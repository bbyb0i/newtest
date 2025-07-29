import { TikTokSound, ArtistSummary } from '../types';

/**
 * A lookup describing the Google Sheet IDs and tab GIDs for each artist. The
 * daily log tab contains a historic record of cumulative post counts for
 * each sound on TikTok. The overview and ranking tabs exist in the source
 * spreadsheets but are not currently used by this simplified parser.
 */
const SHEETS = {
  zukenee: {
    id: '1jhaGQjnxoBUOQvmvzRiAF2D5zr0KNKFOolol50l7Vsk',
    gids: {
      dailyLog: '0',
      overview: '112283840',
      ranking: '3',
    },
  },
  bnyx: {
    id: '1Y2LVYzNOhg2DRbH5CdCYpU1wi4cIkG2IJ1GCZOJ9G18',
    gids: {
      // BNYX uses a non‑zero gid for the daily log. These values were
      // discovered by inspecting the sheet tabs; see the analysis in the
      // companion assistant discussion for details.
      dailyLog: '1122838640',
      overview: '316174675',
      ranking: '126563881',
    },
  },
} as const;

const BASE_URL = 'https://docs.google.com/spreadsheets/d/';

/**
 * Fetches raw rows from a Google Sheets tab via the gviz endpoint. Google
 * wraps the returned JSON in a JavaScript function call for safety, so
 * this helper extracts the JSON substring before parsing. If network
 * requests to Google are blocked in your environment, the returned
 * Promise will reject.
 *
 * @param sheetId The document ID for the spreadsheet
 * @param gid The gid of the tab to fetch
 */
async function fetchSheetRows(sheetId: string, gid: string): Promise<any[]> {
  const url = `${BASE_URL}${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
  const response = await fetch(url);
  const text = await response.text();
  // gviz wraps the JSON response in a call to google.visualization.Query.setResponse
  const jsonText = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
  const json = JSON.parse(jsonText);
  return json.table.rows;
}

/**
 * Normalises date strings from the spreadsheets into ISO‑8601 format. The
 * source sheets use US locale (e.g. "2/13/25" for 13 February 2025). This
 * helper adds a leading zero to single digit months/days and expands
 * two‑digit years into the 2000s. The resulting string is safe to pass
 * directly into new Date() or to chart libraries.
 */
function formatDate(value: string): string {
  const parts = value.split('/');
  if (parts.length !== 3) return value;
  let [month, day, year] = parts;
  // Expand two‑digit years into the 2000s. This app only tracks modern
  // TikTok usage, so assuming 20xx is reasonable.
  if (year.length === 2) {
    year = `20${year}`;
  }
  const mm = month.padStart(2, '0');
  const dd = day.padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * Parses the daily log tab into a mapping from sound name to an array of
 * dated post counts. The first row contains sound names; subsequent rows
 * contain a date in the first column and post counts for each sound.
 *
 * @param rows Raw rows returned from gviz
 */
function parseDailyLog(rows: any[]): Record<string, { date: string; posts: number }[]> {
  if (!rows || rows.length === 0) return {};
  // The header row lists the sound names starting from index 1
  const headerCells = rows[0].c;
  const soundNames: string[] = [];
  for (let i = 1; i < headerCells.length; i++) {
    const cell = headerCells[i];
    soundNames.push(cell?.v ?? `Sound ${i}`);
  }
  // Initialise an array for each sound
  const data: Record<string, { date: string; posts: number }[]> = {};
  soundNames.forEach((name) => {
    data[name] = [];
  });
  // Process each subsequent row as a date entry
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].c;
    const dateCell = row[0];
    if (!dateCell || !dateCell.v) continue;
    const date = formatDate(String(dateCell.v));
    for (let j = 1; j < row.length; j++) {
      const soundName = soundNames[j - 1];
      const cell = row[j];
      const posts = cell && cell.v != null ? Number(cell.v) : 0;
      data[soundName].push({ date, posts });
    }
  }
  return data;
}

/**
 * Converts the parsed daily log into an array of domain objects usable by the
 * rest of the application. Each sound is assigned a normalised ID, the
 * latest totals and growth are calculated and a crude spike detection is
 * applied.
 */
function convertDailyLogToTikTokSounds(
  artist: string,
  dailyData: Record<string, { date: string; posts: number }[]>,
): TikTokSound[] {
  const sounds: TikTokSound[] = [];
  Object.entries(dailyData).forEach(([soundName, series]) => {
    if (!series || series.length === 0) return;
    const totalPosts = series[series.length - 1].posts;
    const previousPosts = series.length > 1 ? series[series.length - 2].posts : series[0].posts;
    const dailyGrowth = totalPosts - previousPosts;
    // A simple spike heuristic: consider it a spike if today's growth is
    // greater than or equal to 20% of yesterday's total. If yesterday had
    // zero posts then any positive growth counts as a spike.
    const isSpike = previousPosts > 0 ? dailyGrowth / previousPosts >= 0.2 : dailyGrowth > 0;
    const id = soundName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    sounds.push({
      id,
      name: soundName,
      artist,
      totalPosts,
      dailyGrowth,
      isSpike,
      lastUpdated: series[series.length - 1].date,
      chartData: series.map(({ date, posts }) => ({ date, value: posts })),
    });
  });
  return sounds;
}

/**
 * Fetches and processes all data for the given artist. At present only the
 * daily log is used, but this function can be extended to include the
 * overview and performance ranking tabs if richer analytics are needed.
 *
 * @param artist The artist identifier ('bnyx' or 'zukenee')
 */
export async function fetchArtistData(artist: keyof typeof SHEETS): Promise<TikTokSound[]> {
  const sheetInfo = SHEETS[artist];
  if (!sheetInfo) throw new Error(`Unknown artist: ${artist}`);
  const rows = await fetchSheetRows(sheetInfo.id, sheetInfo.gids.dailyLog);
  const dailyData = parseDailyLog(rows);
  return convertDailyLogToTikTokSounds(artist, dailyData);
}

/**
 * Computes a high level summary from a list of sounds. You can call this
 * directly if you already have sound data available.
 */
export function computeArtistSummary(sounds: TikTokSound[]): ArtistSummary {
  const totalSounds = sounds.length;
  const combinedDailyGrowth = sounds.reduce((acc, s) => acc + s.dailyGrowth, 0);
  const spikingToday = sounds.filter((s) => s.isSpike).length;
  // Week long spike detection would normally look at seven days of data. For
  // simplicity we duplicate the spikingToday metric here. Feel free to
  // enhance this calculation if more sophisticated insights are required.
  const weekSpikes = spikingToday;
  const lastUpdated = sounds.length > 0 ? sounds[0].lastUpdated : '';
  return { totalSounds, combinedDailyGrowth, spikingToday, weekSpikes, lastUpdated };
}

/**
 * Convenience wrapper to fetch artist data and immediately compute a
 * summary. Use this from components that only need aggregate stats.
 */
export async function fetchArtistSummary(artist: keyof typeof SHEETS): Promise<ArtistSummary> {
  const sounds = await fetchArtistData(artist);
  return computeArtistSummary(sounds);
}