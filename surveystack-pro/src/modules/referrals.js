/**
 * Referral Module — Viral referral programs powered by Referrals.com
 * Generates unique referral codes, tracks referrals, manages rewards
 */

import { htmlResponse, jsonResponse, escHtml, generateReferralCode } from '../lib/utils.js';
import { getBlogShell } from '../templates/shell.js';
import { PLATFORM } from '../config/platform.js';

export async function handleReferralRoutes(ctx) {
  const { path, method } = ctx;

  // GET /r/:code — referral landing (redirect to survey with tracking)
  const codeMatch = path.match(/^\/r\/([a-z0-9]+)\/?$/);
  if (codeMatch && method === 'GET') {
    return handleReferralClick(ctx, codeMatch[1]);
  }

  // GET /refer — referral program page
  if ((path === '/refer' || path === '/referrals') && method === 'GET') {
    return serveReferralPage(ctx);
  }

  // GET /refer/leaderboard — top referrers
  if (path === '/refer/leaderboard' && method === 'GET') {
    return serveLeaderboard(ctx);
  }

  return jsonResponse({ error: 'Referral route not found' }, 404);
}

async function handleReferralClick(ctx, code) {
  const { hostname, domain, env } = ctx;

  // Track the referral click
  ctx.ctx.waitUntil(
    env.DB.prepare(
      "INSERT INTO referrals (domain_id, referrer_code, referrer_email, status) VALUES (?, ?, '', 'pending')"
    ).bind(domain.id, code).run().catch(() => {})
  );

  // Redirect to survey with ref parameter
  return Response.redirect(`https://${hostname}/?ref=${code}`, 302);
}

function serveReferralPage(ctx) {
  const { hostname, domain, config } = ctx;

  const tiersHtml = PLATFORM.referralTiers.map((tier, i) => `
    <div class="tier-card ${i === 0 ? 'first-tier' : ''}">
      <div class="tier-count">${tier.count}${tier.count === 1 ? '' : '+'}</div>
      <div class="tier-label">referral${tier.count === 1 ? '' : 's'}</div>
      <div class="tier-reward">${tier.reward}</div>
    </div>
  `).join('');

  const html = getBlogShell({
    hostname, config, domain,
    title: `Refer Friends — ${domain.title}`,
    content: `
      <div class="referral-page">
        <div class="ref-hero">
          <span class="ref-emoji">🚀</span>
          <h1>Refer & <span>Earn</span></h1>
          <p>Share ${escHtml(domain.title)} with friends and earn impact points, badges, and even eShares.</p>
        </div>

        <div class="ref-card">
          <div id="refNotLoggedIn">
            <h3>Get Your Referral Link</h3>
            <p>Enter your email to generate a unique referral link:</p>
            <div class="ref-form">
              <input type="email" id="refEmail" class="sub-input" placeholder="your@email.com" />
              <button class="btn-primary" onclick="getRefLink()">Generate Link →</button>
            </div>
          </div>

          <div id="refLoggedIn" style="display:none;">
            <h3>Your Referral Link</h3>
            <div class="ref-link-box">
              <code id="refLinkText"></code>
              <button class="btn-copy" onclick="copyRef()">Copy</button>
            </div>
            <div class="ref-stats" id="refStats"></div>
            <div class="ref-share-buttons">
              <a id="refTweetLink" href="#" target="_blank" class="share-btn">𝕏 Share</a>
              <a id="refLinkedInLink" href="#" target="_blank" class="share-btn">LinkedIn</a>
              <a id="refWhatsAppLink" href="#" target="_blank" class="share-btn">WhatsApp</a>
              <button onclick="copyRef()" class="share-btn">🔗 Copy</button>
            </div>
          </div>
        </div>

        <div class="tiers-section">
          <h2>Reward Tiers</h2>
          <div class="tiers-grid">${tiersHtml}</div>
        </div>

        <div class="ref-cta">
          <p>Powered by <a href="https://referrals.com" target="_blank">Referrals.com</a> &middot;
          Part of the <a href="https://ventureos.com" target="_blank">VentureOS</a> network</p>
        </div>
      </div>

      <script>
      async function getRefLink() {
        const email = document.getElementById('refEmail').value.trim();
        if (!email || !email.includes('@')) return;

        const res = await fetch('/api/referral/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (data.code) {
          const link = 'https://${hostname}/r/' + data.code;
          document.getElementById('refLinkText').textContent = link;
          document.getElementById('refTweetLink').href = 'https://twitter.com/intent/tweet?text=' +
            encodeURIComponent('Share your opinion on ${escHtml(config.topic)}! 👇') + '&url=' + encodeURIComponent(link);
          document.getElementById('refLinkedInLink').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(link);
          document.getElementById('refWhatsAppLink').href = 'https://wa.me/?text=' + encodeURIComponent('Check this out: ' + link);

          document.getElementById('refNotLoggedIn').style.display = 'none';
          document.getElementById('refLoggedIn').style.display = 'block';

          if (data.stats) {
            document.getElementById('refStats').innerHTML =
              '<div class="stat-mini"><strong>' + data.stats.total + '</strong> referrals</div>' +
              '<div class="stat-mini"><strong>' + data.stats.completed + '</strong> completed</div>' +
              '<div class="stat-mini"><strong>' + data.stats.points + '</strong> points earned</div>';
          }
        }
      }

      function copyRef() {
        const link = document.getElementById('refLinkText').textContent;
        navigator.clipboard.writeText(link);
        document.querySelector('.btn-copy').textContent = '✓ Copied!';
        setTimeout(() => document.querySelector('.btn-copy').textContent = 'Copy', 2000);
      }
      </script>
    `,
  });

  return htmlResponse(html);
}

async function serveLeaderboard(ctx) {
  const { domain, env, config, hostname } = ctx;

  const leaders = await env.DB.prepare(`
    SELECT referrer_email, referrer_code, COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM referrals WHERE domain_id = ?
    GROUP BY referrer_email ORDER BY total DESC LIMIT 25
  `).bind(domain.id).all();

  const rows = leaders.results.map((l, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td class="email">${l.referrer_email.replace(/(.{2}).*@/, '$1***@')}</td>
      <td>${l.total}</td>
      <td>${l.completed}</td>
    </tr>
  `).join('');

  const html = getBlogShell({
    hostname, config, domain,
    title: 'Referral Leaderboard',
    content: `
      <div class="leaderboard-page">
        <h1>🏆 Referral Leaderboard</h1>
        <p>Top referrers for ${escHtml(domain.title)}</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Referrer</th><th>Total</th><th>Completed</th></tr></thead>
            <tbody>${rows || '<tr><td colspan="4" class="empty">No referrals yet — be the first!</td></tr>'}</tbody>
          </table>
        </div>
        <a href="/refer" class="btn-primary" style="margin-top:24px; display:inline-block;">Start Referring →</a>
      </div>
    `,
  });

  return htmlResponse(html);
}
