import { PostCard } from './PostCard';

export function PostGrid({ posts, showRank = false }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        No posts found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {posts.map((post, index) => (
        <PostCard
          key={post.postId}
          post={post}
          rank={showRank ? index + 1 : null}
        />
      ))}
    </div>
  );
}
