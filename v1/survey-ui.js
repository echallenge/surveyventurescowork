/**
 * Survey UI — Beautiful public-facing survey experience
 * Served as HTML from the Worker
 */

export async function handleSurveyPage(request, env, hostname) {
  const url = new URL(request.url);
  const isEmbed = url.searchParams.get('embed') === '1';
  const shareUrl = `https://${hostname}`;

  const html = getSurveyHTML(hostname, shareUrl, isEmbed);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': isEmbed ? 'ALLOWALL' : 'SAMEORIGIN',
      'Cache-Control': 'no-cache'
    }
  });
}

function getSurveyHTML(hostname, shareUrl, isEmbed) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SurveyStack</title>
<meta property="og:title" content="Take Our Survey" />
<meta property="og:description" content="Share your opinion — takes just 2 minutes." />
<meta property="og:url" content="${shareUrl}" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #0d0d0d;
    --paper: #f7f4ef;
    --accent: #e8603a;
    --accent2: #3a7ee8;
    --muted: #8a8680;
    --card: #ffffff;
    --border: #e2ddd8;
    --success: #2d9e6b;
    --shadow: 0 2px 20px rgba(0,0,0,0.08);
    --shadow-lg: 0 8px 40px rgba(0,0,0,0.12);
  }

  html { scroll-behavior: smooth; }
  
  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--paper);
    color: var(--ink);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
    overflow-x: hidden;
  }

  /* Background texture */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: 
      radial-gradient(circle at 20% 80%, rgba(232,96,58,0.06) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(58,126,232,0.06) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .container {
    width: 100%;
    max-width: 640px;
    position: relative;
    z-index: 1;
  }

  /* Header */
  .survey-header {
    text-align: center;
    margin-bottom: 32px;
    animation: fadeUp 0.6s ease both;
  }

  .domain-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--ink);
    color: var(--paper);
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 100px;
    margin-bottom: 20px;
  }

  .domain-badge .dot {
    width: 6px; height: 6px;
    background: var(--accent);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  .survey-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 6vw, 44px);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
  }

  .survey-title span { color: var(--accent); }

  .survey-desc {
    font-size: 16px;
    color: var(--muted);
    font-weight: 300;
    line-height: 1.6;
  }

  /* Progress */
  .progress-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    animation: fadeUp 0.6s 0.1s ease both;
  }

  .progress-bar {
    flex: 1;
    height: 4px;
    background: var(--border);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    border-radius: 4px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    width: 0%;
  }

  .progress-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--muted);
    white-space: nowrap;
    min-width: 60px;
    text-align: right;
  }

  /* Card */
  .card {
    background: var(--card);
    border-radius: 20px;
    padding: 40px;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border);
    animation: fadeUp 0.6s 0.2s ease both;
    transition: transform 0.3s ease;
  }

  .question-number {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 16px;
  }

  .question-text {
    font-family: 'Syne', sans-serif;
    font-size: clamp(18px, 3.5vw, 24px);
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 28px;
    letter-spacing: -0.01em;
  }

  /* Multiple choice */
  .options-grid {
    display: grid;
    gap: 10px;
  }

  .option-btn {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 16px 20px;
    background: var(--paper);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 400;
    color: var(--ink);
    text-align: left;
    transition: all 0.18s ease;
  }

  .option-btn:hover {
    border-color: var(--accent);
    background: #fff5f2;
    transform: translateX(4px);
  }

  .option-btn.selected {
    border-color: var(--accent);
    background: #fff5f2;
    color: var(--ink);
  }

  .option-btn.selected .option-letter {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .option-letter {
    width: 28px; height: 28px;
    border-radius: 8px;
    border: 1.5px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: var(--muted);
    flex-shrink: 0;
    transition: all 0.18s ease;
  }

  /* Rating */
  .rating-wrap {
    display: flex;
    gap: 10px;
    justify-content: space-between;
  }

  .rating-btn {
    flex: 1;
    aspect-ratio: 1;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    background: var(--paper);
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s ease;
    color: var(--muted);
  }

  .rating-btn:hover { border-color: var(--accent); color: var(--accent); transform: scale(1.08); }
  .rating-btn.selected { border-color: var(--accent); background: var(--accent); color: white; transform: scale(1.08); }

  .rating-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    font-size: 12px;
    color: var(--muted);
  }

  /* Text input */
  .text-input {
    width: 100%;
    min-height: 120px;
    padding: 16px 20px;
    background: var(--paper);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--ink);
    resize: vertical;
    outline: none;
    transition: border-color 0.2s;
  }

  .text-input:focus { border-color: var(--accent); background: white; }
  .text-input::placeholder { color: var(--muted); }

  /* Navigation */
  .nav-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 28px;
    gap: 12px;
  }

  .btn-back {
    display: flex; align-items: center; gap: 6px;
    background: none;
    border: 1.5px solid var(--border);
    color: var(--muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    padding: 12px 20px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .btn-back:hover { border-color: var(--ink); color: var(--ink); }

  .btn-next {
    display: flex; align-items: center; gap: 8px;
    background: var(--ink);
    color: white;
    border: none;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    padding: 14px 28px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-left: auto;
  }
  .btn-next:hover { background: var(--accent); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(232,96,58,0.3); }
  .btn-next:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

  .btn-next .arrow { transition: transform 0.2s; }
  .btn-next:hover .arrow { transform: translateX(4px); }

  /* Email capture screen */
  .email-screen { text-align: center; }
  .email-screen .emoji { font-size: 48px; margin-bottom: 20px; display: block; }
  .email-screen h2 {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
  }
  .email-screen p { color: var(--muted); margin-bottom: 28px; line-height: 1.6; }

  .email-form { display: flex; flex-direction: column; gap: 12px; }

  .email-input {
    width: 100%;
    padding: 16px 20px;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    background: var(--paper);
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s;
    color: var(--ink);
    text-align: center;
  }
  .email-input:focus { border-color: var(--accent); background: white; }

  .btn-submit {
    width: 100%;
    background: var(--accent);
    color: white;
    border: none;
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    padding: 16px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(232,96,58,0.35); }

  .skip-link {
    display: block;
    margin-top: 12px;
    font-size: 13px;
    color: var(--muted);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
    background: none;
    border: none;
    width: 100%;
  }
  .skip-link:hover { color: var(--ink); }

  /* Thank you screen */
  .thankyou-screen { text-align: center; }
  .thankyou-screen .big-check {
    width: 72px; height: 72px;
    background: linear-gradient(135deg, var(--success), #1a7a52);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px;
    font-size: 32px;
  }
  .thankyou-screen h2 {
    font-family: 'Syne', sans-serif;
    font-size: 30px;
    font-weight: 800;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
  }
  .thankyou-screen p { color: var(--muted); line-height: 1.6; margin-bottom: 32px; }

  .share-section { margin-bottom: 24px; }
  .share-label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-bottom: 12px;
    font-family: 'Syne', sans-serif;
  }

  .share-buttons { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .share-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 18px;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    background: var(--paper);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s;
    color: var(--ink);
  }
  .share-btn:hover { border-color: var(--ink); background: white; }

  .embed-section {
    background: var(--paper);
    border-radius: 12px;
    padding: 16px 20px;
    text-align: left;
    border: 1.5px solid var(--border);
  }
  .embed-section .embed-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-bottom: 8px;
    font-family: 'Syne', sans-serif;
  }
  .embed-code {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: var(--accent2);
    word-break: break-all;
    line-height: 1.5;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    text-align: left;
    width: 100%;
  }

  /* Loading state */
  .loading-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 60px 20px;
    color: var(--muted);
  }
  .spinner {
    width: 36px; height: 36px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  /* Error state */
  .error-wrap {
    text-align: center;
    padding: 40px 20px;
    color: var(--muted);
  }

  /* Footer */
  .footer {
    text-align: center;
    margin-top: 24px;
    font-size: 12px;
    color: var(--muted);
    animation: fadeUp 0.6s 0.4s ease both;
  }
  .footer a { color: var(--muted); text-decoration: none; }
  .footer a:hover { color: var(--ink); }
  .footer .powered {
    display: inline-flex; align-items: center; gap: 5px;
  }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(-20px); }
  }

  .question-enter { animation: slideIn 0.3s ease both; }

  /* Mobile */
  @media (max-width: 480px) {
    .card { padding: 28px 24px; }
    .rating-wrap { gap: 6px; }
    .rating-btn { font-size: 16px; }
    .nav-row { flex-wrap: wrap; }
    .btn-next { width: 100%; justify-content: center; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="survey-header" id="surveyHeader">
    <div class="domain-badge"><span class="dot"></span><span id="headerDomain">${hostname}</span></div>
    <h1 class="survey-title" id="surveyTitle">Loading<span>...</span></h1>
    <p class="survey-desc" id="surveyDesc">Preparing your survey</p>
  </div>

  <div class="progress-wrap" id="progressWrap" style="display:none">
    <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
    <div class="progress-label" id="progressLabel">1 of 6</div>
  </div>

  <div class="card" id="mainCard">
    <div class="loading-wrap" id="loadingState">
      <div class="spinner"></div>
      <span>Building your survey...</span>
    </div>
    <div id="questionState" style="display:none"></div>
    <div id="emailState" style="display:none"></div>
    <div id="thankyouState" style="display:none"></div>
    <div id="errorState" style="display:none" class="error-wrap">
      <p>⚠️ Something went wrong. Please refresh and try again.</p>
    </div>
  </div>

  <div class="footer" id="surveyFooter">
    <span class="powered">Powered by <a href="https://ventureos.com" target="_blank">VentureOS</a></span>
    &nbsp;·&nbsp;
    <a href="https://agentdao.com" target="_blank">AgentDAO</a>
  </div>
</div>

<script>
const HOSTNAME = '${hostname}';
const SHARE_URL = '${shareUrl}';
const SESSION_ID = 'ss_' + Math.random().toString(36).slice(2) + Date.now();

let survey = null;
let questions = [];
let currentIndex = 0;
let answers = {};

// ── Init ──────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch('/api/survey');
    if (!res.ok) throw new Error('Failed to load survey');
    
    survey = await res.json();
    questions = survey.questions;

    // Update header
    document.getElementById('surveyTitle').innerHTML = 
      survey.domain.title.replace(/([A-Z][a-z]+)/, '$1<span> Survey</span>').replace(' Survey Survey','<span> Survey</span>') ||
      survey.domain.title + '<span>.</span>';
    document.getElementById('surveyTitle').textContent = survey.domain.title;
    document.getElementById('surveyDesc').textContent = survey.domain.description;
    document.getElementById('headerDomain').textContent = survey.domain.hostname;

    document.getElementById('progressWrap').style.display = 'flex';
    showQuestion(0);
  } catch (err) {
    console.error(err);
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
  }
}

// ── Show question ─────────────────────────────────────────
function showQuestion(index) {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('emailState').style.display = 'none';
  document.getElementById('thankyouState').style.display = 'none';
  
  currentIndex = index;
  updateProgress();

  const q = questions[index];
  const container = document.getElementById('questionState');
  container.style.display = 'block';
  container.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'question-enter';
  wrap.innerHTML = \`
    <div class="question-number">Question \${index + 1} of \${questions.length}</div>
    <div class="question-text">\${escHtml(q.text)}</div>
    <div id="answerArea"></div>
    <div class="nav-row">
      \${index > 0 ? '<button class="btn-back" onclick="goBack()">← Back</button>' : '<span></span>'}
      <button class="btn-next" id="nextBtn" onclick="goNext()" \${!answers[q.id] ? 'disabled' : ''}>
        \${index === questions.length - 1 ? 'Finish' : 'Next'} <span class="arrow">→</span>
      </button>
    </div>
  \`;
  container.appendChild(wrap);

  renderAnswerArea(q, document.getElementById('answerArea'));
}

// ── Render answer input ───────────────────────────────────
function renderAnswerArea(q, el) {
  if (q.type === 'multiple_choice') {
    const letters = ['A','B','C','D','E','F'];
    el.innerHTML = '<div class="options-grid">' + 
      q.options.map((opt, i) => \`
        <button class="option-btn \${answers[q.id] === opt ? 'selected' : ''}"
          onclick="selectOption(\${q.id}, '\${escAttr(opt)}', this)">
          <span class="option-letter">\${letters[i]}</span>
          \${escHtml(opt)}
        </button>
      \`).join('') + 
    '</div>';
  }

  else if (q.type === 'rating') {
    el.innerHTML = \`
      <div class="rating-wrap">
        \${[1,2,3,4,5].map(n => \`
          <button class="rating-btn \${answers[q.id] == n ? 'selected' : ''}"
            onclick="selectRating(\${q.id}, \${n}, this)">\${n}</button>
        \`).join('')}
      </div>
      <div class="rating-labels"><span>Poor</span><span>Excellent</span></div>
    \`;
  }

  else if (q.type === 'text') {
    el.innerHTML = \`
      <textarea class="text-input" placeholder="Share your thoughts..." 
        oninput="handleText(\${q.id}, this.value)"
        rows="4">\${answers[q.id] || ''}</textarea>
    \`;
    // Text is optional — enable next button
    document.getElementById('nextBtn').disabled = false;
  }
}

// ── Answer handlers ───────────────────────────────────────
function selectOption(qid, value, btn) {
  answers[qid] = value;
  btn.closest('.options-grid').querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('nextBtn').disabled = false;
  saveAnswer(qid, value);
}

function selectRating(qid, value, btn) {
  answers[qid] = value;
  btn.closest('.rating-wrap').querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('nextBtn').disabled = false;
  saveAnswer(qid, value);
}

function handleText(qid, value) {
  answers[qid] = value;
  saveAnswer(qid, value);
}

async function saveAnswer(questionId, answer) {
  try {
    await fetch('/api/response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: SESSION_ID, question_id: questionId, answer: String(answer) })
    });
  } catch (e) { /* silent fail, answers saved in memory */ }
}

// ── Navigation ────────────────────────────────────────────
function goNext() {
  if (currentIndex < questions.length - 1) {
    showQuestion(currentIndex + 1);
  } else {
    showEmailCapture();
  }
}

function goBack() {
  if (currentIndex > 0) showQuestion(currentIndex - 1);
}

function updateProgress() {
  const pct = ((currentIndex) / questions.length) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = (currentIndex + 1) + ' of ' + questions.length;
}

// ── Email capture ─────────────────────────────────────────
function showEmailCapture() {
  document.getElementById('progressFill').style.width = '100%';
  document.getElementById('progressLabel').textContent = 'Complete!';
  document.getElementById('questionState').style.display = 'none';
  
  const el = document.getElementById('emailState');
  el.style.display = 'block';
  el.innerHTML = \`
    <div class="email-screen">
      <span class="emoji">🎉</span>
      <h2>You're done!</h2>
      <p>Want to see results and get updates from <strong>\${survey.domain.title}</strong>?<br>Drop your email below — no spam, ever.</p>
      <div class="email-form">
        <input type="email" id="emailInput" class="email-input" placeholder="your@email.com" />
        <button class="btn-submit" onclick="submitEmail()">See Results & Stay Updated →</button>
        <button class="skip-link" onclick="showThankYou(false)">No thanks, skip</button>
      </div>
    </div>
  \`;
  
  setTimeout(() => document.getElementById('emailInput')?.focus(), 100);
}

async function submitEmail() {
  const email = document.getElementById('emailInput').value.trim();
  if (!email || !email.includes('@')) {
    document.getElementById('emailInput').style.borderColor = '#e85a3a';
    return;
  }

  try {
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, session_id: SESSION_ID })
    });
  } catch (e) { /* silent */ }

  showThankYou(true);
}

// ── Thank you ─────────────────────────────────────────────
function showThankYou(subscribed) {
  document.getElementById('emailState').style.display = 'none';
  const el = document.getElementById('thankyouState');
  el.style.display = 'block';
  el.className = 'thankyou-screen question-enter';

  const tweetText = encodeURIComponent(\`Just completed the \${survey.domain.title}! Share your opinion too 👇\`);
  const embedCode = \`<script src="https://\${HOSTNAME}/embed.js"><\\/script>\`;

  el.innerHTML = \`
    <div class="big-check">✓</div>
    <h2>Thank you! 🙌</h2>
    <p>\${subscribed ? "You're on the list! We'll share results and insights with you." : "Your responses help us build better things. Appreciate you."}</p>
    
    <div class="share-section">
      <div class="share-label">Share this survey</div>
      <div class="share-buttons">
        <button class="share-btn" onclick="copyLink()">🔗 Copy Link</button>
        <a class="share-btn" href="https://twitter.com/intent/tweet?text=\${tweetText}&url=\${encodeURIComponent(SHARE_URL)}" target="_blank">𝕏 Tweet</a>
        <a class="share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=\${encodeURIComponent(SHARE_URL)}" target="_blank">in LinkedIn</a>
      </div>
    </div>

    <div class="embed-section">
      <div class="embed-label">Embed on your site</div>
      <button class="embed-code" onclick="copyEmbed(this)" title="Click to copy">\${escHtml(embedCode)}</button>
    </div>
  \`;
}

function copyLink() {
  navigator.clipboard.writeText(SHARE_URL).then(() => {
    event.target.textContent = '✓ Copied!';
    setTimeout(() => event.target.textContent = '🔗 Copy Link', 2000);
  });
}

function copyEmbed(btn) {
  const code = \`<script src="https://\${HOSTNAME}/embed.js"><\\/script>\`;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = '✓ Embed code copied!';
    setTimeout(() => btn.textContent = code, 2000);
  });
}

// ── Utils ─────────────────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(s) {
  return String(s).replace(/'/g,"\\'").replace(/"/g,'\\"');
}

// ── Go ────────────────────────────────────────────────────
init();
</script>
</body>
</html>`;
}
