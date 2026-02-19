# SurveyVentures

**The World's Largest Survey Domain Portfolio** — 1,004 premium survey and poll domains spanning 12 industry verticals, powered by AI and the VentureOS ecosystem.

## Structure

```
├── surveyventures.jsx      # SurveyVentures.com showcase website (React)
├── surveystack-pro/        # SurveyStack Pro v2.0 — full platform
│   ├── src/
│   │   ├── index.js        # Main Cloudflare Worker router
│   │   ├── config/         # Vertical configs, platform constants
│   │   ├── lib/            # AI engine, shared utilities
│   │   ├── modules/        # Survey, Blog, Newsletter, Store, Referrals,
│   │   │                   # Social, Impact, Admin, API, Agent
│   │   └── templates/      # Survey page, shell, landing page
│   ├── migrations/         # D1 schema + 973 domain seed data
│   ├── scripts/            # Agent card generator, PlayLoop scheduler
│   ├── wrangler.toml       # Cloudflare Workers config
│   └── package.json
└── v1/                     # SurveyStack v1 (original prototype)
    ├── index.js
    ├── ai.js
    ├── survey-ui.js
    ├── admin-ui.js
    └── wrangler.toml
```

## 36 Crown Jewel Domains (Top 3 per Vertical)

| Vertical | #1 | #2 | #3 |
|---|---|---|---|
| Travel | tripsurvey.com | hawaiisurvey.com | travelpoll.com |
| Home | homepoll.com | homesurvey.com | realtysurvey.com |
| Health | drugsurvey.com | healthpoll.com | dietsurvey.net |
| Food & Drink | barsurvey.com | coffeesurvey.com | winesurveys.com |
| Tech | javapoll.com | datasurvey.com | codesurvey.com |
| Sports | surfsurvey.com | surfpoll.com | skisurvey.com |
| Finance | stocksurvey.com | 401ksurvey.com | loanpoll.com |
| Education | studentpoll.com | satpoll.com | studentsurvey.com |
| Environment | ecosurvey.com | ecomsurvey.com | solarsurvey.com |
| Business | surveyboard.com | agencysurvey.com | retailsurvey.com |
| Entertainment | stylepoll.com | gamingpoll.com | gamepoll.com |
| Politics | policysurvey.com | electionpoll.com | politicalsurvey.com |

## Platform Features

- **AI Survey Engine** — Claude-powered question generation per domain topic
- **Blog Engine** — AI-generated SEO content with RSS
- **Newsletter System** — Email capture and subscriber management
- **Digital Store** — Products and premium access with ADAO token gating
- **Referral Engine** — Viral growth via Referrals.com
- **Social Sharing** — Dynamic OG cards, embeddable widgets
- **Impact Tracking** — Points flowing to ReefChallenge.com and SavingTheWorld.org
- **Agent Cards** — MCP/A2A/x402 compliant machine-readable identity

## Tech Stack

- **Runtime**: Cloudflare Workers (single Worker serves 1000+ domains)
- **Database**: Cloudflare D1 (13 tables)
- **Cache**: Cloudflare KV
- **Storage**: Cloudflare R2
- **AI**: Claude API
- **Ecosystem**: VentureOS · AgentDAO · eShares · PlayLoop

## VentureOS Network

VentureOS.com · AgentDAO.com · VBot.com · Contrib.com · eCorp.com · VNOC.com · GlobalVentures.com · Referrals.com · eShares.com

---

*A VentureOS Network Asset — Built by VBot.com*
