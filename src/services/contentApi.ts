/**
 * Content API Service
 * Currently returns dummy data - replace with real API calls when backend is ready
 */

import {
  DEMO_CONTENT_ITEMS,
  DEMO_APPROVALS,
  DEMO_REVIEW_ITEMS,
} from '../data/demoData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const contentApi = {
  /**
   * Get content calendar items
   * Future: GET /api/v1/content/calendar
   */
  async getCalendarItems(filters?: {
    businessId?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
    status?: string;
  }) {
    await delay(500);
    let items = [...DEMO_CONTENT_ITEMS];

    if (filters?.type) {
      items = items.filter(item => item.type === filters.type);
    }
    if (filters?.status) {
      items = items.filter(item => item.status === filters.status);
    }

    return {
      success: true,
      data: items,
      total: items.length,
    };
  },

  /**
   * Get content item details
   * Future: GET /api/v1/content/{id}
   */
  async getContentItem(id: string) {
    await delay(300);
    const item = DEMO_CONTENT_ITEMS.find(i => i.id === id);
    
    if (!item) {
      throw new Error('Content item not found');
    }

    return {
      success: true,
      data: item,
    };
  },

  /**
   * Update content item
   * Future: PUT /api/v1/content/{id}
   */
  async updateContentItem(id: string, updates: any) {
    await delay(500);
    // In real implementation, this would update the backend
    return {
      success: true,
      data: { id, ...updates },
    };
  },

  /**
   * Get approval queue
   * Future: GET /api/v1/content/approvals
   */
  async getApprovals(filters?: {
    status?: string;
    priority?: string;
    businessId?: string;
  }) {
    await delay(400);
    let approvals = [...DEMO_APPROVALS];

    if (filters?.status) {
      approvals = approvals.filter(a => a.status === filters.status);
    }
    if (filters?.priority) {
      approvals = approvals.filter(a => a.priority === filters.priority);
    }

    return {
      success: true,
      data: approvals,
      total: approvals.length,
    };
  },

  /**
   * Approve content
   * Future: POST /api/v1/content/{id}/approve
   */
  async approveContent(id: string, feedback?: string) {
    await delay(600);
    return {
      success: true,
      data: { id, status: 'approved', feedback },
    };
  },

  /**
   * Reject content
   * Future: POST /api/v1/content/{id}/reject
   */
  async rejectContent(id: string, reason: string) {
    await delay(600);
    return {
      success: true,
      data: { id, status: 'rejected', reason },
    };
  },

  /**
   * Request changes
   * Future: POST /api/v1/content/{id}/request-changes
   */
  async requestChanges(id: string, feedback: string) {
    await delay(600);
    return {
      success: true,
      data: { id, status: 'changes_requested', feedback },
    };
  },

  /**
   * Get review items
   * Future: GET /api/v1/content/reviews
   */
  async getReviewItems() {
    await delay(400);
    return {
      success: true,
      data: DEMO_REVIEW_ITEMS,
      total: DEMO_REVIEW_ITEMS.length,
    };
  },

  /**
   * Add comment to content
   * Future: POST /api/v1/content/{id}/comments
   */
  async addComment(contentId: string, comment: string) {
    await delay(500);
    return {
      success: true,
      data: {
        id: `c${Date.now()}`,
        contentId,
        author: 'Current User',
        text: comment,
        timestamp: new Date().toISOString(),
        resolved: false,
      },
    };
  },

  /**
   * Resolve comment
   * Future: PUT /api/v1/content/comments/{id}/resolve
   */
  async resolveComment(commentId: string) {
    await delay(300);
    return {
      success: true,
      data: { id: commentId, resolved: true },
    };
  },
};

export default contentApi;

