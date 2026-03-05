import express from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';
import { scrapeInstagram } from './scrapers/instagram.js';
import { scrapeTikTok } from './scrapers/tiktok.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

function detectPlatform(url) {
  if (url.includes('instagram.com')) return 'INSTAGRAM';
  if (url.includes('tiktok.com')) return 'TIKTOK';
  return null;
}

// Image proxy endpoint using native http/https (works in all Node versions)
app.get('/api/proxy-image', (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const imageUrl = new URL(url);
    const protocol = imageUrl.protocol === 'https:' ? https : http;

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return res.redirect(response.headers.location);
      }

      if (response.statusCode !== 200) {
        return res.status(response.statusCode).send('Failed to fetch image');
      }

      const contentType = response.headers['content-type'] || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');

      response.pipe(res);
    });

    request.on('error', (error) => {
      console.error('Image proxy error:', error.message);
      res.status(500).send('Failed to proxy image');
    });

    request.setTimeout(10000, () => {
      request.destroy();
      res.status(504).send('Image request timeout');
    });

  } catch (error) {
    console.error('Image proxy error:', error.message);
    res.status(500).send('Failed to proxy image');
  }
});

app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;

  console.log(`Received scrape request for: ${url}`);

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const platform = detectPlatform(url);

  if (!platform) {
    return res.status(400).json({ error: 'Invalid URL. Please provide an Instagram or TikTok profile URL.' });
  }

  try {
    let result;

    console.log(`Starting ${platform} scrape...`);

    if (platform === 'INSTAGRAM') {
      result = await scrapeInstagram(url);
    } else {
      result = await scrapeTikTok(url);
    }

    console.log(`Scrape completed successfully`);
    res.json(result);

  } catch (error) {
    console.error('Scraping error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to scrape profile. The account might be private or the request was blocked.'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🔍 SocialLens server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
