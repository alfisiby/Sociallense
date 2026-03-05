import { useState } from 'react';
import { formatNumber, formatDate, formatExactDate } from '../utils/formatNumber';
import { Eye, Heart, MessageCircle, Play, Image, Layers, ImageOff } from 'lucide-react';

const POST_TYPE_ICONS = {
  REEL: Play,
  VIDEO: Play,
  PHOTO: Image,
  CAROUSEL: Layers
};

const POST_TYPE_COLORS = {
  REEL: 'bg-accent',
  VIDEO: 'bg-purple-500',
  PHOTO: 'bg-blue-500',
  CAROUSEL: 'bg-green-500'
};

export function PostCard({ post, rank }) {
  const [imgError, setImgError] = useState(false);
  const TypeIcon = POST_TYPE_ICONS[post.postType] || Image;
  const typeColor = POST_TYPE_COLORS[post.postType] || 'bg-gray-500';

  const handleClick = () => {
    window.open(post.postUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleClick}
      className="card cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group relative"
    >
      {rank && (
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
          #{rank}
        </div>
      )}

      <div className="relative mb-3">
        {post.thumbnailUrl && !imgError ? (
          <img
            src={post.thumbnailUrl}
            alt="Post thumbnail"
            className="w-full aspect-square object-cover rounded-lg bg-gray-100"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
            <ImageOff size={40} className="text-gray-400" />
          </div>
        )}

        <div className={`absolute top-2 right-2 ${typeColor} text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1`}>
          <TypeIcon size={12} />
          {post.postType}
        </div>

        {(post.viewCount > 0 || post.postType === 'REEL' || post.postType === 'VIDEO') && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
            <Eye size={14} />
            {formatNumber(post.viewCount)}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm mb-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-text-secondary">
            <Heart size={14} className="text-red-500" />
            {formatNumber(post.likeCount)}
          </span>
          <span className="flex items-center gap-1 text-text-secondary">
            <MessageCircle size={14} className="text-blue-500" />
            {formatNumber(post.commentCount)}
          </span>
        </div>

        <span className="text-xs text-text-secondary font-medium">
          {post.engagementRate}% ER
        </span>
      </div>

      <div
        className="text-xs text-text-secondary"
        title={formatExactDate(post.postedAt)}
      >
        {formatDate(post.postedAt)}
      </div>

      {post.caption && (
        <p className="text-xs text-text-secondary mt-2 line-clamp-2 group-hover:line-clamp-none transition-all">
          {post.caption.substring(0, 200)}
        </p>
      )}
    </div>
  );
}
