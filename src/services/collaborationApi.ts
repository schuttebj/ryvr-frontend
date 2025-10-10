/**
 * Collaboration API Service
 * Currently returns dummy data - replace with real API calls when backend is ready
 */

import {
  DEMO_FEEDBACK_ITEMS,
  DEMO_TEAM_MEMBERS,
} from '../data/demoData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const collaborationApi = {
  /**
   * Get feedback inbox items
   * Future: GET /api/v1/collaboration/feedback
   */
  async getFeedbackInbox(filters?: {
    type?: string;
    isRead?: boolean;
    priority?: string;
  }) {
    await delay(400);
    let items = [...DEMO_FEEDBACK_ITEMS];

    if (filters?.type) {
      items = items.filter(i => i.type === filters.type);
    }
    if (filters?.isRead !== undefined) {
      items = items.filter(i => i.isRead === filters.isRead);
    }
    if (filters?.priority) {
      items = items.filter(i => i.priority === filters.priority);
    }

    return {
      success: true,
      data: items,
      total: items.length,
      unreadCount: items.filter(i => !i.isRead).length,
    };
  },

  /**
   * Mark feedback item as read
   * Future: PUT /api/v1/collaboration/feedback/{id}/read
   */
  async markAsRead(id: string) {
    await delay(300);
    return {
      success: true,
      data: { id, isRead: true },
    };
  },

  /**
   * Mark all feedback items as read
   * Future: PUT /api/v1/collaboration/feedback/read-all
   */
  async markAllAsRead() {
    await delay(400);
    return {
      success: true,
      message: 'All items marked as read',
    };
  },

  /**
   * Get team members
   * Future: GET /api/v1/collaboration/team
   */
  async getTeamMembers(filters?: {
    businessId?: string;
    role?: string;
    status?: string;
  }) {
    await delay(400);
    let members = [...DEMO_TEAM_MEMBERS];

    if (filters?.role) {
      members = members.filter(m => m.role === filters.role);
    }
    if (filters?.status) {
      members = members.filter(m => m.status === filters.status);
    }

    return {
      success: true,
      data: members,
      total: members.length,
    };
  },

  /**
   * Get team member details
   * Future: GET /api/v1/collaboration/team/{id}
   */
  async getTeamMember(id: string) {
    await delay(300);
    const member = DEMO_TEAM_MEMBERS.find(m => m.id === id);
    
    if (!member) {
      throw new Error('Team member not found');
    }

    return {
      success: true,
      data: member,
    };
  },

  /**
   * Update team member permissions
   * Future: PUT /api/v1/collaboration/team/{id}/permissions
   */
  async updatePermissions(id: string, permissions: any) {
    await delay(500);
    return {
      success: true,
      data: { id, permissions, updatedAt: new Date().toISOString() },
    };
  },

  /**
   * Invite team member
   * Future: POST /api/v1/collaboration/team/invite
   */
  async inviteTeamMember(email: string, role: string, permissions: any) {
    await delay(600);
    return {
      success: true,
      data: {
        id: `u${Date.now()}`,
        email,
        role,
        permissions,
        status: 'invited',
        invitedAt: new Date().toISOString(),
      },
    };
  },

  /**
   * Remove team member
   * Future: DELETE /api/v1/collaboration/team/{id}
   */
  async removeTeamMember(_id: string) {
    await delay(400);
    return {
      success: true,
      message: 'Team member removed successfully',
    };
  },

  /**
   * Get activity log
   * Future: GET /api/v1/collaboration/activity
   */
  async getActivityLog(_filters?: {
    userId?: string;
    businessId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    await delay(500);
    // Return mock activity data
    return {
      success: true,
      data: [
        {
          id: 'a1',
          user: 'Sarah Johnson',
          action: 'approved',
          target: 'Blog Post: 10 SEO Tips',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'a2',
          user: 'Mike Chen',
          action: 'commented',
          target: 'Social Post: Product Launch',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      total: 2,
    };
  },
};

export default collaborationApi;

