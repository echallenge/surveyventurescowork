/**
 * API Module — Public + Admin REST API
 * Handles all /api/* routes for surveys, subscribers, referrals, blog, store, impact
 */

import { jsonResponse, checkAdminAuth, getBody, generateReferralCode, trackAnalytics, trackImpact } from '../lib/utils.js';
import { generateSurveyQuestions, generateBlogPost } from '../lib/ai.js';
import { getDomainConfig } from '../config/verticals.js';
import { pushImpactWebhook } from './impact.js';

export async function handleAPIRoutes(ctx) {
  const { path, method, domain, env, request, config } = ctx;

  // ── Public APIs ──────────────────────────────────────────
  // GET /api/survey — get or generate survey
  if (path === '/api/survey' && method === 'GET') {
    return apiGetSurvey(ctx);
  }

  // POST /api/response — submit answer
  if (path === '/api/response' && method === 'POST') {
    return apiPostResponse(ctx);
  }

  // POST /api/subscribe — email signup
  if (path === '/api/subscribe' && method === 'POST') {
    return apiSubscribe(ctx);
  }

  // POST /api/unsubscribe
  if (path === '/api/unsubscribe' && method === 'POST') {
    return apiUnsubscribe(ctx);
  }

  // POST /api/referral/generate — get referral code
  if (path === '/api/referral/generate' && method === 'POST') {
    return apiGenerateReferral(ctx);
  }

  // POST /api/share — track social share
  if (path === '/api/share' && method === 'POST') {
    return apiTrackShare(ctx);
  }

  // GET /api/results — public aggregated results
  if (path === '/api/results' && method === 'GET') {
    return apiGetResults(ctx);
  }

  // POST /api/store/order — create order
  if (path === '/api/store/order' && method === 'POST') {
    return apiCreateOrder(ctx);
  }

  // ── Admin APIs ───────────────────────────────────────────
  if (path.startsWith('/api/admin/')) {
    if (!checkAdminAuth(request, env)) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    if (path === '/api/admin/stats') return apiAdminStats(ctx);
    if (path === '/api/admin/subscribers') return apiAdminSubscribers(ctx);
    if (path === '/api/admin/regenerate' && method === 'POST') return apiAdminRegenerate(ctx);
    if (path === '/api/admin/bulk-generate' && method === 'POST') return apiAdminBulkGenerate(ctx);
    if (path === '/api/admin/generate-posts' && method === 'POST') return apiAdminGeneratePosts(ctx);
    if (path === '/api/admin/export') return apiAdminExport(ctx);
  }

  return jsonResponse({ error: 'API endpoint not found' }, 404);
}

// ── Public: Get/generate survey ────────────────────────────
async function apiGetSurvey(ctx) {
  const { domain, env, config } = ctx;

  const existing = await env.DB.prepare(
    'SELECT * FROM questions WHERE domain_id = ? AND active = 1 ORDER BY question_order'
  ).bind(domain.id).all();

  if (existing.results.length > 0) {
    return jsonResponse({
      domain: { hostname: domain.hostname, topic: domain.topic, title: domain.title, description: domain.description, vertical: domain.vertical, color: domain.primary_color, accent: domain.secondary_color },
      questions: existing.results.map(q => ({ id: q.id, text: q.question_text, type: q.question_type, options: q.options ? JSON.parse(q.options) : null, order: q.question_order })),
      features: { blog: !!domain.features_blog, newsletter: !!domain.features_newsletter, store: !!domain.features_store, referrals: !!domain.features_referrals, impact: !!domain.features_impact },
    });
  }

  // Generate with AI
  const questions = await generateSurveyQuestions(env, domain.topic, domain.title, domain.vertical || 'general', config.ai_context);
  const inserts = questions.map((q, i) =>
    env.DB.prepare('INSERT INTO questions (domain_id, question_order, question_text, question_type, options) VALUES (?, ?, ?, ?, ?)')
      .bind(domain.id, i + 1, q.text, q.type, q.options ? JSON.stringify(q.options) : null)
  );
  await env.DB.batch(inserts);

  const saved = await env.DB.prepare('SELECT * FROM questions WHERE domain_id = ? ORDER BY question_order').bind(domain.id).all();

  return jsonResponse({
    domain: { hostname: domain.hostname, topic: domain.topic, title: domain.title, description: domain.description, vertical: domain.vertical, color: domain.primary_color, accent: domain.secondary_color },
    questions: saved.results.map(q => ({ id: q.id, text: q.question_text, type: q.question_type, options: q.options ? JSON.parse(q.options) : null, order: q.question_order })),
    features: { blog: !!domain.features_blog, newsletter: !!domain.features_newsletter, store: !!domain.features_store, referrals: !!domain.features_referrals, impact: !!domain.features_impact },
  });
}

// ── Public: Submit response ────────────────────────────────
async function apiPostResponse(ctx) {
  const { domain, env } = ctx;
  const { session_id, question_id, answer } = await getBody(ctx.request);
  if (!session_id || !question_id || answer === undefined) return jsonResponse({ error: 'Missing fields' }, 400);

  await env.DB.prepare(`
    INSERT INTO responses (domain_id, session_id, question_id, answer)
    VALUES (?, ?, ?, ?) ON CONFLICT(domain_id, session_id, question_id) DO UPDATE SET answer = excluded.answer
  `).bind(domain.id, session_id, question_id, String(answer)).run();

  return jsonResponse({ success: true });
}

// ── Public: Subscribe ──────────────────────────────────────
async function apiSubscribe(ctx) {
  const { domain, env, config } = ctx;
  const { email, name, session_id, source, ref } = await getBody(ctx.request);
  if (!email || !email.includes('@')) return jsonResponse({ error: 'Valid email required' }, 400);

  const refCode = ref || null;

  await env.DB.prepare(`
    INSERT INTO subscribers (domain_id, email, name, session_id, referral_code, referred_by, source)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(domain_id, email) DO UPDATE SET name = COALESCE(excluded.name, name)
  `).bind(domain.id, email.toLowerCase().trim(), name || null, session_id || null, generateReferralCode(), refCode, source || 'survey').run();

  // Update domain counter
  ctx.ctx.waitUntil(env.DB.prepare('UPDATE domains SET total_subscribers = total_subscribers + 1 WHERE id = ?').bind(domain.id).run());

  // Track impact
  if (config.impact_programs?.length) {
    for (const prog of config.impact_programs) {
      ctx.ctx.waitUntil(trackImpact(env, domain.id, 'signup', prog, email, session_id));
    }
  }

  // If referred, mark referral complete
  if (refCode) {
    ctx.ctx.waitUntil(
      env.DB.prepare("UPDATE referrals SET referred_email = ?, status = 'completed' WHERE referrer_code = ? AND domain_id = ? AND status = 'pending' LIMIT 1")
        .bind(email, refCode, domain.id).run()
    );
  }

  return jsonResponse({ success: true, message: "You're in!" });
}

// ── Public: Unsubscribe ────────────────────────────────────
async function apiUnsubscribe(ctx) {
  const { domain, env } = ctx;
  const { email } = await getBody(ctx.request);
  if (!email) return jsonResponse({ error: 'Email required' }, 400);

  await env.DB.prepare("UPDATE subscribers SET status = 'inactive' WHERE domain_id = ? AND email = ?")
    .bind(domain.id, email.toLowerCase().trim()).run();

  return jsonResponse({ success: true });
}

// ── Public: Generate referral code ─────────────────────────
async function apiGenerateReferral(ctx) {
  const { domain, env } = ctx;
  const { email } = await getBody(ctx.request);
  if (!email) return jsonResponse({ error: 'Email required' }, 400);

  // Check if subscriber already has a code
  const existing = await env.DB.prepare(
    'SELECT referral_code FROM subscribers WHERE domain_id = ? AND email = ?'
  ).bind(domain.id, email.toLowerCase()).first();

  let code = existing?.referral_code;
  if (!code) {
    code = generateReferralCode();
    // Upsert subscriber
    await env.DB.prepare(`
      INSERT INTO subscribers (domain_id, email, referral_code, source) VALUES (?, ?, ?, 'referral_page')
      ON CONFLICT(domain_id, email) DO UPDATE SET referral_code = ?
    `).bind(domain.id, email.toLowerCase(), code, code).run();
  }

  // Get referral stats
  const stats = await env.DB.prepare(`
    SELECT COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM referrals WHERE domain_id = ? AND referrer_code = ?
  `).bind(domain.id, code).first();

  return jsonResponse({
    code,
    link: `https://${domain.hostname}/r/${code}`,
    stats: { total: stats?.total || 0, completed: stats?.completed || 0, points: (stats?.completed || 0) * 25 },
  });
}

// ── Public: Track share ────────────────────────────────────
async function apiTrackShare(ctx) {
  const { domain, env, config } = ctx;
  const { platform, session_id, content_type, content_id } = await getBody(ctx.request);

  await env.DB.prepare(
    'INSERT INTO social_shares (domain_id, session_id, platform, content_type, content_id) VALUES (?, ?, ?, ?, ?)'
  ).bind(domain.id, session_id || null, platform || 'unknown', content_type || 'survey', content_id || null).run();

  // Track impact for shares
  if (config.impact_programs?.length) {
    for (const prog of config.impact_programs) {
      ctx.ctx.waitUntil(trackImpact(env, domain.id, 'share', prog, null, session_id));
    }
  }

  return jsonResponse({ success: true });
}

// ── Public: Get results ────────────────────────────────────
async function apiGetResults(ctx) {
  const { domain, env } = ctx;

  const questions = await env.DB.prepare(
    'SELECT * FROM questions WHERE domain_id = ? AND active = 1 ORDER BY question_order'
  ).bind(domain.id).all();

  const results = [];
  for (const q of questions.results) {
    if (q.question_type === 'text') continue;
    const responses = await env.DB.prepare(
      'SELECT answer, COUNT(*) as count FROM responses WHERE question_id = ? GROUP BY answer ORDER BY count DESC'
    ).bind(q.id).all();
    const total = responses.results.reduce((a, r) => a + r.count, 0);
    results.push({
      question: q.question_text, type: q.question_type, total,
      breakdown: responses.results.map(r => ({ answer: r.answer, count: r.count, pct: total ? Math.round(r.count / total * 100) : 0 })),
    });
  }

  return jsonResponse({ domain: domain.hostname, title: domain.title, results });
}

// ── Public: Create order ───────────────────────────────────
async function apiCreateOrder(ctx) {
  const { domain, env } = ctx;
  const { product_id, email } = await getBody(ctx.request);
  if (!product_id || !email) return jsonResponse({ error: 'Missing fields' }, 400);

  const product = await env.DB.prepare('SELECT * FROM products WHERE id = ? AND domain_id = ?').bind(product_id, domain.id).first();
  if (!product) return jsonResponse({ error: 'Product not found' }, 404);

  await env.DB.prepare(
    'INSERT INTO orders (domain_id, product_id, buyer_email, amount_cents, currency) VALUES (?, ?, ?, ?, ?)'
  ).bind(domain.id, product_id, email.toLowerCase(), product.price_cents, product.currency).run();

  return jsonResponse({ success: true, message: 'Order created. Payment integration pending setup.' });
}

// ── Admin: Full stats ──────────────────────────────────────
async function apiAdminStats(ctx) {
  const { env } = ctx;

  const domains = await env.DB.prepare('SELECT * FROM domains ORDER BY total_subscribers DESC').all();
  const subsTotal = await env.DB.prepare('SELECT COUNT(*) as c FROM subscribers').first();
  const completions = await env.DB.prepare('SELECT COUNT(DISTINCT session_id) as c FROM responses').first();
  const postsTotal = await env.DB.prepare('SELECT COUNT(*) as c FROM posts').first();
  const referralsTotal = await env.DB.prepare('SELECT COUNT(*) as c FROM referrals').first();
  const impactTotal = await env.DB.prepare('SELECT SUM(points) as p FROM impact_events').first();
  const recentSubs = await env.DB.prepare(
    'SELECT s.*, d.hostname FROM subscribers s JOIN domains d ON s.domain_id = d.id ORDER BY s.created_at DESC LIMIT 50'
  ).all();

  const domainStats = await Promise.all(domains.results.map(async d => {
    const subs = await env.DB.prepare('SELECT COUNT(*) as c FROM subscribers WHERE domain_id = ?').bind(d.id).first();
    const comp = await env.DB.prepare('SELECT COUNT(DISTINCT session_id) as c FROM responses WHERE domain_id = ?').bind(d.id).first();
    const posts = await env.DB.prepare('SELECT COUNT(*) as c FROM posts WHERE domain_id = ?').bind(d.id).first();
    const refs = await env.DB.prepare('SELECT COUNT(*) as c FROM referrals WHERE domain_id = ?').bind(d.id).first();
    return { ...d, subscribers: subs?.c || 0, completions: comp?.c || 0, posts: posts?.c || 0, referrals: refs?.c || 0 };
  }));

  return jsonResponse({
    domains: domainStats,
    subscribers: recentSubs.results,
    totals: {
      domains: domains.results.length,
      subscribers: subsTotal?.c || 0,
      completions: completions?.c || 0,
      posts: postsTotal?.c || 0,
      referrals: referralsTotal?.c || 0,
      impact_points: impactTotal?.p || 0,
    },
  });
}

// ── Admin: Get subscribers ─────────────────────────────────
async function apiAdminSubscribers(ctx) {
  const { env, request } = ctx;
  const domain = new URL(request.url).searchParams.get('domain');

  let query = 'SELECT s.*, d.hostname FROM subscribers s JOIN domains d ON s.domain_id = d.id';
  const params = [];

  if (domain) {
    query += ' WHERE d.hostname = ?';
    params.push(domain);
  }
  query += ' ORDER BY s.created_at DESC LIMIT 1000';

  const result = params.length
    ? await env.DB.prepare(query).bind(...params).all()
    : await env.DB.prepare(query).all();

  return jsonResponse({ subscribers: result.results });
}

// ── Admin: Regenerate ──────────────────────────────────────
async function apiAdminRegenerate(ctx) {
  const { env } = ctx;
  const { hostname } = await getBody(ctx.request);
  if (!hostname) return jsonResponse({ error: 'hostname required' }, 400);

  const dom = await env.DB.prepare('SELECT * FROM domains WHERE hostname = ?').bind(hostname).first();
  if (!dom) return jsonResponse({ error: 'Domain not found' }, 404);

  await env.DB.prepare('DELETE FROM questions WHERE domain_id = ?').bind(dom.id).run();
  const config = getDomainConfig(hostname);
  const questions = await generateSurveyQuestions(env, dom.topic, dom.title, dom.vertical, config.ai_context);

  const inserts = questions.map((q, i) =>
    env.DB.prepare('INSERT INTO questions (domain_id, question_order, question_text, question_type, options) VALUES (?, ?, ?, ?, ?)')
      .bind(dom.id, i + 1, q.text, q.type, q.options ? JSON.stringify(q.options) : null)
  );
  await env.DB.batch(inserts);

  return jsonResponse({ success: true, count: questions.length });
}

// ── Admin: Bulk generate ───────────────────────────────────
async function apiAdminBulkGenerate(ctx) {
  const { env } = ctx;
  const domainsWithout = await env.DB.prepare(`
    SELECT d.* FROM domains d
    LEFT JOIN questions q ON d.id = q.domain_id
    WHERE q.id IS NULL LIMIT 10
  `).all();

  let generated = 0;
  for (const dom of domainsWithout.results) {
    const config = getDomainConfig(dom.hostname);
    const questions = await generateSurveyQuestions(env, dom.topic, dom.title, dom.vertical, config.ai_context);
    const inserts = questions.map((q, i) =>
      env.DB.prepare('INSERT INTO questions (domain_id, question_order, question_text, question_type, options) VALUES (?, ?, ?, ?, ?)')
        .bind(dom.id, i + 1, q.text, q.type, q.options ? JSON.stringify(q.options) : null)
    );
    await env.DB.batch(inserts);
    generated++;
  }

  return jsonResponse({ success: true, domains_processed: generated });
}

// ── Admin: Generate blog posts ─────────────────────────────
async function apiAdminGeneratePosts(ctx) {
  const { env } = ctx;
  const domainsWithout = await env.DB.prepare(`
    SELECT d.* FROM domains d
    LEFT JOIN posts p ON d.id = p.domain_id
    WHERE p.id IS NULL AND d.features_blog = 1 LIMIT 5
  `).all();

  let generated = 0;
  for (const dom of domainsWithout.results) {
    const config = getDomainConfig(dom.hostname);
    const post = await generateBlogPost(env, dom.topic, dom.vertical, config.ai_context);
    if (post) {
      await env.DB.prepare(`
        INSERT INTO posts (domain_id, slug, title, excerpt, content, tags, seo_title, seo_description, status, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', datetime('now'))
      `).bind(dom.id, post.slug, post.title, post.excerpt, post.content, JSON.stringify(post.tags || []), post.seo_title, post.seo_description).run();
      generated++;
    }
  }

  return jsonResponse({ success: true, posts_generated: generated });
}

// ── Admin: Export all data ─────────────────────────────────
async function apiAdminExport(ctx) {
  const { env } = ctx;
  const domains = await env.DB.prepare('SELECT * FROM domains').all();
  const subscribers = await env.DB.prepare('SELECT s.*, d.hostname FROM subscribers s JOIN domains d ON s.domain_id = d.id').all();
  const responses = await env.DB.prepare('SELECT r.*, d.hostname FROM responses r JOIN domains d ON r.domain_id = d.id LIMIT 10000').all();

  return jsonResponse({
    exported_at: new Date().toISOString(),
    platform: 'SurveyStack Pro v2.0',
    data: {
      domains: domains.results,
      subscribers: subscribers.results,
      responses: responses.results,
    },
  });
}
