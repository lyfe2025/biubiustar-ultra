import type { Activity } from '../types/activity';

export type { Activity };

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  user_id: string;
  joined_at: string;
  user?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ActivityCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export class ActivityService {
  // 获取所有活动
  async getActivities(): Promise<Activity[]> {
    try {
      const response = await fetch('/api/activities');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  // 获取单个活动
  async getActivity(id: string): Promise<Activity | null> {
    try {
      const response = await fetch(`/api/activities/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  }

  // 创建活动
  static async createActivity(activity: Omit<Activity, 'id' | 'created_at' | 'current_participants' | 'author'>): Promise<Activity | null> {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  // 参与活动
  static async joinActivity(activityId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/activities/${activityId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error joining activity:', error);
      return false;
    }
  }

  // 取消参与活动
  static async leaveActivity(activityId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/activities/${activityId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error leaving activity:', error);
      return false;
    }
  }

  // 检查用户是否已参与活动
  static async isUserParticipating(activityId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/activities/${activityId}/participants/${userId}`);
      if (response.status === 404) {
        return false;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.isParticipating || false;
    } catch (error) {
      console.error('Error checking participation:', error);
      return false;
    }
  }

  // 获取活动参与者
  static async getActivityParticipants(activityId: string): Promise<unknown[]> {
    try {
      const response = await fetch(`/api/activities/${activityId}/participants`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching activity participants:', error);
      throw error;
    }
  }

  // 获取用户的活动
  static async getUserActivities(userId: string): Promise<Activity[]> {
    try {
      const response = await fetch(`/api/users/${userId}/activities`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  }

  // 获取用户创建的活动
  static async getUserCreatedActivities(userId: string): Promise<Activity[]> {
    try {
      const response = await fetch(`/api/users/${userId}/created-activities`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching user created activities:', error);
      throw error;
    }
  }

  // 获取即将到来的活动
  static async getUpcomingActivities(limit = 10): Promise<Activity[]> {
    try {
      const response = await fetch(`/api/activities/upcoming?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('Activities API response:', data);
      }
      
      // activities API 直接返回数组
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching upcoming activities:', error);
      return []; // 返回空数组而不是抛出错误
    }
  }

  // 获取活动分类
  static async getActivityCategories(): Promise<ActivityCategory[]> {
    try {
      console.log('🌐 ActivityService: 开始调用API /api/categories/activity');
      const response = await fetch('/api/categories/activity');
      console.log('🌐 ActivityService: API响应状态:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const response_data = await response.json();
      console.log('🌐 ActivityService: API原始响应数据:', response_data);
      console.log('🌐 ActivityService: response_data.data:', response_data.data);
      console.log('🌐 ActivityService: response_data.data.data:', response_data.data?.data);
      console.log('🌐 ActivityService: response_data.data.total:', response_data.data?.total);
      console.log('🌐 ActivityService: categories长度:', response_data.data?.data?.length);
      
      const categories = response_data.data?.data || [];
      console.log('🌐 ActivityService: 最终返回的categories:', categories);
      return categories;
    } catch (error) {
      console.error('❌ ActivityService: Error fetching activity categories:', error);
      return []; // 返回空数组而不是抛出错误
    }
  }
}