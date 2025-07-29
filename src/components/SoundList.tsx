import { FC, useMemo, useState } from 'react';
import { TikTokSound } from '../types';
import SoundRow from './SoundRow';
import SoundChart from './SoundChart';

interface SoundListProps {
  sounds: TikTokSound[];
}

/**
 * Displays a searchable, sortable list of sounds. Users can filter by name
 * using the search box and reorder the list using the sort dropdown. When a
 * row is clicked a modal chart is shown for the selected sound.
 */
const SoundList: FC<SoundListProps> = ({ sounds }) => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'posts-desc' | 'posts-asc' | 'growth-desc' | 'growth-asc' | 'name-asc' | 'name-desc'>(
    'posts-desc',
  );
  const [selected, setSelected] = useState<TikTokSound | null>(null);

  const filteredSounds = useMemo(() => {
    let result = sounds.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'posts-desc':
          return b.totalPosts - a.totalPosts;
        case 'posts-asc':
          return a.totalPosts - b.totalPosts;
        case 'growth-desc':
          return b.dailyGrowth - a.dailyGrowth;
        case 'growth-asc':
          return a.dailyGrowth - b.dailyGrowth;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
    return result;
  }, [sounds, search, sort]);

  return (
    <div className="mt-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sounds..."
          className="border border-gray-300 rounded-md px-3 py-1 w-full sm:w-1/2"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="border border-gray-300 rounded-md px-2 py-1 w-full sm:w-40"
        >
          <option value="posts-desc">Posts (High → Low)</option>
          <option value="posts-asc">Posts (Low → High)</option>
          <option value="growth-desc">Daily Growth (High → Low)</option>
          <option value="growth-asc">Daily Growth (Low → High)</option>
          <option value="name-asc">Name (A → Z)</option>
          <option value="name-desc">Name (Z → A)</option>
        </select>
      </div>
      {/* Table header */}
      <div className="grid grid-cols-12 gap-3 px-2 py-1 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
        <div className="col-span-4">Sound</div>
        <div className="col-span-4">Trend (last 10 days)</div>
        <div className="col-span-2">Daily Δ</div>
        <div className="col-span-2">Last Updated</div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {filteredSounds.map((sound) => (
          <SoundRow key={sound.id} sound={sound} onSelect={(s) => setSelected(s)} />
        ))}
        {filteredSounds.length === 0 && (
          <div className="py-6 text-center text-gray-400">No sounds found</div>
        )}
      </div>
      {/* Modal */}
      {selected && <SoundChart sound={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default SoundList;