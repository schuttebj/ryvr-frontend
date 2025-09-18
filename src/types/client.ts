// Client questionnaire and profile types

export interface QuestionnaireResponses {
  basic: {
    businessName?: string;
    founderName?: string;
    founderRole?: string;
    businessAge?: string;
    industry?: string;
    coreOffering?: string;
  };
  model: {
    targetAudience?: string;
    problemSolving?: string;
    revenueModel?: string;
    uniqueSellingProposition?: string;
    distributionChannels?: string;
  };
  market: {
    customerDiscovery?: string;
    customerJourney?: string;
    competitors?: string;
    marketTrends?: string;
  };
  operations: {
    keyProcesses?: string;
    technology?: string;
    bottlenecks?: string;
  };
  marketing: {
    channels?: string;
    successfulStrategies?: string;
    growthChallenges?: string;
    contentStrategy?: string;
  };
  financials: {
    primaryKPIs?: string;
    goodMonth?: string;
    financialPainPoints?: string;
  };
  team: {
    teamStructure?: string;
    capacityConstraints?: string;
    teamImprovements?: string;
  };
  goals: {
    shortTermGoals?: string;
    longTermVision?: string;
    biggestRisks?: string;
  };
  challenges: {
    topChallenges?: string;
    sleeplessNights?: string;
    attemptedSolutions?: string;
  };
  resources: {
    availableResources?: string;
    constraints?: string;
  };
  brand: {
    desiredPerception?: string;
    brandVoice?: string;
    messagingPillars?: string;
  };
  risk: {
    regulations?: string;
    recentIssues?: string;
  };
}

export interface BusinessProfile {
  business_summary: {
    name: string;
    founder_or_lead: string;
    industry: string;
    core_offering: string;
    value_proposition: string;
  };
  customer_profile: {
    target_audience: string;
    primary_pain_points: string[];
    customer_journey_overview: string;
    competitive_landscape: {
      top_competitors: string[];
      differentiators: string[];
    };
  };
  business_model: {
    revenue_streams: string[];
    pricing: string;
    distribution_channels: string[];
  };
  marketing_and_growth: {
    channels: string[];
    what_works: string[];
    growth_challenges: string[];
    quick_wins: string[];
  };
  operations: {
    key_processes: string[];
    technology_stack: string[];
    bottlenecks: string[];
  };
  financials_and_metrics: {
    primary_kpis: string[];
    current_performance_snapshot: string;
    financial_pain_points: string[];
  };
  team_and_capacity: {
    team_structure: string;
    constraints: string[];
    opportunities: string[];
  };
  goals_and_vision: {
    short_term: string[];
    long_term: string[];
    existential_risks: string[];
  };
  brand_and_positioning: {
    desired_perception: string;
    voice_tone: string;
    messaging_pillars: string[];
  };
  strategic_risks_and_opportunities: {
    risks: string[];
    immediate_opportunities: string[];
  };
  summary_recommendations: string[];
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  industry?: string;
  status: 'active' | 'inactive' | 'potential';
  createdAt: string;
  updatedAt: string;
  questionnaireResponses?: QuestionnaireResponses;
  businessProfile?: BusinessProfile;
  profileGeneratedAt?: string;
  tags?: string[];
  notes?: string;
}

export interface QuestionCategory {
  id: keyof QuestionnaireResponses;
  title: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  helpText?: string;
}

// Predefined question categories
export const QUESTIONNAIRE_CATEGORIES: QuestionCategory[] = [
  {
    id: 'basic',
    title: 'Basic & Identity',
    description: 'Fundamental information about your business',
    questions: [
      {
        id: 'businessName',
        text: 'What is the name of your business?',
        type: 'text',
        required: true,
        placeholder: 'Enter your business name'
      },
      {
        id: 'founderName',
        text: 'What is your full name and role in the business?',
        type: 'text',
        required: true,
        placeholder: 'e.g., John Smith, CEO & Founder'
      },
      {
        id: 'businessAge',
        text: 'How long has the business been operating?',
        type: 'select',
        options: ['Less than 1 year', '1-2 years', '2-5 years', '5-10 years', 'More than 10 years']
      },
      {
        id: 'industry',
        text: 'What is your primary industry or niche?',
        type: 'text',
        placeholder: 'e.g., SaaS, E-commerce, Consulting'
      },
      {
        id: 'coreOffering',
        text: 'What are the core products or services you offer?',
        type: 'textarea',
        placeholder: 'Describe your main products or services...'
      }
    ]
  },
  {
    id: 'model',
    title: 'Business Model & Value Proposition',
    description: 'How your business creates and delivers value',
    questions: [
      {
        id: 'targetAudience',
        text: 'Who are your primary customers or target audience? (demographics, industries, pain points)',
        type: 'textarea',
        placeholder: 'Describe your target customers in detail...'
      },
      {
        id: 'problemSolving',
        text: 'What problem are you solving for them?',
        type: 'textarea',
        placeholder: 'Explain the main problem your business addresses...'
      },
      {
        id: 'revenueModel',
        text: 'How do you make money? (pricing structure, revenue streams)',
        type: 'textarea',
        placeholder: 'Describe your pricing and revenue model...'
      },
      {
        id: 'uniqueSellingProposition',
        text: 'What is your unique selling proposition / what differentiates you from competitors?',
        type: 'textarea',
        placeholder: 'What makes you unique in the market?'
      },
      {
        id: 'distributionChannels',
        text: 'What are your main distribution or delivery channels?',
        type: 'textarea',
        placeholder: 'How do you reach and serve customers?'
      }
    ]
  },
  {
    id: 'market',
    title: 'Customer & Market',
    description: 'Understanding your market position and customers',
    questions: [
      {
        id: 'customerDiscovery',
        text: 'How do customers currently find or discover you?',
        type: 'textarea',
        placeholder: 'Describe your main customer acquisition channels...'
      },
      {
        id: 'customerJourney',
        text: 'What does your typical customer journey look like?',
        type: 'textarea',
        placeholder: 'From awareness to purchase and beyond...'
      },
      {
        id: 'competitors',
        text: 'Who are your top competitors, and how do you compare to them?',
        type: 'textarea',
        placeholder: 'List main competitors and your advantages/disadvantages...'
      },
      {
        id: 'marketTrends',
        text: 'What market trends or external factors most affect your business right now?',
        type: 'textarea',
        placeholder: 'Industry trends, economic factors, technology changes...'
      }
    ]
  },
  {
    id: 'operations',
    title: 'Operations & Infrastructure',
    description: 'How your business operates day-to-day',
    questions: [
      {
        id: 'keyProcesses',
        text: 'What are the key operational processes (e.g., fulfillment, customer support, delivery)?',
        type: 'textarea',
        placeholder: 'Describe your main business processes...'
      },
      {
        id: 'technology',
        text: 'What tools, platforms, or technologies do you currently use?',
        type: 'textarea',
        placeholder: 'List your tech stack and tools...'
      },
      {
        id: 'bottlenecks',
        text: 'Are there bottlenecks or inefficiencies in your operations? If so, where?',
        type: 'textarea',
        placeholder: 'Identify areas that slow down your business...'
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing & Growth',
    description: 'Your marketing strategies and growth approach',
    questions: [
      {
        id: 'channels',
        text: 'What marketing channels are you using (organic, paid, partnerships, referrals)?',
        type: 'textarea',
        placeholder: 'List all your marketing channels...'
      },
      {
        id: 'successfulStrategies',
        text: 'What has worked best for customer acquisition so far?',
        type: 'textarea',
        placeholder: 'Your most successful marketing strategies...'
      },
      {
        id: 'growthChallenges',
        text: 'What are your biggest challenges in growing awareness or demand?',
        type: 'textarea',
        placeholder: 'Marketing and growth obstacles...'
      },
      {
        id: 'contentStrategy',
        text: 'Do you have a content strategy, email list, or community engagement approach?',
        type: 'textarea',
        placeholder: 'Describe your content and community efforts...'
      }
    ]
  },
  {
    id: 'financials',
    title: 'Financial & KPIs',
    description: 'Key metrics and financial performance',
    questions: [
      {
        id: 'primaryKPIs',
        text: 'What are your primary business metrics or KPIs you monitor?',
        type: 'textarea',
        placeholder: 'Revenue, customers, conversion rates, etc...'
      },
      {
        id: 'goodMonth',
        text: 'What does a "good month" look like in revenue / customer acquisition?',
        type: 'textarea',
        placeholder: 'Define success metrics for a good month...'
      },
      {
        id: 'financialPainPoints',
        text: 'Are there financial pain points (cash flow, margins, customer lifetime value)?',
        type: 'textarea',
        placeholder: 'Describe financial challenges...'
      }
    ]
  },
  {
    id: 'team',
    title: 'Team & Capacity',
    description: 'Your team structure and capabilities',
    questions: [
      {
        id: 'teamStructure',
        text: 'Who is on your team (roles, full-time/part-time/contract)?',
        type: 'textarea',
        placeholder: 'Describe your team composition...'
      },
      {
        id: 'capacityConstraints',
        text: 'What capacity constraints do you face (people, time, expertise)?',
        type: 'textarea',
        placeholder: 'Where are you limited in capacity?'
      },
      {
        id: 'teamImprovements',
        text: 'What do you wish your team could do better or more of?',
        type: 'textarea',
        placeholder: 'Areas for team improvement...'
      }
    ]
  },
  {
    id: 'goals',
    title: 'Goals & Vision',
    description: 'Your business objectives and aspirations',
    questions: [
      {
        id: 'shortTermGoals',
        text: 'What are your short-term goals (next 3–6 months)?',
        type: 'textarea',
        placeholder: 'Immediate priorities and objectives...'
      },
      {
        id: 'longTermVision',
        text: 'What are your long-term vision or aspirational goals (1–3 years)?',
        type: 'textarea',
        placeholder: 'Where do you want to be in the future?'
      },
      {
        id: 'biggestRisks',
        text: 'If nothing changed, what\'s the biggest risk to achieving those goals?',
        type: 'textarea',
        placeholder: 'What could prevent you from reaching your goals?'
      }
    ]
  },
  {
    id: 'challenges',
    title: 'Challenges & Pain Points',
    description: 'Current obstacles and difficulties',
    questions: [
      {
        id: 'topChallenges',
        text: 'What are the top 3 challenges you\'re facing right now in the business?',
        type: 'textarea',
        placeholder: 'List your biggest current challenges...'
      },
      {
        id: 'sleeplessNights',
        text: 'What has kept you awake at night recently about the business?',
        type: 'textarea',
        placeholder: 'Your biggest business concerns...'
      },
      {
        id: 'attemptedSolutions',
        text: 'What have you tried already to solve those challenges, and what were the results?',
        type: 'textarea',
        placeholder: 'Previous attempts and their outcomes...'
      }
    ]
  },
  {
    id: 'resources',
    title: 'Resources & Constraints',
    description: 'Available resources and limitations',
    questions: [
      {
        id: 'availableResources',
        text: 'What resources do you currently have (budget, partnerships, content, audience)?',
        type: 'textarea',
        placeholder: 'List your available resources...'
      },
      {
        id: 'constraints',
        text: 'What constraints (time, technical, regulatory, staffing) limit what you can do?',
        type: 'textarea',
        placeholder: 'What holds you back?'
      }
    ]
  },
  {
    id: 'brand',
    title: 'Brand & Positioning',
    description: 'How you want to be perceived in the market',
    questions: [
      {
        id: 'desiredPerception',
        text: 'How do you want customers to perceive your brand?',
        type: 'textarea',
        placeholder: 'Your desired brand image...'
      },
      {
        id: 'brandVoice',
        text: 'What tone/voice do you use in customer communication?',
        type: 'select',
        options: ['Professional', 'Friendly', 'Authoritative', 'Casual', 'Technical', 'Inspirational', 'Other']
      },
      {
        id: 'messagingPillars',
        text: 'Are there brand assets or messaging pillars we should be aware of?',
        type: 'textarea',
        placeholder: 'Key messaging themes and brand assets...'
      }
    ]
  },
  {
    id: 'risk',
    title: 'Risk & Compliance',
    description: 'Regulatory and risk considerations',
    questions: [
      {
        id: 'regulations',
        text: 'Are there industry-specific regulations or compliance requirements affecting you?',
        type: 'textarea',
        placeholder: 'Regulatory requirements and compliance needs...'
      },
      {
        id: 'recentIssues',
        text: 'Have you experienced any recent customer complaints, reputational issues, or failures?',
        type: 'textarea',
        placeholder: 'Recent issues and how they were handled...'
      }
    ]
  }
];