/**
 * Contact Service
 * Handles contact form submission and related API interactions
 */

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  data?: {
    id: string;
    submitted_at: string;
  };
  message?: string;
  timestamp: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  status: 'pending' | 'read' | 'replied';
  submitted_at: string;
  updated_at: string;
  ip_address?: string;
}

export interface ContactSubmissionsResponse {
  success: boolean;
  data?: {
    submissions: ContactSubmission[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
  timestamp: string;
}

class ContactService {
  private baseUrl: string;

  constructor() {
    // Use environment variable or fallback to localhost
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  /**
   * Submit contact form
   */
  async submitContactForm(formData: ContactFormData): Promise<ContactSubmissionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ContactSubmissionResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Contact form submission error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : '提交失败，请检查网络连接后重试'
      );
    }
  }

  /**
   * Get contact submissions (Admin only)
   */
  async getContactSubmissions(
    page: number = 1,
    limit: number = 10,
    status?: 'pending' | 'read' | 'replied'
  ): Promise<ContactSubmissionsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) {
        params.append('status', status);
      }

      // Get admin token for authentication
      const adminToken = localStorage.getItem('adminToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const response = await fetch(`${this.baseUrl}/api/contact/submissions?${params}`, {
        method: 'GET',
        headers,
      });

      const result: ContactSubmissionsResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Get contact submissions error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : '获取数据失败，请稍后重试'
      );
    }
  }

  /**
   * Update contact submission status (Admin only)
   */
  async updateSubmissionStatus(
    id: string,
    status: 'pending' | 'read' | 'replied'
  ): Promise<ContactSubmissionResponse> {
    try {
      // Get admin token for authentication
      const adminToken = localStorage.getItem('adminToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const response = await fetch(`${this.baseUrl}/api/contact/submissions/${id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status }),
      });

      const result: ContactSubmissionResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Update submission status error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : '更新失败，请稍后重试'
      );
    }
  }

  /**
   * Delete contact submission (Admin only)
   */
  async deleteSubmission(id: string): Promise<ContactSubmissionResponse> {
    try {
      // Get admin token for authentication
      const adminToken = localStorage.getItem('adminToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const response = await fetch(`${this.baseUrl}/api/contact/submissions/${id}`, {
        method: 'DELETE',
        headers,
      });

      const result: ContactSubmissionResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Delete submission error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : '删除失败，请稍后重试'
      );
    }
  }

  /**
   * Validate contact form data
   */
  validateContactForm(data: ContactFormData): { valid: boolean; message?: string } {
    const { name, email, subject, message, phone } = data;
    
    if (!name || !email || !subject || !message) {
      return { valid: false, message: '所有字段都是必填的' };
    }
    
    // Phone validation (optional field)
    if (phone && phone.trim()) {
      const phoneRegex = /^[+]?[1-9][\d\s\-()]{7,15}$/;
      if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ''))) {
        return { valid: false, message: '请输入有效的电话号码' };
      }
    }
    
    if (name.trim().length < 2) {
      return { valid: false, message: '姓名至少需要2个字符' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: '请输入有效的邮箱地址' };
    }
    
    if (subject.trim().length < 5) {
      return { valid: false, message: '主题至少需要5个字符' };
    }
    
    if (message.trim().length < 10) {
      return { valid: false, message: '消息内容至少需要10个字符' };
    }
    
    return { valid: true };
  }
}

// Export singleton instance
export const contactService = new ContactService();
export default ContactService;