/**
 * Contact form API routes
 * Handle contact form submissions and data storage
 */
import { Router, type Request, type Response } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Input validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateContactForm = (data: any): { valid: boolean; message?: string } => {
  const { name, email, subject, message } = data;
  
  if (!name || !email || !subject || !message) {
    return { valid: false, message: '所有字段都是必填的' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, message: '姓名至少需要2个字符' };
  }
  
  if (!validateEmail(email)) {
    return { valid: false, message: '请输入有效的邮箱地址' };
  }
  
  if (subject.trim().length < 5) {
    return { valid: false, message: '主题至少需要5个字符' };
  }
  
  if (message.trim().length < 10) {
    return { valid: false, message: '消息内容至少需要10个字符' };
  }
  
  return { valid: true };
};

// Standard API response format
const sendResponse = (res: Response, success: boolean, data?: any, message?: string, statusCode = 200) => {
  res.status(statusCode).json({
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Submit Contact Form
 * POST /api/contact/submit
 */
router.post('/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    // Input validation
    const validation = validateContactForm({ name, email, subject, message });
    if (!validation.valid) {
      sendResponse(res, false, null, validation.message, 400);
      return;
    }

    // Sanitize input data
    const sanitizedData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      submitted_at: new Date().toISOString(),
      status: 'pending' // pending, read, replied
    };

    // Insert contact form data into database
    const { data, error } = await supabaseAdmin
      .from('contact_submissions')
      .insert([sanitizedData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      sendResponse(res, false, null, '提交失败，请稍后重试', 500);
      return;
    }

    // Return success response (exclude sensitive data)
    sendResponse(res, true, {
      id: data.id,
      submitted_at: data.submitted_at
    }, '消息提交成功，我们将尽快回复您', 201);

  } catch (error) {
    console.error('Contact form submission error:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

/**
 * Get Contact Submissions (Admin only)
 * GET /api/contact/submissions
 */
router.get('/submissions', async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Add admin authentication middleware
    // For now, this endpoint is not secured
    
    const { page = 1, limit = 10, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('contact_submissions')
      .select('*', { count: 'exact' })
      .order('submitted_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    // Filter by status if provided
    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      sendResponse(res, false, null, '获取数据失败', 500);
      return;
    }

    sendResponse(res, true, {
      submissions: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

/**
 * Update Contact Submission Status (Admin only)
 * PUT /api/contact/submissions/:id/status
 */
router.put('/submissions/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Add admin authentication middleware
    
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'read', 'replied'].includes(status)) {
      sendResponse(res, false, null, '无效的状态值', 400);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('contact_submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      sendResponse(res, false, null, '更新失败', 500);
      return;
    }

    if (!data) {
      sendResponse(res, false, null, '未找到指定的提交记录', 404);
      return;
    }

    sendResponse(res, true, data, '状态更新成功');

  } catch (error) {
    console.error('Update status error:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

export default router;