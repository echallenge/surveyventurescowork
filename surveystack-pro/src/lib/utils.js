/**
 * Shared utilities — CORS, JSON responses, analytics, helpers
 */

export function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin.includes('.') ? `https://${origin}` : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function htmlResponse(html, status = 200, extra = {}) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      ...extra,
    },
  });
}

/**
 * Track an analytics event (non-blocking)
 */
export async function trackAnalytics(env, domainId, event, data = {}) {
  try {
    await env.DB.prepare(`
      INSERT INTO analytics (domain_id, event, session_id, path, referrer, user_agent, country, city, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      domainId,
      event,
      data.sessionId || null,
      data.path || null,
      data.referrer || null,
      data.userAgent || null,
      data.country || null,
      data.city || null,
      JSON.stringify(data)
    ).run();
  } catch (e) {
    console.error('Analytics tracking error:', e);
  }
}

/**
 * Track impact event and award points
 */
export async function trackImpact(env, domainId, eventType, program, userEmail, sessionId, extraData = {}) {
  const pointsMap = {
    survey_complete: 10,
    signup: 5,
    referral: 25,
    purchase: 50,
    share: 5,
    blog_read: 2,
  };

  const points = pointsMap[eventType] || 0;

  try {
    await env.DB.prepare(`
      INSERT INTO impact_events (domain_id, event_type, program, points, user_email, session_id, data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(domainId, eventType, program, points, userEmail, sessionId, JSON.stringify(extraData)).run();
  } catch (e) {
    console.error('Impact tracking error:', e);
  }
}

/**
 * Generate a referral code
 */
export function generateReferralCode() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Generate a session ID
 */
export function generateSessionId() {
  return 'ss_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Escape HTML
 */
export function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Simple markdown to HTML converter (for blog posts)
 */
export function markdownToHtml(md) {
  let html = md
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:12px;margin:16px 0;" />')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr />')
    // Lists
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');

  return `<p>${html}</p>`;
}

/**
 * Auth check for admin routes
 */
export function checkAdminAuth(request, env) {
  const key = request.headers.get('X-Admin-Key') ||
    new URL(request.url).searchParams.get('key');
  return key === env.ADMIN_PASSWORD;
}

/**
 * Get request body as JSON safely
 */
export async function getBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
