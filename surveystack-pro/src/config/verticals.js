/**
 * Vertical Configuration — Maps domain patterns to vertical configs
 * Each vertical gets custom branding, AI prompts, impact programs, and features
 */

export const VERTICALS = {
  travel: {
    keywords: ['travel', 'vacation', 'trip', 'tourism', 'flight', 'hotel', 'cruise', 'bali', 'aspen', 'hawaii', 'europe', 'baja', 'austria', 'brazil', 'britain', 'calgary', 'boston', 'atlanta', 'berlin', 'alaska', 'alabama', 'nyc', 'la', 'indy'],
    color: '#0ea5e9',
    accent: '#f97316',
    icon: '✈️',
    title_suffix: 'Travel Survey',
    description: 'Share your travel experiences and shape the future of exploration.',
    ai_context: 'travel, tourism, hospitality, destinations, adventure, booking',
    impact_programs: ['savingtheworld', 'reefchallenge'],
    features: { survey: true, blog: true, newsletter: true, store: true, referrals: true, social: true, impact: true },
    suggested_products: ['Travel Guide eBook', 'Insider Tips Newsletter', 'Travel Planning Session'],
  },
  home: {
    keywords: ['home', 'house', 'property', 'real estate', 'realty', 'mortgage', 'apartment', 'rent', 'lease', 'condo', 'land', 'builder', 'construction', 'booth', 'bed'],
    color: '#22c55e',
    accent: '#a855f7',
    icon: '🏠',
    title_suffix: 'Home Survey',
    description: 'Help us understand what matters most in your living space.',
    ai_context: 'home improvement, real estate, interior design, housing market, property',
    impact_programs: ['savingtheworld'],
    features: { survey: true, blog: true, newsletter: true, store: true, referrals: true, social: true, impact: false },
    suggested_products: ['Home Buying Guide', 'Market Report', 'Design Consultation'],
  },
  health: {
    keywords: ['health', 'medical', 'wellness', 'fitness', 'nutrition', 'diet', 'anxiety', 'addiction', 'asthma', 'body', 'brain', 'allergy', 'dental', 'doctor', 'drug', 'mental'],
    color: '#ef4444',
    accent: '#10b981',
    icon: '💚',
    title_suffix: 'Health Survey',
    description: 'Your health insights drive better wellness outcomes for everyone.',
    ai_context: 'health, wellness, medical, fitness, nutrition, mental health, preventive care',
    impact_programs: ['savingtheworld'],
    features: { survey: true, blog: true, newsletter: true, store: false, referrals: true, social: true, impact: true },
    suggested_products: ['Wellness Guide', 'Nutrition Plan'],
  },
  food: {
    keywords: ['food', 'restaurant', 'dining', 'cafe', 'bakery', 'bagel', 'breakfast', 'beverage', 'beer', 'coffee', 'cooking', 'chef', 'cuisine', 'organic', 'vegan', 'veg', 'pizza', 'sushi'],
    color: '#f59e0b',
    accent: '#ef4444',
    icon: '🍽️',
    title_suffix: 'Food Survey',
    description: 'Share your culinary experiences and discover what others love.',
    ai_context: 'food, dining, restaurants, cooking, cuisine, culinary trends, food delivery',
    impact_programs: [],
    features: { survey: true, blog: true, newsletter: true, store: true, referrals: true, social: true, impact: false },
    suggested_products: ['Recipe Book', 'Restaurant Guide', 'Cooking Class Access'],
  },
  tech: {
    keywords: ['tech', 'code', 'software', 'app', 'android', 'bot', 'byte', 'binary', 'cloud', 'cyber', 'data', 'digital', 'dev', 'geek', 'java', 'crypto', 'eth', 'blockchain', 'ai', 'saas'],
    color: '#6366f1',
    accent: '#ec4899',
    icon: '💻',
    title_suffix: 'Tech Survey',
    description: 'Shape the future of technology with your insights.',
    ai_context: 'technology, software, programming, AI, cloud computing, innovation, startups',
    impact_programs: [],
    features: { survey: true, blog: true, newsletter: true, store: true, referrals: true, social: true, impact: false },
    suggested_products: ['Tech Report', 'Developer Tools', 'API Access'],
  },
  sports: {
    keywords: ['sport', 'baseball', 'football', 'basketball', 'soccer', 'golf', 'tennis', 'fitness', 'gym', 'race', 'running', 'swim', 'surf', 'ski'],
    color: '#22c55e',
    accent: '#eab308',
    icon: '⚽',
    title_suffix: 'Sports Poll',
    description: 'Your sports opinions matter — weigh in on what matters most.',
    ai_context: 'sports, athletics, teams, competitions, fitness, training, fan experience',
    impact_programs: [],
    features: { survey: true, blog: true, newsletter: true, store: true, referrals: true, social: true, impact: false },
  },
  finance: {
    keywords: ['finance', 'money', 'bank', 'invest', 'stock', 'bond', 'fund', 'capital', 'loan', 'credit', 'debt', 'bankruptcy', 'budget', 'cash', 'profit', '401k', 'asset', 'audit', 'barter', 'bid', 'bill', 'buy'],
    color: '#059669',
    accent: '#14b8a6',
    icon: '💰',
    title_suffix: 'Finance Survey',
    description: 'Share your financial perspectives and help build better tools.',
    ai_context: 'finance, investing, banking, personal finance, wealth management, fintech',
    impact_programs: [],
    features: { survey: true, blog: true, newsletter: true, store: true, referrals: true, social: true, impact: false },
  },
  education: {
    keywords: ['edu', 'school', 'college', 'university', 'campus', 'academic', 'academy', 'learning', 'student', 'teacher', 'course', 'class', 'study', 'biology', 'science', 'sat'],
    color: '#8b5cf6',
    accent: '#06b6d4',
    icon: '📚',
    title_suffix: 'Education Survey',
    description: 'Help shape the future of learning and education.',
    ai_context: 'education, learning, schools, universities, online courses, student experience',
    impact_programs: ['savingtheworld'],
    features: { survey: true, blog: true, newsletter: true, store: true, referrals: true, social: true, impact: true },
  },
  environment: {
    keywords: ['green', 'climate', 'eco', 'environment', 'solar', 'energy', 'ocean', 'reef', 'nature', 'organic', 'sustain', 'earth', 'agriculture', 'agri', 'garden', 'farm'],
    color: '#16a34a',
    accent: '#0ea5e9',
    icon: '🌍',
    title_suffix: 'Environment Survey',
    description: 'Your voice matters in building a sustainable future.',
    ai_context: 'environment, sustainability, climate change, renewable energy, conservation, eco-friendly',
    impact_programs: ['reefchallenge', 'savingtheworld'],
    features: { survey: true, blog: true, newsletter: true, store: false, referrals: true, social: true, impact: true },
  },
  business: {
    keywords: ['business', 'startup', 'entrepreneur', 'agency', 'brand', 'marketing', 'affiliate', 'consulting', 'exec', 'ceo', 'manager', 'office', 'board', 'partner', 'deal'],
    color: '#1e40af',
    accent: '#f59e0b',
    icon: '📊',
    title_suffix: 'Business Survey',
    description: 'Business leaders share insights that drive industry forward.',
    ai_context: 'business strategy, entrepreneurship, management, marketing, B2B, operations',
    impact_programs: [],
    features: { survey: true, blog: true, newsletter: true, store: true, referrals: true, social: true, impact: false },
  },
  entertainment: {
    keywords: ['movie', 'music', 'film', 'art', 'band', 'game', 'gaming', 'book', 'podcast', 'media', 'celebrity', 'fashion', 'beauty', 'bikini', 'style', 'culture', 'fun'],
    color: '#ec4899',
    accent: '#a855f7',
    icon: '🎬',
    title_suffix: 'Entertainment Poll',
    description: 'Share your entertainment preferences and discover trending opinions.',
    ai_context: 'entertainment, movies, music, gaming, pop culture, streaming, content',
    impact_programs: [],
    features: { survey: true, blog: true, newsletter: true, store: true, referrals: true, social: true, impact: false },
  },
  politics: {
    keywords: ['politic', 'vote', 'election', 'democrat', 'republican', 'congress', 'senate', 'governor', 'national', 'state', 'policy', 'law', 'civic', 'government'],
    color: '#1e3a5f',
    accent: '#dc2626',
    icon: '🗳️',
    title_suffix: 'Political Poll',
    description: 'Make your voice heard on the issues that matter.',
    ai_context: 'politics, public policy, elections, civic engagement, government, legislation',
    impact_programs: [],
    features: { survey: true, blog: true, newsletter: true, store: false, referrals: true, social: true, impact: false },
  },
  general: {
    keywords: [],
    color: '#e8603a',
    accent: '#3a7ee8',
    icon: '📋',
    title_suffix: 'Survey',
    description: 'Share your thoughts — it only takes 2 minutes.',
    ai_context: 'general knowledge, opinions, preferences, experiences',
    impact_programs: [],
    features: { survey: true, blog: true, newsletter: true, store: false, referrals: true, social: true, impact: false },
  }
};

/**
 * Detect vertical from hostname
 */
export function detectVertical(hostname) {
  const clean = hostname.toLowerCase().replace('www.', '').replace('.com', '').replace('.org', '').replace('.net', '');

  for (const [key, config] of Object.entries(VERTICALS)) {
    if (key === 'general') continue;
    for (const keyword of config.keywords) {
      if (clean.includes(keyword)) return key;
    }
  }
  return 'general';
}

/**
 * Extract human-readable topic from hostname
 */
export function extractTopic(hostname) {
  const clean = hostname.toLowerCase().replace('www.', '').replace('.com', '').replace('.org', '').replace('.net', '');

  // Remove common suffixes
  let topic = clean
    .replace(/surveys?$/i, '')
    .replace(/polls?$/i, '')
    .replace(/^the/i, '')
    .replace(/-/g, ' ')
    .trim();

  // Capitalize
  return topic.charAt(0).toUpperCase() + topic.slice(1);
}

/**
 * Get full config for a domain
 */
export function getDomainConfig(hostname) {
  const vertical = detectVertical(hostname);
  const topic = extractTopic(hostname);
  const config = VERTICALS[vertical];

  return {
    vertical,
    topic,
    title: `${topic} ${config.title_suffix}`,
    description: config.description.replace('your', `your ${topic.toLowerCase()}`),
    color: config.color,
    accent: config.accent,
    icon: config.icon,
    ai_context: config.ai_context,
    impact_programs: config.impact_programs,
    features: config.features,
    suggested_products: config.suggested_products || [],
  };
}
