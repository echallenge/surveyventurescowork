/**
 * SurveyStack Pro v2.0 — Main Entry Point
 * World-leading AI-powered survey & engagement platform
 *
 * Architecture: Hybrid monolith with modular feature plugins
 * Stack: Cloudflare Workers + D1 + KV + R2
 * Domains: 1000+ survey/poll URLs routed through single Worker
 *
 * Modules:
 *   /survey   — AI-generated surveys with conditional logic
 *   /blog     — Per-domain content engine
 *   /newsletter — Email campaigns & subscriber management
 *   /store    — Digital products & commerce
 *   /referrals — Viral referral programs
 *   /social   — Social sharing & embed system
 *   /impact   — Data pipeline for ReefChallenge, SavingTheWorld, etc.
 *   /admin    — Unified dashboard
 *   /api      — Public & admin REST API
 *   /agent    — Agent card & VentureOS integration
 */

import { handleSurveyRoutes } from './modules/survey.js';
import { handleBlogRoutes } from './modules/blog.js';
import { handleNewsletterRoutes } from './modules/newsletter.js';
import { handleStoreRoutes } from './modules/store.js';
import { handleReferralRoutes } from './modules/referrals.js';
import { handleSocialRoutes } from './modules/social.js';
import { handleImpactRoutes } from './modules/impact.js';
import { handleAdminRoutes } from './modules/admin.js';
import { handleAPIRoutes } from './modules/api.js';
import { handleAgentRoutes } from './modules/agent.js';
import { getDomainConfig, detectVertical, extractTopic } from './config/verticals.js';
import { serveLandingPage } from './templates/landing.js';
import { corsHeaders, jsonResponse, trackAnalytics } from './lib/utils.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname.replace('www.', '').toLowerCase();
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(hostname) });
    }

    // ── Ensure domain exists in DB ────────────────────────────
    let domain = await getOrCreateDomain(env, hostname);

    // ── Build context object passed to all handlers ───────────
    const context = {
      request, env, ctx, url, hostname, path, method, domain,
      config: getDomainConfig(hostname),
    };

    // ── Track page view ───────────────────────────────────────
    ctx.waitUntil(trackAnalytics(env, domain.id, 'page_view', {
      path,
      referrer: request.headers.get('referer') || '',
      userAgent: request.headers.get('user-agent') || '',
      country: request.cf?.country || '',
      city: request.cf?.city || '',
    }));

    try {
      // ── Route: Agent card (.well-known) ──────────────────────
      if (path.startsWith('/.well-known/')) {
        return handleAgentRoutes(context);
      }

      // ── Route: Admin dashboard ───────────────────────────────
      if (path.startsWith('/admin')) {
        return handleAdminRoutes(context);
      }

      // ── Route: API ───────────────────────────────────────────
      if (path.startsWith('/api/')) {
        return handleAPIRoutes(context);
      }

      // ── Route: Blog ──────────────────────────────────────────
      if (path.startsWith('/blog') || path.startsWith('/posts')) {
        return handleBlogRoutes(context);
      }

      // ── Route: Newsletter ────────────────────────────────────
      if (path.startsWith('/newsletter') || path.startsWith('/subscribe')) {
        return handleNewsletterRoutes(context);
      }

      // ── Route: Store ─────────────────────────────────────────
      if (path.startsWith('/store') || path.startsWith('/products')) {
        return handleStoreRoutes(context);
      }

      // ── Route: Referrals ─────────────────────────────────────
      if (path.startsWith('/refer') || path.startsWith('/r/')) {
        return handleReferralRoutes(context);
      }

      // ── Route: Social / Sharing ──────────────────────────────
      if (path.startsWith('/share') || path === '/embed.js') {
        return handleSocialRoutes(context);
      }

      // ── Route: Impact Dashboard ──────────────────────────────
      if (path.startsWith('/impact')) {
        return handleImpactRoutes(context);
      }

      // ── Route: Survey (default) ──────────────────────────────
      if (path === '/' || path.startsWith('/survey')) {
        return handleSurveyRoutes(context);
      }

      // ── Route: Landing page for /about, /features, etc. ─────
      if (['/about', '/features', '/pricing', '/contact'].includes(path)) {
        return serveLandingPage(context);
      }

      // ── 404 ──────────────────────────────────────────────────
      return new Response('Not found', { status: 404 });

    } catch (err) {
      console.error(`[${hostname}${path}] Error:`, err);
      return jsonResponse({ error: 'Internal server error', detail: err.message }, 500);
    }
  }
};

// ── Domain auto-creation on first visit ──────────────────────
async function getOrCreateDomain(env, hostname) {
  // Check cache first
  const cached = await env.CACHE?.get(`domain:${hostname}`);
  if (cached) return JSON.parse(cached);

  let domain = await env.DB.prepare(
    'SELECT * FROM domains WHERE hostname = ?'
  ).bind(hostname).first();

  if (!domain) {
    const vertical = detectVertical(hostname);
    const topic = extractTopic(hostname);
    const config = getDomainConfig(hostname);

    await env.DB.prepare(`
      INSERT INTO domains (hostname, topic, title, description, vertical,
        primary_color, secondary_color,
        features_survey, features_blog, features_newsletter,
        features_store, features_referrals, features_social, features_impact)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      hostname, topic, config.title, config.description, vertical,
      config.color, config.accent,
      config.features.survey ? 1 : 0,
      config.features.blog ? 1 : 0,
      config.features.newsletter ? 1 : 0,
      config.features.store ? 1 : 0,
      config.features.referrals ? 1 : 0,
      config.features.social ? 1 : 0,
      config.features.impact ? 1 : 0
    ).run();

    domain = await env.DB.prepare(
      'SELECT * FROM domains WHERE hostname = ?'
    ).bind(hostname).first();
  }

  // Cache for 5 minutes
  if (env.CACHE) {
    await env.CACHE.put(`domain:${hostname}`, JSON.stringify(domain), { expirationTtl: 300 });
  }

  return domain;
}
