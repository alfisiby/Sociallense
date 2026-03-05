export function detectPlatform(url) {
  if (!url) return null;

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('instagram.com')) {
    return 'INSTAGRAM';
  }

  if (lowerUrl.includes('tiktok.com')) {
    return 'TIKTOK';
  }

  return null;
}

export function extractUsername(url) {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Remove leading/trailing slashes and split
    const parts = pathname.replace(/^\/+|\/+$/g, '').split('/');

    // For Instagram: instagram.com/username or instagram.com/username/
    // For TikTok: tiktok.com/@username
    if (parts.length > 0) {
      let username = parts[0];
      // Remove @ if present (TikTok)
      username = username.replace(/^@/, '');
      return username;
    }
  } catch (e) {
    return null;
  }

  return null;
}

export function isValidProfileUrl(url) {
  const platform = detectPlatform(url);
  if (!platform) return false;

  const username = extractUsername(url);
  if (!username || username.length === 0) return false;

  // Check for invalid paths
  const invalidPaths = ['explore', 'reels', 'stories', 'p', 'reel', 'tv', 'accounts', 'direct'];
  if (invalidPaths.includes(username.toLowerCase())) return false;

  return true;
}
