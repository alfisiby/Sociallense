import { useState } from 'react';
import { formatNumber } from '../utils/formatNumber';
import { Instagram, Music2, User } from 'lucide-react';

export function ProfileCard({ profile }) {
  const [imgError, setImgError] = useState(false);

  if (!profile) return null;

  const PlatformIcon = profile.platform === 'INSTAGRAM' ? Instagram : Music2;
  const platformColor = profile.platform === 'INSTAGRAM' ? 'text-accent' : 'text-tiktok-cyan';

  return (
    <div className="card flex items-start gap-6 mb-6">
      <div className="relative">
        {profile.avatarUrl && !imgError ? (
          <img
            src={profile.avatarUrl}
            alt={profile.username}
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-gray-100 flex items-center justify-center">
            <User size={40} className="text-gray-400" />
          </div>
        )}
        <div className={`absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-md ${platformColor}`}>
          <PlatformIcon size={16} />
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-text-primary">
            {profile.displayName || profile.username}
          </h2>
          <span className="text-text-secondary">@{profile.username}</span>
        </div>

        {profile.bio && (
          <p className="text-text-secondary text-sm mb-4 max-w-xl line-clamp-2">
            {profile.bio}
          </p>
        )}

        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-xl font-bold text-text-primary">
              {formatNumber(profile.followerCount)}
            </div>
            <div className="text-xs text-text-secondary">Followers</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold text-text-primary">
              {formatNumber(profile.followingCount)}
            </div>
            <div className="text-xs text-text-secondary">Following</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold text-text-primary">
              {formatNumber(profile.postsCount)}
            </div>
            <div className="text-xs text-text-secondary">Posts</div>
          </div>

          {profile.category && (
            <div className="ml-auto">
              <span className="px-3 py-1 bg-gray-100 text-text-secondary text-sm rounded-full">
                {profile.category}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
