/**
 * Contact form API routes
 * Handle contact form submissions and data storage
 */
import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAdmin } from './admin/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Input validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateContactForm = (data: Record<string, unknown>): { valid: boolean; message?: string } => {
  const { name, email, subject, message, phone } = data;
  
  if (!name || !email || !subject || !message) {
    return { valid: false, message: '所有字段都是必填的' };
  }
  
  const nameStr = String(name);
  const emailStr = String(email);
  const subjectStr = String(subject);
  const messageStr = String(message);
  const phoneStr = phone ? String(phone) : '';
  
  if (phoneStr && phoneStr.trim().length > 0 && phoneStr.trim().length < 8) {
    return { valid: false, message: '电话号码格式不正确' };
  }
  
  if (nameStr.trim().length < 2) {
    return { valid: false, message: '姓名至少需要2个字符' };
  }
  
  if (!validateEmail(emailStr)) {
    return { valid: false, message: '请输入有效的邮箱地址' };
  }
  
  if (subjectStr.trim().length < 5) {
    return { valid: false, message: '主题至少需要5个字符' };
  }
  
  if (messageStr.trim().length < 10) {
    return { valid: false, message: '消息内容至少需要10个字符' };
  }
  
  return { valid: true };
};

// Standard API response format
const sendResponse = (res: Response, success: boolean, data?: unknown, message?: string, statusCode = 200) => {
  res.status(statusCode).json({
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Get client IP address from request
 * Enhanced to get real user IP from various proxy headers
 */
const getClientIP = (req: Request): string => {
  // Check for IP from various headers (for proxy/load balancer scenarios)
  const forwarded = req.headers['x-forwarded-for'] as string;
  const realIP = req.headers['x-real-ip'] as string;
  const cfConnectingIP = req.headers['cf-connecting-ip'] as string;
  const trueClientIP = req.headers['true-client-ip'] as string;
  const xClientIP = req.headers['x-client-ip'] as string;
  
  // Priority order for getting real IP
  if (trueClientIP) {
    return trueClientIP.trim();
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  if (xClientIP) {
    return xClientIP.trim();
  }
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one (original client)
    const ips = forwarded.split(',').map(ip => ip.trim());
    // Filter out private/local IPs and return the first public IP
    for (const ip of ips) {
      if (!ip.startsWith('10.') && !ip.startsWith('192.168.') && !ip.startsWith('172.') && ip !== '127.0.0.1') {
        return ip;
      }
    }
    return ips[0]; // Fallback to first IP if no public IP found
  }
  
  // Fallback to connection remote address
  return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
};

/**
 * Check for duplicate submissions from same IP
 */
const checkDuplicateSubmission = async (ip: string): Promise<boolean> => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  
  const { data, error } = await supabaseAdmin
    .from('contact_submissions')
    .select('id')
    .eq('ip_address', ip)
    .gte('submitted_at', fiveMinutesAgo)
    .limit(1);
  
  if (error) {
    console.error('Error checking duplicate submission:', error);
    return false; // Allow submission if check fails
  }
  
  return data && data.length > 0;
};

/**
 * Submit Contact Form
 * POST /api/contact/submit
 */
router.post('/submit', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
    const { name, email, subject, message, phone } = req.body;

    // Input validation
    const validation = validateContactForm({ name, email, subject, message, phone });
    if (!validation.valid) {
      sendResponse(res, false, null, validation.message, 400);
      return;
    }

    // Get client IP address
    const clientIP = getClientIP(req);

    // Check for duplicate submissions from same IP
    const isDuplicate = await checkDuplicateSubmission(clientIP);
    if (isDuplicate) {
      sendResponse(res, false, null, '您刚刚已经提交过表单，请等待5分钟后再次提交', 429);
      return;
    }

    // Sanitize input data
    const sanitizedData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      phone: phone ? phone.trim() : null,
      ip_address: clientIP,
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

  return;
}));

/**
 * Get Contact Submissions (Admin only)
 * GET /api/contact/submissions
 */
router.get('/submissions', requireAdmin, asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
    
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

  return;
}));

/**
 * Update Contact Submission Status (Admin only)
 * PUT /api/contact/submissions/:id/status
 */
router.put('/submissions/:id/status', requireAdmin, asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
    
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
}));

/**
 * Delete Contact Submission (Admin only)
 * DELETE /api/contact/submissions/:id
 */
router.delete('/submissions/:id', requireAdmin, asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.params;

    // First check if the submission exists
    const { data: existingData, error: checkError } = await supabaseAdmin
      .from('contact_submissions')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingData) {
      sendResponse(res, false, null, '未找到指定的提交记录', 404);
      return;
    }

    // Delete the submission
    const { error } = await supabaseAdmin
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      sendResponse(res, false, null, '删除失败', 500);
      return;
    }

    sendResponse(res, true, null, '联系提交记录删除成功');
}));

export default router;