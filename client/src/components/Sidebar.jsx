import { useState } from 'react';
import { formatDate } from '../utils/formatNumber';
import { Instagram, Music2, ChevronLeft, ChevronRight, Trash2, User, RefreshCw } from 'lucide-react';

function ProfileAvatar({ profile }) {
  const [imgError, setImgError] = useState(false);
  const PlatformIcon = profile.platform === 'INSTAGRAM' ? Instagram : Music2;
  const platformColor = profile.platform === 'INSTAGRAM' ? 'text-accent' : 'text-tiktok-cyan';

  return (
    <div className="relative">
      {profile.avatarUrl && !imgError ? (
        <img
          src={profile.avatarUrl}
          alt={profile.username}
          className="w-10 h-10 rounded-full object-cover bg-gray-100"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <User size={20} className="text-gray-400" />
        </div>
      )}
      <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 bg-white rounded-full ${platformColor}`}>
        <PlatformIcon size={10} />
      </div>
    </div>
  );
}

export function Sidebar({ profiles, onSelectProfile, onRefreshProfile, onRemoveProfile, isCollapsed, onToggle }) {
  const [refreshingUrl, setRefreshingUrl] = useState(null);

  const handleRefresh = async (e, profile) => {
    e.stopPropagation();
    setRefreshingUrl(profile.profileUrl);
    await onRefreshProfile(profile);
    setRefreshingUrl(null);
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-40 ${
        isCollapsed ? 'w-0 overflow-hidden' : 'w-72'
      }`}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">Saved Profiles</h3>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="overflow-y-auto h-[calc(100%-60px)]">
        {profiles.length === 0 ? (
          <div className="p-4 text-sm text-text-secondary text-center">
            No saved profiles yet. Analyze a profile to save it here.
          </div>
        ) : (
          profiles.map((profile) => {
            const isRefreshing = refreshingUrl === profile.profileUrl;
            const isCached = !!profile.cachedData;
            const postCount = profile.cachedData?.posts?.length;

            return (
              <div
                key={profile.profileUrl}
                className="p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors group"
                onClick={() => !isRefreshing && onSelectProfile(profile)}
              >
                <div className="flex items-center gap-3">
                  <ProfileAvatar profile={profile} />

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary text-sm truncate">
                      @{profile.username}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isCached ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                          <span className="text-xs text-text-secondary">
                            {postCount ? `${postCount} posts` : formatDate(profile.lastAnalyzed)}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-text-secondary">
                          {formatDate(profile.lastAnalyzed)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Refresh button */}
                    <button
                      onClick={(e) => handleRefresh(e, profile)}
                      disabled={isRefreshing}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-50 rounded text-blue-400 transition-all disabled:opacity-50"
                      title="Refresh data"
                    >
                      <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveProfile(profile.profileUrl);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-500 transition-all"
                      title="Remove profile"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Collapsed toggle button */}
      {isCollapsed && (
        <button
          onClick={onToggle}
          className="fixed left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg p-2 rounded-r-lg z-50"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
