/**
 * Comments CRUD API routes
 * Handle comment create, update, delete operations
 */
import { Router, Request, Response } from 'express';
import { supabaseAdmin, createUserClient, verifyAuthToken } from '../../lib/supabase.js';

const router = Router();

// Standard API response format
const sendResponse = (res: Response, success: boolean, data?: unknown, message?: string, statusCode = 200) => {
  res.status(statusCode).json({
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

// Input validation helpers
const validateCommentData = (data: Record<string, unknown>): { valid: boolean; message?: string } => {
  const { post_id, content } = data;
  
  if (!post_id || typeof post_id !== 'string') {
    return { valid: false, message: '帖子ID不能为空' };
  }
  
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return { valid: false, message: '评论内容不能为空' };
  }
  
  if (content.trim().length > 1000) {
    return { valid: false, message: '评论内容不能超过1000个字符' };
  }
  
  return { valid: true };
};

/**
 * Add a comment to a post
 * POST /api/comments
 */
router.post('/', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    const user = await verifyAuthToken(authHeader);
    
    if (!user) {
      sendResponse(res, false, null, '请先登录', 401);
      return;
    }

    const validation = validateCommentData(req.body);
    if (!validation.valid) {
      sendResponse(res, false, null, validation.message, 400);
      return;
    }

    const { post_id, content } = req.body;
    
    // 验证帖子是否存在
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .single();

    if (postError || !post) {
      sendResponse(res, false, null, '帖子不存在', 404);
      return;
    }

    // 创建用户客户端
    const userSupabase = createUserClient(authHeader!.replace('Bearer ', ''));
    
    // 添加评论到数据库
    const { data: newComment, error } = await userSupabase
      .from('comments')
      .insert({
        post_id: post_id,
        user_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      console.error('添加评论失败:', error);
      sendResponse(res, false, null, '添加评论失败', 500);
      return;
    }

    // 🚀 优化：从user_profiles获取作者信息，避免Auth API调用
    const { data: authorData } = await supabaseAdmin
      .from('user_profiles')
      .select('id, username, avatar_url')
      .eq('id', user.id)
      .single();
    
    // 格式化返回数据
    const formattedComment = {
      id: newComment.id,
      content: newComment.content,
      created_at: newComment.created_at,
      updated_at: newComment.updated_at,
      author: {
        id: user.id,
        username: authorData?.username || '未知用户',
        avatar_url: authorData?.avatar_url
      }
    };

    sendResponse(res, true, formattedComment, '评论添加成功', 201);

  } catch (error) {
    console.error('添加评论错误:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

/**
 * Delete a comment
 * DELETE /api/comments/:commentId
 */
router.delete('/:commentId', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    const user = await verifyAuthToken(authHeader);
    
    if (!user) {
      sendResponse(res, false, null, '请先登录', 401);
      return;
    }

    const { commentId } = req.params;
    
    if (!commentId) {
      sendResponse(res, false, null, '评论ID不能为空', 400);
      return;
    }

    // 验证评论是否存在且属于当前用户
    const { data: comment, error: fetchError } = await supabaseAdmin
      .from('comments')
      .select('id, user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      sendResponse(res, false, null, '评论不存在', 404);
      return;
    }

    if (comment.user_id !== user.id) {
      sendResponse(res, false, null, '无权删除此评论', 403);
      return;
    }

    // 创建用户客户端
    const userSupabase = createUserClient(authHeader!.replace('Bearer ', ''));
    
    // 删除评论
    const { error } = await userSupabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) {
      console.error('删除评论失败:', error);
      sendResponse(res, false, null, '删除评论失败', 500);
      return;
    }

    sendResponse(res, true, null, '评论删除成功');

  } catch (error) {
    console.error('删除评论错误:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

/**
 * Update a comment
 * PUT /api/comments/:commentId
 */
router.put('/:commentId', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    const user = await verifyAuthToken(authHeader);
    
    if (!user) {
      sendResponse(res, false, null, '请先登录', 401);
      return;
    }

    const { commentId } = req.params;
    const { content } = req.body;
    
    if (!commentId) {
      sendResponse(res, false, null, '评论ID不能为空', 400);
      return;
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      sendResponse(res, false, null, '评论内容不能为空', 400);
      return;
    }

    if (content.trim().length > 1000) {
      sendResponse(res, false, null, '评论内容不能超过1000个字符', 400);
      return;
    }

    // 验证评论是否存在且属于当前用户
    const { data: comment, error: fetchError } = await supabaseAdmin
      .from('comments')
      .select('id, user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      sendResponse(res, false, null, '评论不存在', 404);
      return;
    }

    if (comment.user_id !== user.id) {
      sendResponse(res, false, null, '无权修改此评论', 403);
      return;
    }

    // 创建用户客户端
    const userSupabase = createUserClient(authHeader!.replace('Bearer ', ''));
    
    // 更新评论
    const { data: updatedComment, error } = await userSupabase
      .from('comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) {
      console.error('更新评论失败:', error);
      sendResponse(res, false, null, '更新评论失败', 500);
      return;
    }

    // 🚀 优化：从user_profiles获取作者信息，避免Auth API调用
    const { data: authorData } = await supabaseAdmin
      .from('user_profiles')
      .select('id, username, avatar_url')
      .eq('id', user.id)
      .single();

    // 格式化返回数据
    const formattedComment = {
      id: updatedComment.id,
      content: updatedComment.content,
      created_at: updatedComment.created_at,
      updated_at: updatedComment.updated_at,
      author: {
        id: user.id,
        username: authorData?.username || '未知用户',
        avatar_url: authorData?.avatar_url
      }
    };

    sendResponse(res, true, formattedComment, '评论更新成功');

  } catch (error) {
    console.error('更新评论错误:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

export default router;