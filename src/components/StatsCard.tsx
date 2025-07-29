import { FC, ReactNode } from 'react';

interface StatsCardProps {
  /** Title describing what this stat represents */
  title: string;
  /** The numeric value to display */
  value: number | string;
  /** Optional secondary text underneath the value */
  subtitle?: string;
  /** Optional children allow richer content such as icons */
  children?: ReactNode;
}

/**
 * A simple card component for displaying a single statistic. It uses Tailwind
 * classes to provide spacing, borders and typography. If you need to
 * customise colours further you can pass a child element containing
 * additional markup.
 */
const StatsCard: FC<StatsCardProps> = ({ title, value, subtitle, children }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col gap-1">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</div>
      <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        {value}
        {children}
      </div>
      {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
    </div>
  );
};

export default StatsCard;