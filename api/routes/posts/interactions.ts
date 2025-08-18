import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../../lib/supabase.js';
import { sendResponse, sendValidationError, sendNotFoundError } from '../../utils/response.js';

const router = Router();

// Like a post
router.post('/:id/like', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      sendValidationError(res, '用户ID不能为空');
      return;
    }

    // Check if post exists
    const { error: postError } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('id', id)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        sendNotFoundError(res, '帖子不存在');
      } else {
        console.error('Error fetching post:', postError);
        sendResponse(res, false, null, '获取帖子失败', 500);
      }
      return;
    }

    // Check if already liked
    const { data: existingLike, error: likeCheckError } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user_id)
      .single();

    if (likeCheckError && likeCheckError.code !== 'PGRST116') {
      console.error('Error checking existing like:', likeCheckError);
      sendResponse(res, false, null, '检查点赞状态失败', 500);
      return;
    }

    if (existingLike) {
      sendResponse(res, false, null, '已经点赞过了', 409);
      return;
    }

    // Add like
    const { error: insertError } = await supabaseAdmin
      .from('likes')
      .insert([{
        post_id: id,
        user_id,
        created_at: new Date().toISOString()
      }]);

    if (insertError) {
      console.error('Error adding like:', insertError);
      sendResponse(res, false, null, '点赞失败', 500);
      return;
    }

    sendResponse(res, true, null, '点赞成功');

  } catch (error) {
    console.error('Error in like post:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

// Unlike a post
router.delete('/:id/like', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      sendValidationError(res, '用户ID不能为空');
      return;
    }

    const { error } = await supabaseAdmin
      .from('likes')
      .delete()
      .eq('post_id', id)
      .eq('user_id', user_id);

    if (error) {
      console.error('Error removing like:', error);
      sendResponse(res, false, null, '取消点赞失败', 500);
      return;
    }

    sendResponse(res, true, null, '取消点赞成功');

  } catch (error) {
    console.error('Error in unlike post:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

// Get post likes count
router.get('/:id/likes/count', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { count, error } = await supabaseAdmin
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', id);

    if (error) {
      console.error('Error getting likes count:', error);
      sendResponse(res, false, null, '获取点赞数失败', 500);
      return;
    }

    sendResponse(res, true, { count: count || 0 });

  } catch (error) {
    console.error('Error in get likes count:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

// Check if user liked a post
router.get('/:id/likes/:userId', async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;

    const { data: like, error } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking like status:', error);
      sendResponse(res, false, null, '检查点赞状态失败', 500);
      return;
    }

    sendResponse(res, true, { liked: !!like });

  } catch (error) {
    console.error('Error in check like status:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

// Share a post
router.post('/:id/share', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, platform } = req.body;

    if (!user_id) {
      sendValidationError(res, '用户ID不能为空');
      return;
    }

    // Check if post exists
    const { error: postError } = await supabaseAdmin
      .from('posts')
      .select('id, title')
      .eq('id', id)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        sendNotFoundError(res, '帖子不存在');
      } else {
        console.error('Error fetching post:', postError);
        sendResponse(res, false, null, '获取帖子失败', 500);
      }
      return;
    }

    // Record share activity
    const { error: shareError } = await supabaseAdmin
      .from('post_shares')
      .insert([{
        post_id: id,
        user_id,
        platform: platform || 'unknown',
        created_at: new Date().toISOString()
      }]);

    if (shareError) {
      console.error('Error recording share:', shareError);
      sendResponse(res, false, null, '分享记录失败', 500);
      return;
    }

    sendResponse(res, true, null, '分享成功');

  } catch (error) {
    console.error('Error in share post:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
});

export default router;