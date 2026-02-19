/**
 * Newsletter Module — Email capture, campaigns, subscriber management
 */

import { generateNewsletter } from '../lib/ai.js';
import { htmlResponse, jsonResponse, escHtml } from '../lib/utils.js';
import { getBlogShell } from '../templates/shell.js';

export async function handleNewsletterRoutes(ctx) {
  const { path, method } = ctx;

  // GET /subscribe — subscription landing page
  if ((path === '/subscribe' || path === '/newsletter') && method === 'GET') {
    return serveSubscribePage(ctx);
  }

  // GET /newsletter/unsubscribe — unsubscribe
  if (path === '/newsletter/unsubscribe' && method === 'GET') {
    return serveUnsubscribePage(ctx);
  }

  return jsonResponse({ error: 'Newsletter route not found' }, 404);
}

function serveSubscribePage(ctx) {
  const { hostname, domain, config } = ctx;

  const html = getBlogShell({
    hostname, config, domain,
    title: `Subscribe to ${domain.title}`,
    content: `
      <div class="subscribe-page">
        <div class="sub-hero">
          <span class="sub-icon">${config.icon}</span>
          <h1>Stay in the <span>Loop</span></h1>
          <p>Get weekly insights from the ${escHtml(config.topic)} community — survey results, trending opinions, and exclusive content.</p>
        </div>

        <div class="sub-card">
          <div class="sub-form" id="subForm">
            <input type="text" id="nameInput" class="sub-input" placeholder="Your name (optional)" />
            <input type="email" id="emailInput" class="sub-input" placeholder="your@email.com" required />
            <button class="btn-primary btn-full" onclick="subscribe()">Subscribe Free →</button>
            <p class="sub-fine">No spam, ever. Unsubscribe anytime. We respect your privacy.</p>
          </div>
          <div id="subSuccess" style="display:none" class="sub-success">
            <span class="big-check">✓</span>
            <h2>You're in!</h2>
            <p>Check your inbox for a welcome message. We'll send weekly insights every Friday.</p>
            <a href="/" class="btn-secondary">Take the Survey →</a>
          </div>
        </div>

        <div class="sub-benefits">
          <h3>What you'll get</h3>
          <div class="benefits-grid">
            <div class="benefit">
              <span class="b-icon">📊</span>
              <h4>Weekly Results</h4>
              <p>See aggregated survey results and how your answers compare</p>
            </div>
            <div class="benefit">
              <span class="b-icon">🔥</span>
              <h4>Trending Topics</h4>
              <p>The hottest ${escHtml(config.topic)} discussions from our community</p>
            </div>
            <div class="benefit">
              <span class="b-icon">🎯</span>
              <h4>Exclusive Insights</h4>
              <p>Data-driven analysis you won't find anywhere else</p>
            </div>
            <div class="benefit">
              <span class="b-icon">🏆</span>
              <h4>Impact Points</h4>
              <p>Earn points for participation that support real-world programs</p>
            </div>
          </div>
        </div>
      </div>

      <script>
      async function subscribe() {
        const email = document.getElementById('emailInput').value.trim();
        const name = document.getElementById('nameInput').value.trim();
        if (!email || !email.includes('@')) {
          document.getElementById('emailInput').style.borderColor = '#ef4444';
          return;
        }
        try {
          await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, source: 'newsletter_page' })
          });
        } catch(e) {}
        document.getElementById('subForm').style.display = 'none';
        document.getElementById('subSuccess').style.display = 'block';
      }
      document.getElementById('emailInput')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') subscribe();
      });
      </script>
    `,
  });

  return htmlResponse(html);
}

function serveUnsubscribePage(ctx) {
  const { hostname, domain, config } = ctx;

  const html = getBlogShell({
    hostname, config, domain,
    title: 'Unsubscribe',
    content: `
      <div class="subscribe-page" style="text-align:center; padding: 60px 20px;">
        <h1>Unsubscribe</h1>
        <p>Enter your email to unsubscribe from ${escHtml(domain.title)} newsletters.</p>
        <div style="max-width:400px; margin:24px auto;">
          <input type="email" id="unsubEmail" class="sub-input" placeholder="your@email.com" />
          <button class="btn-primary btn-full" onclick="unsub()" style="margin-top:12px;">Unsubscribe</button>
        </div>
        <div id="unsubMsg" style="display:none; margin-top:20px; color: var(--muted);">
          You've been unsubscribed. We'll miss you!
        </div>
      </div>
      <script>
      async function unsub() {
        const email = document.getElementById('unsubEmail').value.trim();
        if (!email) return;
        await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        document.getElementById('unsubMsg').style.display = 'block';
      }
      </script>
    `,
  });

  return htmlResponse(html);
}
