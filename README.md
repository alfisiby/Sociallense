# SocialLens

Instagram & TikTok Content Intelligence Tool - A local web application that analyzes public social media profiles and displays content performance metrics.

## Features

- **Zero Login Required** - No API keys, no authentication needed
- **Instagram & TikTok Support** - Analyze profiles from both platforms
- **Performance Dashboard** - View posts sorted by views, likes, engagement
- **Top 7 Best Performing** - Quickly identify top content
- **Sorting & Filtering** - Sort by views, likes, comments, engagement, date
- **Saved Profiles** - Profiles are saved locally for quick re-analysis
- **Export to CSV** - Export data for further analysis (Phase 2)

## Tech Stack

- **Frontend**: React + Tailwind CSS + Recharts
- **Backend**: Node.js + Express
- **Scraper**: Playwright (headless browser)
- **Storage**: Browser localStorage

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd sociallense

# Install all dependencies
npm run install:all

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Manual Installation

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Running

```bash
# From root directory - runs both client and server
npm run dev

# Or run separately:
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

## Usage

1. Open `http://localhost:3000` in your browser
2. Paste a public Instagram or TikTok profile URL
3. Click "Analyze"
4. View the performance dashboard with sorted content

## Project Structure

```
sociallense/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   └── ...
├── server/                 # Express backend
│   ├── scrapers/          # Platform scrapers
│   │   ├── instagram.js
│   │   └── tiktok.js
│   └── index.js           # Server entry point
└── package.json
```

## Known Limitations

- Instagram may detect and block automated requests
- Private accounts cannot be analyzed
- Data accuracy depends on what's publicly visible
- Some engagement metrics are estimated

## Disclaimer

This tool is for educational purposes. Always respect platform terms of service and rate limits. Use responsibly.
