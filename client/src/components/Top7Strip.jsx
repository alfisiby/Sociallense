import { PostCard } from './PostCard';
import { Trophy } from 'lucide-react';

export function Top7Strip({ posts }) {
  if (!posts || posts.length === 0) return null;

  const topPosts = [...posts]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 7);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-yellow-500" size={24} />
        <h3 className="text-xl font-bold text-text-primary">Top 7 Best Performing</h3>
      </div>

      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {topPosts.map((post, index) => (
            <PostCard key={post.postId} post={post} rank={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
