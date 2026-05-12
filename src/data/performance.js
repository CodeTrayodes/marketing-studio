export const QUARTERLY_METRICS = {
  assetsProduced: 247,
  assetsTarget: 310,
  assetsPublished: 189,
  qualityAverage: 87.4,
  qualityTarget: 85,
  onTimeDelivery: 94.2,
  gateApprovalRate: 96.1,

  // ROI Calculations
  // Labour value: 310 assets × avg 4.2h manual effort × £95/h blended rate
  laborValueSaved: 123564,
  // Platform cost (simulated)
  platformCost: 18000,
  // Net ROI
  get netROI() { return this.laborValueSaved - this.platformCost; },
  get roiMultiple() { return +(this.laborValueSaved / this.platformCost).toFixed(1); },

  // Pipeline influence (£ value of deals influenced by content)
  pipelineInfluenced: 2840000,
  pipelineTarget: 3200000,

  // Channel performance
  organicTrafficGrowth: 34.7,
  emailOpenRate: 31.2,
  linkedinEngagementRate: 4.8,
  podcastDownloads: 1847,
};

export const BU_PERFORMANCE = [
  {
    buId: 'salesforce',
    buName: 'Salesforce',
    assetsPublished: 44,
    assetsTarget: 62,
    qualityAvg: 89.2,
    pipelineInfluence: 720000,
    organicSessions: 8420,
    emailOpenRate: 33.1,
    completionPct: 71,
  },
  {
    buId: 'dynamics',
    buName: 'Dynamics',
    assetsPublished: 38,
    assetsTarget: 62,
    qualityAvg: 86.7,
    pipelineInfluence: 640000,
    organicSessions: 6830,
    emailOpenRate: 29.4,
    completionPct: 61,
  },
  {
    buId: 'enterprise-integration',
    buName: 'Enterprise Integration',
    assetsPublished: 41,
    assetsTarget: 62,
    qualityAvg: 88.1,
    pipelineInfluence: 580000,
    organicSessions: 5940,
    emailOpenRate: 28.7,
    completionPct: 66,
  },
  {
    buId: 'digital-transformation',
    buName: 'Digital Transformation',
    assetsPublished: 35,
    assetsTarget: 62,
    qualityAvg: 85.9,
    pipelineInfluence: 490000,
    organicSessions: 5120,
    emailOpenRate: 31.8,
    completionPct: 56,
  },
  {
    buId: 'kpo',
    buName: 'KPO',
    assetsPublished: 31,
    assetsTarget: 62,
    qualityAvg: 87.3,
    pipelineInfluence: 410000,
    organicSessions: 4290,
    emailOpenRate: 27.9,
    completionPct: 50,
  },
];

export const WEEKLY_TREND = [
  { week: 'W1', assets: 12, quality: 84.2, pipeline: 180000 },
  { week: 'W2', assets: 28, quality: 86.1, pipeline: 340000 },
  { week: 'W3', assets: 41, quality: 85.8, pipeline: 520000 },
  { week: 'W4', assets: 67, quality: 87.3, pipeline: 810000 },
  { week: 'W5', assets: 89, quality: 88.4, pipeline: 1140000 },
  { week: 'W6', assets: 114, quality: 87.9, pipeline: 1490000 },
  { week: 'W7', assets: 139, quality: 88.7, pipeline: 1820000 },
  { week: 'W8', assets: 162, quality: 87.2, pipeline: 2180000 },
  { week: 'W9', assets: 189, quality: 87.4, pipeline: 2840000 },
];

export const CHANNEL_BREAKDOWN = [
  { channel: 'WordPress (Blog)', assets: 55, sessions: 30600, conversionRate: 2.4 },
  { channel: 'LinkedIn', assets: 60, impressions: 284000, engagementRate: 4.8 },
  { channel: 'Pardot (Email)', assets: 10, sends: 14200, openRate: 31.2 },
  { channel: 'Reddit', assets: 30, upvotes: 1840, comments: 412 },
  { channel: 'Podcast', assets: 10, downloads: 1847, completionRate: 67.3 },
  { channel: 'YouTube', assets: 10, views: 12400, watchTime: 4820 },
  { channel: 'SharePoint', assets: 20, downloads: 3640, usageScore: 78 },
  { channel: 'External Publications', assets: 30, referralTraffic: 8200, backlinks: 47 },
];

export const LABOUR_VALUE_BREAKDOWN = [
  { role: 'Content Writer (senior)', rate: 110, hoursPerAsset: 5.5, assetCount: 97, totalHours: 533.5, totalValue: 58685 },
  { role: 'SEO Specialist', rate: 85, hoursPerAsset: 2.0, assetCount: 55, totalHours: 110, totalValue: 9350 },
  { role: 'Social Media Manager', rate: 75, hoursPerAsset: 1.5, assetCount: 90, totalHours: 135, totalValue: 10125 },
  { role: 'Podcast Producer', rate: 95, hoursPerAsset: 4.0, assetCount: 10, totalHours: 40, totalValue: 3800 },
  { role: 'Video Production', rate: 120, hoursPerAsset: 6.0, assetCount: 10, totalHours: 60, totalValue: 7200 },
  { role: 'Case Study Writer', rate: 130, hoursPerAsset: 7.0, assetCount: 10, totalHours: 70, totalValue: 9100 },
  { role: 'Sales Enablement Writer', rate: 100, hoursPerAsset: 3.0, assetCount: 20, totalHours: 60, totalValue: 6000 },
  { role: 'QA Reviewer', rate: 80, hoursPerAsset: 1.2, assetCount: 247, totalHours: 296.4, totalValue: 23712 },
];
