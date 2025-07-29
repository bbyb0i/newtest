import { FC } from 'react';
import { TikTokSound } from '../types';
import { BarChart, Bar, Tooltip, ResponsiveContainer } from 'recharts';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface SoundRowProps {
  sound: TikTokSound;
  /**
   * Handler invoked when the row is clicked. Use this to trigger a modal
   * displaying a larger chart or additional information.
   */
  onSelect?: (sound: TikTokSound) => void;
}

/**
 * Displays a single sound entry in a list with a miniature bar chart and
 * growth indicator. When the sound is spiking a small badge is shown
 * alongside the name. The component does not manage state itself; it
 * delegates click handling to the parent via onSelect.
 */
const SoundRow: FC<SoundRowProps> = ({ sound, onSelect }) => {
  const growthPositive = sound.dailyGrowth > 0;
  const growthNegative = sound.dailyGrowth < 0;
  const growthColour = growthPositive
    ? 'text-green-600'
    : growthNegative
    ? 'text-red-600'
    : 'text-gray-600';

  return (
    <div
      className="grid grid-cols-12 gap-3 items-center py-2 px-2 hover:bg-gray-50 cursor-pointer"
      onClick={() => onSelect?.(sound)}
    >
      {/* Name and spike badge */}
      <div className="col-span-4 flex items-center">
        <span className="font-medium truncate" title={sound.name}>{sound.name}</span>
        {sound.isSpike && (
          <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-rose-800 bg-rose-100 rounded-full whitespace-nowrap">
            Spike
          </span>
        )}
      </div>
      {/* Mini bar chart showing the last 10 days */}
      <div className="col-span-4 h-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sound.chartData.slice(-10)}>
            <Tooltip
              cursor={{ fill: 'transparent' }}
              formatter={(value: number) => [`${value}`, 'Posts']}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Daily growth */}
      <div className="col-span-2 flex items-center text-sm">
        <span className={`${growthColour} font-semibold mr-1`}>{sound.dailyGrowth}</span>
        {growthPositive && <FaArrowUp className="text-green-600" />}
        {growthNegative && <FaArrowDown className="text-red-600" />}
      </div>
      {/* Last updated date */}
      <div className="col-span-2 text-sm text-gray-500">{sound.lastUpdated}</div>
    </div>
  );
};

export default SoundRow;