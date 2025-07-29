import { Link } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import { useArtistSummary } from '../hooks/useArtist';

interface ArtistCardProps {
  artistId: 'bnyx' | 'zukenee';
  displayName: string;
}

/**
 * A card component representing a single artist on the home page. It
 * summarises the key metrics for the artist and provides a link to the
 * detailed analytics page. While the data is loading skeleton placeholders
 * are shown to maintain layout.
 */
function ArtistCard({ artistId, displayName }: ArtistCardProps) {
  const { summary, loading, error } = useArtistSummary(artistId);
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
        {summary && summary.lastUpdated && (
          <span className="text-xs text-gray-400">Updated {summary.lastUpdated}</span>
        )}
      </div>
      {loading && (
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      )}
      {error && (
        <div className="text-red-500 text-sm">Failed to load data</div>
      )}
      {summary && !loading && !error && (
        <div className="grid grid-cols-2 gap-2">
          <StatsCard title="Total Sounds" value={summary.totalSounds} />
          <StatsCard title="Combined Daily Δ" value={summary.combinedDailyGrowth} />
          <StatsCard title="Spiking Today" value={summary.spikingToday} />
          <StatsCard title="Week Spikes" value={summary.weekSpikes} />
        </div>
      )}
      <Link
        to={`/artist/${artistId}`}
        className="mt-auto inline-block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md"
      >
        View Analytics
      </Link>
    </div>
  );
}

/**
 * The home page lists both artists with their current statistics. Users can
 * click through to see a detailed breakdown. Additional descriptive text
 * introduces the purpose of the app.
 */
export default function IndexPage() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">TikTok Sound Tracker</h1>
        <p className="text-gray-600">
          Monitor how sounds from your favourite producers perform on TikTok. Compare daily growth and identify
          which songs are spiking right now.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ArtistCard artistId="bnyx" displayName="BNYX" />
        <ArtistCard artistId="zukenee" displayName="Zukenee" />
      </div>
    </div>
  );
}