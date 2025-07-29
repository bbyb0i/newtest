import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useArtistData } from '../hooks/useArtist';
import { computeArtistSummary } from '../services/googleSheets';
import StatsCard from '../components/StatsCard';
import SoundList from '../components/SoundList';

/**
 * The artist analytics page shows detailed information for a single artist.
 * It displays aggregate statistics at the top followed by a searchable list
 * of individual sounds. Each sound row opens a modal with a line chart.
 */
export default function ArtistPage() {
  const params = useParams<{ artistId: string }>();
  const artistId = (params.artistId as 'bnyx' | 'zukenee') ?? 'bnyx';
  const { data, loading, error } = useArtistData(artistId);
  // Compute summary locally whenever data changes
  const summary = useMemo(() => (data.length ? computeArtistSummary(data) : null), [data]);

  // Provide a friendly name
  const displayName = artistId === 'bnyx' ? 'BNYX' : artistId === 'zukenee' ? 'Zukenee' : artistId;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{displayName} Analytics</h1>
      </div>
      {/* Stats */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      )}
      {error && <div className="text-red-500 mb-4">Failed to load data.</div>}
      {summary && !loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <StatsCard title="Total Sounds" value={summary.totalSounds} />
          <StatsCard title="Combined Daily Δ" value={summary.combinedDailyGrowth} />
          <StatsCard title="Spiking Today" value={summary.spikingToday} />
          <StatsCard title="Week Spikes" value={summary.weekSpikes} />
        </div>
      )}
      {/* Sound list */}
      {data.length > 0 && !loading && !error && <SoundList sounds={data} />}
      {data.length === 0 && !loading && !error && <div className="text-center text-gray-500">No sounds found.</div>}
    </div>
  );
}