/**
 * Comments API routes
 * Handle comment operations for posts
 */
import { Router, type Request, type Response } from 'express';
import { supabaseAdmin, createUserClient, verifyAuthToken } from '../lib/supabase.js';

const router = Router();

// Standard API response format
const sendResponse = (res: Response, success: boolean, data?: any, message?: string, statusCode = 200) => {
  res.status(statusCode).json({
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

// Input validation helpers
const validateCommentData = (data: any): { valid: boolean; message?: string } => {
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
 * Get comments count for a post
 * GET /api/comments/:postId/count
 */
router.get('/:postId/count', async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    
    if (!postId) {
      sendResponse(res, false, null, '帖子ID不能为空', 400);
      return;
    }

    const { count, error } = await supabaseAdmin
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) {
      console.error('获取评论数量失败:', error);
      sendResponse(res, false, null, '获取评论数量失败', 500);
      return;
    }

    sendResponse(res, true, { count: count || 0 }, '获取评论数量成功');

  } catch (error) {
    console.error('获取评论数量错误:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

/**
 * Get comments for a post
 * GET /api/comments/:postId
 * Also accessible via /api/posts/:postId/comments (handled by posts router)
 */
router.get('/:postId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    
    if (!postId) {
      sendResponse(res, false, null, '帖子ID不能为空', 400);
      return;
    }

    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取评论失败:', error);
      sendResponse(res, false, null, '获取评论失败', 500);
      return;
    }

    // 获取所有评论作者信息
    const userIds = [...new Set(comments?.map(comment => comment.user_id) || [])];
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const userMap = new Map<string, any>();
    if (users?.users) {
      users.users.forEach((user: any) => {
        userMap.set(user.id, user);
      });
    }

    // 格式化评论数据
    const formattedComments = comments?.map(comment => {
      const author = userMap.get(comment.user_id);
      return {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        author: {
          id: author?.id || comment.user_id,
          username: author?.user_metadata?.username || author?.email?.split('@')[0] || '未知用户',
          avatar_url: author?.user_metadata?.avatar_url
        }
      };
    }) || [];

    sendResponse(res, true, formattedComments, '获取评论成功');

  } catch (error) {
    console.error('获取评论错误:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

/**
 * Add a comment to a post
 * POST /api/comments
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
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

    // 获取作者信息
    const { data: authorData } = await supabaseAdmin.auth.admin.getUserById(user.id);
    
    // 格式化返回数据
    const formattedComment = {
      id: newComment.id,
      content: newComment.content,
      created_at: newComment.created_at,
      updated_at: newComment.updated_at,
      author: {
        id: user.id,
        username: authorData?.user?.user_metadata?.username || authorData?.user?.email?.split('@')[0] || '未知用户',
        avatar_url: authorData?.user?.user_metadata?.avatar_url
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
router.delete('/:commentId', async (req: Request, res: Response): Promise<void> => {
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
router.put('/:commentId', async (req: Request, res: Response): Promise<void> => {
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

    // 获取作者信息
    const { data: authorData } = await supabaseAdmin.auth.admin.getUserById(user.id);

    // 格式化返回数据
    const formattedComment = {
      id: updatedComment.id,
      content: updatedComment.content,
      created_at: updatedComment.created_at,
      updated_at: updatedComment.updated_at,
      author: {
        id: user.id,
        username: authorData?.user?.user_metadata?.username || authorData?.user?.email?.split('@')[0] || '未知用户',
        avatar_url: authorData?.user?.user_metadata?.avatar_url
      }
    };

    sendResponse(res, true, formattedComment, '评论更新成功');

  } catch (error) {
    console.error('更新评论错误:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

export default router;