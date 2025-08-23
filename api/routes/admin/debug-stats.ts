import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAdmin } from '../../middleware/auth.js';
import asyncHandler from '../../middleware/asyncHandler.js';

const router = Router();

// 调试统计数据一致性
router.get('/check-consistency', requireAdmin, asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    console.log('开始检查统计数据一致性...');
    
    // 1. 获取posts表中的统计字段总和
    const { data: postsData, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('id, title, likes_count, comments_count, views_count');
    
    if (postsError) {
      console.error('获取posts数据失败:', postsError);
      throw postsError;
    }
    
    // 2. 获取likes表的实际数量
    const { count: actualLikesCount, error: likesError } = await supabaseAdmin
      .from('likes')
      .select('*', { count: 'exact', head: true });
    
    if (likesError) {
      console.error('获取likes数量失败:', likesError);
      throw likesError;
    }
    
    // 3. 获取comments表的实际数量
    const { count: actualCommentsCount, error: commentsError } = await supabaseAdmin
      .from('comments')
      .select('*', { count: 'exact', head: true });
    
    if (commentsError) {
      console.error('获取comments数量失败:', commentsError);
      throw commentsError;
    }
    
    // 4. 计算posts表中存储的统计数据总和
    const postsLikesSum = postsData?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;
    const postsCommentsSum = postsData?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0;
    const postsViewsSum = postsData?.reduce((sum, post) => sum + (post.views_count || 0), 0) || 0;
    
    // 5. 检查每个帖子的统计数据是否正确
    const postConsistencyChecks = [];
    
    for (const post of postsData || []) {
      // 检查该帖子的实际点赞数
      const { count: postActualLikes, error: postLikesError } = await supabaseAdmin
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      
      // 检查该帖子的实际评论数
      const { count: postActualComments, error: postCommentsError } = await supabaseAdmin
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      
      if (!postLikesError && !postCommentsError) {
        const likesMatch = post.likes_count === (postActualLikes || 0);
        const commentsMatch = post.comments_count === (postActualComments || 0);
        
        postConsistencyChecks.push({
          postId: post.id,
          title: post.title,
          storedLikes: post.likes_count,
          actualLikes: postActualLikes || 0,
          likesMatch,
          storedComments: post.comments_count,
          actualComments: postActualComments || 0,
          commentsMatch,
          viewsCount: post.views_count
        });
      }
    }
    
    // 6. 汇总结果
    const result = {
      summary: {
        totalPosts: postsData?.length || 0,
        // 仪表盘显示的数据（从likes/comments表直接计数）
        dashboardStats: {
          totalLikes: actualLikesCount || 0,
          totalComments: actualCommentsCount || 0
        },
        // 内容管理页面显示的数据（posts表中的统计字段总和）
        contentManagementStats: {
          totalLikes: postsLikesSum,
          totalComments: postsCommentsSum,
          totalViews: postsViewsSum
        },
        // 数据一致性检查
        consistency: {
          likesMatch: (actualLikesCount || 0) === postsLikesSum,
          commentsMatch: (actualCommentsCount || 0) === postsCommentsSum,
          likesDifference: (actualLikesCount || 0) - postsLikesSum,
          commentsDifference: (actualCommentsCount || 0) - postsCommentsSum
        }
      },
      // 每个帖子的详细检查结果
      postDetails: postConsistencyChecks.filter(check => !check.likesMatch || !check.commentsMatch),
      // 所有帖子的统计（用于调试）
      allPosts: postConsistencyChecks
    };
    
    console.log('统计数据一致性检查完成:', result.summary);
    
    res.json(result);
  } catch (error) {
    console.error('检查统计数据一致性失败:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
}));

// 修复统计数据不一致问题
router.post('/fix-consistency', requireAdmin, asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    console.log('开始修复统计数据不一致问题...');
    
    const { data: postsData, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('id');
    
    if (postsError) {
      throw postsError;
    }
    
    const fixResults = [];
    
    for (const post of postsData || []) {
      // 获取该帖子的实际点赞数
      const { count: actualLikes, error: likesError } = await supabaseAdmin
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      
      // 获取该帖子的实际评论数
      const { count: actualComments, error: commentsError } = await supabaseAdmin
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      
      if (!likesError && !commentsError) {
        // 更新posts表中的统计字段
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({
            likes_count: actualLikes || 0,
            comments_count: actualComments || 0
          })
          .eq('id', post.id);
        
        if (updateError) {
          console.error(`更新帖子 ${post.id} 统计数据失败:`, updateError);
          fixResults.push({
            postId: post.id,
            success: false,
            error: updateError.message
          });
        } else {
          fixResults.push({
            postId: post.id,
            success: true,
            updatedLikes: actualLikes || 0,
            updatedComments: actualComments || 0
          });
        }
      }
    }
    
    const successCount = fixResults.filter(r => r.success).length;
    const failureCount = fixResults.filter(r => !r.success).length;
    
    console.log(`统计数据修复完成: 成功 ${successCount} 个，失败 ${failureCount} 个`);
    
    res.json({
      message: '统计数据修复完成',
      summary: {
        totalProcessed: fixResults.length,
        successful: successCount,
        failed: failureCount
      },
      details: fixResults
    });
  } catch (error) {
    console.error('修复统计数据失败:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
}));

export default router;