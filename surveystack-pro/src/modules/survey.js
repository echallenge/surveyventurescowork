/**
 * Survey Module — AI-powered survey generation, response collection, results
 */

import { generateSurveyQuestions } from '../lib/ai.js';
import { htmlResponse, jsonResponse, trackAnalytics, trackImpact } from '../lib/utils.js';
import { getSurveyPageHTML } from '../templates/survey-page.js';

export async function handleSurveyRoutes(ctx) {
  const { path, method, domain, env, config } = ctx;

  // GET / or /survey — serve the survey page
  if ((path === '/' || path === '/survey') && method === 'GET') {
    return serveSurveyPage(ctx);
  }

  // GET /survey/results — show aggregated results
  if (path === '/survey/results' && method === 'GET') {
    return serveSurveyResults(ctx);
  }

  return jsonResponse({ error: 'Survey route not found' }, 404);
}

async function serveSurveyPage(ctx) {
  const { hostname, domain, env, config, request } = ctx;
  const url = new URL(request.url);
  const isEmbed = url.searchParams.get('embed') === '1';
  const refCode = url.searchParams.get('ref');

  const html = getSurveyPageHTML({
    hostname,
    domain,
    config,
    isEmbed,
    refCode,
    shareUrl: `https://${hostname}`,
  });

  return htmlResponse(html, 200, {
    'X-Frame-Options': isEmbed ? 'ALLOWALL' : 'SAMEORIGIN',
  });
}

async function serveSurveyResults(ctx) {
  const { domain, env, config } = ctx;

  // Get question stats
  const questions = await env.DB.prepare(
    'SELECT * FROM questions WHERE domain_id = ? AND active = 1 ORDER BY question_order'
  ).bind(domain.id).all();

  const stats = [];
  for (const q of questions.results) {
    const responses = await env.DB.prepare(
      'SELECT answer, COUNT(*) as count FROM responses WHERE question_id = ? GROUP BY answer ORDER BY count DESC'
    ).bind(q.id).all();

    const total = responses.results.reduce((a, r) => a + r.count, 0);

    stats.push({
      question: q.question_text,
      type: q.question_type,
      total_responses: total,
      breakdown: responses.results.map(r => ({
        answer: r.answer,
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
      })),
    });
  }

  return jsonResponse({
    domain: { hostname: domain.hostname, title: domain.title },
    results: stats,
    total_completions: domain.total_surveys_completed,
  });
}
