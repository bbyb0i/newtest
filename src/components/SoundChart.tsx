import { FC } from 'react';
import { TikTokSound } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface SoundChartProps {
  sound: TikTokSound;
  onClose: () => void;
}

/**
 * A fullscreen modal displaying a line chart of all data points for a
 * particular TikTok sound. The modal darkens the background and traps
 * clicks; clicking the close button or background will dismiss it. The
 * parent component controls visibility via state.
 */
const SoundChart: FC<SoundChartProps> = ({ sound, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-3xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
        <div className="p-4">
          <h2 className="text-lg font-bold mb-2">{sound.name}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sound.chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                width={40}
              />
              <Tooltip
                formatter={(value: number) => [`${value}`, 'Posts']}
                labelFormatter={(label: string) => `Date: ${label}`}
              />
              <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SoundChart;