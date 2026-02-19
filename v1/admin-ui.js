/**
 * Admin Dashboard
 * Password-protected management interface
 */

export async function handleAdminPage(request, env, hostname) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Serve the dashboard HTML
  if (path === '/admin' || path === '/admin/') {
    return new Response(getAdminHTML(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  return new Response('Not found', { status: 404 });
}

function getAdminHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SurveyStack Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0f0f12;
    --surface: #1a1a20;
    --surface2: #22222a;
    --border: #2a2a35;
    --text: #e8e6e2;
    --muted: #6b6977;
    --accent: #e8603a;
    --accent2: #3a7ee8;
    --success: #2d9e6b;
    --warning: #e8a83a;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  /* Login screen */
  #loginScreen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
  }

  .login-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 48px;
    width: 100%;
    max-width: 400px;
    text-align: center;
  }

  .login-logo {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  .login-logo span { color: var(--accent); }

  .login-sub { color: var(--muted); font-size: 14px; margin-bottom: 32px; }

  .login-input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 18px;
    color: var(--text);
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    outline: none;
    margin-bottom: 12px;
    text-align: center;
    letter-spacing: 0.1em;
    transition: border-color 0.2s;
  }
  .login-input:focus { border-color: var(--accent); }

  .login-btn {
    width: 100%;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 14px;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .login-btn:hover { opacity: 0.88; }

  .login-error { color: #e85a5a; font-size: 13px; margin-top: 12px; display: none; }

  /* Main dashboard */
  #dashScreen { display: none; }

  .topbar {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 16px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .topbar-logo {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
  .topbar-logo span { color: var(--accent); }

  .topbar-actions { display: flex; gap: 10px; align-items: center; }

  .btn-export {
    display: flex; align-items: center; gap: 6px;
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.18s;
  }
  .btn-export:hover { border-color: var(--accent); color: var(--accent); }

  .main { padding: 32px; max-width: 1200px; margin: 0 auto; }

  /* Stat cards */
  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
  }

  .stat-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-bottom: 8px;
    font-family: 'Syne', sans-serif;
  }

  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  .stat-value.orange { color: var(--accent); }
  .stat-value.blue { color: var(--accent2); }
  .stat-value.green { color: var(--success); }

  /* Section */
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* Domain table */
  .table-wrap {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 32px;
  }

  table { width: 100%; border-collapse: collapse; }
  th {
    background: var(--surface2);
    padding: 12px 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    text-align: left;
    font-family: 'Syne', sans-serif;
  }

  td {
    padding: 14px 20px;
    font-size: 14px;
    border-top: 1px solid var(--border);
  }

  tr:hover td { background: var(--surface2); }

  .domain-name {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: var(--accent2);
  }

  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
  }

  .badge-green { background: rgba(45,158,107,0.15); color: var(--success); }
  .badge-blue { background: rgba(58,126,232,0.15); color: var(--accent2); }
  .badge-orange { background: rgba(232,96,58,0.15); color: var(--accent); }

  .action-btn {
    background: none;
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .action-btn:hover { border-color: var(--warning); color: var(--warning); }

  /* Subscribers */
  .subs-table { font-size: 13px; }
  .email-cell { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--accent2); }
  .date-cell { color: var(--muted); font-size: 12px; }

  /* Loading */
  .table-loading { padding: 40px; text-align: center; color: var(--muted); }

  /* Empty */
  .empty { padding: 40px; text-align: center; color: var(--muted); }

  @media (max-width: 640px) {
    .main { padding: 16px; }
    .topbar { padding: 12px 16px; }
    th, td { padding: 10px 12px; }
  }
</style>
</head>
<body>

<!-- Login -->
<div id="loginScreen">
  <div class="login-card">
    <div class="login-logo">Survey<span>Stack</span></div>
    <div class="login-sub">Admin Dashboard</div>
    <input type="password" id="pwInput" class="login-input" placeholder="Enter admin password"
      onkeydown="if(event.key==='Enter')login()">
    <button class="login-btn" onclick="login()">Access Dashboard →</button>
    <div class="login-error" id="loginError">❌ Incorrect password</div>
  </div>
</div>

<!-- Dashboard -->
<div id="dashScreen">
  <div class="topbar">
    <div class="topbar-logo">Survey<span>Stack</span> <span style="color:var(--muted);font-size:12px;font-weight:400;">Admin</span></div>
    <div class="topbar-actions">
      <button class="btn-export" onclick="exportCSV()">⬇ Export Emails CSV</button>
    </div>
  </div>

  <div class="main">
    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">Total Domains</div>
        <div class="stat-value orange" id="statDomains">—</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Email Subscribers</div>
        <div class="stat-value blue" id="statSubs">—</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Survey Completions</div>
        <div class="stat-value green" id="statCompletions">—</div>
      </div>
    </div>

    <!-- Domains table -->
    <div class="section-title">
      Active Domains
      <span style="font-size:12px;color:var(--muted);font-weight:400;">Auto-generated from traffic</span>
    </div>
    <div class="table-wrap">
      <div id="domainsTable"><div class="table-loading">Loading domains...</div></div>
    </div>

    <!-- Recent subscribers -->
    <div class="section-title">Recent Subscribers</div>
    <div class="table-wrap">
      <div id="subsTable"><div class="table-loading">Loading subscribers...</div></div>
    </div>
  </div>
</div>

<script>
let adminKey = '';
let statsData = null;

function login() {
  const pw = document.getElementById('pwInput').value;
  if (!pw) return;
  adminKey = pw;
  loadDashboard();
}

async function loadDashboard() {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'X-Admin-Key': adminKey }
    });

    if (res.status === 401) {
      document.getElementById('loginError').style.display = 'block';
      adminKey = '';
      return;
    }

    statsData = await res.json();

    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashScreen').style.display = 'block';

    // Stats
    document.getElementById('statDomains').textContent = statsData.domains.length;
    document.getElementById('statSubs').textContent = statsData.totals.subscribers.toLocaleString();
    document.getElementById('statCompletions').textContent = statsData.totals.completions.toLocaleString();

    renderDomainsTable(statsData.domains);
    loadSubscribers();
  } catch (err) {
    document.getElementById('loginError').textContent = '⚠️ Connection error. Try again.';
    document.getElementById('loginError').style.display = 'block';
  }
}

function renderDomainsTable(domains) {
  const el = document.getElementById('domainsTable');
  if (!domains.length) {
    el.innerHTML = '<div class="empty">No domains visited yet. Share your survey URLs!</div>';
    return;
  }

  el.innerHTML = \`<table>
    <thead>
      <tr>
        <th>Domain</th>
        <th>Topic</th>
        <th>Questions</th>
        <th>Completions</th>
        <th>Subscribers</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      \${domains.map(d => \`
        <tr>
          <td><a class="domain-name" href="https://\${d.hostname}" target="_blank">\${d.hostname}</a></td>
          <td>\${d.topic}</td>
          <td><span class="badge badge-blue">\${d.questions}</span></td>
          <td><span class="badge badge-green">\${d.completions}</span></td>
          <td><span class="badge badge-orange">\${d.subscribers}</span></td>
          <td>
            <button class="action-btn" onclick="regenerate('\${d.hostname}', this)">↺ Regenerate</button>
          </td>
        </tr>
      \`).join('')}
    </tbody>
  </table>\`;
}

async function loadSubscribers() {
  const res = await fetch('/api/admin/subscribers', {
    headers: { 'X-Admin-Key': adminKey }
  });
  const data = await res.json();
  const el = document.getElementById('subsTable');

  if (!data.subscribers.length) {
    el.innerHTML = '<div class="empty">No subscribers yet. Keep sharing those survey links!</div>';
    return;
  }

  el.innerHTML = \`<table class="subs-table">
    <thead>
      <tr><th>Email</th><th>Domain</th><th>Joined</th></tr>
    </thead>
    <tbody>
      \${data.subscribers.slice(0, 50).map(s => \`
        <tr>
          <td class="email-cell">\${s.email}</td>
          <td><span class="badge badge-blue">\${s.hostname}</span></td>
          <td class="date-cell">\${new Date(s.created_at).toLocaleDateString()}</td>
        </tr>
      \`).join('')}
    </tbody>
  </table>\`;
}

async function regenerate(hostname, btn) {
  btn.textContent = '...';
  btn.disabled = true;
  try {
    const res = await fetch('/api/admin/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
      body: JSON.stringify({ hostname })
    });
    const data = await res.json();
    btn.textContent = '✓ Done';
    setTimeout(() => { btn.textContent = '↺ Regenerate'; btn.disabled = false; }, 2000);
  } catch (e) {
    btn.textContent = '✗ Error';
    btn.disabled = false;
  }
}

async function exportCSV() {
  const res = await fetch('/api/admin/subscribers', {
    headers: { 'X-Admin-Key': adminKey }
  });
  const data = await res.json();

  const rows = [['Email', 'Name', 'Domain', 'Date']];
  data.subscribers.forEach(s => {
    rows.push([s.email, s.name || '', s.hostname, new Date(s.created_at).toLocaleDateString()]);
  });

  const csv = rows.map(r => r.map(c => \`"\${String(c).replace(/"/g,'""')}"\`).join(',')).join('\\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'surveystack-subscribers-' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
}
</script>
</body>
</html>`;
}
