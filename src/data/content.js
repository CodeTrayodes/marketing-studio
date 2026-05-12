import { BUSINESS_UNITS } from './agents';

const CONTENT_TYPES = [
  { id: 'seo-blog', name: 'SEO Blog', count: 5, layer: 2, agent: 'agent-2c', wordCount: '1,800–2,400' },
  { id: 'guest-post', name: 'Guest Post', count: 6, layer: 2, agent: 'agent-2c', wordCount: '800–1,200' },
  { id: 'reddit', name: 'Reddit Post', count: 6, layer: 2, agent: 'agent-2b', wordCount: '400–600' },
  { id: 'podcast', name: 'Podcast Script', count: 2, layer: 2, agent: 'agent-2d', wordCount: '5,000–6,000' },
  { id: 'video-script', name: 'Video Script', count: 2, layer: 2, agent: 'agent-2e', wordCount: '600–900' },
  { id: 'case-study', name: 'Case Study', count: 2, layer: 2, agent: 'agent-2g', wordCount: '1,200–1,600' },
  { id: 'sales-enablement', name: 'Sales Enablement', count: 4, layer: 2, agent: 'agent-2g', wordCount: '300–500' },
  { id: 'email-sequence', name: 'Email Sequence', count: 2, layer: 2, agent: 'agent-2a', wordCount: '400–600/email' },
  { id: 'webinar', name: 'Webinar Script', count: 1, layer: 2, agent: 'agent-2a', wordCount: '4,000–5,000' },
  { id: 'linkedin', name: 'LinkedIn Post', count: 12, layer: 2, agent: 'agent-2b', wordCount: '150–300' },
  { id: 'repurposed', name: 'Repurposed Asset', count: 20, layer: 2, agent: 'agent-2h', wordCount: 'Varies' },
];

const CONTENT_STATUSES = [
  'draft', 'qa-review', 'gate-2-pending', 'gate-3-pending', 'approved', 'published', 'error'
];

const SEO_BLOG_TITLES = {
  salesforce: [
    'How Salesforce Einstein Copilot Is Changing Pipeline Forecasting for Mid-Market Teams',
    'The Real Cost of Salesforce Customisation: What No One Tells You Before Implementation',
    'Salesforce vs HubSpot in 2025: An Honest Side-by-Side for Growing B2B Companies',
    'How to Build a Unified Customer 360 View Inside Salesforce Without Expensive Add-Ons',
    'Salesforce Flow Builder Mistakes That Kill Automation Performance (and How to Fix Them)',
  ],
  dynamics: [
    'Microsoft Dynamics 365 Copilot: What Sales Leaders Actually Think After Six Months',
    'Dynamics 365 vs Salesforce: Migration Guide for Mid-Enterprise B2B Companies',
    'Why Dynamics 365 Finance + Operations Integration Is the Unlock for ERP-CRM Alignment',
    'The Dynamics 365 Data Model Explained: How to Build Custom Entities Without Breaking Upgrades',
    'Power Automate + Dynamics 365: Building No-Code Workflows That Survive Release Updates',
  ],
  'enterprise-integration': [
    'API-First Integration Strategy: Why Enterprise Architects Are Rethinking Point-to-Point Connections',
    'MuleSoft vs Azure Integration Services: A Neutral Comparison for 2025 Enterprise Buyers',
    'The Hidden Cost of Integration Sprawl: How Disconnected Systems Drain Revenue Operations',
    'Real-Time Data Synchronisation Between CRM and ERP: Architecture Patterns That Scale',
    'Integration Centre of Excellence: How to Build Internal Capability Without Headcount Explosion',
  ],
  'digital-transformation': [
    'Digital Transformation That Actually Sticks: Process Change Before Technology Selection',
    'Change Management Failures in Enterprise Tech Rollouts (and the Patterns Behind Them)',
    'Building a Digital Operations Roadmap Without Burning Out Your IT Department',
    'AI Readiness Assessment: What Boards Are Actually Asking CIOs to Deliver in 2025',
    'From Legacy to Cloud-Native: The Phased Migration Playbook for Risk-Averse Organisations',
  ],
  kpo: [
    'KPO vs BPO: Why the Distinction Matters for Organisations Buying Outsourced Services',
    'Knowledge Process Outsourcing in Financial Services: Compliance, Data, and Delivery Models',
    'How to Build SLAs for Knowledge Work That Actually Measure Outcomes, Not Activity',
    'Analytics Outsourcing: What High-Performing Teams Retain In-House vs Send to Partners',
    'The KPO Selection Framework: 12 Criteria for Evaluating Knowledge Process Vendors',
  ],
};

const LINKEDIN_TOPICS = [
  'Just published our Q2 research: {stat}% of enterprise teams are still reconciling CRM data manually. The opportunity cost is staggering.',
  'The most overlooked piece of any {topic} implementation? The 90-day post-go-live phase. Here is what we see working.',
  'Hot take: Buying enterprise software for features is expensive. Buying it for the ecosystem is where the ROI lives.',
  'Three signs your {topic} implementation is heading off the rails — and how to course-correct before the launch date.',
  'We spent 18 months analysing {topic} deployments across 47 mid-enterprise clients. The pattern that matters most is not what you expect.',
  'The difference between a {topic} implementation that lasts and one that gets ripped out in three years? Change management. Not the tech.',
];

const REDDIT_TITLES = {
  salesforce: [
    '[Discussion] Has anyone actually seen ROI from Salesforce Einstein features? Sharing our honest 6-month assessment',
    '[Question] Salesforce admin burnout is real — what actually helped your team manage release complexity?',
    '[Experience] We migrated from HubSpot to Salesforce last year — here is what surprised us',
    '[Resource] Built a free Salesforce Flow audit checklist after watching too many orgs slow down — feel free to use it',
    '[Discussion] What would you do differently about your Salesforce data model if you could start over?',
    '[Question] SF CPQ implementation gone sideways — looking for community input before we escalate',
  ],
  dynamics: [
    '[Discussion] Dynamics 365 or Salesforce for a £50M manufacturing company? Working through this decision now',
    '[Experience] 18 months live on D365 Finance — things nobody warned us about',
    '[Question] Power Platform licensing confusion — how are you handling the per-user vs capacity model?',
    '[Resource] D365 CRM custom entity migration script — tested on v9.2, sharing for anyone who needs it',
    '[Discussion] D365 Copilot: genuinely useful or feature theatre? Real experiences appreciated',
    '[Question] Azure DevOps for D365 deployments — ALM pipeline setup question from a new team',
  ],
};

const QUALITY_SCORE_RANGES = {
  'seo-blog': { min: 81, max: 96 },
  'guest-post': { min: 78, max: 92 },
  linkedin: { min: 74, max: 91 },
  reddit: { min: 72, max: 88 },
  podcast: { min: 80, max: 94 },
  'video-script': { min: 77, max: 93 },
  'case-study': { min: 83, max: 97 },
  'sales-enablement': { min: 79, max: 95 },
  email: { min: 76, max: 90 },
  webinar: { min: 80, max: 93 },
  repurposed: { min: 71, max: 87 },
};

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function randomInRange(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickRandom(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function generateQualityScores(rng, typeId) {
  const range = QUALITY_SCORE_RANGES[typeId] || { min: 74, max: 92 };
  const overall = randomInRange(rng, range.min, range.max);
  return {
    overall,
    seo: randomInRange(rng, overall - 8, Math.min(overall + 6, 99)),
    brand: randomInRange(rng, overall - 6, Math.min(overall + 8, 99)),
    geo: randomInRange(rng, overall - 10, Math.min(overall + 4, 99)),
    aiDetection: randomInRange(rng, 3, 22),
  };
}

const STATUS_DISTRIBUTION = [
  'published', 'published', 'published', 'published', 'published',
  'published', 'published', 'published', 'published',
  'approved', 'approved', 'approved',
  'gate-3-pending', 'gate-3-pending',
  'gate-2-pending', 'gate-2-pending', 'gate-2-pending',
  'qa-review', 'qa-review',
  'draft',
];

let assetIdCounter = 1;

function generateAssetsForBU(bu) {
  const rng = seededRandom(bu.id.length * 31337 + bu.abbr.charCodeAt(0) * 7);
  const assets = [];

  // SEO Blogs
  const blogTitles = SEO_BLOG_TITLES[bu.id] || SEO_BLOG_TITLES['salesforce'];
  blogTitles.forEach((title, i) => {
    const status = pickRandom(rng, STATUS_DISTRIBUTION);
    const qualityScores = generateQualityScores(rng, 'seo-blog');
    assets.push({
      id: `asset-${assetIdCounter++}`,
      buId: bu.id,
      buName: bu.name,
      buAbbr: bu.abbr,
      type: 'seo-blog',
      typeName: 'SEO Blog',
      title,
      agent: 'agent-2c',
      agentName: 'Blog + SEO Agent',
      status,
      wordCount: randomInRange(rng, 1800, 2400),
      qualityScores,
      createdAt: new Date(Date.now() - randomInRange(rng, 1, 45) * 24 * 60 * 60 * 1000),
      publishedAt: status === 'published' ? new Date(Date.now() - randomInRange(rng, 1, 30) * 24 * 60 * 60 * 1000) : null,
      channel: 'WordPress',
      preview: `This analysis examines the strategic implications of ${title.toLowerCase().split(':')[0]} across enterprise deployments. Our research team reviewed implementation data from 43 organisations over a 12-month period, identifying key patterns that differentiate high-performing deployments from those that stall post-launch.\n\nThe findings challenge several commonly held assumptions about ${bu.name} technology adoption...`,
    });
  });

  // Guest Posts
  for (let i = 0; i < 6; i++) {
    const status = pickRandom(rng, STATUS_DISTRIBUTION);
    assets.push({
      id: `asset-${assetIdCounter++}`,
      buId: bu.id,
      buName: bu.name,
      buAbbr: bu.abbr,
      type: 'guest-post',
      typeName: 'Guest Post',
      title: `${bu.name} Perspective: ${['Why Enterprise Teams Need Better Data Visibility', 'The Case for Process-First Technology Selection', 'Building Durable Digital Capability in Uncertain Markets', 'What High-Performing Implementations Have in Common', 'The Honest Playbook for Mid-Enterprise Tech Decisions', 'How to Avoid the Most Expensive Mistakes in Digital Transformation'][i]}`,
      agent: 'agent-2c',
      agentName: 'Blog + SEO Agent',
      status,
      wordCount: randomInRange(rng, 800, 1200),
      qualityScores: generateQualityScores(rng, 'guest-post'),
      createdAt: new Date(Date.now() - randomInRange(rng, 1, 45) * 24 * 60 * 60 * 1000),
      publishedAt: status === 'published' ? new Date(Date.now() - randomInRange(rng, 1, 30) * 24 * 60 * 60 * 1000) : null,
      channel: ['TechRepublic', 'CMSWire', 'Diginomica', 'ZDNet', 'The Register', 'InfoWorld'][i],
      preview: `Guest contribution for ${['TechRepublic', 'CMSWire', 'Diginomica', 'ZDNet', 'The Register', 'InfoWorld'][i]}. This piece argues that organisations approaching ${bu.name} decisions without a structured evaluation framework are setting themselves up for expensive course corrections within 18 months...`,
    });
  }

  // Reddit Posts
  const redditTitles = (REDDIT_TITLES[bu.id] || REDDIT_TITLES['salesforce']).concat([
    `[Discussion] ${bu.name} implementation patterns we have seen work consistently in 2025`,
    `[Resource] ${bu.name} evaluation checklist — refined after 30+ client engagements`,
  ]);
  for (let i = 0; i < 6; i++) {
    const status = pickRandom(rng, STATUS_DISTRIBUTION);
    assets.push({
      id: `asset-${assetIdCounter++}`,
      buId: bu.id,
      buName: bu.name,
      buAbbr: bu.abbr,
      type: 'reddit',
      typeName: 'Reddit Post',
      title: redditTitles[i] || `[Discussion] ${bu.name} community question ${i + 1}`,
      agent: 'agent-2b',
      agentName: 'Social Media Agent',
      status,
      wordCount: randomInRange(rng, 400, 650),
      qualityScores: generateQualityScores(rng, 'reddit'),
      createdAt: new Date(Date.now() - randomInRange(rng, 1, 45) * 24 * 60 * 60 * 1000),
      publishedAt: status === 'published' ? new Date(Date.now() - randomInRange(rng, 1, 30) * 24 * 60 * 60 * 1000) : null,
      channel: `r/${['salesforce', 'dynamics365', 'mulesoft', 'digitaltransformation', 'outsourcing'][BUSINESS_UNITS.indexOf(bu)] || 'enterprise'}`,
      preview: `Community-native discussion designed to build authentic presence in the ${bu.name} practitioner community. Written with a professional-but-peer tone that matches subreddit conventions...`,
    });
  }

  // LinkedIn Posts
  for (let i = 0; i < 12; i++) {
    const status = pickRandom(rng, STATUS_DISTRIBUTION);
    const topicTemplate = LINKEDIN_TOPICS[i % LINKEDIN_TOPICS.length];
    const topic = bu.name;
    const stat = randomInRange(rng, 43, 78);
    assets.push({
      id: `asset-${assetIdCounter++}`,
      buId: bu.id,
      buName: bu.name,
      buAbbr: bu.abbr,
      type: 'linkedin',
      typeName: 'LinkedIn Post',
      title: `LinkedIn Post ${i + 1} — ${bu.name} Q2`,
      agent: 'agent-2b',
      agentName: 'Social Media Agent',
      status,
      wordCount: randomInRange(rng, 150, 300),
      qualityScores: generateQualityScores(rng, 'linkedin'),
      createdAt: new Date(Date.now() - randomInRange(rng, 1, 45) * 24 * 60 * 60 * 1000),
      publishedAt: status === 'published' ? new Date(Date.now() - randomInRange(rng, 1, 30) * 24 * 60 * 60 * 1000) : null,
      channel: 'LinkedIn',
      preview: topicTemplate.replace('{stat}', stat).replace('{topic}', topic),
    });
  }

  // Podcast Scripts
  ['Digital Transformation in Enterprise CRM: What Actually Works', 'The Future of Knowledge Work and AI Automation'][0];
  for (let i = 0; i < 2; i++) {
    const status = pickRandom(rng, STATUS_DISTRIBUTION);
    assets.push({
      id: `asset-${assetIdCounter++}`,
      buId: bu.id,
      buName: bu.name,
      buAbbr: bu.abbr,
      type: 'podcast',
      typeName: 'Podcast Script',
      title: `${bu.name} Podcast Ep.${i + 1}: ${['The State of Enterprise Adoption in 2025', 'Implementation Pitfalls and How to Navigate Them'][i]}`,
      agent: 'agent-2d',
      agentName: 'Podcast Agent',
      status,
      wordCount: randomInRange(rng, 5000, 6500),
      qualityScores: generateQualityScores(rng, 'podcast'),
      createdAt: new Date(Date.now() - randomInRange(rng, 1, 45) * 24 * 60 * 60 * 1000),
      publishedAt: status === 'published' ? new Date(Date.now() - randomInRange(rng, 1, 30) * 24 * 60 * 60 * 1000) : null,
      channel: 'Podcast',
      preview: `[INTRO — 90 seconds]\nHost: Welcome back to the ${bu.name} Insights podcast. I am joined today by a practitioner with over twelve years in enterprise implementation. We are going to cover the real patterns we are seeing in deployments this year — not the vendor narrative, but the ground truth...`,
    });
  }

  // Video Scripts
  for (let i = 0; i < 2; i++) {
    const status = pickRandom(rng, STATUS_DISTRIBUTION);
    assets.push({
      id: `asset-${assetIdCounter++}`,
      buId: bu.id,
      buName: bu.name,
      buAbbr: bu.abbr,
      type: 'video-script',
      typeName: 'Video Script',
      title: `${bu.name} Video ${i + 1}: ${['5 Things to Check Before Signing the Contract', 'How to Measure ROI in Year One'][i]}`,
      agent: 'agent-2e',
      agentName: 'Video Script Agent',
      status,
      wordCount: randomInRange(rng, 600, 950),
      qualityScores: generateQualityScores(rng, 'video-script'),
      createdAt: new Date(Date.now() - randomInRange(rng, 1, 45) * 24 * 60 * 60 * 1000),
      publishedAt: status === 'published' ? new Date(Date.now() - randomInRange(rng, 1, 30) * 24 * 60 * 60 * 1000) : null,
      channel: 'YouTube',
      preview: `[OPENING SHOT — office environment, presenter to camera]\nSPEAKER: If you are evaluating ${bu.name} solutions right now, this video will save you from the three most expensive mistakes we see enterprise teams make in the first 60 days of selection...\n\n[CUT TO SCREEN RECORDING — dashboard overview]`,
    });
  }

  // Case Studies
  for (let i = 0; i < 2; i++) {
    const status = pickRandom(rng, STATUS_DISTRIBUTION);
    const company = ['Meridian Financial Group', 'Apex Industrial Holdings', 'Vantage Consulting Partners', 'Coastal Healthcare Systems', 'Summit Logistics Co.', 'Nexarion Manufacturing', 'Pinnacle Legal Services', 'Horizon Energy Systems'][randomInRange(rng, 0, 7)];
    assets.push({
      id: `asset-${assetIdCounter++}`,
      buId: bu.id,
      buName: bu.name,
      buAbbr: bu.abbr,
      type: 'case-study',
      typeName: 'Case Study',
      title: `How ${company} Reduced ${['Implementation Time by 34%', 'Data Reconciliation Overhead by 61%', 'Sales Cycle Length by 27%', 'Support Ticket Volume by 48%'][i % 4]} with ${bu.name} Optimisation`,
      agent: 'agent-2g',
      agentName: 'Case Studies + Sales Agent',
      status,
      wordCount: randomInRange(rng, 1200, 1700),
      qualityScores: generateQualityScores(rng, 'case-study'),
      createdAt: new Date(Date.now() - randomInRange(rng, 1, 45) * 24 * 60 * 60 * 1000),
      publishedAt: status === 'published' ? new Date(Date.now() - randomInRange(rng, 1, 30) * 24 * 60 * 60 * 1000) : null,
      channel: 'Website + Sales Deck',
      preview: `${company} is a mid-market firm operating across seven regional offices with a team of 340 professionals. Prior to engaging LevelShift, the organisation's ${bu.name} environment had grown organically over six years, resulting in significant data fragmentation and manual reconciliation overhead...\n\n**The Challenge:** Fragmented data workflows were consuming approximately 14 hours per week of analyst time across three departments.`,
    });
  }

  // Sales Enablement
  const salesTypes = ['One-Pager', 'Battle Card', 'ROI Calculator Brief', 'Objection Handling Guide'];
  for (let i = 0; i < 4; i++) {
    const status = pickRandom(rng, STATUS_DISTRIBUTION);
    assets.push({
      id: `asset-${assetIdCounter++}`,
      buId: bu.id,
      buName: bu.name,
      buAbbr: bu.abbr,
      type: 'sales-enablement',
      typeName: 'Sales Enablement',
      title: `${bu.name} ${salesTypes[i]}`,
      agent: 'agent-2g',
      agentName: 'Case Studies + Sales Agent',
      status,
      wordCount: randomInRange(rng, 300, 550),
      qualityScores: generateQualityScores(rng, 'sales-enablement'),
      createdAt: new Date(Date.now() - randomInRange(rng, 1, 45) * 24 * 60 * 60 * 1000),
      publishedAt: status === 'published' ? new Date(Date.now() - randomInRange(rng, 1, 30) * 24 * 60 * 60 * 1000) : null,
      channel: 'SharePoint',
      preview: `Sales asset for internal use by the ${bu.name} practice team. Designed for use in discovery calls and proposal stages. Updated Q2 2025.`,
    });
  }

  // Email Sequences
  for (let i = 0; i < 2; i++) {
    const status = pickRandom(rng, STATUS_DISTRIBUTION);
    assets.push({
      id: `asset-${assetIdCounter++}`,
      buId: bu.id,
      buName: bu.name,
      buAbbr: bu.abbr,
      type: 'email-sequence',
      typeName: 'Email Sequence',
      title: `${bu.name} Nurture Sequence ${i + 1} — ${['Mid-Funnel Re-Engagement', 'Post-Demo Follow-Up'][i]}`,
      agent: 'agent-2a',
      agentName: 'Email + Webinar Agent',
      status,
      wordCount: randomInRange(rng, 2200, 3200),
      qualityScores: generateQualityScores(rng, 'email'),
      createdAt: new Date(Date.now() - randomInRange(rng, 1, 45) * 24 * 60 * 60 * 1000),
      publishedAt: status === 'published' ? new Date(Date.now() - randomInRange(rng, 1, 30) * 24 * 60 * 60 * 1000) : null,
      channel: 'Pardot',
      preview: `Email 1 of 6 — Subject: [FIRST NAME], a quick observation about your ${bu.name} setup\n\nHi [FIRST NAME],\n\nI noticed you downloaded our ${bu.name} evaluation guide last week. Most teams that grab that guide are somewhere between "we know we need to change something" and "we're not sure what that change should look like."\n\nI wanted to share one pattern we see consistently in teams that get the implementation right the first time...`,
    });
  }

  // Webinar
  {
    const status = pickRandom(rng, STATUS_DISTRIBUTION);
    assets.push({
      id: `asset-${assetIdCounter++}`,
      buId: bu.id,
      buName: bu.name,
      buAbbr: bu.abbr,
      type: 'webinar',
      typeName: 'Webinar Script',
      title: `${bu.name} Live: The 2025 Enterprise Buyer’s Guide — What Has Changed and Why It Matters`,
      agent: 'agent-2a',
      agentName: 'Email + Webinar Agent',
      status,
      wordCount: randomInRange(rng, 4000, 5200),
      qualityScores: generateQualityScores(rng, 'webinar'),
      createdAt: new Date(Date.now() - randomInRange(rng, 1, 45) * 24 * 60 * 60 * 1000),
      publishedAt: status === 'published' ? new Date(Date.now() - randomInRange(rng, 1, 30) * 24 * 60 * 60 * 1000) : null,
      channel: 'Pardot + LinkedIn Live',
      preview: `[SLIDE 1 — Title card, 60 seconds]\nPresenter: Welcome, everyone. We have 47 registrations today, and I am going to make sure every one of you leaves with at least two things you can act on this week.\n\nToday's session covers the three biggest shifts in how enterprise organisations are buying and implementing ${bu.name} technology in 2025. These are based on direct observation, not analyst reports...`,
    });
  }

  // Repurposed Assets
  for (let i = 0; i < 20; i++) {
    const status = pickRandom(rng, STATUS_DISTRIBUTION);
    const blogTitle = blogTitles[i % 5];
    const derivativeTypes = ['Infographic Brief', 'LinkedIn Carousel', 'Email Teaser', 'Reddit Summary'];
    const dType = derivativeTypes[i % 4];
    assets.push({
      id: `asset-${assetIdCounter++}`,
      buId: bu.id,
      buName: bu.name,
      buAbbr: bu.abbr,
      type: 'repurposed',
      typeName: 'Repurposed Asset',
      title: `[${dType}] ${blogTitle.split(':')[0]}`,
      agent: 'agent-2h',
      agentName: 'Repurposing Agent',
      status,
      wordCount: randomInRange(rng, 150, 600),
      qualityScores: generateQualityScores(rng, 'repurposed'),
      createdAt: new Date(Date.now() - randomInRange(rng, 1, 45) * 24 * 60 * 60 * 1000),
      publishedAt: status === 'published' ? new Date(Date.now() - randomInRange(rng, 1, 30) * 24 * 60 * 60 * 1000) : null,
      channel: dType.includes('LinkedIn') ? 'LinkedIn' : dType.includes('Reddit') ? 'Reddit' : dType.includes('Email') ? 'Pardot' : 'Design Team',
      sourceAssetTitle: blogTitle,
      preview: `Derivative asset derived from: "${blogTitle}"\n\nType: ${dType}\nSource: SEO Blog (Blog + SEO Agent, Q2 2025)\n\nThis repurposed piece adapts the core argument and key data points from the source blog into ${dType.toLowerCase()} format, optimised for ${dType.includes('LinkedIn') ? 'LinkedIn audience' : dType.includes('Reddit') ? 'Reddit community' : dType.includes('Email') ? 'email subscribers' : 'visual design'}.`,
    });
  }

  return assets;
}

export const ALL_CONTENT = BUSINESS_UNITS.flatMap(generateAssetsForBU);

export const getContentByBU = (buId) => ALL_CONTENT.filter((a) => a.buId === buId);
export const getContentByType = (type) => ALL_CONTENT.filter((a) => a.type === type);
export const getContentByStatus = (status) => ALL_CONTENT.filter((a) => a.status === status);
export const getPublishedCount = () => ALL_CONTENT.filter((a) => a.status === 'published').length;
export const getPendingApprovalCount = () =>
  ALL_CONTENT.filter((a) => ['gate-2-pending', 'gate-3-pending'].includes(a.status)).length;
