/**
 * SurveyStack - AI-Powered Survey Platform
 * Built on Cloudflare Workers + D1
 * 
 * Domain → Topic → AI Questions → Email Capture → VentureOS
 */

import { handleSurveyPage } from './survey-ui.js';
import { handleAdminPage } from './admin-ui.js';
import { generateQuestions } from './ai.js';
import { corsHeaders, jsonResponse, extractTopicFromHostname } from './utils.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname.replace('www.', '');
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ── Admin routes ──────────────────────────────────────
    if (path.startsWith('/admin')) {
      return handleAdminPage(request, env, hostname);
    }

    // ── API routes ────────────────────────────────────────
    if (path.startsWith('/api/')) {
      return handleAPI(request, env, hostname, path, method);
    }

    // ── Embed script ──────────────────────────────────────
    if (path === '/embed.js') {
      return serveEmbedScript(hostname);
    }

    // ── Main survey page ──────────────────────────────────
    return handleSurveyPage(request, env, hostname);
  }
};

async function handleAPI(request, env, hostname, path, method) {
  try {
    // GET /api/survey - get or generate survey for this domain
    if (path === '/api/survey' && method === 'GET') {
      return await getSurvey(env, hostname);
    }

    // POST /api/response - submit a survey answer
    if (path === '/api/response' && method === 'POST') {
      const body = await request.json();
      return await saveResponse(env, hostname, body);
    }

    // POST /api/subscribe - capture email
    if (path === '/api/subscribe' && method === 'POST') {
      const body = await request.json();
      return await saveSubscriber(env, hostname, body);
    }

    // GET /api/admin/stats - dashboard data (protected)
    if (path === '/api/admin/stats' && method === 'GET') {
      const auth = request.headers.get('X-Admin-Key');
      if (auth !== env.ADMIN_PASSWORD) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }
      return await getAdminStats(env);
    }

    // GET /api/admin/subscribers - export emails (protected)
    if (path === '/api/admin/subscribers' && method === 'GET') {
      const auth = request.headers.get('X-Admin-Key');
      if (auth !== env.ADMIN_PASSWORD) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }
      return await getSubscribers(env, url.searchParams.get('domain'));
    }

    // POST /api/admin/regenerate - force regenerate questions
    if (path === '/api/admin/regenerate' && method === 'POST') {
      const auth = request.headers.get('X-Admin-Key');
      if (auth !== env.ADMIN_PASSWORD) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }
      const body = await request.json();
      return await regenerateSurvey(env, body.hostname || hostname);
    }

    return jsonResponse({ error: 'Not found' }, 404);
  } catch (err) {
    console.error('API error:', err);
    return jsonResponse({ error: 'Server error', detail: err.message }, 500);
  }
}

// ── Core: Get or generate survey ─────────────────────────
async function getSurvey(env, hostname) {
  // Check if domain exists in DB
  let domain = await env.DB.prepare(
    'SELECT * FROM domains WHERE hostname = ?'
  ).bind(hostname).first();

  if (!domain) {
    // New domain — create it and generate questions
    const topic = extractTopicFromHostname(hostname);
    const { title, description } = generateDomainMeta(hostname, topic);

    const insert = await env.DB.prepare(
      'INSERT INTO domains (hostname, topic, title, description) VALUES (?, ?, ?, ?)'
    ).bind(hostname, topic, title, description).run();

    domain = {
      id: insert.meta.last_row_id,
      hostname,
      topic,
      title,
      description
    };
  }

  // Check if questions already exist (cached)
  const existing = await env.DB.prepare(
    'SELECT * FROM questions WHERE domain_id = ? ORDER BY question_order ASC'
  ).bind(domain.id).all();

  if (existing.results.length > 0) {
    return jsonResponse({
      domain: {
        hostname: domain.hostname,
        topic: domain.topic,
        title: domain.title,
        description: domain.description
      },
      questions: existing.results.map(q => ({
        id: q.id,
        text: q.question_text,
        type: q.question_type,
        options: q.options ? JSON.parse(q.options) : null,
        order: q.question_order
      }))
    });
  }

  // Generate questions with AI
  const questions = await generateQuestions(env, domain.topic, domain.title);

  // Save to DB
  const inserts = questions.map((q, i) =>
    env.DB.prepare(
      'INSERT INTO questions (domain_id, question_order, question_text, question_type, options) VALUES (?, ?, ?, ?, ?)'
    ).bind(domain.id, i + 1, q.text, q.type, q.options ? JSON.stringify(q.options) : null)
  );

  await env.DB.batch(inserts);

  // Fetch saved questions with real IDs
  const saved = await env.DB.prepare(
    'SELECT * FROM questions WHERE domain_id = ? ORDER BY question_order ASC'
  ).bind(domain.id).all();

  return jsonResponse({
    domain: {
      hostname: domain.hostname,
      topic: domain.topic,
      title: domain.title,
      description: domain.description
    },
    questions: saved.results.map(q => ({
      id: q.id,
      text: q.question_text,
      type: q.question_type,
      options: q.options ? JSON.parse(q.options) : null,
      order: q.question_order
    }))
  });
}

// ── Save individual response ──────────────────────────────
async function saveResponse(env, hostname, body) {
  const { session_id, question_id, answer } = body;
  if (!session_id || !question_id || answer === undefined) {
    return jsonResponse({ error: 'Missing required fields' }, 400);
  }

  const domain = await env.DB.prepare(
    'SELECT id FROM domains WHERE hostname = ?'
  ).bind(hostname).first();

  if (!domain) return jsonResponse({ error: 'Domain not found' }, 404);

  // Upsert: update if exists (user changed answer)
  await env.DB.prepare(`
    INSERT INTO responses (domain_id, session_id, question_id, answer)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(domain_id, session_id, question_id) DO UPDATE SET answer = excluded.answer
  `).bind(domain.id, session_id, question_id, String(answer)).run();

  return jsonResponse({ success: true });
}

// ── Save email subscriber ─────────────────────────────────
async function saveSubscriber(env, hostname, body) {
  const { email, name, session_id } = body;
  if (!email || !email.includes('@')) {
    return jsonResponse({ error: 'Valid email required' }, 400);
  }

  const domain = await env.DB.prepare(
    'SELECT id FROM domains WHERE hostname = ?'
  ).bind(hostname).first();

  if (!domain) return jsonResponse({ error: 'Domain not found' }, 404);

  // Don't error on duplicate, just update
  await env.DB.prepare(`
    INSERT INTO subscribers (domain_id, email, name, session_id)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(domain_id, email) DO UPDATE SET name = COALESCE(excluded.name, name)
  `).bind(domain.id, email.toLowerCase().trim(), name || null, session_id || null).run();

  return jsonResponse({ success: true, message: 'You\'re in! Check your inbox.' });
}

// ── Admin: stats dashboard ────────────────────────────────
async function getAdminStats(env) {
  const domains = await env.DB.prepare('SELECT * FROM domains ORDER BY created_at DESC').all();

  const stats = await Promise.all(domains.results.map(async (d) => {
    const subs = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM subscribers WHERE domain_id = ?'
    ).bind(d.id).first();

    const responses = await env.DB.prepare(
      'SELECT COUNT(DISTINCT session_id) as count FROM responses WHERE domain_id = ?'
    ).bind(d.id).first();

    const questions = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM questions WHERE domain_id = ?'
    ).bind(d.id).first();

    return {
      id: d.id,
      hostname: d.hostname,
      topic: d.topic,
      title: d.title,
      subscribers: subs?.count || 0,
      completions: responses?.count || 0,
      questions: questions?.count || 0,
      created_at: d.created_at
    };
  }));

  const totalSubs = stats.reduce((a, s) => a + s.subscribers, 0);
  const totalCompletions = stats.reduce((a, s) => a + s.completions, 0);

  return jsonResponse({ domains: stats, totals: { subscribers: totalSubs, completions: totalCompletions } });
}

// ── Admin: get subscribers ────────────────────────────────
async function getSubscribers(env, domainFilter) {
  let query, results;

  if (domainFilter) {
    const domain = await env.DB.prepare(
      'SELECT id FROM domains WHERE hostname = ?'
    ).bind(domainFilter).first();

    if (!domain) return jsonResponse({ subscribers: [] });

    results = await env.DB.prepare(
      'SELECT s.email, s.name, s.created_at, d.hostname FROM subscribers s JOIN domains d ON s.domain_id = d.id WHERE s.domain_id = ? ORDER BY s.created_at DESC'
    ).bind(domain.id).all();
  } else {
    results = await env.DB.prepare(
      'SELECT s.email, s.name, s.created_at, d.hostname FROM subscribers s JOIN domains d ON s.domain_id = d.id ORDER BY s.created_at DESC'
    ).all();
  }

  return jsonResponse({ subscribers: results.results });
}

// ── Admin: force regenerate questions ────────────────────
async function regenerateSurvey(env, hostname) {
  const domain = await env.DB.prepare(
    'SELECT * FROM domains WHERE hostname = ?'
  ).bind(hostname).first();

  if (!domain) return jsonResponse({ error: 'Domain not found' }, 404);

  // Delete old questions
  await env.DB.prepare('DELETE FROM questions WHERE domain_id = ?').bind(domain.id).run();

  // Regenerate
  const questions = await generateQuestions(env, domain.topic, domain.title);
  const inserts = questions.map((q, i) =>
    env.DB.prepare(
      'INSERT INTO questions (domain_id, question_order, question_text, question_type, options) VALUES (?, ?, ?, ?, ?)'
    ).bind(domain.id, i + 1, q.text, q.type, q.options ? JSON.stringify(q.options) : null)
  );

  await env.DB.batch(inserts);
  return jsonResponse({ success: true, message: `Regenerated ${questions.length} questions for ${hostname}` });
}

// ── Helpers ───────────────────────────────────────────────
function generateDomainMeta(hostname, topic) {
  const isPool = hostname.includes('poll');
  const type = isPool ? 'Poll' : 'Survey';
  return {
    title: `${topic} ${type}`,
    description: `Share your ${topic.toLowerCase()} experiences and opinions. Takes 2 minutes.`
  };
}

function serveEmbedScript(hostname) {
  const script = `
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = 'https://' + '${hostname}' + '/?embed=1';
  iframe.style.cssText = 'width:100%;height:600px;border:none;border-radius:12px;';
  iframe.allow = 'clipboard-write';
  var el = document.currentScript || document.querySelector('script[src*="embed.js"]');
  el.parentNode.insertBefore(iframe, el.nextSibling);
})();
`.trim();

  return new Response(script, {
    headers: { 'Content-Type': 'application/javascript', ...corsHeaders }
  });
}
