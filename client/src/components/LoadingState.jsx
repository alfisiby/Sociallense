import { Loader2 } from 'lucide-react';

export function LoadingState({ progress }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-text-secondary text-lg">{progress || 'Loading...'}</p>

      {/* Skeleton cards */}
      <div className="mt-8 w-full max-w-4xl">
        <div className="card animate-pulse mb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">!</span>
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">Something went wrong</h3>
      <p className="text-text-secondary text-center max-w-md mb-6">
        {error || 'Failed to analyze the profile. This might be because the account is private or the request was blocked.'}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">?</span>
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">No posts found</h3>
      <p className="text-text-secondary text-center max-w-md">
        This account has no public posts yet, or we couldn't retrieve them.
      </p>
    </div>
  );
}
