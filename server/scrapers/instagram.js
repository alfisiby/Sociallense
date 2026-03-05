import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COOKIES_PATH = path.join(__dirname, '..', 'instagram_cookies.json');

async function loadCookies(context) {
  try {
    if (fs.existsSync(COOKIES_PATH)) {
      const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
      if (cookies.length > 0) {
        await context.addCookies(cookies);
        const hasSession = cookies.some(c => c.name === 'sessionid');
        console.log(`Loaded ${cookies.length} cookies (sessionid: ${hasSession ? 'YES - authenticated' : 'NO - anonymous, max 12 posts'})`);
      }
    }
  } catch (e) {
    console.log('Could not load cookies:', e.message);
  }
}

function extractUsername(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.replace(/^\/+|\/+$/g, '').split('/');
    return parts[0] || null;
  } catch (e) {
    return null;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min = 1000, max = 2000) {
  return delay(Math.floor(Math.random() * (max - min + 1)) + min);
}

function processGraphQLNode(node) {
  const isVideo = node.is_video || node.__typename === 'GraphVideo';
  const isReel = node.product_type === 'clips' || node.product_type === 'reels';
  const isCarousel = node.__typename === 'GraphSidecar';
  let postType = 'PHOTO';
  if (isReel) postType = 'REEL';
  else if (isVideo) postType = 'VIDEO';
  else if (isCarousel) postType = 'CAROUSEL';
  return {
    postId: node.shortcode || node.id,
    postUrl: `https://www.instagram.com/p/${node.shortcode}/`,
    thumbnailUrl: node.thumbnail_src || node.display_url || node.thumbnail_resources?.[node.thumbnail_resources?.length - 1]?.src || '',
    postType,
    viewCount: node.video_view_count || 0,
    likeCount: node.edge_liked_by?.count || node.edge_media_preview_like?.count || node.like_count || 0,
    commentCount: node.edge_media_to_comment?.count || node.edge_media_preview_comment?.count || node.comment_count || 0,
    caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || node.caption?.text || '',
    postedAt: node.taken_at_timestamp
      ? new Date(node.taken_at_timestamp * 1000).toISOString()
      : new Date().toISOString()
  };
}

function processV1Item(item) {
  const isCarousel = item.media_type === 8;
  const isVideo = item.media_type === 2;
  const isReel = item.product_type === 'clips' || item.product_type === 'reels';
  let postType = 'PHOTO';
  if (isReel) postType = 'REEL';
  else if (isVideo) postType = 'VIDEO';
  else if (isCarousel) postType = 'CAROUSEL';
  const thumbnail =
    item.image_versions2?.candidates?.[0]?.url ||
    item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url || '';
  return {
    postId: item.code || String(item.pk),
    postUrl: `https://www.instagram.com/p/${item.code}/`,
    thumbnailUrl: thumbnail,
    postType,
    // play_count matches what Instagram's profile grid displays for reels
    viewCount: item.play_count || item.video_view_count || item.view_count || 0,
    likeCount: item.like_count || 0,
    commentCount: item.comment_count || 0,
    caption: item.caption?.text || '',
    postedAt: item.taken_at
      ? new Date(item.taken_at * 1000).toISOString()
      : new Date().toISOString()
  };
}

export async function scrapeInstagram(url) {
  const username = extractUsername(url);
  if (!username) throw new Error('Invalid Instagram URL');

  const TARGET_POSTS = 60;

  console.log(`\n========================================`);
  console.log(`Scraping @${username} (target: ${TARGET_POSTS} posts)`);
  console.log(`========================================\n`);

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' }
    });

    const page = await context.newPage();

    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      window.chrome = { runtime: {} };
    });

    // ─── Capture ALL pagination responses Instagram fires ───────────────────
    let apiUserData = null;
    const allSeenIds = new Set();
    const allCapturedPosts = []; // unified list, mixed formats normalised on insert

    function addPost(post) {
      if (!allSeenIds.has(post.postId) && post.postId) {
        allSeenIds.add(post.postId);
        allCapturedPosts.push(post);
      }
    }

    page.on('response', async (response) => {
      const responseUrl = response.url();
      try {
        // web_profile_info — first 12 posts + profile data
        if (responseUrl.includes('web_profile_info')) {
          const json = await response.json();
          if (json.data?.user) {
            apiUserData = json.data.user;
            const edges = json.data.user.edge_owner_to_timeline_media?.edges || [];
            if (edges.length > 0) {
              const sample = edges[0].node;
              console.log(`[DEBUG] GraphQL node keys: ${Object.keys(sample).join(', ')}`);
              console.log(`[DEBUG] GraphQL sample counts: video_view_count=${sample.video_view_count}, play_count=${sample.play_count}, view_count=${sample.view_count}, like_count=${sample.like_count}, edge_liked_by=${JSON.stringify(sample.edge_liked_by)}, edge_media_preview_like=${JSON.stringify(sample.edge_media_preview_like)}, comment_count=${sample.comment_count}`);
            }
            edges.forEach(e => addPost(processGraphQLNode(e.node)));
            console.log(`[response] web_profile_info: ${edges.length} posts, total: ${allCapturedPosts.length}`);
          }
        }

        // v1 feed or GraphQL — may still fire on some account types, capture if present
        if (responseUrl.includes('/api/v1/feed/user/') || (responseUrl.includes('/graphql/query') && !responseUrl.includes('web_profile_info'))) {
          const json = await response.json();
          if (json.items?.length > 0) {
            const before = allCapturedPosts.length;
            json.items.forEach(item => addPost(processV1Item(item)));
            if (allCapturedPosts.length > before) {
              console.log(`[response] passive capture: +${allCapturedPosts.length - before} posts`);
            }
          }
          const edges = json.data?.user?.edge_owner_to_timeline_media?.edges;
          if (edges?.length > 0) {
            const before = allCapturedPosts.length;
            edges.forEach(e => addPost(processGraphQLNode(e.node)));
            if (allCapturedPosts.length > before) {
              console.log(`[response] passive GraphQL: +${allCapturedPosts.length - before} posts`);
            }
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    });
    // ────────────────────────────────────────────────────────────────────────

    // Load saved Instagram cookies (must include sessionid to unlock pagination)
    await loadCookies(context);

    // Visit homepage first to establish a proper session + cookies
    console.log('Establishing session...');
    await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomDelay(1500, 2500);

    // Navigate to the profile — use 'load' not 'networkidle':
    // authenticated sessions keep firing background calls forever, so networkidle never triggers
    console.log(`Navigating to profile...`);
    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'load', timeout: 60000 });
    // Wait for the web_profile_info API response specifically (up to 10s), then give a little more time
    await Promise.race([
      page.waitForResponse(r => r.url().includes('web_profile_info'), { timeout: 10000 }).catch(() => null),
      delay(10000)
    ]);
    await randomDelay(1500, 2000);

    const pageContent = await page.content();
    if (pageContent.includes("Sorry, this page isn't available")) {
      throw new Error('Profile not found or account is private');
    }

    // If web_profile_info wasn't captured via listener, call it directly
    if (!apiUserData) {
      console.log('web_profile_info not captured, calling directly...');
      try {
        const apiResponse = await page.evaluate(async (u) => {
          const r = await fetch(
            `https://www.instagram.com/api/v1/users/web_profile_info/?username=${u}`,
            {
              headers: {
                'Accept': '*/*',
                'X-IG-App-ID': '936619743392459',
                'X-ASBD-ID': '129477',
                'X-IG-WWW-Claim': '0',
                'X-Requested-With': 'XMLHttpRequest'
              },
              credentials: 'include'
            }
          ).catch(() => null);
          if (r?.ok) return r.json();
          return null;
        }, username);
        if (apiResponse?.data?.user) {
          apiUserData = apiResponse.data.user;
          const edges = apiUserData.edge_owner_to_timeline_media?.edges || [];
          edges.forEach(e => addPost(processGraphQLNode(e.node)));
          console.log(`Direct API: ${edges.length} initial posts`);
        }
      } catch (e) {
        console.log('Direct API failed:', e.message);
      }
    }

    // ─── Direct v1 API pagination ─────────────────────────────────────────────
    // Instagram's web_profile_info no longer returns post data in edges.
    // Instead, we call /api/v1/feed/user/{id}/ directly from the page context
    // so the session cookies are included automatically.
    const userId = apiUserData?.id;
    if (userId) {
      console.log(`\nPaginating v1 feed for user ID ${userId}...`);
      let maxId = null;
      let hasMore = true;
      let pageNum = 0;

      while (allCapturedPosts.length < TARGET_POSTS && hasMore && pageNum < 6) {
        let apiUrl = `https://www.instagram.com/api/v1/feed/user/${userId}/?count=12`;
        if (maxId) apiUrl += `&max_id=${maxId}`;

        const result = await page.evaluate(async (url) => {
          try {
            const r = await fetch(url, {
              headers: {
                'X-IG-App-ID': '936619743392459',
                'X-ASBD-ID': '129477',
                'X-IG-WWW-Claim': '0',
                'Accept': '*/*'
              },
              credentials: 'include'
            });
            if (!r.ok) {
              const text = await r.text().catch(() => '');
              return { __error: r.status, __text: text.slice(0, 300) };
            }
            return r.json();
          } catch (e) {
            return { __error: e.message };
          }
        }, apiUrl);

        if (result?.__error) {
          console.log(`v1 API error: ${result.__error} ${result.__text || ''}`);
          break;
        }

        if (result?.items?.length > 0) {
          if (pageNum === 0) {
            const s = result.items[0];
            console.log(`[DEBUG] v1 keys: ${Object.keys(s).slice(0, 25).join(', ')}`);
            console.log(`[DEBUG] v1 counts: play_count=${s.play_count}, video_view_count=${s.video_view_count}, view_count=${s.view_count}, ig_play_count=${s.ig_play_count}, like_count=${s.like_count}, comment_count=${s.comment_count}`);
          }
          const before = allCapturedPosts.length;
          result.items.forEach(item => addPost(processV1Item(item)));
          console.log(`v1 page ${pageNum + 1}: +${allCapturedPosts.length - before} posts (total: ${allCapturedPosts.length})`);
          maxId = result.next_max_id;
          hasMore = result.more_available && !!maxId;
        } else {
          console.log(`v1 page ${pageNum + 1}: no items returned`);
          hasMore = false;
        }

        pageNum++;
        if (hasMore) await randomDelay(1000, 2000);
      }
    } else {
      console.log('No user ID from profile API — cannot paginate v1 feed');
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Extract profile data from meta tags (fallback for profile card)
    const metaData = await page.evaluate(() => ({
      metaDesc: document.querySelector('meta[name="description"]')?.content || '',
      ogImage: document.querySelector('meta[property="og:image"]')?.content || '',
      ogTitle: document.querySelector('meta[property="og:title"]')?.content || ''
    }));

    const parseCount = (text) => {
      if (!text) return 0;
      text = String(text).replace(/,/g, '').trim();
      const match = text.match(/([\d.]+)\s*(K|M|B)?/i);
      if (!match) return parseInt(text) || 0;
      let num = parseFloat(match[1]);
      const suffix = (match[2] || '').toUpperCase();
      if (suffix === 'K') num *= 1000;
      if (suffix === 'M') num *= 1000000;
      if (suffix === 'B') num *= 1000000000;
      return Math.round(num);
    };

    let profileData = {
      username,
      displayName: username,
      avatarUrl: metaData.ogImage || '',
      bio: '',
      followerCount: 0,
      followingCount: 0,
      postsCount: 0
    };

    const followerMatch = metaData.metaDesc.match(/([\d,.]+[KMB]?)\s*Followers/i);
    const followingMatch = metaData.metaDesc.match(/([\d,.]+[KMB]?)\s*Following/i);
    const postsMatch = metaData.metaDesc.match(/([\d,.]+[KMB]?)\s*Posts/i);
    if (followerMatch) profileData.followerCount = parseCount(followerMatch[1]);
    if (followingMatch) profileData.followingCount = parseCount(followingMatch[1]);
    if (postsMatch) profileData.postsCount = parseCount(postsMatch[1]);
    if (metaData.ogTitle) {
      const nameMatch = metaData.ogTitle.match(/^([^(@]+)/);
      if (nameMatch) profileData.displayName = nameMatch[1].trim();
    }
    const bioMatch = metaData.metaDesc.match(/Posts\s*-\s*(.+)$/i);
    if (bioMatch) profileData.bio = bioMatch[1].trim();

    // Override with better data from API if available
    if (apiUserData) {
      profileData = {
        username: apiUserData.username || username,
        displayName: apiUserData.full_name || profileData.displayName,
        avatarUrl: apiUserData.profile_pic_url_hd || apiUserData.profile_pic_url || profileData.avatarUrl,
        bio: apiUserData.biography || profileData.bio,
        followerCount: apiUserData.edge_followed_by?.count || apiUserData.follower_count || profileData.followerCount,
        followingCount: apiUserData.edge_follow?.count || apiUserData.following_count || profileData.followingCount,
        postsCount: apiUserData.edge_owner_to_timeline_media?.count || apiUserData.media_count || profileData.postsCount
      };
    }

    let posts = allCapturedPosts.slice(0, TARGET_POSTS);

    // ─── Last-resort DOM fallback ─────────────────────────────────────────────
    if (posts.length === 0) {
      console.log('API captured nothing — falling back to DOM extraction...');
      posts = await page.evaluate(() => {
        const foundPosts = [];
        const seenUrls = new Set();
        document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]').forEach((link, index) => {
          if (foundPosts.length >= 60) return;
          const href = link.href;
          if (!href || seenUrls.has(href)) return;
          if (href.includes('/liked_by') || href.includes('/comments')) return;
          seenUrls.add(href);
          const isReel = href.includes('/reel/');
          const match = href.match(/\/(p|reel)\/([A-Za-z0-9_-]+)/);
          const postId = match ? match[2] : `post_${index}`;
          const img = link.querySelector('img');
          const thumbnailUrl = (img?.src && !img.src.includes('data:')) ? img.src : '';
          // No random estimates — real counts unavailable from DOM, show 0
          foundPosts.push({
            postId, postUrl: href, thumbnailUrl,
            postType: isReel ? 'REEL' : 'PHOTO',
            viewCount: 0, likeCount: 0, commentCount: 0,
            caption: img?.alt || '',
            postedAt: new Date(Date.now() - (index * 2 * 86400000)).toISOString()
          });
        });
        return foundPosts;
      });
      console.log(`DOM fallback found: ${posts.length} posts`);
    }

    // Add engagement rates
    posts = posts.map(post => ({
      ...post,
      engagementRate: profileData.followerCount > 0
        ? (((post.likeCount + post.commentCount) / profileData.followerCount) * 100).toFixed(2)
        : '0.00'
    }));

    console.log(`\n--- Results ---`);
    console.log(`Profile : @${profileData.username}`);
    console.log(`Followers: ${profileData.followerCount}`);
    console.log(`Account posts: ${profileData.postsCount}`);
    console.log(`Posts extracted: ${posts.length}`);

    await browser.close();

    return {
      profile: {
        username,
        displayName: profileData.displayName || username,
        avatarUrl: profileData.avatarUrl
          ? `/api/proxy-image?url=${encodeURIComponent(profileData.avatarUrl)}`
          : '',
        bio: profileData.bio || '',
        followerCount: profileData.followerCount,
        followingCount: profileData.followingCount,
        postsCount: profileData.postsCount || posts.length,
        platform: 'INSTAGRAM',
        category: null
      },
      posts: posts.map(post => ({
        ...post,
        thumbnailUrl: post.thumbnailUrl
          ? `/api/proxy-image?url=${encodeURIComponent(post.thumbnailUrl)}`
          : ''
      }))
    };

  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    console.error('Scrape error:', error.message);
    throw error;
  }
}
