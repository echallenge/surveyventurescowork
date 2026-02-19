-- ══════════════════════════════════════════════════════════════
-- SurveyStack Pro v2.0 — Full Schema
-- Platform: Cloudflare D1 (SQLite)
-- ══════════════════════════════════════════════════════════════

-- ── Core: Domains ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hostname TEXT UNIQUE NOT NULL,
  topic TEXT NOT NULL,
  title TEXT,
  description TEXT,
  vertical TEXT DEFAULT 'general',
  status TEXT DEFAULT 'active',
  -- Branding
  primary_color TEXT DEFAULT '#e8603a',
  secondary_color TEXT DEFAULT '#3a7ee8',
  logo_url TEXT,
  og_image_url TEXT,
  -- Features enabled per domain
  features_survey INTEGER DEFAULT 1,
  features_blog INTEGER DEFAULT 1,
  features_newsletter INTEGER DEFAULT 1,
  features_store INTEGER DEFAULT 0,
  features_referrals INTEGER DEFAULT 1,
  features_social INTEGER DEFAULT 1,
  features_impact INTEGER DEFAULT 0,
  -- VentureOS integration
  venture_id TEXT,
  eshares_contract TEXT,
  agent_card_url TEXT,
  playloop_phase INTEGER DEFAULT 0,
  playloop_start TEXT,
  -- Metrics
  total_surveys_completed INTEGER DEFAULT 0,
  total_subscribers INTEGER DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  venture_score INTEGER DEFAULT 0,
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_domains_hostname ON domains(hostname);
CREATE INDEX IF NOT EXISTS idx_domains_vertical ON domains(vertical);
CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status);

-- ── Surveys: Questions ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL,
  question_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  options TEXT, -- JSON array
  conditional_on_question_id INTEGER,
  conditional_on_answer TEXT,
  required INTEGER DEFAULT 1,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (domain_id) REFERENCES domains(id)
);

CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(domain_id);

-- ── Surveys: Responses ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  question_id INTEGER NOT NULL,
  answer TEXT NOT NULL,
  metadata TEXT, -- JSON: user agent, geo, time spent
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (domain_id) REFERENCES domains(id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  UNIQUE(domain_id, session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_responses_domain ON responses(domain_id);
CREATE INDEX IF NOT EXISTS idx_responses_session ON responses(session_id);

-- ── Subscribers (Email list) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  session_id TEXT,
  referral_code TEXT,
  referred_by TEXT,
  source TEXT DEFAULT 'survey',
  status TEXT DEFAULT 'active',
  tags TEXT, -- JSON array
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (domain_id) REFERENCES domains(id),
  UNIQUE(domain_id, email)
);

CREATE INDEX IF NOT EXISTS idx_subscribers_domain ON subscribers(domain_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_referral ON subscribers(referral_code);

-- ── Blog Posts ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL, -- Markdown
  author TEXT DEFAULT 'SurveyStack AI',
  cover_image_url TEXT,
  tags TEXT, -- JSON array
  status TEXT DEFAULT 'draft', -- draft, published, archived
  published_at TEXT,
  seo_title TEXT,
  seo_description TEXT,
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (domain_id) REFERENCES domains(id),
  UNIQUE(domain_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_posts_domain ON posts(domain_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- ── Newsletter Campaigns ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  content TEXT NOT NULL, -- HTML
  status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent
  scheduled_at TEXT,
  sent_at TEXT,
  recipients_count INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (domain_id) REFERENCES domains(id)
);

-- ── Referral Program ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL,
  referrer_email TEXT NOT NULL,
  referrer_code TEXT NOT NULL,
  referred_email TEXT,
  referred_session TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, rewarded
  reward_type TEXT, -- points, discount, eshares
  reward_amount TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (domain_id) REFERENCES domains(id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referrer_code);
CREATE INDEX IF NOT EXISTS idx_referrals_domain ON referrals(domain_id);

-- ── Store: Products ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  type TEXT DEFAULT 'digital', -- digital, physical, subscription, access
  file_url TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT -1, -- -1 = unlimited
  active INTEGER DEFAULT 1,
  metadata TEXT, -- JSON
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (domain_id) REFERENCES domains(id)
);

-- ── Store: Orders ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  buyer_email TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT, -- stripe, adao, eshares
  payment_ref TEXT,
  status TEXT DEFAULT 'pending', -- pending, paid, fulfilled, refunded
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (domain_id) REFERENCES domains(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ── Impact Tracking ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS impact_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL,
  event_type TEXT NOT NULL, -- survey_complete, signup, referral, purchase, share
  program TEXT, -- reefchallenge, savingtheworld, etc.
  points INTEGER DEFAULT 0,
  data TEXT, -- JSON payload
  user_email TEXT,
  session_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (domain_id) REFERENCES domains(id)
);

CREATE INDEX IF NOT EXISTS idx_impact_domain ON impact_events(domain_id);
CREATE INDEX IF NOT EXISTS idx_impact_program ON impact_events(program);

-- ── Social Shares ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL,
  session_id TEXT,
  platform TEXT NOT NULL, -- twitter, linkedin, facebook, whatsapp, email, embed, copy
  content_type TEXT DEFAULT 'survey', -- survey, post, product, referral
  content_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (domain_id) REFERENCES domains(id)
);

-- ── Analytics Events ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL,
  event TEXT NOT NULL, -- page_view, survey_start, survey_complete, subscribe, share, purchase
  session_id TEXT,
  path TEXT,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  data TEXT, -- JSON
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (domain_id) REFERENCES domains(id)
);

CREATE INDEX IF NOT EXISTS idx_analytics_domain ON analytics(domain_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics(event);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(created_at);

-- ── API Keys ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_hash TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  permissions TEXT DEFAULT '["read"]', -- JSON array
  rate_limit INTEGER DEFAULT 1000,
  active INTEGER DEFAULT 1,
  last_used TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
