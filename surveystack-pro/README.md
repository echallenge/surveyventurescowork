# SurveyStack Pro v2.0

## World-Leading AI Survey & Engagement Platform

**1,004 domains. 973 active. 12 verticals. One unified platform.**

SurveyStack Pro transforms a portfolio of 1,000+ survey/poll domain names into an autonomous, AI-powered engagement network. Each domain becomes a fully-featured venture with surveys, blogs, newsletters, stores, referral programs, social sharing, and impact tracking — all from a single Cloudflare Worker deployment.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE WORKER                         │
│                   (surveystack-pro)                          │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Survey   │ │   Blog   │ │Newsletter│ │  Store   │      │
│  │  Module   │ │  Module  │ │  Module  │ │  Module  │      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘      │
│  ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐      │
│  │Referrals │ │  Social  │ │  Impact  │ │  Agent   │      │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │          Unified Admin Dashboard                    │     │
│  │    (Stats, Domains, Subscribers, Content, Tools)    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  Storage: D1 (SQL) + KV (Cache) + R2 (Media)              │
│  AI: Claude API (survey generation, blog content, etc.)     │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    VENTUREOS NETWORK                         │
│                                                             │
│  VentureOS.com → AgentDAO.com → VBot.com → CoCEO.com      │
│  PlayLoop.com → VentureBuilder.com → VentureScore.com      │
│  VNOC.com → Contrib.com → eShares.com → Referrals.com     │
│  eCorp.com → GlobalVentures.com                            │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    IMPACT PROGRAMS                           │
│                                                             │
│  ReefChallenge.com → SavingTheWorld.org → More...          │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
surveystack-pro/
├── src/
│   ├── index.js                 ← Main Worker entry + router
│   ├── config/
│   │   ├── verticals.js         ← 12 vertical configs + domain detection
│   │   └── platform.js          ← Platform-wide constants
│   ├── lib/
│   │   ├── utils.js             ← CORS, JSON, analytics, helpers
│   │   └── ai.js               ← Claude AI engine (surveys, blog, newsletter)
│   ├── modules/
│   │   ├── survey.js            ← AI survey generation + response collection
│   │   ├── blog.js              ← Per-domain blog engine + RSS
│   │   ├── newsletter.js        ← Email capture + campaigns
│   │   ├── store.js             ← Digital products + commerce
│   │   ├── referrals.js         ← Viral referral programs
│   │   ├── social.js            ← Social sharing + embed widget
│   │   ├── impact.js            ← Impact tracking + webhook pipeline
│   │   ├── admin.js             ← Unified admin dashboard
│   │   ├── api.js               ← Full REST API (public + admin)
│   │   └── agent.js             ← Agent cards (MCP/A2A/x402)
│   └── templates/
│       ├── survey-page.js       ← Beautiful survey UI
│       ├── shell.js             ← Shared HTML shell for all pages
│       └── landing.js           ← About, features, pricing, contact
├── migrations/
│   ├── 001_init.sql             ← Full database schema (13 tables)
│   └── 003_seed_domains.sql     ← 973 domain seed data
├── scripts/
│   ├── generate_agent_cards.js  ← Bulk agent card generator
│   └── playloop_scheduler.js    ← PlayLoop 14-day calendar generator
├── wrangler.toml                ← Cloudflare config + domain routes
├── package.json
└── README.md
```

## Deployment Guide

### Prerequisites
- Cloudflare account with Workers enabled
- Wrangler CLI installed (`npm i -g wrangler`)
- Anthropic API key (for AI features)
- Domains pointed to Cloudflare DNS

### Step 1: Install & Configure
```bash
cd surveystack-pro
npm install
wrangler login
```

### Step 2: Create Storage
```bash
# D1 Database
wrangler d1 create surveystack-db
# Update database_id in wrangler.toml with the returned ID

# KV Namespaces
wrangler kv namespace create CACHE
wrangler kv namespace create SESSIONS
# Update KV IDs in wrangler.toml

# R2 Bucket
wrangler r2 bucket create surveystack-media
```

### Step 3: Initialize Database
```bash
npm run db:init     # Creates all 13 tables
npm run db:seed     # Seeds 973 domains from portfolio
```

### Step 4: Set Secrets
```bash
wrangler secret put ANTHROPIC_API_KEY    # Your Claude API key
wrangler secret put ADMIN_PASSWORD       # Strong admin password
wrangler secret put SMTP_API_KEY         # Email service API key (optional)
```

### Step 5: Deploy
```bash
npm run deploy
```

### Step 6: Connect Domains
For each domain in the portfolio:
1. Cloudflare DNS → CNAME `@` → `surveystack-pro.YOUR.workers.dev`
2. Workers Dashboard → Custom Domains → Add domain
3. Visit the domain → survey auto-generates on first visit

---

## Features Per Domain

| Feature | Route | Description |
|---------|-------|-------------|
| AI Survey | `/` | Auto-generated topic-specific questions |
| Blog | `/blog` | AI content engine + RSS feed |
| Newsletter | `/subscribe` | Email capture with benefits |
| Store | `/store` | Digital products + commerce |
| Referrals | `/refer` | Viral referral program + leaderboard |
| Impact | `/impact` | Impact dashboard + points |
| Admin | `/admin` | Password-protected management |
| Agent Card | `/.well-known/agent.json` | MCP/A2A/x402 compliant |
| Embed | `/embed.js` | Embeddable survey widget |
| Share | `/share` | Dynamic OG cards for social |
| API | `/api/*` | Full REST API |

## Verticals (12)

Travel, Home, Health, Food, Tech, Sports, Finance, Education, Environment, Business, Entertainment, Politics — plus General fallback.

Each vertical configures: color theme, AI prompts, impact programs, default features, and suggested products.

## API Endpoints

### Public
- `GET /api/survey` — Get or generate survey
- `POST /api/response` — Submit answer
- `POST /api/subscribe` — Email signup
- `POST /api/referral/generate` — Get referral code
- `POST /api/share` — Track social share
- `GET /api/results` — Aggregated results
- `POST /api/store/order` — Create order

### Admin (requires X-Admin-Key header)
- `GET /api/admin/stats` — Full dashboard data
- `GET /api/admin/subscribers` — All subscribers
- `POST /api/admin/regenerate` — Regenerate questions
- `POST /api/admin/bulk-generate` — Bulk AI generation
- `POST /api/admin/generate-posts` — Bulk blog posts
- `GET /api/admin/export` — Export all data

## VentureOS Integration

Each domain is a tokenized smart entity:
- 1M eShares on Base mainnet
- ADAO token economy
- Agent card at `/.well-known/agent.json`
- PlayLoop 14-day activation cycle
- 59-agent swarm coordination via AgentDAO

## Impact Programs

Survey data flows to:
- **ReefChallenge.com** — Ocean reef protection
- **SavingTheWorld.org** — Global impact initiatives

Points earned: surveys (10-15), referrals (25-30), shares (5-10), signups (5)

---

Built with VentureOS · AgentDAO · VBot · PlayLoop · eCorp
