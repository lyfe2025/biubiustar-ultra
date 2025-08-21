import { supabaseAdmin } from '../lib/supabase.js';
import { statsCache } from '../lib/cacheInstances.js';

// 统计数据接口定义
export interface StatsData {
  userStats: {
    totalUsers: number
    newUsersToday: number
  }
  postStats: {
    totalPosts: number
    pendingPosts: number
    totalViews: number
  }
  activityStats: {
    totalActivities: number
    activeActivities: number
    completedActivities: number
  }
  participationStats: {
    totalParticipants: number
  }
  likeStats: {
    totalLikes: number
  }
  commentStats: {
    totalComments: number
  }
}

// 缓存键常量
const STATS_CACHE_KEY = 'system:stats:all';
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

/**
 * 获取缓存的统计数据
 */
export const getCachedStats = async (): Promise<StatsData> => {
  try {
    // 尝试从增强版缓存获取数据
    const cachedData = await statsCache.get<StatsData>(STATS_CACHE_KEY);
    
    if (cachedData) {
      console.log('使用缓存的统计数据');
      return cachedData;
    }
    
    // 缓存未命中，重新获取数据
    console.log('缓存失效，重新获取统计数据...');
    const statsData = await fetchStatsFromDatabase();
    
    // 存储到增强版缓存
    statsCache.set(STATS_CACHE_KEY, statsData, CACHE_TTL);
    
    console.log(`统计数据已缓存，缓存有效期${CACHE_TTL/1000}秒`);
    return statsData;
  } catch (error) {
    console.error('获取缓存统计数据失败:', error);
    // 缓存失败时直接从数据库获取
    return await fetchStatsFromDatabase();
  }
}

/**
 * 清除统计数据缓存
 */
export const clearStatsCache = () => {
  try {
    statsCache.delete(STATS_CACHE_KEY);
    console.log('统计数据缓存已清除');
  } catch (error) {
    console.error('清除统计数据缓存失败:', error);
  }
}

/**
 * 获取统计缓存状态
 */
export const getStatsCacheInfo = () => {
  try {
    const stats = statsCache.getStats();
    return {
      hasCache: statsCache.get(STATS_CACHE_KEY) !== null,
      cacheStats: stats,
      cacheKey: STATS_CACHE_KEY,
      ttl: CACHE_TTL
    };
  } catch (error) {
    console.error('获取统计缓存信息失败:', error);
    return null;
  }
}

/**
 * 从数据库获取统计数据（优化后的聚合查询）
 */
async function fetchStatsFromDatabase(): Promise<StatsData> {
  try {
    // 使用并行查询优化性能
    const [userStatsResult, postStatsResult, activityStatsResult, participationResult, likeResult, commentResult] = await Promise.all([
      // 用户统计
      getUserStats(),
      // 帖子统计
      getPostStats(),
      // 活动统计
      getActivityStats(),
      // 参与统计
      getParticipationStats(),
      // 点赞统计
      getLikeStats(),
      // 评论统计
      getCommentStats()
    ])

    return {
      userStats: userStatsResult,
      postStats: postStatsResult,
      activityStats: activityStatsResult,
      participationStats: participationResult,
      likeStats: likeResult,
      commentStats: commentResult
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    throw error
  }
}

/**
 * 获取用户统计（优化版：使用数据库聚合查询）
 */
async function getUserStats() {
  const today = new Date().toISOString().split('T')[0]
  
  // 并行获取总用户数和今日新增用户数
  const [totalUsersResult, newUsersTodayResult] = await Promise.all([
    // 获取总用户数
    supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true }),
    // 获取今日新增用户数
    supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today)
      .lt('created_at', `${today}T23:59:59.999Z`)
  ])
  
  if (totalUsersResult.error) {
    console.error('获取总用户数失败:', totalUsersResult.error)
    throw totalUsersResult.error
  }
  
  if (newUsersTodayResult.error) {
    console.error('获取今日新增用户数失败:', newUsersTodayResult.error)
    throw newUsersTodayResult.error
  }
  
  return {
    totalUsers: totalUsersResult.count || 0,
    newUsersToday: newUsersTodayResult.count || 0
  }
}

/**
 * 获取帖子统计（优化版：使用数据库聚合查询）
 */
async function getPostStats() {
  // 并行获取帖子统计数据
  const [totalPostsResult, pendingPostsResult, viewsResult] = await Promise.all([
    // 获取总帖子数
    supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true }),
    // 获取待审核帖子数
    supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    // 获取所有帖子的浏览量数据
    supabaseAdmin
      .from('posts')
      .select('views')
      .not('views', 'is', null)
  ])
  
  if (totalPostsResult.error) {
    console.error('获取总帖子数失败:', totalPostsResult.error)
    throw totalPostsResult.error
  }
  
  if (pendingPostsResult.error) {
    console.error('获取待审核帖子数失败:', pendingPostsResult.error)
    throw pendingPostsResult.error
  }
  
  if (viewsResult.error) {
    console.error('获取总浏览量失败:', viewsResult.error)
    // 浏览量获取失败时使用0，不影响其他统计
    console.warn('浏览量统计失败，使用默认值0')
  }
  
  // 在应用层计算总浏览量
  let totalViews = 0
  if (viewsResult.data && Array.isArray(viewsResult.data)) {
    totalViews = viewsResult.data.reduce((sum, post) => {
      const views = post.views || 0
      return sum + (typeof views === 'number' ? views : 0)
    }, 0)
  }
  
  return {
    totalPosts: totalPostsResult.count || 0,
    pendingPosts: pendingPostsResult.count || 0,
    totalViews
  }
}

/**
 * 获取活动统计（优化版：使用数据库查询过滤）
 */
async function getActivityStats() {
  const now = new Date().toISOString()
  
  // 并行获取活动统计数据
  const [totalActivitiesResult, activeActivitiesResult, completedActivitiesResult] = await Promise.all([
    // 获取总活动数
    supabaseAdmin
      .from('activities')
      .select('*', { count: 'exact', head: true }),
    // 获取进行中活动数
    supabaseAdmin
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .lte('start_date', now)
      .gte('end_date', now),
    // 获取已完成活动数
    supabaseAdmin
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .lt('end_date', now)
  ])
  
  if (totalActivitiesResult.error) {
    console.error('获取总活动数失败:', totalActivitiesResult.error)
    throw totalActivitiesResult.error
  }
  
  if (activeActivitiesResult.error) {
    console.error('获取进行中活动数失败:', activeActivitiesResult.error)
    throw activeActivitiesResult.error
  }
  
  if (completedActivitiesResult.error) {
    console.error('获取已完成活动数失败:', completedActivitiesResult.error)
    throw completedActivitiesResult.error
  }
  
  return {
    totalActivities: totalActivitiesResult.count || 0,
    activeActivities: activeActivitiesResult.count || 0,
    completedActivities: completedActivitiesResult.count || 0
  }
}

/**
 * 获取参与统计
 */
async function getParticipationStats() {
  const { count, error } = await supabaseAdmin
    .from('activity_participants')
    .select('*', { count: 'exact', head: true })
  
  if (error) {
    console.error('获取参与统计失败:', error)
    throw error
  }
  
  return { totalParticipants: count || 0 }
}

/**
 * 获取点赞统计
 */
async function getLikeStats() {
  const { count, error } = await supabaseAdmin
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
  
  if (error) {
    console.error('获取点赞统计失败:', error)
    throw error
  }
  
  return { totalLikes: count || 0 }
}

/**
 * 获取评论统计
 */
async function getCommentStats() {
  const { count, error } = await supabaseAdmin
    .from('comments')
    .select('*', { count: 'exact', head: true })
  
  if (error) {
    console.error('获取评论统计失败:', error)
    throw error
  }
  
  return { totalComments: count || 0 }
}