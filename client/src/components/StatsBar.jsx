import { formatNumber } from '../utils/formatNumber';
import { getAverageStats, getBestPerformingType } from '../utils/calculateEngagement';
import { Eye, Heart, MessageCircle, TrendingUp, BarChart3, Calendar } from 'lucide-react';

export function StatsBar({ posts, followerCount }) {
  if (!posts || posts.length === 0) return null;

  const stats = getAverageStats(posts);
  const bestType = getBestPerformingType(posts);

  const statItems = [
    {
      icon: Eye,
      label: 'Avg Views',
      value: formatNumber(stats.avgViews),
      color: 'text-primary'
    },
    {
      icon: Heart,
      label: 'Avg Likes',
      value: formatNumber(stats.avgLikes),
      color: 'text-red-500'
    },
    {
      icon: MessageCircle,
      label: 'Avg Comments',
      value: formatNumber(stats.avgComments),
      color: 'text-blue-500'
    },
    {
      icon: TrendingUp,
      label: 'Avg Engagement',
      value: `${stats.avgEngagement}%`,
      color: 'text-green-500'
    },
    {
      icon: BarChart3,
      label: 'Best Type',
      value: bestType || 'N/A',
      color: 'text-accent'
    },
    {
      icon: Calendar,
      label: 'Posts Analyzed',
      value: posts.length,
      color: 'text-text-secondary'
    }
  ];

  return (
    <div className="card mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statItems.map((item) => (
          <div key={item.label} className="text-center p-2">
            <item.icon className={`mx-auto mb-2 ${item.color}`} size={20} />
            <div className="text-lg font-bold text-text-primary">{item.value}</div>
            <div className="text-xs text-text-secondary">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
