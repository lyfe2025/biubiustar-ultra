import { Router, Request, Response } from 'express';
import { supabaseAdmin, verifyAuthToken } from '../../lib/supabase.js';
import { sendResponse, sendValidationError, sendNotFoundError, sendUnauthorizedError } from '../../utils/response.js';
import { validatePostStatus } from '../../utils/validation.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { createCacheMiddleware, createUserSpecificCacheMiddleware } from '../../middleware/cache';
import { contentCache } from '../../lib/cacheInstances';
import { invalidatePostCache, invalidateContentCache, invalidateUserCache } from '../../services/cacheInvalidation';
import { CACHE_TTL } from '../../config/cache';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

// Get all posts with pagination and filtering
router.get('/', 
  createCacheMiddleware({
    cacheService: contentCache,
    keyGenerator: (req) => {
      const { page = 1, limit = 10, category, status, author } = req.query;
      return `posts:list:${page}:${limit}:${category || 'all'}:${status || 'all'}:${author || 'all'}`;
    }
  }),
  asyncHandler(async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      category, 
      status = 'published',
      user_id,
      search,
      sort 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('posts')
      .select(`
        *,
        likes(count),
        media_files(
          id,
          file_url,
          file_type,
          thumbnail_url,
          display_order
        )
      `, { count: 'exact' })
      .eq('status', status);

    // 处理排序逻辑
    if (sort === 'trending') {
      // 热门页面改为按最新发布时间排序
      query = query.order('created_at', { ascending: false });
    } else {
      // 默认按创建时间排序
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limitNum - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      sendResponse(res, false, null, '获取帖子列表失败', 500);
      return;
    }

    // 🚀 优化：从user_profiles表获取帖子作者信息，避免Auth API调用
    const userIds = [...new Set((posts || []).map(post => post.user_id))];
    const userMap = new Map<string, { id: string; username: string; full_name?: string; avatar_url?: string }>();
    
    if (userIds.length > 0) {
      try {
        // 从user_profiles表批量获取用户信息，避免Auth API调用
        const { data: userProfiles } = await supabaseAdmin
          .from('user_profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', userIds);
        
        if (userProfiles) {
          userProfiles.forEach(user => {
            userMap.set(user.id, {
              id: user.id,
              username: user.username,
              full_name: user.full_name,
              avatar_url: user.avatar_url
            });
          });
        }
        
        console.log(`从user_profiles批量获取 ${userIds.length} 个帖子作者信息，成功获取 ${userMap.size} 个用户信息`)
      } catch (error) {
        console.error('获取帖子作者信息失败:', error)
        // 继续执行，只是作者信息可能为空
      }
    }

    // 格式化帖子数据，添加作者信息
    const formattedPosts = (posts || []).map(post => {
      const author = userMap.get(post.user_id);
      return {
        ...post,
        author: author ? {
          id: author.id,
          username: author.username,
          full_name: author.full_name,
          avatar_url: author.avatar_url
        } : null
      };
    });

    const totalPages = Math.ceil((count || 0) / limitNum);

    sendResponse(res, true, {
      posts: formattedPosts,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_count: count || 0,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('Error in get posts:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
}));

// Get single post by ID
router.get('/:id', 
  createCacheMiddleware({
    cacheService: contentCache,
    keyGenerator: (req) => `post:${req.params.id}`
  }),
  asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🔍 [POST_DETAIL] 请求帖子详情 ID: ${id}`);
    console.log(`🔍 [POST_DETAIL] Authorization header: ${req.headers.authorization ? '存在' : '不存在'}`);
    
    // 验证用户身份
    const currentUser = await verifyAuthToken(req.headers.authorization);
    console.log(`🔍 [POST_DETAIL] 用户认证结果:`, currentUser ? `用户ID: ${currentUser.id}` : '未登录');
    
    // 构建查询条件
    let query = supabaseAdmin
      .from('posts')
      .select(`
        *,
        likes(count),
        media_files(
          id,
          file_url,
          file_type,
          thumbnail_url,
          display_order
        )
      `)
      .eq('id', id);
    
    let statusFilter = null;
    
    // 如果用户未登录或不是帖子作者，只能查看已发布的帖子
    if (!currentUser) {
      statusFilter = 'published';
      query = query.eq('status', 'published');
      console.log(`🔍 [POST_DETAIL] 未登录用户，只能查看已发布帖子`);
    } else {
      // 先获取帖子基本信息以检查作者
      console.log(`🔍 [POST_DETAIL] 获取帖子基本信息以检查作者权限`);
      const { data: postInfo, error: postInfoError } = await supabaseAdmin
        .from('posts')
        .select('user_id, status, title')
        .eq('id', id)
        .single();
      
      if (postInfoError) {
        console.log(`🔍 [POST_DETAIL] 获取帖子基本信息失败:`, postInfoError);
      } else {
        console.log(`🔍 [POST_DETAIL] 帖子基本信息:`, {
          user_id: postInfo?.user_id,
          status: postInfo?.status,
          title: postInfo?.title,
          isAuthor: postInfo?.user_id === currentUser.id
        });
      }
      
      // 如果不是帖子作者，只能查看已发布的帖子
      if (!postInfo || postInfo.user_id !== currentUser.id) {
        statusFilter = 'published';
        query = query.eq('status', 'published');
        console.log(`🔍 [POST_DETAIL] 非作者用户，只能查看已发布帖子`);
      } else {
        console.log(`🔍 [POST_DETAIL] 帖子作者，可以查看任何状态的帖子`);
      }
      // 如果是帖子作者，可以查看任何状态的帖子（不添加status过滤条件）
    }
    
    console.log(`🔍 [POST_DETAIL] 最终查询条件 - 帖子ID: ${id}, 状态过滤: ${statusFilter || '无限制'}`);
    
    const { data: post, error } = await query.single();
    
    console.log(`🔍 [POST_DETAIL] 查询结果:`, {
      success: !error,
      error: error?.message,
      errorCode: error?.code,
      postFound: !!post,
      postStatus: post?.status
    });

    if (error) {
      if (error.code === 'PGRST116') {
        sendNotFoundError(res, '帖子不存在');
      } else {
        console.error('Error fetching post:', error);
        sendResponse(res, false, null, '获取帖子失败', 500);
      }
      return;
    }

    // 🚀 优化：从user_profiles表获取帖子作者信息，避免Auth API调用
    let author = null;
    try {
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', post.user_id)
        .single();
      
      if (userProfile) {
        author = {
          id: userProfile.id,
          username: userProfile.username,
          full_name: userProfile.full_name,
          avatar_url: userProfile.avatar_url
        };
      }
      
      console.log(`从user_profiles获取帖子作者信息，成功获取作者: ${author?.username || '未知'}`)
    } catch (error) {
      console.error('获取帖子作者信息失败:', error)
      // 继续执行，只是作者信息可能为空
    }

    // 异步更新阅读量（不影响响应）
    console.log(`🔍 API: 准备更新帖子 ${id} 的阅读量，当前值: ${post.views_count}`)
    supabaseAdmin
      .from('posts')
      .update({ 
        views_count: post.views_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .then(({ error, data }) => {
        if (error) {
          console.error('❌ API: 更新阅读量失败:', error)
        } else {
          console.log(`✅ API: 帖子 ${id} 阅读量已更新，从 ${post.views_count} 增加到 ${post.views_count + 1}`)
          console.log('📊 API: 更新结果:', data)
        }
      })

    // 格式化帖子数据，添加作者信息和更新后的阅读量
    const formattedPost = {
      ...post,
      views_count: (post.views_count || 0) + 1, // 返回更新后的阅读量
      author: author
    };

    sendResponse(res, true, { post: formattedPost });

  } catch (error) {
    console.error('Error in get post:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
}));

// Create new post
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { title, content, category, tags, images, image_url, video, thumbnail, user_id, media_files } = req.body;

    if (!title?.trim() || !content?.trim() || !user_id) {
      sendValidationError(res, '标题、内容和用户ID不能为空');
      return;
    }

    // Handle images array - use first image as image_url or use provided image_url
    let finalImageUrl = image_url;
    if (images && Array.isArray(images) && images.length > 0) {
      finalImageUrl = images[0];
    }

    const postData = {
      title: title.trim(),
      content: content.trim(),
      category: category || 'general',
      tags: tags || [],
      user_id,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert([postData])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating post:', error);
      sendResponse(res, false, null, '创建帖子失败', 500);
      return;
    }

    // Handle media_files if provided
    if (media_files && Array.isArray(media_files) && media_files.length > 0) {
      try {
        const mediaFilesData = media_files.map((file: any, index: number) => ({
          post_id: post.id,
          file_url: file.file_url || file.url,
          file_type: file.file_type || file.type,
          thumbnail_url: file.thumbnail_url || file.thumbnail,
          display_order: file.display_order !== undefined ? file.display_order : index,
          created_at: new Date().toISOString()
        }));

        const { error: mediaError } = await supabaseAdmin
          .from('media_files')
          .insert(mediaFilesData);

        if (mediaError) {
          console.error('Error creating media files:', mediaError);
          // Don't fail the entire request, just log the error
        }
      } catch (mediaError) {
        console.error('Error processing media files:', mediaError);
      }
    }

    // Fetch the complete post with media_files
    const { data: completePost } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        media_files(
          id,
          file_url,
          file_type,
          thumbnail_url,
          display_order
        )
      `)
      .eq('id', post.id)
      .single();

    // 清除相关缓存
    await invalidatePostCache(post.id);
    await invalidateContentCache();
    await invalidateUserCache(post.user_id); // 失效用户相关缓存

    sendResponse(res, true, { post: completePost || post }, '帖子创建成功', 201);

  } catch (error) {
    console.error('Error in create post:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
}));

// Update post
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, images, image_url, video, thumbnail, user_id } = req.body;

    if (!user_id) {
      sendValidationError(res, '用户ID不能为空');
      return;
    }

    // Check if post exists and user has permission
    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        sendNotFoundError(res, '帖子不存在');
      } else {
        console.error('Error fetching post:', fetchError);
        sendResponse(res, false, null, '获取帖子失败', 500);
      }
      return;
    }

    if (existingPost.user_id !== user_id) {
      sendUnauthorizedError(res, '无权限修改此帖子');
      return;
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    
    // Note: image_url, video, and thumbnail fields are no longer used
    // Media files are now handled through the media_files table

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating post:', error);
      sendResponse(res, false, null, '更新帖子失败', 500);
      return;
    }

    // 清除相关缓存
    await invalidatePostCache(id);
    await invalidateContentCache();
    await invalidateUserCache(post.user_id); // 失效用户相关缓存

    sendResponse(res, true, { post }, '帖子更新成功');

  } catch (error) {
    console.error('Error in update post:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
}));

// Delete post
router.delete('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // 从认证中间件获取用户ID

    if (!userId) {
      sendUnauthorizedError(res, '用户未认证');
      return;
    }

    // Check if post exists and user has permission
    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        sendNotFoundError(res, '帖子不存在');
      } else {
        console.error('Error fetching post:', fetchError);
        sendResponse(res, false, null, '获取帖子失败', 500);
      }
      return;
    }

    if (existingPost.user_id !== userId) {
      sendUnauthorizedError(res, '无权限删除此帖子');
      return;
    }

    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      sendResponse(res, false, null, '删除帖子失败', 500);
      return;
    }

    // 清除相关缓存
    await invalidatePostCache(id);
    await invalidateContentCache();
    await invalidateUserCache(existingPost.user_id); // 失效用户相关缓存

    sendResponse(res, true, null, '帖子删除成功');

  } catch (error) {
    console.error('Error in delete post:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
}));

// Update post status (admin only)
router.put('/:id/status', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id; // 从认证中间件获取用户ID

    if (!userId) {
      sendUnauthorizedError(res, '用户未认证');
      return;
    }

    if (!validatePostStatus(status)) {
      sendValidationError(res, '无效的帖子状态');
      return;
    }

    // TODO: Add admin permission check
    // For now, we'll allow the post owner to change status
    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        sendNotFoundError(res, '帖子不存在');
      } else {
        console.error('Error fetching post:', fetchError);
        sendResponse(res, false, null, '获取帖子失败', 500);
      }
      return;
    }

    if (existingPost.user_id !== userId) {
      sendUnauthorizedError(res, '无权限修改此帖子状态');
      return;
    }

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating post status:', error);
      sendResponse(res, false, null, '更新帖子状态失败', 500);
      return;
    }

    // 清除相关缓存
    await invalidatePostCache(id);
    await invalidateContentCache();
    await invalidateUserCache(existingPost.user_id); // 失效用户相关缓存

    sendResponse(res, true, { post }, '帖子状态更新成功');

  } catch (error) {
    console.error('Error in update post status:', error);
    sendResponse(res, false, null, '服务器内部错误', 500);
  }
}));

export default router;