/**
 * Platform-wide configuration constants
 */

export const PLATFORM = {
  name: 'SurveyStack',
  version: '2.0.0',
  tagline: 'World-Leading AI Survey & Engagement Platform',

  // Network URLs
  urls: {
    ventureOS: 'https://ventureos.com',
    agentDAO: 'https://agentdao.com',
    vbot: 'https://vbot.com',
    coceo: 'https://coceo.com',
    playloop: 'https://playloop.com',
    ventureBuilder: 'https://venturebuilder.com',
    ventureScore: 'https://venturescore.com',
    vnoc: 'https://vnoc.com',
    contrib: 'https://contrib.com',
    eshares: 'https://eshares.com',
    referrals: 'https://referrals.com',
    ecorp: 'https://ecorp.com',
    globalVentures: 'https://globalventures.com',
  },

  // Impact programs
  impact: {
    reefchallenge: {
      name: 'Reef Challenge',
      url: 'https://reefchallenge.com',
      description: 'Protecting ocean reefs through community engagement',
      pointsPerSurvey: 10,
      pointsPerReferral: 25,
      pointsPerShare: 5,
    },
    savingtheworld: {
      name: 'Saving The World',
      url: 'https://savingtheworld.org',
      description: 'Global impact through collective action',
      pointsPerSurvey: 15,
      pointsPerReferral: 30,
      pointsPerShare: 10,
    },
  },

  // ADAO token config
  adao: {
    chain: 'base-mainnet',
    contract: '0x1ef7Be0aBff7d1490e952eC1C7476443A66d6b72',
    decimals: 18,
  },

  // eShares config per domain
  eshares: {
    totalSupply: 1000000,
    allocation: {
      community: 0.30,
      assetDNA: 0.30,
      treasury: 0.18,
      team: 0.10,
      agentPool: 0.10,
      impact: 0.02,
    },
  },

  // Default features
  defaultFeatures: {
    survey: true,
    blog: true,
    newsletter: true,
    store: false,
    referrals: true,
    social: true,
    impact: false,
  },

  // Social platforms for sharing
  socialPlatforms: ['twitter', 'linkedin', 'facebook', 'whatsapp', 'email', 'embed', 'copy'],

  // Referral reward tiers
  referralTiers: [
    { count: 1, reward: '50 Impact Points' },
    { count: 5, reward: '500 Impact Points + Badge' },
    { count: 10, reward: '1,000 Impact Points + Feature' },
    { count: 25, reward: '5,000 Impact Points + eShares' },
    { count: 100, reward: 'Contributor Status + Revenue Share' },
  ],
};
