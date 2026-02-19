/**
 * Survey Page Template — Beautiful, mobile-first survey experience
 * Dynamic theming per domain vertical
 */

import { escHtml } from '../lib/utils.js';

export function getSurveyPageHTML({ hostname, domain, config, isEmbed, refCode, shareUrl }) {
  const color = domain.primary_color || config.color || '#e8603a';
  const accent = domain.secondary_color || config.accent || '#3a7ee8';
  const icon = config.icon || '📋';
  const title = domain.title || config.title;
  const desc = domain.description || config.description;
  const features = {
    blog: !!domain.features_blog,
    newsletter: !!domain.features_newsletter,
    referrals: !!domain.features_referrals,
    store: !!domain.features_store,
    impact: !!domain.features_impact,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(title)}</title>
<meta name="description" content="${escHtml(desc)}" />
<meta property="og:title" content="${escHtml(title)}" />
<meta property="og:description" content="${escHtml(desc)}" />
<meta property="og:url" content="${shareUrl}" />
<meta property="og:image" content="https://${hostname}/share/card" />
<meta name="twitter:card" content="summary_large_image" />
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --color: ${color}; --accent: ${accent}; --ink: #0d0d0d; --paper: #f7f4ef; --card: #ffffff; --muted: #8a8680; --border: #e2ddd8; --success: #2d9e6b; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; position: relative; }
  body::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle at 20% 80%, color-mix(in srgb, ${color} 6%, transparent) 0%, transparent 50%), radial-gradient(circle at 80% 20%, color-mix(in srgb, ${accent} 6%, transparent) 0%, transparent 50%); pointer-events: none; }
  .container { width: 100%; max-width: 640px; position: relative; z-index: 1; }

  /* Navigation bar for non-embed */
  .mini-nav { display: ${isEmbed ? 'none' : 'flex'}; justify-content: center; gap: 12px; margin-bottom: 20px; animation: fadeUp 0.5s ease both; }
  .mini-nav a { font-size: 12px; color: var(--muted); text-decoration: none; padding: 4px 10px; border-radius: 6px; border: 1px solid transparent; }
  .mini-nav a:hover { color: var(--ink); border-color: var(--border); }

  .survey-header { text-align: center; margin-bottom: 28px; animation: fadeUp 0.6s ease both; }
  .domain-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--ink); color: var(--paper); font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 5px 12px; border-radius: 100px; margin-bottom: 16px; }
  .domain-badge .dot { width: 6px; height: 6px; background: var(--color); border-radius: 50%; animation: pulse 2s infinite; }
  .survey-title { font-family: 'Syne', sans-serif; font-size: clamp(26px, 6vw, 40px); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 10px; }
  .survey-title span { color: var(--color); }
  .survey-desc { font-size: 15px; color: var(--muted); font-weight: 300; line-height: 1.5; }

  .progress-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; animation: fadeUp 0.6s 0.1s ease both; }
  .progress-bar { flex: 1; height: 4px; background: var(--border); border-radius: 4px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--color), var(--accent)); border-radius: 4px; transition: width 0.5s cubic-bezier(0.4,0,0.2,1); width: 0%; }
  .progress-label { font-size: 12px; font-weight: 500; color: var(--muted); white-space: nowrap; min-width: 56px; text-align: right; }

  .card { background: var(--card); border-radius: 18px; padding: 36px; box-shadow: 0 8px 40px rgba(0,0,0,0.10); border: 1px solid var(--border); animation: fadeUp 0.6s 0.2s ease both; }

  .question-number { font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color); margin-bottom: 14px; }
  .question-text { font-family: 'Syne', sans-serif; font-size: clamp(17px, 3.5vw, 22px); font-weight: 700; line-height: 1.3; margin-bottom: 24px; }

  .options-grid { display: grid; gap: 8px; }
  .option-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 18px; background: var(--paper); border: 1.5px solid var(--border); border-radius: 10px; cursor: pointer; font-family: 'DM Sans'; font-size: 14px; color: var(--ink); text-align: left; transition: all 0.15s; }
  .option-btn:hover { border-color: var(--color); transform: translateX(3px); }
  .option-btn.selected { border-color: var(--color); background: color-mix(in srgb, ${color} 8%, white); }
  .option-letter { width: 26px; height: 26px; border-radius: 7px; border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; font-family: 'Syne'; font-size: 11px; font-weight: 700; color: var(--muted); flex-shrink: 0; transition: all 0.15s; }
  .option-btn.selected .option-letter { background: var(--color); color: white; border-color: var(--color); }

  .rating-wrap { display: flex; gap: 8px; justify-content: space-between; }
  .rating-btn { flex: 1; aspect-ratio: 1; border: 1.5px solid var(--border); border-radius: 10px; background: var(--paper); font-family: 'Syne'; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.15s; color: var(--muted); }
  .rating-btn:hover { border-color: var(--color); color: var(--color); transform: scale(1.06); }
  .rating-btn.selected { border-color: var(--color); background: var(--color); color: white; transform: scale(1.06); }
  .rating-labels { display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: var(--muted); }

  .text-input { width: 100%; min-height: 100px; padding: 14px 18px; background: var(--paper); border: 1.5px solid var(--border); border-radius: 10px; font-family: 'DM Sans'; font-size: 14px; color: var(--ink); resize: vertical; outline: none; }
  .text-input:focus { border-color: var(--color); background: white; }

  .nav-row { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; gap: 10px; }
  .btn-back { display: flex; align-items: center; gap: 5px; background: none; border: 1.5px solid var(--border); color: var(--muted); font-size: 13px; font-weight: 500; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-family: 'DM Sans'; }
  .btn-back:hover { border-color: var(--ink); color: var(--ink); }
  .btn-next { display: flex; align-items: center; gap: 6px; background: var(--ink); color: white; border: none; font-family: 'Syne'; font-size: 14px; font-weight: 700; padding: 12px 24px; border-radius: 8px; cursor: pointer; transition: all 0.2s; margin-left: auto; }
  .btn-next:hover { background: var(--color); transform: translateY(-1px); }
  .btn-next:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

  .email-screen, .thankyou-screen { text-align: center; }
  .email-screen .emoji, .thankyou-screen .big-check-wrap { font-size: 44px; margin-bottom: 16px; display: block; }
  .email-screen h2, .thankyou-screen h2 { font-family: 'Syne'; font-size: 26px; font-weight: 800; margin-bottom: 10px; }
  .email-screen p, .thankyou-screen p { color: var(--muted); margin-bottom: 24px; line-height: 1.5; }
  .email-form { display: flex; flex-direction: column; gap: 10px; }
  .email-input { width: 100%; padding: 14px 18px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--paper); font-family: 'DM Sans'; font-size: 15px; outline: none; text-align: center; color: var(--ink); }
  .email-input:focus { border-color: var(--color); background: white; }
  .btn-submit { width: 100%; background: var(--color); color: white; border: none; font-family: 'Syne'; font-size: 15px; font-weight: 700; padding: 14px; border-radius: 10px; cursor: pointer; }
  .btn-submit:hover { opacity: 0.92; }
  .skip-link { display: block; margin-top: 10px; font-size: 12px; color: var(--muted); cursor: pointer; text-decoration: underline; background: none; border: none; width: 100%; }

  .big-check-wrap { width: 64px; height: 64px; background: linear-gradient(135deg, var(--success), #1a7a52); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px; }
  .share-section { margin: 24px 0; }
  .share-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 10px; font-family: 'Syne'; }
  .share-buttons { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
  .share-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: 1.5px solid var(--border); background: var(--paper); font-family: 'DM Sans'; font-size: 12px; font-weight: 500; cursor: pointer; color: var(--ink); text-decoration: none; }
  .share-btn:hover { border-color: var(--ink); }

  .loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 50px 20px; color: var(--muted); }
  .spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--color); border-radius: 50%; animation: spin 0.8s linear infinite; }

  .footer { text-align: center; margin-top: 20px; font-size: 11px; color: var(--muted); animation: fadeUp 0.6s 0.4s ease both; }
  .footer a { color: var(--muted); text-decoration: none; }
  .footer a:hover { color: var(--ink); }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
  .question-enter { animation: slideIn 0.25s ease both; }

  @media (max-width: 480px) { .card { padding: 24px 20px; } .rating-wrap { gap: 5px; } .nav-row { flex-wrap: wrap; } .btn-next { width: 100%; justify-content: center; } }
</style>
</head>
<body>
<div class="container">
  <div class="mini-nav">
    ${features.blog ? '<a href="/blog">Blog</a>' : ''}
    ${features.newsletter ? '<a href="/subscribe">Newsletter</a>' : ''}
    ${features.referrals ? '<a href="/refer">Refer & Earn</a>' : ''}
    ${features.store ? '<a href="/store">Store</a>' : ''}
    ${features.impact ? '<a href="/impact">Impact</a>' : ''}
  </div>

  <div class="survey-header">
    <div class="domain-badge"><span class="dot"></span><span id="headerDomain">${escHtml(hostname)}</span></div>
    <h1 class="survey-title" id="surveyTitle">${escHtml(title)}</h1>
    <p class="survey-desc" id="surveyDesc">${escHtml(desc)}</p>
  </div>

  <div class="progress-wrap" id="progressWrap" style="display:none">
    <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
    <div class="progress-label" id="progressLabel">1 of 8</div>
  </div>

  <div class="card" id="mainCard">
    <div class="loading-wrap" id="loadingState"><div class="spinner"></div><span>Building your survey...</span></div>
    <div id="questionState" style="display:none"></div>
    <div id="emailState" style="display:none"></div>
    <div id="thankyouState" style="display:none"></div>
  </div>

  <div class="footer">
    <span>Powered by <a href="https://ventureos.com" target="_blank">VentureOS</a></span> · <a href="https://agentdao.com" target="_blank">AgentDAO</a>
    ${refCode ? ' · <span style="color:var(--color);">Referred</span>' : ''}
  </div>
</div>

<script>
const HOSTNAME = '${hostname}';
const SHARE_URL = '${shareUrl}';
const REF_CODE = '${refCode || ''}';
const SESSION_ID = 'ss_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
const FEATURES = ${JSON.stringify(features)};

let survey = null, questions = [], currentIndex = 0, answers = {};

async function init() {
  try {
    const res = await fetch('/api/survey');
    if (!res.ok) throw new Error('Failed');
    survey = await res.json();
    questions = survey.questions;
    document.getElementById('surveyTitle').textContent = survey.domain.title;
    document.getElementById('surveyDesc').textContent = survey.domain.description;
    document.getElementById('progressWrap').style.display = 'flex';
    showQuestion(0);
  } catch(e) {
    document.getElementById('loadingState').innerHTML = '<p>Something went wrong. Please refresh.</p>';
  }
}

function showQuestion(idx) {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('emailState').style.display = 'none';
  document.getElementById('thankyouState').style.display = 'none';
  currentIndex = idx;
  updateProgress();
  const q = questions[idx];
  const el = document.getElementById('questionState');
  el.style.display = 'block';
  const letters = ['A','B','C','D','E','F'];
  let answerHtml = '';

  if (q.type === 'multiple_choice' || q.type === 'ranking') {
    answerHtml = '<div class="options-grid">' + (q.options||[]).map((opt, i) =>
      '<button class="option-btn ' + (answers[q.id]===opt?'selected':'') + '" onclick="selectOption('+q.id+',this,\\''+opt.replace(/'/g,"\\\\'")+'\\')"><span class="option-letter">'+letters[i]+'</span>'+escH(opt)+'</button>'
    ).join('') + '</div>';
  } else if (q.type === 'rating') {
    answerHtml = '<div class="rating-wrap">' + [1,2,3,4,5].map(n =>
      '<button class="rating-btn '+(answers[q.id]==n?'selected':'')+'" onclick="selectRating('+q.id+','+n+',this)">'+n+'</button>'
    ).join('') + '</div><div class="rating-labels"><span>Poor</span><span>Excellent</span></div>';
  } else if (q.type === 'text') {
    answerHtml = '<textarea class="text-input" placeholder="Share your thoughts..." oninput="handleText('+q.id+',this.value)">'+(answers[q.id]||'')+'</textarea>';
  }

  el.innerHTML = '<div class="question-enter"><div class="question-number">Question '+(idx+1)+' of '+questions.length+'</div><div class="question-text">'+escH(q.text)+'</div><div>'+answerHtml+'</div><div class="nav-row">'+(idx>0?'<button class="btn-back" onclick="showQuestion('+(idx-1)+')">← Back</button>':'<span></span>')+'<button class="btn-next" id="nextBtn" onclick="goNext()" '+(q.type==='text'||answers[q.id]?'':'disabled')+'>'+( idx===questions.length-1?'Finish':'Next')+' →</button></div></div>';
}

function selectOption(qid, btn, val) {
  answers[qid] = val;
  btn.closest('.options-grid').querySelectorAll('.option-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('nextBtn').disabled = false;
  saveAnswer(qid, val);
}

function selectRating(qid, val, btn) {
  answers[qid] = val;
  btn.closest('.rating-wrap').querySelectorAll('.rating-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('nextBtn').disabled = false;
  saveAnswer(qid, val);
}

function handleText(qid, val) { answers[qid] = val; saveAnswer(qid, val); }

async function saveAnswer(qid, answer) {
  fetch('/api/response', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({session_id:SESSION_ID,question_id:qid,answer:String(answer)}) }).catch(()=>{});
}

function goNext() {
  if (currentIndex < questions.length - 1) showQuestion(currentIndex + 1);
  else showEmailCapture();
}

function updateProgress() {
  const pct = (currentIndex / questions.length) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = (currentIndex+1) + ' of ' + questions.length;
}

function showEmailCapture() {
  document.getElementById('progressFill').style.width = '100%';
  document.getElementById('progressLabel').textContent = 'Done!';
  document.getElementById('questionState').style.display = 'none';
  const el = document.getElementById('emailState');
  el.style.display = 'block';
  el.innerHTML = '<div class="email-screen"><span class="emoji">🎉</span><h2>Survey Complete!</h2><p>Want results and updates from <strong>'+escH(survey.domain.title)+'</strong>?</p><div class="email-form"><input type="email" id="emailInput" class="email-input" placeholder="your@email.com" /><button class="btn-submit" onclick="submitEmail()">Get Results & Subscribe →</button><button class="skip-link" onclick="showThankYou(false)">No thanks, skip</button></div></div>';
  setTimeout(()=>document.getElementById('emailInput')?.focus(),100);
}

async function submitEmail() {
  const email = document.getElementById('emailInput').value.trim();
  if (!email||!email.includes('@')) { document.getElementById('emailInput').style.borderColor='#ef4444'; return; }
  fetch('/api/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,session_id:SESSION_ID,ref:REF_CODE,source:'survey'}) }).catch(()=>{});
  fetch('/api/share', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({platform:'subscribe',session_id:SESSION_ID}) }).catch(()=>{});
  showThankYou(true);
}

function showThankYou(subscribed) {
  document.getElementById('emailState').style.display = 'none';
  const el = document.getElementById('thankyouState');
  el.style.display = 'block';
  el.className = 'thankyou-screen question-enter';
  const tweetText = encodeURIComponent('Just completed the '+survey.domain.title+'! Share yours 👇');
  el.innerHTML = '<div class="big-check-wrap">✓</div><h2>Thank You!</h2><p>'+(subscribed?"You're on the list! We'll share results.":"Your responses make a difference.")+'</p><div class="share-section"><div class="share-label">Share this survey</div><div class="share-buttons"><button class="share-btn" onclick="copyLink()">🔗 Copy</button><a class="share-btn" href="https://twitter.com/intent/tweet?text='+tweetText+'&url='+encodeURIComponent(SHARE_URL)+'" target="_blank" onclick="trackShare(\\'twitter\\')">𝕏 Tweet</a><a class="share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(SHARE_URL)+'" target="_blank" onclick="trackShare(\\'linkedin\\')">LinkedIn</a><a class="share-btn" href="https://wa.me/?text='+encodeURIComponent(survey.domain.title+': '+SHARE_URL)+'" target="_blank" onclick="trackShare(\\'whatsapp\\')">WhatsApp</a></div></div>'+(FEATURES.referrals?'<div style="margin-top:16px;"><a href="/refer" style="font-size:13px;color:var(--color);">🔗 Get your referral link & earn rewards →</a></div>':'')+(FEATURES.blog?'<div style="margin-top:8px;"><a href="/blog" style="font-size:13px;color:var(--muted);">📝 Read our latest insights →</a></div>':'');
}

function copyLink() { navigator.clipboard.writeText(SHARE_URL); trackShare('copy'); }
function trackShare(platform) { fetch('/api/share',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({platform,session_id:SESSION_ID})}).catch(()=>{}); }
function escH(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

init();
</script>
</body>
</html>`;
}
