/**
 * Social Sharing & Embed Module — Viral distribution engine
 */

import { htmlResponse, jsonResponse, corsHeaders } from '../lib/utils.js';

export async function handleSocialRoutes(ctx) {
  const { path, method } = ctx;

  // GET /embed.js — embeddable survey widget
  if (path === '/embed.js') {
    return serveEmbedScript(ctx);
  }

  // GET /share — share page with OG metadata
  if (path === '/share' && method === 'GET') {
    return serveSharePage(ctx);
  }

  // GET /share/card — dynamic OG image (future: R2-backed)
  if (path === '/share/card') {
    return serveShareCard(ctx);
  }

  return jsonResponse({ error: 'Social route not found' }, 404);
}

function serveEmbedScript(ctx) {
  const { hostname, config } = ctx;

  const script = `
(function() {
  var container = document.currentScript || document.querySelector('script[src*="embed.js"]');
  var iframe = document.createElement('iframe');
  iframe.src = 'https://${hostname}/?embed=1';
  iframe.style.cssText = 'width:100%;min-height:650px;border:none;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.1);';
  iframe.allow = 'clipboard-write';
  iframe.loading = 'lazy';
  iframe.title = '${config.title} - Powered by SurveyStack';

  // Responsive height adjustment
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'surveystack-resize') {
      iframe.style.height = e.data.height + 'px';
    }
  });

  container.parentNode.insertBefore(iframe, container.nextSibling);
})();
`.trim();

  return new Response(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
      ...corsHeaders(ctx.hostname),
    },
  });
}

function serveSharePage(ctx) {
  const { hostname, domain, config, request } = ctx;
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'survey'; // survey, post, result
  const id = url.searchParams.get('id') || '';

  const shareUrl = `https://${hostname}`;
  const title = domain.title;
  const description = domain.description;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Share</title>
<meta property="og:type" content="website" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${shareUrl}" />
<meta property="og:image" content="https://${hostname}/share/card?type=${type}" />
<meta property="og:site_name" content="SurveyStack" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="https://${hostname}/share/card?type=${type}" />
<meta http-equiv="refresh" content="0;url=${shareUrl}">
</head>
<body>
<p>Redirecting to <a href="${shareUrl}">${title}</a>...</p>
</body>
</html>`;

  return htmlResponse(html);
}

function serveShareCard(ctx) {
  const { config, domain } = ctx;

  // Generate a simple SVG social card
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${config.color}" />
  <rect x="0" y="0" width="1200" height="630" fill="url(#grad)" />
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${config.color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${config.accent};stop-opacity:1" />
    </linearGradient>
  </defs>
  <text x="80" y="280" font-family="system-ui, sans-serif" font-size="72" font-weight="800" fill="white" letter-spacing="-2">${domain.title || config.topic}</text>
  <text x="80" y="350" font-family="system-ui, sans-serif" font-size="28" fill="rgba(255,255,255,0.8)">${domain.description || 'Share your opinion — takes 2 minutes'}</text>
  <text x="80" y="540" font-family="system-ui, sans-serif" font-size="20" fill="rgba(255,255,255,0.6)">Powered by SurveyStack · VentureOS · AgentDAO</text>
  <text x="1120" y="540" font-family="system-ui, sans-serif" font-size="64" fill="rgba(255,255,255,0.3)" text-anchor="end">${config.icon}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
