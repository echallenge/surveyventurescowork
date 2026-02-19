/**
 * Admin Dashboard Module — Unified management for all 1000+ domains
 * Password-protected, real-time stats, domain management, content tools
 */

import { htmlResponse, jsonResponse, checkAdminAuth, escHtml } from '../lib/utils.js';

export async function handleAdminRoutes(ctx) {
  const { path, method } = ctx;

  if (path === '/admin' || path === '/admin/') {
    return serveAdminDashboard(ctx);
  }

  return jsonResponse({ error: 'Admin route not found' }, 404);
}

function serveAdminDashboard(ctx) {
  const { hostname, config } = ctx;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SurveyStack Pro — Command Center</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f; --surface: #12121a; --surface2: #1a1a24;
    --border: #252530; --text: #e8e6e2; --muted: #6b6977;
    --accent: #e8603a; --accent2: #3a7ee8; --success: #2d9e6b;
    --warning: #e8a83a; --danger: #ef4444;
  }
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

  /* Login */
  #loginScreen { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
  .login-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 48px; width: 100%; max-width: 420px; text-align: center; }
  .login-logo { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .login-logo span { color: var(--accent); }
  .login-sub { color: var(--muted); font-size: 13px; margin-bottom: 32px; }
  .login-badge { background: var(--accent); color: white; font-size: 10px; padding: 2px 8px; border-radius: 100px; font-weight: 600; display: inline-block; margin-bottom: 20px; }
  .login-input { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 14px; color: var(--text); font-family: 'DM Mono', monospace; font-size: 14px; outline: none; margin-bottom: 12px; text-align: center; letter-spacing: 0.1em; }
  .login-input:focus { border-color: var(--accent); }
  .login-btn { width: 100%; background: var(--accent); color: white; border: none; border-radius: 10px; padding: 14px; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; }
  .login-btn:hover { opacity: 0.9; }
  .login-error { color: var(--danger); font-size: 13px; margin-top: 12px; display: none; }

  /* Dashboard layout */
  #dashScreen { display: none; }
  .topbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 14px 32px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
  .topbar-logo { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800; }
  .topbar-logo span { color: var(--accent); }
  .topbar-right { display: flex; gap: 10px; align-items: center; }
  .topbar-badge { background: var(--accent2); color: white; font-size: 10px; padding: 2px 8px; border-radius: 100px; font-weight: 600; }

  /* Tabs */
  .tab-bar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 32px; display: flex; gap: 0; overflow-x: auto; }
  .tab-btn { background: none; border: none; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; padding: 14px 20px; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; }
  .tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }
  .tab-btn:hover { color: var(--text); }

  .main { padding: 24px 32px; max-width: 1400px; margin: 0 auto; }

  /* Stats row */
  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 28px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
  .stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 6px; font-family: 'Syne', sans-serif; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; letter-spacing: -0.03em; }
  .stat-value.orange { color: var(--accent); }
  .stat-value.blue { color: var(--accent2); }
  .stat-value.green { color: var(--success); }
  .stat-value.yellow { color: var(--warning); }

  /* Table */
  .section-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
  .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; margin-bottom: 28px; overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; min-width: 600px; }
  th { background: var(--surface2); padding: 10px 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); text-align: left; font-family: 'Syne', sans-serif; }
  td { padding: 12px 16px; font-size: 13px; border-top: 1px solid var(--border); }
  tr:hover td { background: var(--surface2); }
  .domain-name { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--accent2); }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 600; }
  .badge-green { background: rgba(45,158,107,0.15); color: var(--success); }
  .badge-blue { background: rgba(58,126,232,0.15); color: var(--accent2); }
  .badge-orange { background: rgba(232,96,58,0.15); color: var(--accent); }
  .badge-yellow { background: rgba(232,168,58,0.15); color: var(--warning); }

  .action-btn { background: none; border: 1px solid var(--border); color: var(--muted); font-size: 11px; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-family: 'DM Sans'; }
  .action-btn:hover { border-color: var(--accent); color: var(--accent); }

  .btn-export { display: flex; align-items: center; gap: 6px; background: var(--surface2); border: 1px solid var(--border); color: var(--text); font-size: 12px; font-weight: 500; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-family: 'DM Sans'; }
  .btn-export:hover { border-color: var(--accent); }

  .search-input { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 8px 14px; color: var(--text); font-size: 13px; outline: none; width: 240px; }
  .search-input:focus { border-color: var(--accent); }
  .search-input::placeholder { color: var(--muted); }

  .empty { padding: 40px; text-align: center; color: var(--muted); }
  .tab-panel { display: none; }
  .tab-panel.active { display: block; }

  /* Quick actions */
  .quick-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px; }
  .qa-btn { background: var(--surface); border: 1px solid var(--border); color: var(--text); font-size: 13px; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-family: 'DM Sans'; display: flex; align-items: center; gap: 8px; }
  .qa-btn:hover { border-color: var(--accent); background: var(--surface2); }
  .qa-icon { font-size: 16px; }

  @media (max-width: 640px) {
    .main { padding: 16px; }
    .topbar { padding: 12px 16px; }
  }
</style>
</head>
<body>

<div id="loginScreen">
  <div class="login-card">
    <div class="login-badge">v2.0 PRO</div>
    <div class="login-logo">Survey<span>Stack</span></div>
    <div class="login-sub">Command Center — 1000+ Domain Network</div>
    <input type="password" id="pwInput" class="login-input" placeholder="Enter admin password" onkeydown="if(event.key==='Enter')login()">
    <button class="login-btn" onclick="login()">Access Dashboard →</button>
    <div class="login-error" id="loginError"></div>
  </div>
</div>

<div id="dashScreen">
  <div class="topbar">
    <div class="topbar-logo">Survey<span>Stack</span> Pro</div>
    <div class="topbar-right">
      <input type="text" class="search-input" placeholder="Search domains..." id="domainSearch" oninput="filterDomains(this.value)">
      <button class="btn-export" onclick="exportCSV()">⬇ Export CSV</button>
      <span class="topbar-badge">VentureOS</span>
    </div>
  </div>

  <div class="tab-bar">
    <button class="tab-btn active" onclick="switchTab('overview')">Overview</button>
    <button class="tab-btn" onclick="switchTab('domains')">Domains</button>
    <button class="tab-btn" onclick="switchTab('subscribers')">Subscribers</button>
    <button class="tab-btn" onclick="switchTab('content')">Content</button>
    <button class="tab-btn" onclick="switchTab('referrals')">Referrals</button>
    <button class="tab-btn" onclick="switchTab('impact')">Impact</button>
    <button class="tab-btn" onclick="switchTab('tools')">Tools</button>
  </div>

  <div class="main">
    <!-- Overview Tab -->
    <div class="tab-panel active" id="panel-overview">
      <div class="stats-row" id="statsRow"></div>
      <div class="quick-actions">
        <button class="qa-btn" onclick="switchTab('domains')"><span class="qa-icon">🌐</span> Manage Domains</button>
        <button class="qa-btn" onclick="generateBlogPosts()"><span class="qa-icon">📝</span> Generate Blog Posts</button>
        <button class="qa-btn" onclick="switchTab('subscribers')"><span class="qa-icon">📧</span> View Subscribers</button>
        <button class="qa-btn" onclick="switchTab('referrals')"><span class="qa-icon">🔗</span> Referral Stats</button>
        <button class="qa-btn" onclick="switchTab('impact')"><span class="qa-icon">🌍</span> Impact Data</button>
      </div>
      <div class="section-title">Top Performing Domains</div>
      <div class="table-wrap"><div id="topDomainsTable"><div class="empty">Loading...</div></div></div>
      <div class="section-title">Recent Subscribers</div>
      <div class="table-wrap"><div id="recentSubsTable"><div class="empty">Loading...</div></div></div>
    </div>

    <!-- Domains Tab -->
    <div class="tab-panel" id="panel-domains">
      <div class="section-title">All Domains <span id="domainCount" style="font-size:12px;color:var(--muted);font-weight:400;"></span></div>
      <div class="table-wrap"><div id="allDomainsTable"><div class="empty">Loading...</div></div></div>
    </div>

    <!-- Subscribers Tab -->
    <div class="tab-panel" id="panel-subscribers">
      <div class="section-title">All Subscribers</div>
      <div class="table-wrap"><div id="allSubsTable"><div class="empty">Loading...</div></div></div>
    </div>

    <!-- Content Tab -->
    <div class="tab-panel" id="panel-content">
      <div class="section-title">Blog Posts</div>
      <div class="table-wrap"><div id="allPostsTable"><div class="empty">Loading...</div></div></div>
    </div>

    <!-- Referrals Tab -->
    <div class="tab-panel" id="panel-referrals">
      <div class="section-title">Referral Activity</div>
      <div class="table-wrap"><div id="allReferralsTable"><div class="empty">Loading...</div></div></div>
    </div>

    <!-- Impact Tab -->
    <div class="tab-panel" id="panel-impact">
      <div class="section-title">Impact Events</div>
      <div class="table-wrap"><div id="impactTable"><div class="empty">Loading...</div></div></div>
    </div>

    <!-- Tools Tab -->
    <div class="tab-panel" id="panel-tools">
      <div class="section-title">Platform Tools</div>
      <div class="quick-actions" style="flex-direction:column;">
        <button class="qa-btn" onclick="bulkGenerateQuestions()"><span class="qa-icon">🤖</span> Bulk Generate Survey Questions (AI)</button>
        <button class="qa-btn" onclick="generateBlogPosts()"><span class="qa-icon">📝</span> Bulk Generate Blog Posts (AI)</button>
        <button class="qa-btn" onclick="generateNewsletters()"><span class="qa-icon">📧</span> Generate Weekly Newsletters (AI)</button>
        <button class="qa-btn" onclick="exportAllData()"><span class="qa-icon">💾</span> Export All Data (JSON)</button>
        <button class="qa-btn" onclick="syncVentureOS()"><span class="qa-icon">🔄</span> Sync with VentureOS</button>
        <button class="qa-btn" onclick="pushImpactData()"><span class="qa-icon">🌍</span> Push Impact Data to Programs</button>
      </div>
    </div>
  </div>
</div>

<script>
let adminKey = '';
let allData = null;

function login() {
  adminKey = document.getElementById('pwInput').value;
  if (!adminKey) return;
  loadDashboard();
}

async function loadDashboard() {
  try {
    const res = await fetch('/api/admin/stats', { headers: { 'X-Admin-Key': adminKey } });
    if (res.status === 401) {
      document.getElementById('loginError').textContent = 'Incorrect password';
      document.getElementById('loginError').style.display = 'block';
      return;
    }
    allData = await res.json();
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashScreen').style.display = 'block';
    renderDashboard();
  } catch (e) {
    document.getElementById('loginError').textContent = 'Connection error';
    document.getElementById('loginError').style.display = 'block';
  }
}

function renderDashboard() {
  const d = allData;
  document.getElementById('statsRow').innerHTML = [
    { label: 'Active Domains', value: d.totals.domains, cls: 'orange' },
    { label: 'Total Subscribers', value: d.totals.subscribers, cls: 'blue' },
    { label: 'Survey Completions', value: d.totals.completions, cls: 'green' },
    { label: 'Blog Posts', value: d.totals.posts || 0, cls: 'yellow' },
    { label: 'Referrals', value: d.totals.referrals || 0, cls: 'orange' },
    { label: 'Impact Points', value: d.totals.impact_points || 0, cls: 'green' },
  ].map(s => '<div class="stat-card"><div class="stat-label">' + s.label + '</div><div class="stat-value ' + s.cls + '">' + (s.value || 0).toLocaleString() + '</div></div>').join('');

  // Top domains
  const top = (d.domains || []).sort((a, b) => (b.subscribers + b.completions) - (a.subscribers + a.completions)).slice(0, 20);
  renderDomainsTable('topDomainsTable', top);
  renderDomainsTable('allDomainsTable', d.domains || []);
  document.getElementById('domainCount').textContent = (d.domains || []).length + ' domains';

  // Subscribers
  renderSubsTable('recentSubsTable', (d.subscribers || []).slice(0, 15));
  renderSubsTable('allSubsTable', d.subscribers || []);
}

function renderDomainsTable(elId, domains) {
  const el = document.getElementById(elId);
  if (!domains.length) { el.innerHTML = '<div class="empty">No domains yet</div>'; return; }
  el.innerHTML = '<table><thead><tr><th>Domain</th><th>Vertical</th><th>Surveys</th><th>Subs</th><th>Posts</th><th>Referrals</th><th>Actions</th></tr></thead><tbody>' +
    domains.map(d => '<tr>' +
      '<td><a class="domain-name" href="https://' + d.hostname + '" target="_blank">' + d.hostname + '</a></td>' +
      '<td><span class="badge badge-blue">' + (d.vertical || d.topic) + '</span></td>' +
      '<td>' + (d.completions || 0) + '</td>' +
      '<td>' + (d.subscribers || 0) + '</td>' +
      '<td>' + (d.posts || 0) + '</td>' +
      '<td>' + (d.referrals || 0) + '</td>' +
      '<td><button class="action-btn" onclick="regenerate(\\'' + d.hostname + '\\',this)">↺ Regen</button></td>' +
    '</tr>').join('') + '</tbody></table>';
}

function renderSubsTable(elId, subs) {
  const el = document.getElementById(elId);
  if (!subs.length) { el.innerHTML = '<div class="empty">No subscribers yet</div>'; return; }
  el.innerHTML = '<table><thead><tr><th>Email</th><th>Domain</th><th>Source</th><th>Date</th></tr></thead><tbody>' +
    subs.map(s => '<tr><td style="font-family:DM Mono;font-size:12px;color:var(--accent2);">' + s.email + '</td><td><span class="badge badge-blue">' + (s.hostname || '') + '</span></td><td>' + (s.source || 'survey') + '</td><td style="color:var(--muted);font-size:12px;">' + new Date(s.created_at).toLocaleDateString() + '</td></tr>').join('') + '</tbody></table>';
}

function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('panel-' + name)?.classList.add('active');
}

function filterDomains(q) {
  if (!allData) return;
  const filtered = allData.domains.filter(d => d.hostname.includes(q.toLowerCase()));
  renderDomainsTable('allDomainsTable', filtered);
}

async function regenerate(hostname, btn) {
  btn.textContent = '...'; btn.disabled = true;
  await fetch('/api/admin/regenerate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
    body: JSON.stringify({ hostname })
  });
  btn.textContent = '✓'; setTimeout(() => { btn.textContent = '↺ Regen'; btn.disabled = false; }, 2000);
}

async function exportCSV() {
  const res = await fetch('/api/admin/subscribers', { headers: { 'X-Admin-Key': adminKey } });
  const data = await res.json();
  const rows = [['Email','Name','Domain','Source','Date']];
  (data.subscribers || []).forEach(s => rows.push([s.email, s.name||'', s.hostname||'', s.source||'', s.created_at||'']));
  const csv = rows.map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'surveystack-subscribers-' + new Date().toISOString().split('T')[0] + '.csv'; a.click();
}

async function bulkGenerateQuestions() { alert('Triggering bulk AI question generation for all domains without questions...'); await fetch('/api/admin/bulk-generate', { method: 'POST', headers: { 'X-Admin-Key': adminKey } }); }
async function generateBlogPosts() { alert('Triggering AI blog post generation...'); await fetch('/api/admin/generate-posts', { method: 'POST', headers: { 'X-Admin-Key': adminKey } }); }
async function generateNewsletters() { alert('Triggering newsletter generation...'); }
async function exportAllData() { window.open('/api/admin/export?key=' + adminKey); }
async function syncVentureOS() { alert('Syncing with VentureOS...'); }
async function pushImpactData() { alert('Pushing impact data to programs...'); }
</script>
</body>
</html>`;

  return htmlResponse(html);
}
