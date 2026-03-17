// ============================================================
// GlobalPulse RSS Proxy — Cloudflare Worker
// ============================================================
// This Worker fetches RSS/HTML from any URL and returns it
// to your browser, bypassing CORS restrictions.
//
// FREE TIER: 100,000 requests/day (you'll use ~200)
//
// SETUP INSTRUCTIONS:
// 1. Go to https://dash.cloudflare.com → sign up (free, no card)
// 2. Click "Workers & Pages" in the left sidebar
// 3. Click "Create" → "Create Worker"
// 4. Name it something like "rss-proxy"
// 5. Delete the default code and paste THIS ENTIRE FILE
// 6. Click "Deploy"
// 7. You'll get a URL like: https://rss-proxy.YOUR_USERNAME.workers.dev
// 8. Copy that URL into your news-dashboard.html (see WORKER_URL variable)
// ============================================================

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return jsonResponse({ error: 'Missing ?url= parameter' }, 400);
    }

    // Validate URL
    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return jsonResponse({ error: 'Invalid URL' }, 400);
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return jsonResponse({ error: 'Only HTTP(S) URLs allowed' }, 400);
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'GlobalPulse-RSS-Reader/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml, text/html, */*',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        return jsonResponse({
          error: `Upstream returned ${response.status}`,
          status: response.status,
        }, 502);
      }

      const contentType = response.headers.get('content-type') || 'text/plain';
      const body = await response.text();

      return new Response(body, {
        headers: {
          ...corsHeaders(),
          'Content-Type': contentType,
          'X-Proxied-URL': targetUrl,
          'Cache-Control': 'public, max-age=300', // Cache 5 min at edge
        },
      });
    } catch (err) {
      return jsonResponse({ error: `Fetch failed: ${err.message}` }, 502);
    }
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
    },
  });
}
