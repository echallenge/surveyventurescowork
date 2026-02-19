#!/usr/bin/env node
/**
 * Generate agent cards for all domains in the SurveyStack network
 * Outputs .well-known/agent.json files for each domain
 *
 * Usage: node scripts/generate_agent_cards.js
 */

import { getDomainConfig, detectVertical, extractTopic } from '../src/config/verticals.js';
import { PLATFORM } from '../src/config/platform.js';
import fs from 'fs';
import path from 'path';

const DOMAINS_FILE = path.join(process.cwd(), 'migrations', '003_seed_domains.sql');

function extractDomainsFromSQL(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const regex = /INSERT OR IGNORE INTO domains.*?'([^']+)'/g;
  const domains = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    domains.push(match[1]);
  }
  return domains;
}

function generateAgentCard(hostname) {
  const config = getDomainConfig(hostname);
  const slug = hostname.replace(/\./g, '-');

  return {
    agent_id: `${slug}-001`,
    url_identity: hostname,
    network: 'AgentDAO.com',
    version: '1.0.0',
    status: 'active',
    profile: {
      name: config.title,
      tagline: config.description,
      category: config.vertical,
      tier: 'venture',
      description: `AI-powered ${config.topic} survey and engagement platform.`,
      icon: config.icon,
    },
    capabilities: {
      goals: [
        `Collect ${config.topic} insights through AI surveys`,
        `Build engaged ${config.topic} subscriber community`,
        `Generate ${config.topic} content and analysis`,
        'Drive referral-based viral growth',
      ],
      skills: ['ai-survey', 'email-capture', 'blog', 'newsletter', 'referrals', 'social', 'impact', 'analytics'],
      tools: [`mcp-server-${slug}`],
    },
    economics: {
      token: 'ADAO',
      chain: PLATFORM.adao.chain,
      contract: PLATFORM.adao.contract,
      eshares: { supply: PLATFORM.eshares.totalSupply, allocation: PLATFORM.eshares.allocation },
    },
    endpoints: {
      web: `https://${hostname}`,
      api: `https://${hostname}/api`,
      agent_card: `https://${hostname}/.well-known/agent.json`,
    },
    compliance: { mcp_version: '1.0', a2a_version: '1.0', x402_enabled: true },
  };
}

// Main
try {
  const domains = extractDomainsFromSQL(DOMAINS_FILE);
  console.log(`Found ${domains.length} domains. Generating agent cards...`);

  const outputDir = path.join(process.cwd(), 'agent-cards');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  for (const d of domains) {
    const card = generateAgentCard(d);
    const file = path.join(outputDir, `${d.replace(/\./g, '-')}.json`);
    fs.writeFileSync(file, JSON.stringify(card, null, 2));
  }

  console.log(`Generated ${domains.length} agent cards in ${outputDir}/`);
} catch (e) {
  console.error('Error:', e.message);
}
