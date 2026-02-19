#!/usr/bin/env node
/**
 * PlayLoop Scheduler — Generates 14-day activation calendars for survey domains
 * Integrates with the 59-agent swarm via AgentDAO
 *
 * Usage: node scripts/playloop_scheduler.js <hostname>
 */

const PHASES = [
  {
    phase: 1, name: 'Discovery & Tokenization', days: [1, 2],
    agents: ['HashAgent', 'EquityAgent', 'ContentAgent', 'ProfileAgents', 'StoryAgents', 'ScienceAgent', 'AgentChallenge', 'VentureScore', 'MarketBot'],
    tasks: ['Mint eShares', 'Market validation', 'Brand identity', 'VentureScore baseline'],
  },
  {
    phase: 2, name: 'MVP Build & Deploy', days: [3, 4],
    agents: ['CodeAgent', 'DesignBots', 'StoryAgents', 'TestAgent', 'StatsAgent', 'SecurityAgent'],
    tasks: ['Deploy survey site', 'Blog setup', 'Newsletter setup', 'Analytics integration', 'QA testing'],
  },
  {
    phase: 3, name: 'Distribution & Community', days: [5, 6, 7],
    agents: ['ListAgent', 'ReferAgent', 'AgentNews', 'SocialAgent', 'LinkAgent', 'PRAgent', 'BountyAgent', 'NetworkAgent'],
    tasks: ['Directory submissions', 'Referral program launch', 'Social media blitz', 'Community setup', 'PR campaign'],
  },
  {
    phase: 4, name: 'Monetization & Fundraising', days: [8, 9, 10],
    agents: ['PitchAgent', 'CapitalAgent', 'FundAgent', 'ValuationAgents', 'DealAgent', 'PurchaseAgent', 'CommerceAgent'],
    tasks: ['Store setup', 'Pitch deck', 'Investor matching', 'Payment integration', 'Partnership deals'],
  },
  {
    phase: 5, name: 'Governance & Security', days: [11, 12],
    agents: ['GovAgent', 'EquityAgent', 'DealAgent', 'ProjectAgent', 'SecurityAgent', 'AttackAgent', 'IPAgent', 'CourtAgent'],
    tasks: ['DAO governance', 'Cap table finalization', 'Security audit', 'IP protection', 'Dispute framework'],
  },
  {
    phase: 6, name: 'Growth & Autonomy', days: [13, 14],
    agents: ['LoopAgent', 'SupportAgent', 'VoiceAgent', 'PartnerAgent', 'LiveAgents', 'PortfolioAgent'],
    tasks: ['PlayLoop recurrence', 'Support integration', '90-day growth calendar', 'Cross-venture optimization'],
  },
];

function generateCalendar(hostname, startDate = new Date()) {
  const calendar = { hostname, start: startDate.toISOString(), phases: [] };

  for (const phase of PHASES) {
    const phaseEntry = {
      phase: phase.phase,
      name: phase.name,
      days: phase.days.map(d => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + d - 1);
        return { day: d, date: date.toISOString().split('T')[0] };
      }),
      agents: phase.agents,
      tasks: phase.tasks,
      status: 'pending',
    };
    calendar.phases.push(phaseEntry);
  }

  // Add reinforcement loops
  calendar.loops = [
    { type: '30-day', date: new Date(new Date(startDate).setDate(startDate.getDate() + 30)).toISOString().split('T')[0] },
    { type: '60-day', date: new Date(new Date(startDate).setDate(startDate.getDate() + 60)).toISOString().split('T')[0] },
    { type: '90-day', date: new Date(new Date(startDate).setDate(startDate.getDate() + 90)).toISOString().split('T')[0] },
  ];

  return calendar;
}

// Main
const hostname = process.argv[2] || 'travelsurvey.com';
const calendar = generateCalendar(hostname);
console.log(JSON.stringify(calendar, null, 2));
