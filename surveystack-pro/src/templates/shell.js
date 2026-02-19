/**
 * Shared HTML shell for blog, newsletter, store, referrals, impact pages
 * Consistent branding with per-domain color theming
 */

import { escHtml } from '../lib/utils.js';

export function getBlogShell({ hostname, config, domain, title, description, content }) {
  const color = domain.primary_color || config.color || '#e8603a';
  const accent = domain.secondary_color || config.accent || '#3a7ee8';
  const icon = config.icon || '📋';
  const domainTitle = domain.title || config.title || hostname;
  const nav = buildNav(hostname, domain, config);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(title || domainTitle)}</title>
<meta name="description" content="${escHtml(description || domain.description || config.description)}" />
<meta property="og:title" content="${escHtml(title || domainTitle)}" />
<meta property="og:description" content="${escHtml(description || domain.description || '')}" />
<meta property="og:url" content="https://${hostname}" />
<meta property="og:image" content="https://${hostname}/share/card" />
<link rel="alternate" type="application/rss+xml" title="${escHtml(domainTitle)} Blog" href="https://${hostname}/blog/feed.xml" />
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --color: ${color}; --accent: ${accent};
    --ink: #0d0d0d; --paper: #f7f4ef; --card: #ffffff;
    --muted: #8a8680; --border: #e2ddd8; --success: #2d9e6b;
    --shadow: 0 2px 20px rgba(0,0,0,0.06);
    --shadow-lg: 0 8px 40px rgba(0,0,0,0.10);
  }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); min-height: 100vh; }

  /* Navigation */
  .site-nav { background: var(--card); border-bottom: 1px solid var(--border); padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(12px); }
  .nav-logo { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800; color: var(--ink); text-decoration: none; display: flex; align-items: center; gap: 8px; }
  .nav-logo .icon { font-size: 20px; }
  .nav-logo span { color: var(--color); }
  .nav-links { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
  .nav-link { font-size: 13px; font-weight: 500; color: var(--muted); text-decoration: none; padding: 6px 12px; border-radius: 8px; transition: all 0.15s; }
  .nav-link:hover { color: var(--ink); background: var(--paper); }
  .nav-link.active { color: var(--color); font-weight: 600; }
  .nav-cta { font-size: 13px; font-weight: 700; color: white; background: var(--color); text-decoration: none; padding: 8px 16px; border-radius: 8px; font-family: 'Syne', sans-serif; }
  .nav-cta:hover { opacity: 0.9; }

  /* Main content */
  .site-main { max-width: 900px; margin: 0 auto; padding: 40px 24px; }

  /* Common components */
  h1, h2, h3 { font-family: 'Syne', sans-serif; letter-spacing: -0.02em; }
  h1 { font-size: clamp(28px, 5vw, 42px); font-weight: 800; line-height: 1.1; margin-bottom: 16px; }
  h1 span { color: var(--color); }
  h2 { font-size: 22px; font-weight: 700; margin: 32px 0 16px; }
  h3 { font-size: 18px; font-weight: 700; margin: 24px 0 12px; }
  p { line-height: 1.7; margin-bottom: 16px; }
  a { color: var(--color); }

  .btn-primary { display: inline-flex; align-items: center; gap: 6px; background: var(--color); color: white; border: none; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 10px; cursor: pointer; text-decoration: none; transition: all 0.2s; }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
  .btn-secondary { display: inline-flex; align-items: center; gap: 6px; background: var(--paper); border: 1.5px solid var(--border); color: var(--ink); font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; padding: 12px 22px; border-radius: 10px; cursor: pointer; text-decoration: none; }
  .btn-small { font-size: 12px; padding: 6px 14px; border-radius: 8px; background: var(--paper); border: 1px solid var(--border); color: var(--ink); text-decoration: none; font-weight: 500; }
  .btn-full { width: 100%; justify-content: center; }

  .sub-input { width: 100%; padding: 14px 18px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 15px; font-family: 'DM Sans'; color: var(--ink); background: var(--paper); outline: none; }
  .sub-input:focus { border-color: var(--color); background: white; }

  .badge { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; background: rgba(0,0,0,0.06); color: var(--muted); }
  .tag { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; background: rgba(0,0,0,0.05); color: var(--muted); margin: 2px; }

  .empty-state { text-align: center; padding: 60px 20px; }
  .empty-icon { font-size: 48px; margin-bottom: 16px; }
  .empty-state h2 { margin-bottom: 8px; }
  .empty-state p { color: var(--muted); margin-bottom: 24px; }

  .back-link { font-size: 14px; color: var(--muted); text-decoration: none; display: inline-block; margin-bottom: 20px; }
  .back-link:hover { color: var(--ink); }

  /* Blog styles */
  .blog-header { text-align: center; margin-bottom: 40px; }
  .blog-header p { color: var(--muted); font-size: 16px; }
  .posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .post-card { background: var(--card); border-radius: 16px; overflow: hidden; border: 1px solid var(--border); transition: all 0.2s; }
  .post-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
  .post-cover { width: 100%; height: 180px; object-fit: cover; }
  .post-info { padding: 20px; }
  .post-meta { display: flex; gap: 12px; font-size: 12px; color: var(--muted); margin-bottom: 8px; padding: 20px 20px 0; }
  .post-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; line-height: 1.3; margin: 0 0 8px; padding: 0 20px; }
  .post-title a { color: var(--ink); text-decoration: none; }
  .post-title a:hover { color: var(--color); }
  .post-excerpt { font-size: 14px; color: var(--muted); line-height: 1.5; padding: 0 20px; margin-bottom: 12px; }
  .post-tags { padding: 0 20px 20px; }

  .blog-post { max-width: 720px; margin: 0 auto; }
  .post-header { margin-bottom: 32px; }
  .post-header h1 { margin-bottom: 12px; }
  .post-meta-full { display: flex; gap: 8px; font-size: 14px; color: var(--muted); margin-bottom: 12px; flex-wrap: wrap; }
  .post-hero { width: 100%; border-radius: 16px; margin-bottom: 32px; }
  .post-content { font-size: 16px; line-height: 1.8; }
  .post-content h2 { font-size: 24px; margin: 36px 0 16px; }
  .post-content h3 { font-size: 20px; margin: 28px 0 12px; }
  .post-content blockquote { border-left: 3px solid var(--color); padding: 12px 20px; margin: 20px 0; background: rgba(0,0,0,0.02); border-radius: 0 8px 8px 0; color: var(--muted); }
  .post-content pre { background: var(--ink); color: #e8e6e2; padding: 20px; border-radius: 12px; overflow-x: auto; margin: 20px 0; font-size: 14px; }
  .post-content code { background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
  .post-content pre code { background: none; padding: 0; }
  .post-cta { background: var(--card); border: 1.5px solid var(--border); border-radius: 16px; padding: 32px; text-align: center; margin: 40px 0; }
  .post-cta h3 { margin-top: 0; }
  .post-cta p { color: var(--muted); margin-bottom: 20px; }
  .share-bar { display: flex; align-items: center; gap: 12px; margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--border); }
  .share-bar span { font-size: 13px; color: var(--muted); font-weight: 500; }
  .share-link { font-size: 13px; color: var(--ink); text-decoration: none; padding: 6px 14px; border: 1px solid var(--border); border-radius: 8px; background: none; cursor: pointer; font-family: 'DM Sans'; }
  .share-link:hover { border-color: var(--color); color: var(--color); }

  /* Subscribe page */
  .subscribe-page { max-width: 560px; margin: 0 auto; }
  .sub-hero { text-align: center; margin-bottom: 32px; }
  .sub-icon { font-size: 48px; display: block; margin-bottom: 12px; }
  .sub-card { background: var(--card); border-radius: 16px; padding: 32px; border: 1px solid var(--border); box-shadow: var(--shadow); margin-bottom: 40px; }
  .sub-form { display: flex; flex-direction: column; gap: 12px; }
  .sub-fine { font-size: 12px; color: var(--muted); text-align: center; margin-top: 4px; margin-bottom: 0; }
  .sub-success { text-align: center; }
  .big-check { font-size: 48px; margin-bottom: 12px; display: block; color: var(--success); }
  .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
  .benefit { background: var(--card); border-radius: 12px; padding: 20px; border: 1px solid var(--border); }
  .benefit .b-icon { font-size: 24px; display: block; margin-bottom: 8px; }
  .benefit h4 { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  .benefit p { font-size: 13px; color: var(--muted); margin: 0; }

  /* Referral page */
  .referral-page { max-width: 640px; margin: 0 auto; }
  .ref-hero { text-align: center; margin-bottom: 32px; }
  .ref-emoji { font-size: 48px; display: block; margin-bottom: 12px; }
  .ref-card { background: var(--card); border-radius: 16px; padding: 32px; border: 1px solid var(--border); box-shadow: var(--shadow); margin-bottom: 40px; }
  .ref-form { display: flex; gap: 10px; }
  .ref-link-box { display: flex; gap: 8px; align-items: center; background: var(--paper); padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 16px; }
  .ref-link-box code { font-size: 13px; flex: 1; word-break: break-all; color: var(--color); }
  .btn-copy { background: var(--color); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .ref-stats { display: flex; gap: 20px; margin-bottom: 16px; }
  .stat-mini { font-size: 14px; }
  .stat-mini strong { color: var(--color); }
  .ref-share-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
  .share-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border); font-size: 13px; font-weight: 500; text-decoration: none; color: var(--ink); cursor: pointer; background: none; font-family: 'DM Sans'; }
  .share-btn:hover { border-color: var(--color); }
  .tiers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
  .tier-card { background: var(--card); border-radius: 12px; padding: 20px; border: 1px solid var(--border); text-align: center; }
  .tier-count { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--color); }
  .tier-label { font-size: 12px; color: var(--muted); margin-bottom: 8px; }
  .tier-reward { font-size: 13px; font-weight: 500; }
  .ref-cta { text-align: center; font-size: 13px; color: var(--muted); margin-top: 32px; }

  /* Store page */
  .store-page { }
  .store-header { text-align: center; margin-bottom: 32px; }
  .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
  .product-card { background: var(--card); border-radius: 16px; overflow: hidden; border: 1px solid var(--border); transition: all 0.2s; }
  .product-card:hover { box-shadow: var(--shadow-lg); }
  .product-img { width: 100%; height: 200px; object-fit: cover; }
  .product-placeholder { width: 100%; height: 160px; display: flex; align-items: center; justify-content: center; font-size: 48px; background: var(--paper); }
  .product-info { padding: 20px; }
  .product-info h3 { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; margin: 8px 0; }
  .product-info p { font-size: 13px; color: var(--muted); margin-bottom: 12px; }
  .product-footer { display: flex; justify-content: space-between; align-items: center; }
  .product-price { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: var(--color); }
  .product-page .product-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 24px; }
  .product-placeholder-lg { width: 100%; height: 300px; display: flex; align-items: center; justify-content: center; font-size: 72px; background: var(--card); border-radius: 16px; border: 1px solid var(--border); }
  .product-price-lg { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: var(--color); margin: 16px 0; }
  .purchase-section { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; }
  .purchase-note { font-size: 12px; color: var(--muted); text-align: center; }

  /* Impact page */
  .impact-page { max-width: 800px; margin: 0 auto; }
  .impact-hero { text-align: center; margin-bottom: 32px; }
  .impact-emoji { font-size: 48px; display: block; margin-bottom: 12px; }
  .impact-totals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 32px; }
  .total-card { background: var(--card); border-radius: 14px; padding: 24px; text-align: center; border: 1px solid var(--border); }
  .total-value { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: var(--color); display: block; }
  .total-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
  .impact-programs { display: grid; gap: 16px; margin-bottom: 32px; }
  .impact-card { background: var(--card); border-radius: 14px; padding: 24px; border: 1px solid var(--border); }
  .impact-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .impact-card h3 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin: 0; }
  .impact-link { font-size: 13px; color: var(--color); text-decoration: none; }
  .impact-desc { font-size: 14px; color: var(--muted); margin-bottom: 16px; }
  .impact-stats { display: flex; gap: 32px; margin-bottom: 16px; }
  .impact-stat .stat-value { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--color); display: block; }
  .impact-stat .stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; }
  .breakdown-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-top: 1px solid var(--border); }
  .how-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
  .how-card { background: var(--card); border-radius: 12px; padding: 20px; border: 1px solid var(--border); text-align: center; }
  .how-card span { font-size: 28px; display: block; margin-bottom: 8px; }
  .how-card h4 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  .how-card p { font-size: 13px; color: var(--muted); margin: 0; }
  .impact-footer { text-align: center; font-size: 13px; color: var(--muted); margin-top: 40px; }

  /* Leaderboard */
  .leaderboard-page { max-width: 600px; margin: 0 auto; text-align: center; }
  .leaderboard-page h1 { margin-bottom: 8px; }
  .leaderboard-page > p { color: var(--muted); margin-bottom: 24px; }
  .table-wrap { background: var(--card); border-radius: 14px; overflow: hidden; border: 1px solid var(--border); }
  table { width: 100%; border-collapse: collapse; }
  th { background: var(--paper); padding: 10px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); text-align: left; }
  td { padding: 12px 16px; font-size: 14px; border-top: 1px solid var(--border); }
  .rank { font-family: 'Syne', sans-serif; font-weight: 800; color: var(--color); }
  .empty { padding: 40px; text-align: center; color: var(--muted); }

  /* Pagination */
  .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 32px; }
  .page-btn { font-size: 14px; color: var(--color); text-decoration: none; padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; }
  .page-btn:hover { background: var(--card); }
  .page-info { font-size: 13px; color: var(--muted); }

  /* Footer */
  .site-footer { text-align: center; padding: 40px 24px; font-size: 12px; color: var(--muted); border-top: 1px solid var(--border); margin-top: 60px; }
  .site-footer a { color: var(--muted); text-decoration: none; }
  .site-footer a:hover { color: var(--ink); }
  .footer-links { display: flex; gap: 16px; justify-content: center; margin-top: 8px; }

  /* Responsive */
  @media (max-width: 640px) {
    .site-main { padding: 24px 16px; }
    .nav-links { display: none; }
    .product-page .product-detail { grid-template-columns: 1fr; }
    .impact-totals { grid-template-columns: 1fr; }
    .ref-form { flex-direction: column; }
  }
</style>
</head>
<body>
  <nav class="site-nav">
    <a href="/" class="nav-logo"><span class="icon">${icon}</span> ${escHtml(domainTitle)}</a>
    ${nav}
  </nav>
  <main class="site-main">${content}</main>
  <footer class="site-footer">
    <div>Powered by <a href="https://ventureos.com" target="_blank">VentureOS</a> · <a href="https://agentdao.com" target="_blank">AgentDAO</a> · <a href="https://referrals.com" target="_blank">Referrals.com</a></div>
    <div class="footer-links">
      <a href="/">Survey</a>
      <a href="/blog">Blog</a>
      <a href="/subscribe">Newsletter</a>
      <a href="/refer">Refer</a>
      <a href="/impact">Impact</a>
      <a href="/blog/feed.xml">RSS</a>
    </div>
  </footer>
</body>
</html>`;
}

function buildNav(hostname, domain, config) {
  const links = [
    { href: '/', label: 'Survey', show: true },
    { href: '/blog', label: 'Blog', show: !!domain.features_blog },
    { href: '/subscribe', label: 'Newsletter', show: !!domain.features_newsletter },
    { href: '/store', label: 'Store', show: !!domain.features_store },
    { href: '/refer', label: 'Refer', show: !!domain.features_referrals },
    { href: '/impact', label: 'Impact', show: !!domain.features_impact },
  ];

  const navLinks = links.filter(l => l.show).map(l =>
    `<a href="${l.href}" class="nav-link">${l.label}</a>`
  ).join('');

  return `
    <div class="nav-links">
      ${navLinks}
      <a href="/subscribe" class="nav-cta">Subscribe</a>
    </div>
  `;
}
