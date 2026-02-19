/**
 * AI Question Generation
 * Uses Claude to generate smart, topic-specific survey questions
 */

export async function generateQuestions(env, topic, title) {
  const apiKey = env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('No ANTHROPIC_API_KEY set, using fallback questions');
    return getFallbackQuestions(topic);
  }

  const prompt = `You are creating a professional survey for "${title}" targeting people interested in ${topic}.

Generate exactly 6 survey questions. Mix question types for engagement:
- 3-4 multiple choice questions (4 options each)  
- 1-2 rating scale questions (1-5 scale)
- 1 open text question (last question)

Rules:
- Questions must be genuinely useful for market research in the ${topic} space
- Multiple choice options must be realistic and mutually exclusive
- Rating questions should measure satisfaction, likelihood, or frequency
- The open text question should invite genuine feedback
- Keep questions concise and clear

Respond ONLY with valid JSON in this exact format:
{
  "questions": [
    {
      "text": "Question text here?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    },
    {
      "text": "Rate your experience (1=Poor, 5=Excellent)?",
      "type": "rating",
      "options": ["1", "2", "3", "4", "5"]
    },
    {
      "text": "What else would you like to share?",
      "type": "text",
      "options": null
    }
  ]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Claude API error:', err);
      return getFallbackQuestions(topic);
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    // Parse JSON, handle possible markdown fences
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return parsed.questions.map(q => ({
      text: q.text,
      type: q.type || 'multiple_choice',
      options: q.options || null
    }));

  } catch (err) {
    console.error('Failed to generate questions:', err);
    return getFallbackQuestions(topic);
  }
}

// Fallback questions if API key not set or request fails
function getFallbackQuestions(topic) {
  return [
    {
      text: `How familiar are you with ${topic}?`,
      type: 'multiple_choice',
      options: ['Complete beginner', 'Some experience', 'Intermediate', 'Expert']
    },
    {
      text: `How often do you engage with ${topic}-related activities?`,
      type: 'multiple_choice',
      options: ['Daily', 'Weekly', 'Monthly', 'Rarely']
    },
    {
      text: `What is your biggest challenge related to ${topic}?`,
      type: 'multiple_choice',
      options: ['Lack of knowledge', 'Limited resources', 'Time constraints', 'Finding quality options']
    },
    {
      text: `How satisfied are you with current ${topic} options available to you?`,
      type: 'rating',
      options: ['1', '2', '3', '4', '5']
    },
    {
      text: `How likely are you to recommend ${topic} resources to a friend?`,
      type: 'rating',
      options: ['1', '2', '3', '4', '5']
    },
    {
      text: `What would make your ${topic} experience better? Any thoughts?`,
      type: 'text',
      options: null
    }
  ];
}
