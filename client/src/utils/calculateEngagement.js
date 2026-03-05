export function calculateEngagement(likes, comments, followers) {
  if (!followers || followers === 0) return 0;
  return ((likes + comments) / followers * 100).toFixed(2);
}

export function getAverageStats(posts) {
  if (!posts || posts.length === 0) {
    return {
      avgViews: 0,
      avgLikes: 0,
      avgComments: 0,
      avgEngagement: 0
    };
  }

  const totalViews = posts.reduce((sum, post) => sum + (post.viewCount || 0), 0);
  const totalLikes = posts.reduce((sum, post) => sum + (post.likeCount || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.commentCount || 0), 0);
  const totalEngagement = posts.reduce((sum, post) => sum + (parseFloat(post.engagementRate) || 0), 0);

  return {
    avgViews: Math.round(totalViews / posts.length),
    avgLikes: Math.round(totalLikes / posts.length),
    avgComments: Math.round(totalComments / posts.length),
    avgEngagement: (totalEngagement / posts.length).toFixed(2)
  };
}

export function getBestPerformingType(posts) {
  if (!posts || posts.length === 0) return null;

  const typeStats = {};

  posts.forEach(post => {
    const type = post.postType;
    if (!typeStats[type]) {
      typeStats[type] = { count: 0, totalViews: 0 };
    }
    typeStats[type].count++;
    typeStats[type].totalViews += post.viewCount || 0;
  });

  let bestType = null;
  let bestAvg = 0;

  Object.entries(typeStats).forEach(([type, stats]) => {
    const avg = stats.totalViews / stats.count;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestType = type;
    }
  });

  return bestType;
}
