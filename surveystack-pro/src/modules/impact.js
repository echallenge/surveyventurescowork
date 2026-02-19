/**
 * Impact Module — Data pipeline for ReefChallenge.com, SavingTheWorld.org, etc.
 * Real-time webhook triggers + aggregated data warehouse
 */

import { htmlResponse, jsonResponse, escHtml } from '../lib/utils.js';
import { getBlogShell } from '../templates/shell.js';
import { PLATFORM } from '../config/platform.js';

export async function handleImpactRoutes(ctx) {
  const { path, method } = ctx;

  // GET /impact — impact dashboard for this domain
  if ((path === '/impact' || path === '/impact/') && method === 'GET') {
    return serveImpactDashboard(ctx);
  }

  return jsonResponse({ error: 'Impact route not found' }, 404);
}

async function serveImpactDashboard(ctx) {
  const { domain, env, config, hostname } = ctx;

  // Get impact stats
  const programStats = await env.DB.prepare(`
    SELECT program, event_type,
      COUNT(*) as count,
      SUM(points) as total_points
    FROM impact_events
    WHERE domain_id = ?
    GROUP BY program, event_type
    ORDER BY program, total_points DESC
  `).bind(domain.id).all();

  const totals = await env.DB.prepare(`
    SELECT
      COUNT(*) as total_events,
      SUM(points) as total_points,
      COUNT(DISTINCT user_email) as unique_participants
    FROM impact_events WHERE domain_id = ?
  `).bind(domain.id).first();

  // Build program cards
  const programs = config.impact_programs || [];
  const programCards = programs.map(pid => {
    const prog = PLATFORM.impact[pid];
    if (!prog) return '';

    const stats = programStats.results.filter(s => s.program === pid);
    const points = stats.reduce((a, s) => a + (s.total_points || 0), 0);
    const events = stats.reduce((a, s) => a + s.count, 0);

    return `
      <div class="impact-card">
        <div class="impact-card-header">
          <h3>${escHtml(prog.name)}</h3>
          <a href="${escHtml(prog.url)}" target="_blank" class="impact-link">Visit →</a>
        </div>
        <p class="impact-desc">${escHtml(prog.description)}</p>
        <div class="impact-stats">
          <div class="impact-stat">
            <span class="stat-value">${points.toLocaleString()}</span>
            <span class="stat-label">Impact Points</span>
          </div>
          <div class="impact-stat">
            <span class="stat-value">${events}</span>
            <span class="stat-label">Contributions</span>
          </div>
        </div>
        <div class="impact-breakdown">
          ${stats.map(s => `
            <div class="breakdown-row">
              <span>${s.event_type.replace(/_/g, ' ')}</span>
              <span>${s.count} × ${Math.round((s.total_points || 0) / Math.max(s.count, 1))} pts</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  const html = getBlogShell({
    hostname, config, domain,
    title: `Impact Dashboard — ${domain.title}`,
    content: `
      <div class="impact-page">
        <div class="impact-hero">
          <span class="impact-emoji">🌍</span>
          <h1>Your Impact <span>Matters</span></h1>
          <p>Every survey completed, every referral made, every share — it all contributes to real-world impact programs.</p>
        </div>

        <div class="impact-totals">
          <div class="total-card">
            <span class="total-value">${(totals?.total_points || 0).toLocaleString()}</span>
            <span class="total-label">Total Impact Points</span>
          </div>
          <div class="total-card">
            <span class="total-value">${totals?.total_events || 0}</span>
            <span class="total-label">Total Actions</span>
          </div>
          <div class="total-card">
            <span class="total-value">${totals?.unique_participants || 0}</span>
            <span class="total-label">Contributors</span>
          </div>
        </div>

        ${programs.length > 0 ? `
          <h2>Active Programs</h2>
          <div class="impact-programs">${programCards}</div>
        ` : `
          <div class="empty-state">
            <h2>Impact tracking active</h2>
            <p>Participation data from ${escHtml(domain.title)} is being tracked. Impact programs will be connected soon.</p>
          </div>
        `}

        <div class="impact-how">
          <h2>How to Earn Impact Points</h2>
          <div class="how-grid">
            <div class="how-card">
              <span>📋</span>
              <h4>Complete Surveys</h4>
              <p>10-15 pts per survey</p>
            </div>
            <div class="how-card">
              <span>🔗</span>
              <h4>Refer Friends</h4>
              <p>25-30 pts per referral</p>
            </div>
            <div class="how-card">
              <span>📢</span>
              <h4>Share on Social</h4>
              <p>5-10 pts per share</p>
            </div>
            <div class="how-card">
              <span>📧</span>
              <h4>Subscribe</h4>
              <p>5 pts for newsletter signup</p>
            </div>
          </div>
        </div>

        <div class="impact-footer">
          <p>Powered by <a href="https://ventureos.com" target="_blank">VentureOS</a> · Impact data flows to
          ${programs.map(pid => {
            const p = PLATFORM.impact[pid];
            return p ? `<a href="${p.url}" target="_blank">${p.name}</a>` : '';
          }).filter(Boolean).join(', ')}</p>
        </div>
      </div>
    `,
  });

  return htmlResponse(html);
}

/**
 * Send impact data to external programs (called from API module)
 */
export async function pushImpactWebhook(env, program, eventData) {
  const webhookUrl = env.IMPACT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'surveystack',
        program,
        timestamp: new Date().toISOString(),
        ...eventData,
      }),
    });
  } catch (e) {
    console.error('Impact webhook failed:', e);
  }
}
