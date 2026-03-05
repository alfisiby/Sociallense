import { useState, useMemo } from 'react';
import { ProfileCard } from './components/ProfileCard';
import { PostGrid } from './components/PostGrid';
import { Top7Strip } from './components/Top7Strip';
import { Sidebar } from './components/Sidebar';
import { StatsBar } from './components/StatsBar';
import { SortFilter, sortPosts, filterPosts } from './components/SortFilter';
import { LoadingState, ErrorState, EmptyState } from './components/LoadingState';
import { useProfiles } from './hooks/useProfiles';
import { useScraper } from './hooks/useScraper';
import { isValidProfileUrl, detectPlatform, extractUsername } from './utils/detectPlatform';
import { Search, Instagram, Music2 } from 'lucide-react';

function App() {
  const [url, setUrl] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [sortBy, setSortBy] = useState('views_desc');
  const [filterBy, setFilterBy] = useState('ALL');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { profiles, saveProfile, removeProfile } = useProfiles();
  const { scrapeProfile, loading, error, progress } = useScraper();

  const handleAnalyze = async () => {
    if (!isValidProfileUrl(url)) {
      alert('Please enter a valid Instagram or TikTok profile URL');
      return;
    }

    const data = await scrapeProfile(url);

    if (data) {
      setProfileData(data);
      saveProfile({
        profileUrl: url,
        username: data.profile.username,
        platform: data.profile.platform,
        avatarUrl: data.profile.avatarUrl,
        followerCount: data.profile.followerCount,
        cachedData: data
      });
    }
  };

  // Load from cache instantly — no scraping needed
  const handleSelectProfile = (profile) => {
    setUrl(profile.profileUrl);
    if (profile.cachedData) {
      setProfileData(profile.cachedData);
    } else {
      // No cache yet, scrape it
      handleRefreshProfile(profile);
    }
  };

  // Force a fresh scrape and update the cache
  const handleRefreshProfile = async (profile) => {
    setUrl(profile.profileUrl);
    const data = await scrapeProfile(profile.profileUrl);
    if (data) {
      setProfileData(data);
      saveProfile({
        profileUrl: profile.profileUrl,
        username: data.profile.username,
        platform: data.profile.platform,
        avatarUrl: data.profile.avatarUrl,
        followerCount: data.profile.followerCount,
        cachedData: data
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  const processedPosts = useMemo(() => {
    if (!profileData?.posts) return [];
    let posts = filterPosts(profileData.posts, filterBy);
    posts = sortPosts(posts, sortBy);
    return posts;
  }, [profileData?.posts, sortBy, filterBy]);

  const platform = detectPlatform(url);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        onRefreshProfile={handleRefreshProfile}
        onRemoveProfile={removeProfile}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-0' : 'ml-72'
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Search className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-bold text-text-primary">SocialLens</h1>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">Supports:</span>
                <Instagram className="text-accent" size={20} />
                <Music2 className="text-tiktok-cyan" size={20} />
              </div>
            </div>

            {/* URL Input */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste Instagram or TikTok profile URL (e.g., https://instagram.com/nike)"
                  className="input-field pr-12"
                  disabled={loading}
                />
                {platform && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {platform === 'INSTAGRAM' ? (
                      <Instagram className="text-accent" size={20} />
                    ) : (
                      <Music2 className="text-tiktok-cyan" size={20} />
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || !url}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {loading ? (
            <LoadingState progress={progress} />
          ) : error ? (
            <ErrorState error={error} onRetry={handleAnalyze} />
          ) : profileData ? (
            <>
              {/* Profile Card */}
              <ProfileCard profile={profileData.profile} />

              {/* Stats Bar */}
              <StatsBar
                posts={profileData.posts}
                followerCount={profileData.profile.followerCount}
              />

              {/* Top 7 Best Performing */}
              <Top7Strip posts={profileData.posts} />

              {/* Sort & Filter Controls */}
              <SortFilter
                sortBy={sortBy}
                filterBy={filterBy}
                onSortChange={setSortBy}
                onFilterChange={setFilterBy}
              />

              {/* Post Grid */}
              {processedPosts.length > 0 ? (
                <PostGrid posts={processedPosts} />
              ) : (
                <EmptyState />
              )}
            </>
          ) : (
            /* Empty Home State */
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6">
                <Search className="text-white" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-text-primary mb-3">
                Analyze Any Public Profile
              </h2>
              <p className="text-text-secondary text-center max-w-md mb-8">
                Paste an Instagram or TikTok profile URL above to see their content
                performance, sorted by views and engagement.
              </p>
              <div className="flex items-center gap-4 text-text-secondary">
                <div className="flex items-center gap-2">
                  <Instagram className="text-accent" size={24} />
                  <span>Instagram</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-2">
                  <Music2 className="text-tiktok-cyan" size={24} />
                  <span>TikTok</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
