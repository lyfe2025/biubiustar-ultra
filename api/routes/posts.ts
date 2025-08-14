import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/posts - 获取帖子列表
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 10, 
      offset = 0, 
      category, 
      status = 'published',
      user_id 
    } = req.query;

    let query = supabase
      .from('posts')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    // 按分类筛选
    if (category) {
      query = query.eq('category', category);
    }

    // 按用户筛选
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    // 分页
    query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in GET /posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/posts/popular - 获取热门帖子
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('likes_count', { ascending: false })
      .order('views_count', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      console.error('Error fetching popular posts:', error);
      return res.status(500).json({ error: 'Failed to fetch popular posts' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in GET /posts/popular:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/posts/:id - 获取单个帖子
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Post not found' });
      }
      console.error('Error fetching post:', error);
      return res.status(500).json({ error: 'Failed to fetch post' });
    }

    // 增加浏览量
    await supabase
      .from('posts')
      .update({ views_count: data.views_count + 1 })
      .eq('id', id);

    res.json({ ...data, views_count: data.views_count + 1 });
  } catch (error) {
    console.error('Error in GET /posts/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/posts/:id/comments - 获取帖子评论
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: '帖子ID不能为空' });
    }

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取评论失败:', error);
      return res.status(500).json({ error: '获取评论失败' });
    }

    // 获取所有评论作者信息
    const userIds = [...new Set(comments?.map(comment => comment.user_id) || [])];
    const { data: users } = await supabase.auth.admin.listUsers();
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

    res.json(formattedComments);

  } catch (error) {
    console.error('获取评论错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// POST /api/posts - 创建帖子
router.post('/', async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      image_url,
      category,
      tags,
      user_id,
      status = 'pending'
    } = req.body;

    // 输入验证
    if (!title || !content || !user_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, content, user_id' 
      });
    }

    const postData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      image_url,
      category: category || 'general',
      tags: tags || [],
      user_id,
      status,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      views_count: 0
    };

    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ error: 'Failed to create post' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in POST /posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/posts/:id - 更新帖子
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 移除不应该被更新的字段
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.likes_count;
    delete updateData.comments_count;
    delete updateData.shares_count;
    delete updateData.views_count;

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Post not found' });
      }
      console.error('Error updating post:', error);
      return res.status(500).json({ error: 'Failed to update post' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in PUT /posts/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/posts/:id - 删除帖子
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      return res.status(500).json({ error: 'Failed to delete post' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /posts/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/posts/:id/like - 点赞帖子
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    // 检查是否已经点赞
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user_id)
      .single();

    if (existingLike) {
      return res.status(400).json({ error: 'Post already liked' });
    }

    // 添加点赞记录
    const { error: likeError } = await supabase
      .from('likes')
      .insert([{ post_id: id, user_id }]);

    if (likeError) {
      console.error('Error liking post:', likeError);
      return res.status(500).json({ error: 'Failed to like post' });
    }

    // 更新帖子点赞数
    const { data: post } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', id)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ likes_count: post.likes_count + 1 })
        .eq('id', id);
    }

    res.status(201).json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error in POST /posts/:id/like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/posts/:id/like - 取消点赞
router.delete('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    // 删除点赞记录
    const { error: unlikeError } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', id)
      .eq('user_id', user_id);

    if (unlikeError) {
      console.error('Error unliking post:', unlikeError);
      return res.status(500).json({ error: 'Failed to unlike post' });
    }

    // 更新帖子点赞数
    const { data: post } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', id)
      .single();

    if (post && post.likes_count > 0) {
      await supabase
        .from('posts')
        .update({ likes_count: post.likes_count - 1 })
        .eq('id', id);
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /posts/:id/like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/posts/:id/likes/count - 获取帖子点赞数量
router.get('/:id/likes/count', async (req, res) => {
  try {
    const { id } = req.params;

    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', id);

    if (error) {
      console.error('Error fetching likes count:', error);
      return res.status(500).json({ error: 'Failed to fetch likes count' });
    }

    res.json({ count: count || 0 });
  } catch (error) {
    console.error('Error in GET /posts/:id/likes/count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/posts/:id/likes/:userId - 检查用户是否已点赞
router.get('/:id/likes/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', userId)
      .single();

    // 如果找到点赞记录，返回200；否则返回404
    if (existingLike) {
      res.status(200).json({ liked: true });
    } else {
      res.status(404).json({ liked: false });
    }
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/posts/:id/share - 分享帖子
router.post('/:id/share', async (req, res) => {
  try {
    const { id } = req.params;

    // 更新分享数
    const { data: post } = await supabase
      .from('posts')
      .select('shares_count')
      .eq('id', id)
      .single();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const { error } = await supabase
      .from('posts')
      .update({ shares_count: post.shares_count + 1 })
      .eq('id', id);

    if (error) {
      console.error('Error updating share count:', error);
      return res.status(500).json({ error: 'Failed to update share count' });
    }

    res.json({ message: 'Post shared successfully' });
  } catch (error) {
    console.error('Error in POST /posts/:id/share:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/posts/:id/status - 更新帖子状态（管理员审核）
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 验证状态值
    if (!['pending', 'approved', 'rejected', 'draft'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // 更新帖子状态
    const { data, error } = await supabase
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
      return res.status(500).json({ error: 'Failed to update post status' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in PUT /posts/:id/status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;