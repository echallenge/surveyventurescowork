/**
 * AI Engine — Powered by Claude
 * Generates survey questions, blog posts, newsletter content, product descriptions
 */

export async function callClaude(env, systemPrompt, userPrompt, maxTokens = 2000) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      console.error('Claude API error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.content[0].text.trim();
  } catch (err) {
    console.error('Claude API call failed:', err);
    return null;
  }
}

/**
 * Generate survey questions for a domain
 */
export async function generateSurveyQuestions(env, topic, title, vertical, aiContext) {
  const system = `You are a world-class survey designer creating engaging, research-grade questions.
Your surveys achieve 90%+ completion rates because they're fun, relevant, and concise.
Always output valid JSON only — no markdown fences, no extra text.`;

  const prompt = `Create a survey for "${title}" in the ${vertical} vertical.
Topic context: ${aiContext}

Generate exactly 8 survey questions with a strategic mix:
- 4 multiple choice (4 options each, mutually exclusive)
- 2 rating scale (1-5, measuring satisfaction/likelihood/frequency)
- 1 ranking/priority question (rank 4 items)
- 1 open text (last question, inviting genuine feedback)

Rules:
- Questions must yield actionable market research insights
- Progressive difficulty: easy openers, deeper questions in middle, open end
- Include one "share-worthy" question that makes people want to discuss results
- Keep it under 2 minutes total

Output JSON: {"questions": [{"text": "...", "type": "multiple_choice|rating|ranking|text", "options": [...] or null}]}`;

  const result = await callClaude(env, system, prompt, 2000);
  if (!result) return getFallbackQuestions(topic);

  try {
    const clean = result.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return parsed.questions;
  } catch {
    return getFallbackQuestions(topic);
  }
}

/**
 * Generate a blog post for a domain
 */
export async function generateBlogPost(env, topic, vertical, aiContext, keyword) {
  const system = `You are an expert content strategist writing SEO-optimized blog posts.
Write in a warm, authoritative voice. Use data points and insights.
Output valid JSON only.`;

  const prompt = `Write a blog post for a ${topic} ${vertical} platform.
Context: ${aiContext}
${keyword ? `Focus keyword: ${keyword}` : ''}

Generate a 600-word blog post with:
- Compelling headline (60 chars max, SEO-optimized)
- Meta description (155 chars)
- 3-4 sections with subheadings
- 1 embedded call-to-action to take the survey
- Practical, actionable insights

Output JSON: {"title": "...", "slug": "...", "excerpt": "...", "seo_title": "...", "seo_description": "...", "content": "markdown content here", "tags": ["tag1", "tag2"]}`;

  const result = await callClaude(env, system, prompt, 3000);
  if (!result) return null;

  try {
    const clean = result.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

/**
 * Generate newsletter content
 */
export async function generateNewsletter(env, topic, vertical, subscriberCount, recentStats) {
  const system = `You are a newsletter expert who writes engaging weekly digests.
Concise, scannable, with clear CTAs. Output valid JSON only.`;

  const prompt = `Create a weekly newsletter for a ${topic} ${vertical} community.
Subscribers: ${subscriberCount}
Recent activity: ${JSON.stringify(recentStats)}

Generate:
- Subject line (50 chars max, high open rate)
- Preview text (90 chars)
- HTML email body with:
  - Key survey insight of the week
  - One trending discussion topic
  - Call to action (take a new survey or refer a friend)
  - Impact update if applicable

Output JSON: {"subject": "...", "preview_text": "...", "content": "HTML string"}`;

  const result = await callClaude(env, system, prompt, 2000);
  if (!result) return null;

  try {
    return JSON.parse(result.replace(/```json|```/g, '').trim());
  } catch {
    return null;
  }
}

/**
 * Fallback questions when AI unavailable
 */
function getFallbackQuestions(topic) {
  return [
    { text: `How familiar are you with ${topic}?`, type: 'multiple_choice', options: ['Complete beginner', 'Some experience', 'Intermediate', 'Expert'] },
    { text: `How often do you engage with ${topic}-related activities?`, type: 'multiple_choice', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'] },
    { text: `What matters most to you about ${topic}?`, type: 'multiple_choice', options: ['Quality', 'Affordability', 'Convenience', 'Innovation'] },
    { text: `What is your biggest challenge with ${topic}?`, type: 'multiple_choice', options: ['Lack of information', 'Too many options', 'Cost', 'Time'] },
    { text: `Rate your overall satisfaction with ${topic} (1=Poor, 5=Excellent)`, type: 'rating', options: ['1', '2', '3', '4', '5'] },
    { text: `How likely are you to recommend ${topic} resources to others?`, type: 'rating', options: ['1', '2', '3', '4', '5'] },
    { text: `Rank these ${topic} priorities`, type: 'ranking', options: ['Quality', 'Price', 'Speed', 'Trust'] },
    { text: `What would improve your ${topic} experience? Share freely.`, type: 'text', options: null },
  ];
}
