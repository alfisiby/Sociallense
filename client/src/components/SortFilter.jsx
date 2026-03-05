import { ArrowUpDown, Filter } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'views_desc', label: 'Highest Views' },
  { value: 'views_asc', label: 'Lowest Views' },
  { value: 'likes_desc', label: 'Most Likes' },
  { value: 'comments_desc', label: 'Most Comments' },
  { value: 'engagement_desc', label: 'Highest Engagement' },
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' }
];

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Types' },
  { value: 'REEL', label: 'Reels Only' },
  { value: 'PHOTO', label: 'Photos Only' },
  { value: 'CAROUSEL', label: 'Carousels Only' },
  { value: 'VIDEO', label: 'Videos Only' }
];

export function SortFilter({ sortBy, filterBy, onSortChange, onFilterChange }) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <ArrowUpDown size={16} className="text-text-secondary" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="input-field py-2 px-3 text-sm w-44"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Filter size={16} className="text-text-secondary" />
        <select
          value={filterBy}
          onChange={(e) => onFilterChange(e.target.value)}
          className="input-field py-2 px-3 text-sm w-40"
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function sortPosts(posts, sortBy) {
  const sorted = [...posts];

  switch (sortBy) {
    case 'views_desc':
      return sorted.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    case 'views_asc':
      return sorted.sort((a, b) => (a.viewCount || 0) - (b.viewCount || 0));
    case 'likes_desc':
      return sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    case 'comments_desc':
      return sorted.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
    case 'engagement_desc':
      return sorted.sort((a, b) => parseFloat(b.engagementRate || 0) - parseFloat(a.engagementRate || 0));
    case 'date_desc':
      return sorted.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
    case 'date_asc':
      return sorted.sort((a, b) => new Date(a.postedAt) - new Date(b.postedAt));
    default:
      return sorted;
  }
}

export function filterPosts(posts, filterBy) {
  if (filterBy === 'ALL') return posts;
  return posts.filter((post) => post.postType === filterBy);
}
