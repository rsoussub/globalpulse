# GlobalPulse — Free News Aggregator

A single-page news dashboard that pulls headlines from 45+ sources across 8 countries. No backend, no subscription, no API keys.

**Live categories:** Finance, Money, Stocks, Options, Forex, War/Conflict, Elections, Sports

**Countries:** USA, UK, India, Nepal, Iran, Israel, UAE, Middle East

**Nepal-specific sources:** NEPSE Trading, ShareSansar, Merolagani, IRD Nepal, myRepublica, Himalayan Times, Online Khabar

---

## Setup (15 minutes total, free forever)

### Part 1: Host on GitHub Pages (5 min)

1. **Create a GitHub account** (if you don't have one)
   - Go to https://github.com/signup
   - Free account is all you need

2. **Create a new repository**
   - Click the **+** button (top right) → **New repository**
   - Name: `globalpulse`
   - Set to **Public**
   - Check **"Add a README file"**
   - Click **Create repository**

3. **Upload the files**
   - In your new repo, click **Add file** → **Upload files**
   - Drag and drop `index.html` into the upload area
   - Click **Commit changes**

4. **Enable GitHub Pages**
   - Go to repo **Settings** (tab at top)
   - In the left sidebar, click **Pages**
   - Under "Source", select **Deploy from a branch**
   - Branch: **main**, folder: **/ (root)**
   - Click **Save**
   - Wait 1-2 minutes

5. **Your site is live at:**
   ```
   https://YOUR_USERNAME.github.io/globalpulse/
   ```

### Part 2: Deploy Cloudflare Worker proxy (10 min)

This eliminates dependency on unreliable public CORS proxies.

1. **Create Cloudflare account**
   - Go to https://dash.cloudflare.com/sign-up
   - Email + password, no credit card needed

2. **Create a Worker**
   - Sidebar → **Workers & Pages** → **Create** → **Create Worker**
   - Name it: `rss-proxy`
   - Click **Deploy**

3. **Paste proxy code**
   - Click **Edit Code**
   - Delete all default code
   - Copy the entire contents of `cloudflare-worker-proxy.js` and paste it in
   - Click **Deploy**

4. **Copy your Worker URL**
   - It looks like: `https://rss-proxy.YOUR_USERNAME.workers.dev`

5. **Connect Worker to your dashboard**
   - Go back to your GitHub repo
   - Click on `index.html` → pencil icon (Edit)
   - Find this line (use Ctrl+F to search for `WORKER_URL`):
     ```javascript
     const WORKER_URL = '';
     ```
   - Change it to:
     ```javascript
     const WORKER_URL = 'https://rss-proxy.YOUR_USERNAME.workers.dev';
     ```
   - Click **Commit changes**
   - GitHub Pages will redeploy automatically in ~1 minute

6. **Done.** Visit your site and click Refresh.

---

## Architecture

```
Any browser/phone/tablet
        ↓
GitHub Pages (free hosting)
   serves index.html
        ↓
Browser fetches feeds via:
   1st: Your Cloudflare Worker (if configured)
   2nd: rss2json.com (free fallback)
   3rd: allorigins.win (free fallback)
   4th: corsproxy.io (free fallback)
        ↓
RSS feeds & scraped news sites
   BBC, CNBC, Reuters, NEPSE Trading, etc.
```

## Free tier limits

| Service | Free limit | Your usage |
|---------|-----------|------------|
| GitHub Pages | 100 GB bandwidth/month | ~0.01 GB |
| Cloudflare Worker | 100,000 requests/day | ~200/day |

You will never hit these limits with personal use.

## Customization

### Add a new RSS feed

Edit `index.html`, find the `RSS_FEEDS` object, add a line:

```javascript
{ url: 'https://example.com/rss.xml', cat: 'finance', src: 'Example News' },
```

### Add a website without RSS (scraping)

Find the `SCRAPE_SITES` array, add:

```javascript
{
  url: 'https://example.com/news',
  country: 'np', cat: 'stocks', src: 'Example',
  baseUrl: 'https://example.com',
  selectors: { articles: 'a[href*="/news/"]', titleFromText: true }
},
```

### Available categories

`finance` `money` `stocks` `options` `forex` `war` `election` `sports`

### Available countries

`us` `gb` `in` `np` `ir` `il` `ae` `mideast`

## Troubleshooting

**No articles loading?**
→ Open debug log (status bar link). Check if ad blocker is interfering. Try disabling it for your GitHub Pages URL.

**Some feeds show errors?**
→ The feed URL may have changed. Search for the site's current RSS feed URL and update it in `index.html`.

**Works locally but not on GitHub Pages?**
→ Make sure you committed `index.html` to the `main` branch and GitHub Pages is set to deploy from `main` / `root`.

**Want to access from phone?**
→ Just open `https://YOUR_USERNAME.github.io/globalpulse/` in your phone browser. Works on any device.
