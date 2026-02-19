/**
 * Blog Module — AI-generated content engine per domain
 * Each survey domain gets its own blog with SEO-optimized posts
 */

import { generateBlogPost } from '../lib/ai.js';
import { htmlResponse, jsonResponse, markdownToHtml, escHtml, trackAnalytics } from '../lib/utils.js';
import { getBlogShell } from '../templates/shell.js';

export async function handleBlogRoutes(ctx) {
  const { path, method, domain, env, config } = ctx;

  // GET /blog — blog index
  if ((path === '/blog' || path === '/blog/') && method === 'GET') {
    return serveBlogIndex(ctx);
  }

  // GET /blog/:slug — single post
  const slugMatch = path.match(/^\/blog\/([a-z0-9-]+)\/?$/);
  if (slugMatch && method === 'GET') {
    return serveBlogPost(ctx, slugMatch[1]);
  }

  // GET /posts/feed.xml — RSS feed
  if (path === '/posts/feed.xml' || path === '/blog/feed.xml') {
    return serveRSSFeed(ctx);
  }

  return jsonResponse({ error: 'Blog route not found' }, 404);
}

async function serveBlogIndex(ctx) {
  const { domain, env, config, hostname } = ctx;
  const page = parseInt(new URL(ctx.request.url).searchParams.get('page') || '1');
  const perPage = 12;
  const offset = (page - 1) * perPage;

  const posts = await env.DB.prepare(
    `SELECT id, slug, title, excerpt, author, cover_image_url, tags, published_at, views, shares
     FROM posts WHERE domain_id = ? AND status = 'published'
     ORDER BY published_at DESC LIMIT ? OFFSET ?`
  ).bind(domain.id, perPage, offset).all();

  const total = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM posts WHERE domain_id = ? AND status = 'published'"
  ).bind(domain.id).first();

  const postsHtml = posts.results.length === 0
    ? `<div class="empty-state">
        <div class="empty-icon">${config.icon}</div>
        <h2>Blog Coming Soon</h2>
        <p>We're crafting insightful ${config.topic} content. Subscribe to get notified!</p>
        <a href="/subscribe" class="btn-primary">Get Notified →</a>
      </div>`
    : posts.results.map(p => `
      <article class="post-card">
        ${p.cover_image_url ? `<img src="${escHtml(p.cover_image_url)}" alt="${escHtml(p.title)}" class="post-cover" />` : ''}
        <div class="post-meta">
          <span class="post-date">${new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span class="post-views">${p.views} reads</span>
        </div>
        <h2 class="post-title"><a href="/blog/${escHtml(p.slug)}">${escHtml(p.title)}</a></h2>
        <p class="post-excerpt">${escHtml(p.excerpt || '')}</p>
        <div class="post-tags">${(JSON.parse(p.tags || '[]')).map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>
      </article>
    `).join('');

  const totalPages = Math.ceil((total?.count || 0) / perPage);
  const pagination = totalPages > 1
    ? `<div class="pagination">
        ${page > 1 ? `<a href="/blog?page=${page - 1}" class="page-btn">← Previous</a>` : ''}
        <span class="page-info">Page ${page} of ${totalPages}</span>
        ${page < totalPages ? `<a href="/blog?page=${page + 1}" class="page-btn">Next →</a>` : ''}
      </div>`
    : '';

  const html = getBlogShell({
    hostname,
    config,
    domain,
    title: `${domain.title} Blog`,
    content: `
      <div class="blog-header">
        <h1>${config.icon} ${escHtml(domain.title)} <span>Blog</span></h1>
        <p>Insights, trends, and analysis from the ${escHtml(config.topic)} community</p>
      </div>
      <div class="posts-grid">${postsHtml}</div>
      ${pagination}
    `,
  });

  return htmlResponse(html);
}

async function serveBlogPost(ctx, slug) {
  const { domain, env, config, hostname } = ctx;

  const post = await env.DB.prepare(
    "SELECT * FROM posts WHERE domain_id = ? AND slug = ? AND status = 'published'"
  ).bind(domain.id, slug).first();

  if (!post) return htmlResponse('<h1>Post not found</h1>', 404);

  // Increment views
  ctx.ctx.waitUntil(
    env.DB.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').bind(post.id).run()
  );

  const contentHtml = markdownToHtml(post.content);
  const tags = JSON.parse(post.tags || '[]');

  const html = getBlogShell({
    hostname,
    config,
    domain,
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    content: `
      <article class="blog-post">
        <div class="post-header">
          <a href="/blog" class="back-link">← All Posts</a>
          <h1>${escHtml(post.title)}</h1>
          <div class="post-meta-full">
            <span>By ${escHtml(post.author)}</span>
            <span>·</span>
            <time>${new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
            <span>·</span>
            <span>${post.views + 1} reads</span>
          </div>
          <div class="post-tags">${tags.map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>
        </div>
        ${post.cover_image_url ? `<img src="${escHtml(post.cover_image_url)}" class="post-hero" alt="${escHtml(post.title)}" />` : ''}
        <div class="post-content">${contentHtml}</div>
        <div class="post-cta">
          <h3>Share your perspective</h3>
          <p>Enjoyed this article? Take our quick ${escHtml(config.topic)} survey and see how your views compare.</p>
          <a href="/" class="btn-primary">Take the Survey →</a>
        </div>
        <div class="share-bar">
          <span>Share:</span>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=https://${hostname}/blog/${slug}" target="_blank" class="share-link">𝕏</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://${hostname}/blog/${slug}" target="_blank" class="share-link">LinkedIn</a>
          <button onclick="navigator.clipboard.writeText(window.location.href);this.textContent='Copied!'" class="share-link">Copy Link</button>
        </div>
      </article>
    `,
  });

  return htmlResponse(html);
}

async function serveRSSFeed(ctx) {
  const { domain, env, hostname } = ctx;

  const posts = await env.DB.prepare(
    `SELECT title, slug, excerpt, published_at FROM posts
     WHERE domain_id = ? AND status = 'published' ORDER BY published_at DESC LIMIT 20`
  ).bind(domain.id).all();

  const items = posts.results.map(p => `
    <item>
      <title>${escHtml(p.title)}</title>
      <link>https://${hostname}/blog/${p.slug}</link>
      <description>${escHtml(p.excerpt || '')}</description>
      <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
      <guid>https://${hostname}/blog/${p.slug}</guid>
    </item>
  `).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escHtml(domain.title)} Blog</title>
    <link>https://${hostname}/blog</link>
    <description>${escHtml(domain.description)}</description>
    <language>en</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
