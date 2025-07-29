export interface ChartData {
  /**
   * A formatted date string (e.g. "2025-02-13") representing the day this
   * value belongs to. Keeping the date as a string simplifies passing it
   * directly to chart libraries and avoids timezone confusion when
   * serialised to JSON.
   */
  date: string;
  /**
   * The numeric value for this point in the series. In this app it
   * represents the cumulative number of posts on TikTok for a given
   * sound on a particular date.
   */
  value: number;
}

export interface TikTokSound {
  /** A unique identifier for the sound within the dataset */
  id: string;
  /** The human‑readable name of the sound */
  name: string;
  /** The artist this sound belongs to */
  artist: string;
  /** The total posts recorded on the last day of the log */
  totalPosts: number;
  /** The difference in posts between the last day and the previous day */
  dailyGrowth: number;
  /** Whether this sound is considered spiking today */
  isSpike: boolean;
  /** The ISO date string for the most recent log entry */
  lastUpdated: string;
  /** A time series of all posts values for charting */
  chartData: ChartData[];
}

export interface ArtistSummary {
  /** Total number of unique sounds tracked for the artist */
  totalSounds: number;
  /** The sum of daily growth across all sounds */
  combinedDailyGrowth: number;
  /** How many sounds are spiking today */
  spikingToday: number;
  /** How many sounds have shown week over week growth; for simplicity this
   * duplicates spikingToday because week long growth detection requires
   * more historical context */
  weekSpikes: number;
  /** The ISO date string for when the data was last updated */
  lastUpdated: string;
}