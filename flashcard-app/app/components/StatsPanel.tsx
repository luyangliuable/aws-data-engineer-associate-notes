import { Stats } from '@/app/lib/types';

interface StatsPanelProps {
  stats: Stats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Study Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        <StatItem label="Total Reviews" value={stats.totalReviews} />
        <StatItem label="Current Streak" value={stats.currentStreak} suffix="days" />
        <StatItem label="Cards Due Today" value={stats.cardsDueToday} />
        <StatItem
          label="Last Study"
          value={stats.lastStudyDate ? formatDate(stats.lastStudyDate) : 'Never'}
        />
      </div>
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string | number;
  suffix?: string;
}

function StatItem({ label, value, suffix }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-blue-600">
        {value}
        {suffix && <span className="text-sm text-gray-500 ml-1">{suffix}</span>}
      </div>
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}
