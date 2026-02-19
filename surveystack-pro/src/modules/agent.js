/**
 * Agent Module — Agent cards, VentureOS integration, PlayLoop status
 * Serves .well-known/agent.json for MCP/A2A/x402 compliance
 */

import { jsonResponse } from '../lib/utils.js';
import { PLATFORM } from '../config/platform.js';

export async function handleAgentRoutes(ctx) {
  const { path, domain, hostname, config } = ctx;

  // GET /.well-known/agent.json — MCP/A2A compliant agent card
  if (path === '/.well-known/agent.json') {
    return serveAgentCard(ctx);
  }

  // GET /.well-known/x402-manifest.json — payment manifest
  if (path === '/.well-known/x402-manifest.json') {
    return servePaymentManifest(ctx);
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

function serveAgentCard(ctx) {
  const { domain, hostname, config } = ctx;
  const slug = hostname.replace(/\./g, '-');

  const card = {
    agent_id: `${slug}-001`,
    url_identity: hostname,
    network: 'AgentDAO.com',
    version: '1.0.0',
    status: 'active',
    profile: {
      name: domain.title || config.title,
      tagline: domain.description || config.description,
      category: config.vertical,
      tier: 'venture',
      description: `AI-powered ${config.topic} survey and engagement platform. Part of the SurveyStack network with 1000+ domains.`,
      icon: config.icon,
    },
    capabilities: {
      goals: [
        `Collect ${config.topic} community insights through AI-generated surveys`,
        `Build engaged ${config.topic} subscriber community`,
        `Generate data-driven ${config.topic} content and analysis`,
        'Drive referral-based viral growth',
        'Contribute to impact programs through engagement data',
      ],
      skills: [
        'ai-survey-generation',
        'email-capture',
        'blog-content-generation',
        'newsletter-campaigns',
        'referral-programs',
        'social-sharing',
        'impact-tracking',
        'analytics-dashboard',
      ],
      tools: [`mcp-server-${slug}`],
      input_types: ['application/json', 'text/plain'],
      output_types: ['application/json', 'text/html'],
    },
    economics: {
      token: 'ADAO',
      chain: PLATFORM.adao.chain,
      contract: PLATFORM.adao.contract,
      eshares: {
        supply: PLATFORM.eshares.totalSupply,
        contract: domain.eshares_contract || 'pending-deployment',
        allocation: PLATFORM.eshares.allocation,
      },
      pricing: {
        model: 'freemium',
        survey_access: 'free',
        premium_insights: '10 ADAO/report',
        api_access: '25 ADAO/1K requests',
      },
    },
    endpoints: {
      web: `https://${hostname}`,
      api: `https://${hostname}/api`,
      survey: `https://${hostname}/api/survey`,
      results: `https://${hostname}/api/results`,
      subscribe: `https://${hostname}/api/subscribe`,
      blog: `https://${hostname}/blog`,
      store: `https://${hostname}/store`,
      referrals: `https://${hostname}/refer`,
      impact: `https://${hostname}/impact`,
      embed: `https://${hostname}/embed.js`,
      rss: `https://${hostname}/blog/feed.xml`,
      agent_card: `https://${hostname}/.well-known/agent.json`,
      x402: `https://${hostname}/.well-known/x402-manifest.json`,
      coceo: `${PLATFORM.urls.coceo}/ventures/${slug}`,
      vnoc: `${PLATFORM.urls.vnoc}/ventures/${slug}`,
      ventureos: `${PLATFORM.urls.ventureOS}/ventures/${slug}`,
    },
    playloop: {
      status: domain.playloop_phase > 0 ? 'active' : 'pending',
      current_phase: domain.playloop_phase || 0,
      start_date: domain.playloop_start || null,
      methodology: PLATFORM.urls.playloop || 'https://playloop.com',
    },
    network: {
      parent: 'SurveyStack Pro',
      ecosystem: 'VentureOS',
      agent_dao: PLATFORM.urls.agentDAO,
      contrib: PLATFORM.urls.contrib,
      referrals: PLATFORM.urls.referrals,
      impact_programs: config.impact_programs.map(pid => ({
        id: pid,
        ...PLATFORM.impact[pid],
      })),
    },
    compliance: {
      mcp_version: '1.0',
      a2a_version: '1.0',
      x402_enabled: true,
    },
    metadata: {
      created: domain.created_at,
      last_updated: domain.updated_at,
      venture_score: domain.venture_score,
      vertical: config.vertical,
      features_enabled: {
        survey: !!domain.features_survey,
        blog: !!domain.features_blog,
        newsletter: !!domain.features_newsletter,
        store: !!domain.features_store,
        referrals: !!domain.features_referrals,
        social: !!domain.features_social,
        impact: !!domain.features_impact,
      },
    },
  };

  return new Response(JSON.stringify(card, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function servePaymentManifest(ctx) {
  const { hostname } = ctx;

  const manifest = {
    version: '1.0',
    network: 'base-mainnet',
    token: {
      symbol: 'ADAO',
      contract: PLATFORM.adao.contract,
      decimals: PLATFORM.adao.decimals,
    },
    endpoints: {
      payment: `https://${hostname}/api/store/order`,
      verify: `https://${hostname}/api/payment/verify`,
    },
    pricing: {
      premium_survey_results: { amount: '10', currency: 'ADAO' },
      api_access_1k: { amount: '25', currency: 'ADAO' },
      newsletter_sponsorship: { amount: '100', currency: 'ADAO' },
    },
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
