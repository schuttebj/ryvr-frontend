/**
 * Demo Data for Showcase Pages
 * This file contains realistic dummy data for all demo pages.
 * When connecting to real APIs, replace imports from this file with actual API calls.
 * 
 * Example migration:
 * Before: import { DEMO_CAMPAIGNS } from '@/data/demoData'
 * After: const campaigns = await campaignApi.list()
 */

import { addDays, subDays, format } from 'date-fns';

// ============================================================================
// CONTENT CALENDAR DATA
// ============================================================================

export const DEMO_CONTENT_ITEMS = [
  {
    id: '1',
    title: '10 SEO Tips for 2024',
    type: 'blog',
    status: 'scheduled',
    scheduledDate: addDays(new Date(), 2).toISOString(),
    campaign: 'Q1 Content Push',
    business: 'Tech Solutions Inc',
    author: 'Sarah Johnson',
    color: '#5f5eff',
  },
  {
    id: '2',
    title: 'Instagram Story - Product Launch',
    type: 'social',
    status: 'scheduled',
    scheduledDate: addDays(new Date(), 1).toISOString(),
    campaign: 'Product Launch 2024',
    business: 'Fashion Brand Co',
    author: 'Mike Chen',
    color: '#ff6b9d',
  },
  {
    id: '3',
    title: 'Monthly Newsletter',
    type: 'email',
    status: 'draft',
    scheduledDate: addDays(new Date(), 7).toISOString(),
    campaign: 'Email Marketing Q1',
    business: 'Tech Solutions Inc',
    author: 'Emily Davis',
    color: '#ffa726',
  },
  {
    id: '4',
    title: 'Google Ads - Spring Sale',
    type: 'ad',
    status: 'scheduled',
    scheduledDate: addDays(new Date(), 3).toISOString(),
    campaign: 'Spring Promotion',
    business: 'E-commerce Plus',
    author: 'John Smith',
    color: '#42a5f5',
  },
  {
    id: '5',
    title: 'How to Guide: Marketing Automation',
    type: 'blog',
    status: 'published',
    scheduledDate: subDays(new Date(), 2).toISOString(),
    campaign: 'Q1 Content Push',
    business: 'Marketing Agency',
    author: 'Sarah Johnson',
    color: '#5f5eff',
  },
  {
    id: '6',
    title: 'Facebook Campaign - New Service',
    type: 'ad',
    status: 'scheduled',
    scheduledDate: addDays(new Date(), 5).toISOString(),
    campaign: 'Service Launch',
    business: 'Tech Solutions Inc',
    author: 'Mike Chen',
    color: '#42a5f5',
  },
];

// ============================================================================
// CAMPAIGN TIMELINE DATA
// ============================================================================

export const DEMO_CAMPAIGNS = [
  {
    id: '1',
    name: 'Q1 Content Push',
    startDate: subDays(new Date(), 30).toISOString(),
    endDate: addDays(new Date(), 60).toISOString(),
    progress: 45,
    status: 'active',
    budget: 25000,
    spent: 11250,
    team: ['Sarah Johnson', 'Emily Davis', 'Tom Wilson'],
    milestones: [
      { id: 'm1', name: 'Content Planning', date: subDays(new Date(), 25).toISOString(), completed: true },
      { id: 'm2', name: 'First Wave Published', date: subDays(new Date(), 10).toISOString(), completed: true },
      { id: 'm3', name: 'Mid-Campaign Review', date: addDays(new Date(), 15).toISOString(), completed: false },
      { id: 'm4', name: 'Campaign Completion', date: addDays(new Date(), 60).toISOString(), completed: false },
    ],
    dependencies: [],
  },
  {
    id: '2',
    name: 'Product Launch 2024',
    startDate: subDays(new Date(), 14).toISOString(),
    endDate: addDays(new Date(), 45).toISOString(),
    progress: 65,
    status: 'active',
    budget: 50000,
    spent: 32500,
    team: ['Mike Chen', 'Lisa Park', 'David Brown'],
    milestones: [
      { id: 'm1', name: 'Pre-launch Teaser', date: subDays(new Date(), 7).toISOString(), completed: true },
      { id: 'm2', name: 'Official Launch', date: addDays(new Date(), 2).toISOString(), completed: false },
      { id: 'm3', name: 'Follow-up Campaign', date: addDays(new Date(), 30).toISOString(), completed: false },
    ],
    dependencies: [],
  },
  {
    id: '3',
    name: 'Spring Promotion',
    startDate: addDays(new Date(), 10).toISOString(),
    endDate: addDays(new Date(), 70).toISOString(),
    progress: 10,
    status: 'planning',
    budget: 35000,
    spent: 3500,
    team: ['John Smith', 'Anna Lee'],
    milestones: [
      { id: 'm1', name: 'Campaign Strategy', date: addDays(new Date(), 15).toISOString(), completed: false },
      { id: 'm2', name: 'Creative Assets', date: addDays(new Date(), 25).toISOString(), completed: false },
      { id: 'm3', name: 'Launch', date: addDays(new Date(), 35).toISOString(), completed: false },
    ],
    dependencies: ['1'],
  },
];

// ============================================================================
// APPROVAL DASHBOARD DATA
// ============================================================================

export const DEMO_APPROVALS = [
  {
    id: 'a1',
    type: 'blog',
    title: '10 SEO Tips for 2024',
    content: 'Search Engine Optimization continues to evolve...',
    status: 'pending',
    priority: 'high',
    submittedBy: 'Sarah Johnson',
    submittedAt: subDays(new Date(), 1).toISOString(),
    business: 'Tech Solutions Inc',
    campaign: 'Q1 Content Push',
    thumbnail: null,
    wordCount: 1250,
  },
  {
    id: 'a2',
    type: 'social',
    title: 'Instagram Story - Product Launch',
    content: '🚀 Exciting news! Our new product is here...',
    status: 'pending',
    priority: 'urgent',
    submittedBy: 'Mike Chen',
    submittedAt: new Date().toISOString(),
    business: 'Fashion Brand Co',
    campaign: 'Product Launch 2024',
    thumbnail: 'https://via.placeholder.com/400x300',
    wordCount: 45,
  },
  {
    id: 'a3',
    type: 'ad',
    title: 'Google Ads - Spring Sale',
    content: 'Spring Sale: Up to 40% Off Everything!',
    status: 'changes_requested',
    priority: 'medium',
    submittedBy: 'John Smith',
    submittedAt: subDays(new Date(), 3).toISOString(),
    business: 'E-commerce Plus',
    campaign: 'Spring Promotion',
    thumbnail: null,
    wordCount: 85,
    feedback: 'Please update the discount percentage and add urgency language.',
  },
  {
    id: 'a4',
    type: 'email',
    title: 'Monthly Newsletter - January',
    content: 'Happy New Year! Here are the top stories...',
    status: 'approved',
    priority: 'low',
    submittedBy: 'Emily Davis',
    submittedAt: subDays(new Date(), 5).toISOString(),
    approvedBy: 'Admin User',
    approvedAt: subDays(new Date(), 4).toISOString(),
    business: 'Tech Solutions Inc',
    campaign: 'Email Marketing Q1',
    thumbnail: null,
    wordCount: 650,
  },
];

// ============================================================================
// CONTENT REVIEW DATA
// ============================================================================

export const DEMO_REVIEW_ITEMS = [
  {
    id: 'r1',
    title: '10 SEO Tips for 2024',
    type: 'blog',
    content: `# 10 SEO Tips for 2024

Search Engine Optimization continues to evolve rapidly. Here are the top strategies for staying ahead:

## 1. Focus on User Experience
Google's algorithm increasingly prioritizes sites that provide excellent user experience...

## 2. Optimize for Voice Search
With the rise of smart speakers and voice assistants...

## 3. Create High-Quality Content
Content quality remains the cornerstone of SEO success...`,
    status: 'in_review',
    version: 2,
    author: 'Sarah Johnson',
    reviewers: ['Admin User', 'Mike Chen'],
    comments: [
      {
        id: 'c1',
        author: 'Admin User',
        text: 'Great start! Can we add more specific examples in section 2?',
        timestamp: subDays(new Date(), 1).toISOString(),
        resolved: false,
      },
      {
        id: 'c2',
        author: 'Mike Chen',
        text: '@Sarah Johnson - The voice search section needs recent statistics',
        timestamp: new Date().toISOString(),
        resolved: false,
      },
    ],
    attachments: [],
  },
];

// ============================================================================
// FEEDBACK INBOX DATA
// ============================================================================

export const DEMO_FEEDBACK_ITEMS = [
  {
    id: 'f1',
    type: 'approval',
    title: 'Instagram Story - Product Launch needs your approval',
    priority: 'urgent',
    dueDate: addDays(new Date(), 1).toISOString(),
    from: 'Mike Chen',
    isRead: false,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'f2',
    type: 'comment',
    title: 'New comment on "10 SEO Tips for 2024"',
    priority: 'medium',
    dueDate: addDays(new Date(), 2).toISOString(),
    from: 'Admin User',
    isRead: false,
    timestamp: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 'f3',
    type: 'revision',
    title: 'Changes requested: Google Ads - Spring Sale',
    priority: 'high',
    dueDate: addDays(new Date(), 3).toISOString(),
    from: 'Admin User',
    isRead: true,
    timestamp: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 'f4',
    type: 'mention',
    title: '@You in "Q1 Content Strategy Review"',
    priority: 'low',
    dueDate: addDays(new Date(), 7).toISOString(),
    from: 'Sarah Johnson',
    isRead: true,
    timestamp: subDays(new Date(), 3).toISOString(),
  },
];

// ============================================================================
// TEAM PERMISSIONS DATA
// ============================================================================

export const DEMO_TEAM_MEMBERS = [
  {
    id: 'u1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'Content Manager',
    permissions: {
      view: true,
      edit: true,
      approve: true,
      publish: false,
    },
    businesses: ['Tech Solutions Inc', 'Marketing Agency'],
    lastActive: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'u2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'Social Media Manager',
    permissions: {
      view: true,
      edit: true,
      approve: false,
      publish: true,
    },
    businesses: ['Fashion Brand Co', 'E-commerce Plus'],
    lastActive: subDays(new Date(), 1).toISOString(),
    status: 'active',
  },
  {
    id: 'u3',
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'Email Specialist',
    permissions: {
      view: true,
      edit: true,
      approve: false,
      publish: true,
    },
    businesses: ['Tech Solutions Inc'],
    lastActive: subDays(new Date(), 2).toISOString(),
    status: 'active',
  },
  {
    id: 'u4',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'PPC Specialist',
    permissions: {
      view: true,
      edit: true,
      approve: true,
      publish: true,
    },
    businesses: ['E-commerce Plus', 'Tech Solutions Inc'],
    lastActive: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'u5',
    name: 'Lisa Park',
    email: 'lisa@example.com',
    role: 'Intern',
    permissions: {
      view: true,
      edit: false,
      approve: false,
      publish: false,
    },
    businesses: ['Fashion Brand Co'],
    lastActive: subDays(new Date(), 7).toISOString(),
    status: 'invited',
  },
];

// ============================================================================
// CAMPAIGN REPORTS DATA
// ============================================================================

export const DEMO_ANALYTICS_DATA = {
  websiteTraffic: {
    labels: ['Jan 1', 'Jan 8', 'Jan 15', 'Jan 22', 'Jan 29', 'Feb 5', 'Feb 12'],
    sessions: [4200, 4500, 4300, 5100, 4800, 5300, 5600],
    pageViews: [12600, 13500, 12900, 15300, 14400, 15900, 16800],
    uniqueVisitors: [3800, 4100, 3900, 4600, 4300, 4800, 5100],
  },
  adPerformance: {
    google: {
      impressions: 125000,
      clicks: 3750,
      conversions: 188,
      cost: 4500,
      ctr: 3.0,
      cpc: 1.20,
      conversionRate: 5.0,
    },
    facebook: {
      impressions: 98000,
      clicks: 2940,
      conversions: 147,
      cost: 3200,
      ctr: 3.0,
      cpc: 1.09,
      conversionRate: 5.0,
    },
  },
  conversions: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    data: [42, 55, 48, 68, 71, 85],
  },
  topPages: [
    { page: '/products/premium-service', views: 8500, bounceRate: 32, avgTime: '3:45' },
    { page: '/blog/seo-tips-2024', views: 6200, bounceRate: 28, avgTime: '5:12' },
    { page: '/about', views: 4100, bounceRate: 45, avgTime: '2:20' },
    { page: '/contact', views: 3800, bounceRate: 38, avgTime: '1:55' },
    { page: '/pricing', views: 3500, bounceRate: 42, avgTime: '2:40' },
  ],
  channelPerformance: [
    { channel: 'Organic Search', sessions: 12500, conversions: 425, value: 85000 },
    { channel: 'Paid Search', sessions: 8200, conversions: 328, value: 65600 },
    { channel: 'Social Media', sessions: 6500, conversions: 195, value: 39000 },
    { channel: 'Email', sessions: 4200, conversions: 252, value: 50400 },
    { channel: 'Direct', sessions: 3800, conversions: 190, value: 38000 },
  ],
};

// ============================================================================
// WORKFLOW ANALYTICS DATA
// ============================================================================

export const DEMO_WORKFLOW_STATS = {
  executionStats: {
    total: 1247,
    successful: 1098,
    failed: 89,
    running: 12,
    pending: 48,
    successRate: 88.1,
  },
  creditUsage: {
    total: 45680,
    byWorkflow: [
      { name: 'SEO Content Generator', credits: 12500, executions: 250 },
      { name: 'Social Media Scheduler', credits: 8900, executions: 445 },
      { name: 'Email Campaign Builder', credits: 7200, executions: 180 },
      { name: 'Ad Copy Generator', credits: 6800, executions: 170 },
      { name: 'Blog Post Optimizer', credits: 5280, executions: 132 },
    ],
  },
  performanceMetrics: {
    avgExecutionTime: 45, // seconds
    mostUsed: [
      { name: 'Social Media Scheduler', count: 445 },
      { name: 'SEO Content Generator', count: 250 },
      { name: 'Email Campaign Builder', count: 180 },
    ],
    errorRates: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [8.5, 7.2, 6.8, 7.1],
    },
  },
  optimizationSuggestions: [
    {
      workflow: 'SEO Content Generator',
      suggestion: 'Consider reducing OpenAI model temperature for more consistent outputs',
      potentialSaving: '15% credit reduction',
    },
    {
      workflow: 'Email Campaign Builder',
      suggestion: 'Batch processing could reduce execution time by 30%',
      potentialSaving: '25 seconds per execution',
    },
    {
      workflow: 'Ad Copy Generator',
      suggestion: 'Template reuse could save 20% of API calls',
      potentialSaving: '1,360 credits per month',
    },
  ],
};

// ============================================================================
// ROI TRACKING DATA
// ============================================================================

export const DEMO_ROI_DATA = {
  overview: {
    totalRevenue: 285000,
    totalCost: 42500,
    roi: 570,
    cac: 45,
    ltv: 850,
    activeCampaigns: 8,
  },
  campaignROI: [
    { campaign: 'Q1 Content Push', cost: 11250, revenue: 68500, roi: 509, status: 'active' },
    { campaign: 'Product Launch 2024', cost: 32500, revenue: 142000, roi: 337, status: 'active' },
    { campaign: 'Email Marketing Q1', cost: 3500, revenue: 28000, roi: 700, status: 'active' },
    { campaign: 'Spring Promotion', cost: 3500, revenue: 18500, roi: 429, status: 'planning' },
    { campaign: 'Social Media Ads', cost: 8200, revenue: 28000, roi: 241, status: 'active' },
  ],
  roiTrend: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    revenue: [38000, 42000, 48000, 52000, 55000, 58000],
    cost: [6500, 7200, 7800, 8200, 8500, 8800],
    roi: [485, 483, 515, 534, 547, 559],
  },
  channelComparison: [
    { channel: 'Email Marketing', roi: 720, avgCost: 2800, conversions: 420 },
    { channel: 'Content Marketing', roi: 615, avgCost: 4200, conversions: 385 },
    { channel: 'Organic Social', roi: 580, avgCost: 1200, conversions: 180 },
    { channel: 'Paid Search', roi: 340, avgCost: 12500, conversions: 485 },
    { channel: 'Display Ads', roi: 225, avgCost: 8500, conversions: 215 },
  ],
  goalTracking: [
    { goal: 'Q1 Revenue Target', target: 250000, actual: 285000, progress: 114 },
    { goal: 'Customer Acquisition', target: 500, actual: 632, progress: 126 },
    { goal: 'Marketing ROI', target: 500, actual: 570, progress: 114 },
    { goal: 'Email Subscribers', target: 10000, actual: 8750, progress: 88 },
  ],
};

// ============================================================================
// AUTOMATION SCHEDULER DATA
// ============================================================================

export const DEMO_SCHEDULED_AUTOMATIONS = [
  {
    id: 's1',
    name: 'Daily Social Media Posts',
    schedule: 'Daily at 9:00 AM',
    frequency: 'daily',
    nextRun: addDays(new Date(), 1).toISOString(),
    lastRun: subDays(new Date(), 1).toISOString(),
    status: 'active',
    workflow: 'Social Media Scheduler',
    business: 'Fashion Brand Co',
  },
  {
    id: 's2',
    name: 'Weekly Newsletter',
    schedule: 'Every Monday at 8:00 AM',
    frequency: 'weekly',
    nextRun: addDays(new Date(), 5).toISOString(),
    lastRun: subDays(new Date(), 2).toISOString(),
    status: 'active',
    workflow: 'Email Campaign Builder',
    business: 'Tech Solutions Inc',
  },
  {
    id: 's3',
    name: 'Monthly SEO Report',
    schedule: '1st of every month at 10:00 AM',
    frequency: 'monthly',
    nextRun: addDays(new Date(), 15).toISOString(),
    lastRun: subDays(new Date(), 15).toISOString(),
    status: 'active',
    workflow: 'SEO Content Generator',
    business: 'Marketing Agency',
  },
  {
    id: 's4',
    name: 'Ad Performance Check',
    schedule: 'Daily at 6:00 PM',
    frequency: 'daily',
    nextRun: new Date().toISOString(),
    lastRun: subDays(new Date(), 1).toISOString(),
    status: 'paused',
    workflow: 'Ad Copy Generator',
    business: 'E-commerce Plus',
  },
];

export const DEMO_EXECUTION_QUEUE = [
  {
    id: 'q1',
    workflow: 'Social Media Scheduler',
    business: 'Fashion Brand Co',
    status: 'running',
    progress: 65,
    startedAt: new Date().toISOString(),
    estimatedCompletion: addDays(new Date(), 0).toISOString(),
    creditsUsed: 18,
  },
  {
    id: 'q2',
    workflow: 'Email Campaign Builder',
    business: 'Tech Solutions Inc',
    status: 'queued',
    progress: 0,
    queuedAt: new Date().toISOString(),
    estimatedStart: addDays(new Date(), 0).toISOString(),
  },
  {
    id: 'q3',
    workflow: 'Blog Post Optimizer',
    business: 'Marketing Agency',
    status: 'queued',
    progress: 0,
    queuedAt: subDays(new Date(), 0).toISOString(),
    estimatedStart: addDays(new Date(), 0).toISOString(),
  },
];

// ============================================================================
// DOCUMENT LIBRARY DATA
// ============================================================================

export const DEMO_DOCUMENTS = [
  {
    id: 'd1',
    title: '10 SEO Tips for 2024',
    type: 'blog',
    business: 'Tech Solutions Inc',
    tags: ['SEO', 'Content', 'Marketing'],
    createdAt: subDays(new Date(), 15).toISOString(),
    updatedAt: subDays(new Date(), 2).toISOString(),
    author: 'Sarah Johnson',
    version: 3,
    size: '24 KB',
    status: 'published',
  },
  {
    id: 'd2',
    title: 'Product Launch Campaign Brief',
    type: 'document',
    business: 'Fashion Brand Co',
    tags: ['Campaign', 'Strategy', 'Launch'],
    createdAt: subDays(new Date(), 30).toISOString(),
    updatedAt: subDays(new Date(), 10).toISOString(),
    author: 'Mike Chen',
    version: 5,
    size: '156 KB',
    status: 'draft',
  },
  {
    id: 'd3',
    title: 'Q1 Email Templates',
    type: 'template',
    business: 'Tech Solutions Inc',
    tags: ['Email', 'Template', 'Q1'],
    createdAt: subDays(new Date(), 45).toISOString(),
    updatedAt: subDays(new Date(), 20).toISOString(),
    author: 'Emily Davis',
    version: 2,
    size: '48 KB',
    status: 'published',
  },
  {
    id: 'd4',
    title: 'Spring Sale Ad Creatives',
    type: 'design',
    business: 'E-commerce Plus',
    tags: ['Ads', 'Design', 'Sale'],
    createdAt: subDays(new Date(), 10).toISOString(),
    updatedAt: subDays(new Date(), 3).toISOString(),
    author: 'John Smith',
    version: 4,
    size: '2.4 MB',
    status: 'approved',
  },
  {
    id: 'd5',
    title: 'Brand Guidelines 2024',
    type: 'document',
    business: 'Fashion Brand Co',
    tags: ['Brand', 'Guidelines', 'Design'],
    createdAt: subDays(new Date(), 60).toISOString(),
    updatedAt: subDays(new Date(), 40).toISOString(),
    author: 'Lisa Park',
    version: 1,
    size: '3.8 MB',
    status: 'published',
  },
];

// ============================================================================
// VERSION CONTROL DATA
// ============================================================================

export const DEMO_VERSION_HISTORY = {
  documentId: 'd1',
  currentVersion: 3,
  versions: [
    {
      version: 3,
      status: 'published',
      author: 'Sarah Johnson',
      timestamp: subDays(new Date(), 2).toISOString(),
      changes: 'Updated statistics and added voice search section',
      content: '# 10 SEO Tips for 2024\n\nSearch Engine Optimization continues to evolve...',
    },
    {
      version: 2,
      status: 'draft',
      author: 'Sarah Johnson',
      timestamp: subDays(new Date(), 5).toISOString(),
      changes: 'Revised introduction and added examples',
      content: '# 10 SEO Tips for 2024\n\nSEO is changing rapidly...',
    },
    {
      version: 1,
      status: 'draft',
      author: 'Sarah Johnson',
      timestamp: subDays(new Date(), 15).toISOString(),
      changes: 'Initial draft',
      content: '# 10 SEO Tips for 2024\n\nHere are some tips...',
    },
  ],
};

// ============================================================================
// TEMPLATE MARKETPLACE DATA
// ============================================================================

export const DEMO_TEMPLATES = [
  {
    id: 't1',
    name: 'SEO Article Generator',
    category: 'Content',
    description: 'Generate SEO-optimized blog articles with keyword research and meta descriptions',
    author: 'RYVR Team',
    rating: 4.8,
    reviews: 245,
    installs: 1240,
    featured: true,
    thumbnail: 'https://via.placeholder.com/400x300',
    tags: ['SEO', 'Content', 'Blogging'],
  },
  {
    id: 't2',
    name: 'Social Media Campaign',
    category: 'Social',
    description: 'Create and schedule multi-platform social media campaigns with AI-generated content',
    author: 'RYVR Team',
    rating: 4.6,
    reviews: 189,
    installs: 890,
    featured: true,
    thumbnail: 'https://via.placeholder.com/400x300',
    tags: ['Social', 'Campaign', 'Automation'],
  },
  {
    id: 't3',
    name: 'Email Drip Campaign',
    category: 'Email',
    description: 'Automated email sequences with personalization and A/B testing',
    author: 'Marketing Pro',
    rating: 4.7,
    reviews: 156,
    installs: 670,
    featured: false,
    thumbnail: 'https://via.placeholder.com/400x300',
    tags: ['Email', 'Automation', 'Marketing'],
  },
  {
    id: 't4',
    name: 'PPC Ad Optimizer',
    category: 'Ads',
    description: 'Optimize Google and Facebook ads with AI-powered suggestions and bidding strategies',
    author: 'Ad Expert',
    rating: 4.5,
    reviews: 134,
    installs: 520,
    featured: false,
    thumbnail: 'https://via.placeholder.com/400x300',
    tags: ['PPC', 'Ads', 'Optimization'],
  },
  {
    id: 't5',
    name: 'SEO Audit & Report',
    category: 'SEO',
    description: 'Comprehensive SEO audit with actionable recommendations and progress tracking',
    author: 'SEO Wizard',
    rating: 4.9,
    reviews: 312,
    installs: 1580,
    featured: true,
    thumbnail: 'https://via.placeholder.com/400x300',
    tags: ['SEO', 'Audit', 'Reporting'],
  },
  {
    id: 't6',
    name: 'Content Calendar Planner',
    category: 'Content',
    description: 'Plan and organize your content strategy with automated scheduling and reminders',
    author: 'RYVR Team',
    rating: 4.4,
    reviews: 98,
    installs: 445,
    featured: false,
    thumbnail: 'https://via.placeholder.com/400x300',
    tags: ['Planning', 'Content', 'Organization'],
  },
];

// ============================================================================
// PUBLISHING HUB DATA
// ============================================================================

export const DEMO_PUBLISHING_CONTENT = [
  {
    id: 'p1',
    title: '10 SEO Tips for 2024',
    type: 'blog',
    content: 'Search Engine Optimization continues to evolve rapidly...',
    platforms: {
      wordpress: { enabled: true, status: 'published', url: 'https://example.com/blog/seo-tips' },
      linkedin: { enabled: true, status: 'scheduled', scheduledFor: addDays(new Date(), 1).toISOString() },
      twitter: { enabled: false, status: null },
      facebook: { enabled: false, status: null },
      instagram: { enabled: false, status: null },
    },
    publishedAt: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 'p2',
    title: 'Product Launch Announcement',
    type: 'social',
    content: '🚀 Exciting news! Our new product is here...',
    platforms: {
      wordpress: { enabled: false, status: null },
      linkedin: { enabled: true, status: 'draft' },
      twitter: { enabled: true, status: 'draft' },
      facebook: { enabled: true, status: 'draft' },
      instagram: { enabled: true, status: 'draft' },
    },
    scheduledFor: addDays(new Date(), 2).toISOString(),
  },
];

export const DEMO_PUBLISHING_HISTORY = [
  {
    id: 'ph1',
    title: '10 SEO Tips for 2024',
    platform: 'WordPress',
    status: 'published',
    publishedAt: subDays(new Date(), 2).toISOString(),
    url: 'https://example.com/blog/seo-tips',
  },
  {
    id: 'ph2',
    title: 'Marketing Automation Guide',
    platform: 'LinkedIn',
    status: 'published',
    publishedAt: subDays(new Date(), 5).toISOString(),
    url: 'https://linkedin.com/posts/example',
  },
  {
    id: 'ph3',
    title: 'Quick Marketing Tip',
    platform: 'Twitter',
    status: 'published',
    publishedAt: subDays(new Date(), 7).toISOString(),
    url: 'https://twitter.com/example/status/123',
  },
  {
    id: 'ph4',
    title: 'Behind the Scenes',
    platform: 'Instagram',
    status: 'published',
    publishedAt: subDays(new Date(), 10).toISOString(),
    url: 'https://instagram.com/p/abc123',
  },
];

