/**
 * Comments Query API routes
 * Handle comment query operations
 */
import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../../lib/supabase.js';

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

/**
 * Get comments count for a post
 * GET /api/comments/:postId/count
 */
router.get('/:postId/count', async (req: Request, res: Response): Promise<Response | void> => {
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
router.get('/:postId', async (req: Request, res: Response): Promise<Response | void> => {
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

    // 🚀 优化：从user_profiles表获取评论作者信息，避免Auth API调用
    const userIds = [...new Set(comments?.map(comment => comment.user_id) || [])];
    const userMap = new Map<string, { id: string; username: string; avatar_url?: string }>();
    
    if (userIds.length > 0) {
      try {
        // 从user_profiles表批量获取用户信息，避免Auth API调用
        const { data: userProfiles } = await supabaseAdmin
          .from('user_profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);
        
        if (userProfiles) {
          userProfiles.forEach(user => {
            userMap.set(user.id, {
              id: user.id,
              username: user.username,
              avatar_url: user.avatar_url
            });
          });
        }
        
        console.log(`从user_profiles批量获取 ${userIds.length} 个评论作者信息，成功获取 ${userMap.size} 个用户信息`)
      } catch (error) {
        console.error('获取评论作者信息失败:', error)
        // 继续执行，只是作者信息可能为空
      }
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
          username: author?.username || '未知用户',
          avatar_url: author?.avatar_url
        }
      };
    }) || [];

    sendResponse(res, true, formattedComments, '获取评论成功');

  } catch (error) {
    console.error('获取评论错误:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

export default router;