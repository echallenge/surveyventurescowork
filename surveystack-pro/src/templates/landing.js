/**
 * Landing Page — /about, /features, /pricing, /contact
 */

import { htmlResponse, escHtml } from '../lib/utils.js';
import { getBlogShell } from './shell.js';

export function serveLandingPage(ctx) {
  const { path, hostname, domain, config } = ctx;
  const page = path.replace('/', '');

  const pages = {
    about: aboutPage(ctx),
    features: featuresPage(ctx),
    pricing: pricingPage(ctx),
    contact: contactPage(ctx),
  };

  const content = pages[page] || '<h1>Page not found</h1>';

  const html = getBlogShell({
    hostname, config, domain,
    title: `${page.charAt(0).toUpperCase() + page.slice(1)} — ${domain.title}`,
    content,
  });

  return htmlResponse(html);
}

function aboutPage(ctx) {
  const { config, domain } = ctx;
  return `
    <div style="max-width:640px;margin:0 auto;text-align:center;">
      <span style="font-size:64px;display:block;margin-bottom:16px;">${config.icon}</span>
      <h1>About <span>${escHtml(domain.title)}</span></h1>
      <p style="font-size:18px;color:var(--muted);margin-bottom:32px;">
        ${escHtml(domain.title)} is part of the SurveyStack network — 1,000+ domain-specific survey platforms powered by AI.
      </p>
      <p>Every survey on ${escHtml(domain.hostname)} generates AI-powered, topic-specific questions designed to collect meaningful ${escHtml(config.topic)} insights. Responses feed into community analytics, blog content, and impact programs that make a real difference.</p>
      <h2>Our Network</h2>
      <p>SurveyStack is built on <a href="https://ventureos.com" target="_blank">VentureOS</a> — the operating system for URL-based ventures. Each domain in the network is a tokenized smart entity with its own community, content, and commerce.</p>
      <p>Coordination is handled by <a href="https://agentdao.com" target="_blank">AgentDAO</a>'s 59-agent swarm, ensuring every domain gets world-class survey design, content creation, and growth strategies — autonomously.</p>
      <div style="margin-top:32px;">
        <a href="/" class="btn-primary">Take the Survey →</a>
      </div>
    </div>
  `;
}

function featuresPage(ctx) {
  return `
    <div style="max-width:720px;margin:0 auto;">
      <h1 style="text-align:center;">Platform <span>Features</span></h1>
      <p style="text-align:center;color:var(--muted);margin-bottom:40px;">Everything needed to build an engaged community around any topic.</p>

      <div style="display:grid;gap:20px;">
        ${[
          { icon: '🤖', title: 'AI-Powered Surveys', desc: 'Claude generates topic-specific, research-grade questions that achieve 90%+ completion rates.' },
          { icon: '📝', title: 'Blog Engine', desc: 'AI-generated SEO-optimized content specific to your domain topic. Auto-published, always relevant.' },
          { icon: '📧', title: 'Newsletter System', desc: 'Email capture, subscriber management, and AI-generated weekly digests with survey insights.' },
          { icon: '🔗', title: 'Referral Programs', desc: 'Viral growth engine with unique referral codes, reward tiers, and leaderboards. Powered by Referrals.com.' },
          { icon: '🏪', title: 'Digital Store', desc: 'Sell guides, reports, premium access, and digital products. ADAO + fiat payment support.' },
          { icon: '📢', title: 'Social Sharing', desc: 'Dynamic OG cards, one-click sharing to all platforms, embeddable survey widgets.' },
          { icon: '🌍', title: 'Impact Tracking', desc: 'Every action earns impact points that flow to programs like ReefChallenge.com and SavingTheWorld.org.' },
          { icon: '📊', title: 'Analytics Dashboard', desc: 'Real-time stats across all domains — subscribers, completions, referrals, revenue, impact.' },
          { icon: '🤝', title: 'Agent Card (MCP/A2A)', desc: 'Every domain publishes a machine-readable agent card for AI-to-AI communication.' },
          { icon: '💎', title: 'eShares Tokenization', desc: '1M eShares per domain on Base mainnet. Community ownership and governance built in.' },
        ].map(f => `
          <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;display:flex;gap:16px;align-items:flex-start;">
            <span style="font-size:28px;flex-shrink:0;">${f.icon}</span>
            <div>
              <h3 style="margin:0 0 6px;font-size:16px;">${f.title}</h3>
              <p style="margin:0;font-size:14px;color:var(--muted);">${f.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function pricingPage(ctx) {
  return `
    <div style="max-width:600px;margin:0 auto;text-align:center;">
      <h1>Simple <span>Pricing</span></h1>
      <p style="color:var(--muted);margin-bottom:40px;">Surveys are free. Forever. Premium features unlock with ADAO tokens.</p>

      <div style="display:grid;gap:20px;">
        <div style="background:var(--card);border:2px solid var(--border);border-radius:16px;padding:32px;">
          <h3 style="margin-bottom:4px;">Free</h3>
          <p style="font-size:36px;font-weight:800;font-family:Syne;margin:12px 0;">$0</p>
          <p style="color:var(--muted);font-size:14px;">AI surveys, email capture, social sharing, referral program, blog, newsletter, impact tracking</p>
          <a href="/" style="display:inline-block;margin-top:16px;padding:10px 24px;background:var(--color);color:white;border-radius:8px;text-decoration:none;font-weight:700;">Get Started →</a>
        </div>
        <div style="background:var(--card);border:2px solid var(--color);border-radius:16px;padding:32px;">
          <h3 style="margin-bottom:4px;">Pro (ADAO)</h3>
          <p style="font-size:36px;font-weight:800;font-family:Syne;color:var(--color);margin:12px 0;">Token-Gated</p>
          <p style="color:var(--muted);font-size:14px;">Premium survey results, API access, store, advanced analytics, white-label, priority agent support</p>
          <a href="https://agentdao.com" target="_blank" style="display:inline-block;margin-top:16px;padding:10px 24px;border:2px solid var(--color);color:var(--color);border-radius:8px;text-decoration:none;font-weight:700;">Learn About ADAO →</a>
        </div>
      </div>
    </div>
  `;
}

function contactPage(ctx) {
  const { hostname } = ctx;
  return `
    <div style="max-width:500px;margin:0 auto;text-align:center;">
      <h1>Get in <span>Touch</span></h1>
      <p style="color:var(--muted);margin-bottom:32px;">Questions, partnerships, or feedback — we'd love to hear from you.</p>
      <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:32px;text-align:left;">
        <p><strong>Email:</strong> hello@${hostname}</p>
        <p><strong>Network:</strong> <a href="https://ventureos.com" target="_blank">VentureOS</a></p>
        <p><strong>Community:</strong> <a href="https://contrib.com" target="_blank">Contrib.com</a></p>
        <p><strong>Agent coordination:</strong> <a href="https://agentdao.com" target="_blank">AgentDAO.com</a></p>
      </div>
    </div>
  `;
}
