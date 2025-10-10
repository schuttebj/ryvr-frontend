/**
 * Campaign API Service
 * Currently returns dummy data - replace with real API calls when backend is ready
 */

import {
  DEMO_CAMPAIGNS,
  DEMO_ROI_DATA,
} from '../data/demoData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const campaignApi = {
  /**
   * Get all campaigns
   * Future: GET /api/v1/campaigns
   */
  async list(filters?: {
    status?: string;
    businessId?: string;
  }) {
    await delay(500);
    let campaigns = [...DEMO_CAMPAIGNS];

    if (filters?.status) {
      campaigns = campaigns.filter(c => c.status === filters.status);
    }

    return {
      success: true,
      data: campaigns,
      total: campaigns.length,
    };
  },

  /**
   * Get campaign details
   * Future: GET /api/v1/campaigns/{id}
   */
  async get(id: string) {
    await delay(300);
    const campaign = DEMO_CAMPAIGNS.find(c => c.id === id);
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return {
      success: true,
      data: campaign,
    };
  },

  /**
   * Create campaign
   * Future: POST /api/v1/campaigns
   */
  async create(campaignData: any) {
    await delay(600);
    return {
      success: true,
      data: {
        id: `c${Date.now()}`,
        ...campaignData,
        createdAt: new Date().toISOString(),
      },
    };
  },

  /**
   * Update campaign
   * Future: PUT /api/v1/campaigns/{id}
   */
  async update(id: string, updates: any) {
    await delay(500);
    return {
      success: true,
      data: { id, ...updates },
    };
  },

  /**
   * Delete campaign
   * Future: DELETE /api/v1/campaigns/{id}
   */
  async delete(_id: string) {
    await delay(400);
    return {
      success: true,
      message: 'Campaign deleted successfully',
    };
  },

  /**
   * Get ROI data
   * Future: GET /api/v1/campaigns/roi
   */
  async getRoiData(_filters?: {
    campaignId?: string;
    dateRange?: { start: string; end: string };
  }) {
    await delay(500);
    return {
      success: true,
      data: DEMO_ROI_DATA,
    };
  },

  /**
   * Get campaign ROI by ID
   * Future: GET /api/v1/campaigns/{id}/roi
   */
  async getCampaignRoi(id: string) {
    await delay(400);
    const campaign = DEMO_ROI_DATA.campaignROI.find(c => c.campaign.includes(id));
    
    return {
      success: true,
      data: campaign || null,
    };
  },

  /**
   * Update milestone
   * Future: PUT /api/v1/campaigns/{id}/milestones/{milestoneId}
   */
  async updateMilestone(campaignId: string, milestoneId: string, updates: any) {
    await delay(400);
    return {
      success: true,
      data: { campaignId, milestoneId, ...updates },
    };
  },

  /**
   * Add team member to campaign
   * Future: POST /api/v1/campaigns/{id}/team
   */
  async addTeamMember(campaignId: string, userId: string) {
    await delay(400);
    return {
      success: true,
      data: { campaignId, userId, addedAt: new Date().toISOString() },
    };
  },

  /**
   * Remove team member from campaign
   * Future: DELETE /api/v1/campaigns/{id}/team/{userId}
   */
  async removeTeamMember(_campaignId: string, _userId: string) {
    await delay(400);
    return {
      success: true,
      message: 'Team member removed successfully',
    };
  },
};

export default campaignApi;

