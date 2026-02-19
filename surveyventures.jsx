import { useState, useEffect, useRef } from "react";

const VERTICALS = [
  {
    name: "Travel",
    icon: "✈️",
    color: "#0891b2",
    bg: "#ecfeff",
    domains: ["tripsurvey.com", "hawaiisurvey.com", "travelpoll.com"],
    desc: "Capture traveler insights, destination preferences, and tourism trends across the world's most engaged audiences.",
    stat: "87 domains",
  },
  {
    name: "Home",
    icon: "🏠",
    color: "#059669",
    bg: "#ecfdf5",
    domains: ["homepoll.com", "homesurvey.com", "realtysurvey.com"],
    desc: "Real estate, home improvement, and lifestyle data from homeowners, buyers, and renters.",
    stat: "64 domains",
  },
  {
    name: "Health",
    icon: "💊",
    color: "#dc2626",
    bg: "#fef2f2",
    domains: ["drugsurvey.com", "healthpoll.com", "dietsurvey.net"],
    desc: "Healthcare, wellness, and pharmaceutical insights driving better patient outcomes.",
    stat: "91 domains",
  },
  {
    name: "Food & Drink",
    icon: "☕",
    color: "#d97706",
    bg: "#fffbeb",
    domains: ["barsurvey.com", "coffeesurvey.com", "winesurveys.com"],
    desc: "Culinary preferences, restaurant trends, and beverage insights from food enthusiasts globally.",
    stat: "73 domains",
  },
  {
    name: "Tech",
    icon: "💻",
    color: "#7c3aed",
    bg: "#f5f3ff",
    domains: ["javapoll.com", "datasurvey.com", "codesurvey.com"],
    desc: "Developer sentiment, technology adoption, and software trend data from technical communities.",
    stat: "82 domains",
  },
  {
    name: "Sports",
    icon: "🏄",
    color: "#0284c7",
    bg: "#f0f9ff",
    domains: ["surfsurvey.com", "surfpoll.com", "skisurvey.com"],
    desc: "Fan engagement, athletic preferences, and sports industry insights at scale.",
    stat: "56 domains",
  },
  {
    name: "Finance",
    icon: "📈",
    color: "#16a34a",
    bg: "#f0fdf4",
    domains: ["stocksurvey.com", "401ksurvey.com", "loanpoll.com"],
    desc: "Investment sentiment, financial literacy, and market research across retail and institutional audiences.",
    stat: "68 domains",
  },
  {
    name: "Education",
    icon: "🎓",
    color: "#2563eb",
    bg: "#eff6ff",
    domains: ["studentpoll.com", "satpoll.com", "studentsurvey.com"],
    desc: "Student engagement, academic research, and education technology insights.",
    stat: "59 domains",
  },
  {
    name: "Environment",
    icon: "🌍",
    color: "#15803d",
    bg: "#f0fdf4",
    domains: ["ecosurvey.com", "ecomsurvey.com", "solarsurvey.com"],
    desc: "Climate attitudes, sustainability practices, and green technology adoption data.",
    stat: "47 domains",
  },
  {
    name: "Business",
    icon: "🏢",
    color: "#4f46e5",
    bg: "#eef2ff",
    domains: ["surveyboard.com", "agencysurvey.com", "retailsurvey.com"],
    desc: "Enterprise research, B2B insights, and industry benchmarking across business sectors.",
    stat: "112 domains",
  },
  {
    name: "Entertainment",
    icon: "🎮",
    color: "#db2777",
    bg: "#fdf2f8",
    domains: ["stylepoll.com", "gamingpoll.com", "gamepoll.com"],
    desc: "Gaming, style, and media preference data from highly engaged entertainment audiences.",
    stat: "78 domains",
  },
  {
    name: "Politics",
    icon: "🏛️",
    color: "#1e40af",
    bg: "#dbeafe",
    domains: ["policysurvey.com", "electionpoll.com", "politicalsurvey.com"],
    desc: "Policy sentiment, election polling, and civic engagement research at national scale.",
    stat: "52 domains",
  },
];

const NETWORK = [
  { name: "VentureOS.com", role: "Operating System", icon: "⚙️" },
  { name: "AgentDAO.com", role: "59-Agent Swarm", icon: "🤖" },
  { name: "VBot.com", role: "AI Builder", icon: "🔧" },
  { name: "PlayLoop.com", role: "14-Day Cycles", icon: "🔄" },
  { name: "Contrib.com", role: "Community", icon: "🤝" },
  { name: "eShares.com", role: "Tokenization", icon: "💎" },
  { name: "Referrals.com", role: "Viral Growth", icon: "🔗" },
  { name: "eCorp.com", role: "Enterprise", icon: "🏢" },
  { name: "VNOC.com", role: "Operations", icon: "📡" },
  { name: "GlobalVentures.com", role: "Scale", icon: "🌐" },
];

const STATS = [
  { value: "1,004", label: "Premium Domains", suffix: "" },
  { value: "973", label: "Active & Ready", suffix: "" },
  { value: "12", label: "Industry Verticals", suffix: "" },
  { value: "36", label: "Crown Jewels", suffix: "" },
];

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const num = parseInt(target.replace(/,/g, ""));
          const step = Math.ceil(num / (duration / 16));
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= num) {
              current = num;
              clearInterval(timer);
            }
            setCount(current);
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
    </span>
  );
}

function VerticalCard({ vertical, index, isExpanded, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        background: "#fff",
        border: `1px solid ${isExpanded ? vertical.color : "#e5e7eb"}`,
        borderRadius: 12,
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: isExpanded
          ? `0 4px 20px ${vertical.color}22`
          : "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>{vertical.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>
              {vertical.name}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>{vertical.stat}</div>
          </div>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          style={{
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
          }}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke={vertical.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isExpanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
          <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, margin: "0 0 16px" }}>
            {vertical.desc}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {vertical.domains.map((d, i) => (
              <div
                key={d}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: vertical.bg,
                  borderRadius: 8,
                  border: `1px solid ${vertical.color}20`,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: vertical.color,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#111", fontFamily: "monospace" }}>
                  {d}
                </span>
                {i === 0 && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      fontWeight: 700,
                      color: vertical.color,
                      background: `${vertical.color}15`,
                      padding: "2px 8px",
                      borderRadius: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Crown Jewel
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SurveyVentures() {
  const [expandedVertical, setExpandedVertical] = useState(null);
  const [activeSection, setActiveSection] = useState("hero");

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: "#111", background: "#fafafa" }}>
      {/* NAV */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 56,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>📊</span>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em" }}>
              SurveyVentures
            </span>
            <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>.com</span>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 13, fontWeight: 500, color: "#6b7280" }}>
            {["Portfolio", "Verticals", "Platform", "Network", "Opportunity"].map((s) => (
              <a
                key={s}
                href={`#${s.toLowerCase()}`}
                style={{ textDecoration: "none", color: "inherit", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.target.style.color = "#111")}
                onMouseLeave={(e) => (e.target.style.color = "#6b7280")}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "80px 24px 60px",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
          <span
            style={{
              display: "inline-block",
              background: "#f0fdf4",
              color: "#16a34a",
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: 20,
              letterSpacing: "0.03em",
            }}
          >
            973 ACTIVE DOMAINS
          </span>
          <span
            style={{
              display: "inline-block",
              background: "#eff6ff",
              color: "#2563eb",
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: 20,
              letterSpacing: "0.03em",
            }}
          >
            12 VERTICALS
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            margin: "0 0 20px",
            maxWidth: 800,
          }}
        >
          The World's Largest
          <br />
          <span style={{ color: "#2563eb" }}>Survey Domain Portfolio</span>
        </h1>
        <p
          style={{
            fontSize: 18,
            color: "#4b5563",
            lineHeight: 1.65,
            maxWidth: 620,
            margin: "0 0 40px",
          }}
        >
          1,004 premium survey and poll domains spanning every major industry vertical.
          AI-powered engagement platform. Tokenized on-chain. Built for autonomous scale.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href="#verticals"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              background: "#111",
              color: "#fff",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              transition: "background 0.2s",
            }}
          >
            Explore Crown Jewels →
          </a>
          <a
            href="#opportunity"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              background: "#fff",
              color: "#111",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            View Opportunity
          </a>
        </div>
      </section>

      {/* STATS BAR */}
      <section id="portfolio" style={{ background: "#111", padding: "40px 24px" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 32,
            textAlign: "center",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                <AnimatedCounter target={s.value} />
              </div>
              <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500, marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VERTICALS */}
      <section id="verticals" style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              margin: "0 0 8px",
            }}
          >
            12 Verticals · 36 Crown Jewels
          </h2>
          <p style={{ fontSize: 15, color: "#6b7280", margin: 0, maxWidth: 560 }}>
            Top 3 domains per vertical, ranked by age, brand strength, and market demand.
            Click any vertical to explore.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 12,
          }}
        >
          {VERTICALS.map((v, i) => (
            <VerticalCard
              key={v.name}
              vertical={v}
              index={i}
              isExpanded={expandedVertical === i}
              onToggle={() =>
                setExpandedVertical(expandedVertical === i ? null : i)
              }
            />
          ))}
        </div>
      </section>

      {/* PLATFORM */}
      <section
        id="platform"
        style={{
          background: "#fff",
          borderTop: "1px solid #e5e7eb",
          borderBottom: "1px solid #e5e7eb",
          padding: "64px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              margin: "0 0 8px",
            }}
          >
            SurveyStack Pro Platform
          </h2>
          <p style={{ fontSize: 15, color: "#6b7280", margin: "0 0 40px", maxWidth: 560 }}>
            Every domain is a fully autonomous venture. One Cloudflare Worker deployment
            powers the entire network.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {[
              {
                icon: "🤖",
                title: "AI Survey Engine",
                desc: "Claude-powered questions tailored to each domain's topic and vertical. 8 question types per survey.",
              },
              {
                icon: "📝",
                title: "Blog Engine",
                desc: "AI-generated SEO content. Auto-published, vertical-specific, with RSS and social cards.",
              },
              {
                icon: "📧",
                title: "Newsletter System",
                desc: "Email capture, subscriber management, and AI-generated weekly digests.",
              },
              {
                icon: "🏪",
                title: "Digital Store",
                desc: "Reports, premium access, and digital products. ADAO token-gated premium tiers.",
              },
              {
                icon: "🔗",
                title: "Referral Engine",
                desc: "Viral growth via Referrals.com. Unique codes, reward tiers, leaderboards.",
              },
              {
                icon: "📢",
                title: "Social Sharing",
                desc: "Dynamic OG cards, one-click sharing, embeddable survey widgets.",
              },
              {
                icon: "🌍",
                title: "Impact Tracking",
                desc: "Every action earns impact points flowing to ReefChallenge.com and SavingTheWorld.org.",
              },
              {
                icon: "🤝",
                title: "Agent Cards",
                desc: "MCP/A2A/x402 compliant. Machine-readable identity for AI-to-AI coordination.",
              },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  padding: "20px",
                  background: "#fafafa",
                  borderRadius: 10,
                  border: "1px solid #f3f4f6",
                }}
              >
                <span style={{ fontSize: 24, display: "block", marginBottom: 10 }}>
                  {f.icon}
                </span>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NETWORK */}
      <section id="network" style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px" }}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: "0 0 8px",
          }}
        >
          VentureOS Network
        </h2>
        <p style={{ fontSize: 15, color: "#6b7280", margin: "0 0 40px", maxWidth: 560 }}>
          SurveyVentures is powered by a constellation of premium URL assets,
          each serving a critical role in the autonomous venture ecosystem.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {NETWORK.map((n) => (
            <div
              key={n.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 18px",
                background: "#fff",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
              }}
            >
              <span style={{ fontSize: 22 }}>{n.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>
                  {n.name}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{n.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Architecture Diagram */}
        <div
          style={{
            marginTop: 40,
            padding: 32,
            background: "#111",
            borderRadius: 12,
            color: "#e5e7eb",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 1.7,
            overflow: "auto",
          }}
        >
          <div style={{ color: "#9ca3af", marginBottom: 12, fontFamily: "sans-serif", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Architecture
          </div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{`┌─── SurveyVentures.com ────────────────────────┐
│                                                 │
│  973 Domains → 1 Cloudflare Worker              │
│                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ Surveys │ │  Blogs  │ │ Stores  │  ...x8    │
│  └────┬────┘ └────┬────┘ └────┬────┘          │
│       │           │           │                 │
│  ┌────┴───────────┴───────────┴────┐           │
│  │     D1 + KV + R2 + Claude AI    │           │
│  └─────────────┬───────────────────┘           │
│                │                                │
│  ┌─────────────┴───────────────────┐           │
│  │  VentureOS · AgentDAO · eShares │           │
│  │  59 Agents · PlayLoop Cycles    │           │
│  └─────────────────────────────────┘           │
│                                                 │
│  Impact → ReefChallenge · SavingTheWorld        │
└─────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </section>

      {/* OPPORTUNITY */}
      <section
        id="opportunity"
        style={{
          background: "#111",
          color: "#fff",
          padding: "64px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              margin: "0 0 8px",
              color: "#fff",
            }}
          >
            The Opportunity
          </h2>
          <p style={{ fontSize: 15, color: "#9ca3af", margin: "0 0 48px", maxWidth: 600 }}>
            This isn't just a domain portfolio. It's a fully operational, AI-powered
            survey network with tokenized governance and autonomous agent coordination.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                num: "01",
                title: "Unmatched Domain Portfolio",
                points: [
                  "973 active premium survey/poll domains",
                  "Avg domain age: 8+ years (SEO authority)",
                  "12 vertical coverage = total addressable market",
                  "Brandable, memorable, exact-match domains",
                ],
              },
              {
                num: "02",
                title: "Production-Ready Platform",
                points: [
                  "Single-worker architecture handles 1000+ domains",
                  "8 modular feature engines per domain",
                  "AI content generation via Claude API",
                  "D1 + KV + R2 storage layer on Cloudflare",
                ],
              },
              {
                num: "03",
                title: "Autonomous Economics",
                points: [
                  "1M eShares per domain on Base mainnet",
                  "ADAO token-gated premium features",
                  "59-agent swarm via AgentDAO coordination",
                  "PlayLoop 14-day activation cycles",
                ],
              },
              {
                num: "04",
                title: "Impact at Scale",
                points: [
                  "Every survey generates real-world impact data",
                  "Flows to ReefChallenge.com + SavingTheWorld.org",
                  "Referral-driven viral growth via Referrals.com",
                  "Community ownership through Contrib.com",
                ],
              },
            ].map((card) => (
              <div
                key={card.num}
                style={{
                  padding: 28,
                  background: "#1a1a1a",
                  borderRadius: 12,
                  border: "1px solid #333",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#2563eb",
                    marginBottom: 8,
                    fontFamily: "monospace",
                  }}
                >
                  {card.num}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", color: "#fff" }}>
                  {card.title}
                </h3>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {card.points.map((p, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: 13,
                        color: "#9ca3af",
                        lineHeight: 1.6,
                        paddingLeft: 16,
                        position: "relative",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          color: "#2563eb",
                        }}
                      >
                        ›
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* TOKEN MODEL */}
          <div
            style={{
              marginTop: 48,
              padding: 32,
              background: "#1a1a1a",
              borderRadius: 12,
              border: "1px solid #333",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px", color: "#fff" }}>
              eShares Allocation Model (per domain)
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {[
                { label: "Community", pct: 30, color: "#2563eb" },
                { label: "Asset DNA", pct: 30, color: "#7c3aed" },
                { label: "Treasury", pct: 18, color: "#059669" },
                { label: "Team", pct: 10, color: "#d97706" },
                { label: "Agent Pool", pct: 10, color: "#dc2626" },
                { label: "Impact", pct: 2, color: "#0891b2" },
              ].map((s) => (
                <div key={s.label} style={{ flex: "1 1 140px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: s.color, fontWeight: 700 }}>{s.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: "#333", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${s.pct}%`,
                        height: "100%",
                        background: s.color,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: "0 0 12px",
          }}
        >
          Ready to Build the Future of Surveys?
        </h2>
        <p style={{ fontSize: 15, color: "#6b7280", margin: "0 0 32px", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
          Partner with us. Invest in the platform. Or contribute to the network.
          The opportunity is now.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="mailto:hello@surveyventures.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              background: "#2563eb",
              color: "#fff",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Contact Us →
          </a>
          <a
            href="https://ventureos.com"
            target="_blank"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              background: "#fff",
              color: "#111",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            VentureOS.com
          </a>
          <a
            href="https://agentdao.com"
            target="_blank"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              background: "#fff",
              color: "#111",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            AgentDAO.com
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid #e5e7eb",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 12 }}>
            <span style={{ fontWeight: 700, color: "#6b7280" }}>SurveyVentures.com</span> — A VentureOS Network Asset
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap", fontSize: 12, color: "#9ca3af" }}>
            <span>VentureOS.com</span>
            <span>AgentDAO.com</span>
            <span>Contrib.com</span>
            <span>eCorp.com</span>
            <span>VNOC.com</span>
            <span>Referrals.com</span>
            <span>GlobalVentures.com</span>
          </div>
          <div style={{ fontSize: 11, color: "#d1d5db", marginTop: 16 }}>
            1,004 domains · 973 active · 12 verticals · Powered by AI · Built for impact
          </div>
        </div>
      </footer>
    </div>
  );
}