import { useState, useEffect } from 'react'
import { Plus, Calendar, Users, ArrowRight, TrendingUp, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/language'

import { socialService } from '../lib/socialService'
import { batchStatusService } from '../services/batchStatusService'
import type { Post } from '../types'
import { ActivityService, Activity as ActivityType } from '../lib/activityService'
import PostCard from '../components/PostCard'
import CommentModal from '../components/CommentModal'
import CreatePostModal from '../components/CreatePostModal'
import AuthModal from '../components/AuthModal'
import { ActivityCard } from '../components/ActivityCard'
import { usePageTitle } from '../hooks/usePageTitle'
import { useSiteInfo, useLocalizedSiteDescription } from '../hooks/useSettings'
import { useMetaDescription, useSocialMetaTags } from '../hooks/useMetaDescription'
import { useHomePageData } from '../hooks/useOptimizedData'

const Home = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { siteName } = useSiteInfo()
  const { localizedDescription } = useLocalizedSiteDescription()

  
  usePageTitle(t('home.title'))
  useMetaDescription(localizedDescription)
  useSocialMetaTags(
    siteName || 'BiuBiuStar',
    localizedDescription,
    '/images/big-logo.png' // 添加站点Logo作为分享图片
  )
  // 使用优化的数据获取Hook
  const { 
    posts, 
    activities, 
    isLoading, 
    isActivitiesLoading, 
    error,
    refetch 
  } = useHomePageData()
  
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [selectedPostTitle, setSelectedPostTitle] = useState('')
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  
  // 批量状态数据
  const [postStatusMap, setPostStatusMap] = useState<{
    commentsCount: Record<string, number>;
    likesCount: Record<string, number>;
    isLiked: Record<string, boolean>;
  }>({ commentsCount: {}, likesCount: {}, isLiked: {} })
  
  const [activityStatusMap, setActivityStatusMap] = useState<{
    isParticipating: Record<string, boolean>;
    participantCount: Record<string, number>;
  }>({ isParticipating: {}, participantCount: {} })

  const handleComment = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      setSelectedPostId(postId)
      setSelectedPostTitle(post.title)
      setIsCommentModalOpen(true)
    }
  }

  // 批量加载帖子状态
  const loadPostsStatus = async (posts: any[]) => {
    try {
      const postIds = posts.map(post => post.id)
      
      // 批量获取评论数量
      const commentsCountMap = await batchStatusService.batchGetCommentsCount(postIds)
      
      // 批量获取点赞数量和状态（如果用户已登录）
      let likesCountMap: Record<string, number> = {}
      let isLikedMap: Record<string, boolean> = {}
      
      // 批量获取点赞数量
      likesCountMap = await batchStatusService.batchGetLikesCount(postIds)
      
      if (user) {
        // 批量获取点赞状态
        isLikedMap = await batchStatusService.batchCheckLikeStatus(postIds, user.id)
      }
      
      setPostStatusMap({
        commentsCount: commentsCountMap,
        likesCount: likesCountMap,
        isLiked: isLikedMap
      })
    } catch (error) {
      console.error('Failed to load posts status:', error)
      // 静默失败，组件会降级到单独获取数据
    }
  }
  
  // 批量加载活动状态
  const loadActivitiesStatus = async (activities: any[]) => {
    if (!user) return
    
    try {
      const activityIds = activities.map(activity => activity.id)
      
      // 批量获取用户参与状态
      const participationMap = await batchStatusService.batchGetUserParticipationStatus(activityIds, user.id)
      
      // 批量获取参与人数
      const participantCountMap = await batchStatusService.batchGetParticipantCount(activityIds)
      
      setActivityStatusMap({
        isParticipating: Object.fromEntries(participationMap.entries()),
        participantCount: Object.fromEntries(participantCountMap.entries())
      })
    } catch (error) {
      console.error('Failed to load activities status:', error)
      // 静默失败，组件会降级到单独获取数据
    }
  }

  // 当数据加载完成后，批量获取状态信息
  useEffect(() => {
    if (posts && posts.length > 0) {
      loadPostsStatus(posts)
    }
  }, [posts, user])
  
  useEffect(() => {
    if (activities && activities.length > 0 && user) {
      loadActivitiesStatus(activities)
    }
  }, [activities, user])

  const handlePostCreated = () => {
    refetch() // 重新加载所有数据
  }





  // 调试信息（仅在开发环境中显示）
  if (process.env.NODE_ENV === 'development') {
    console.log('Home component data (optimized):', {
      postsCount: posts?.length,
      activitiesCount: activities?.length,
      isLoading,
      isActivitiesLoading,
      error: error ? 'Error occurred' : 'No error'
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* 开发调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 bg-black/80 text-white text-xs p-2 z-50">
          Posts: {posts?.length || 0} | Activities: {activities?.length || 0} | Loading: {isLoading ? 'Yes' : 'No'}
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* 背景图片 */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/hero-background-modern.svg')`,
          }}
        />
        
        {/* 背景遮罩层 - 更柔和的遮罩 */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
        
        {/* 动态光效 - 与科技感背景协调 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/6 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-56 h-56 bg-blue-500/4 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        {/* 粒子效果 - 减少数量和亮度 */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        {/* 主要内容 - 左右分栏布局 */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen py-20">
            {/* 左侧文字内容 */}
            <div className="text-left space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg leading-tight">
                {t('home.welcome')}
              </h1>
              <p className="text-lg md:text-xl text-white/85 drop-shadow-md max-w-lg">
                {localizedDescription || t('home.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/trending"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500/90 to-purple-600/90 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-purple-500/20 hover:scale-105 backdrop-blur-sm border border-white/15 w-full sm:w-auto"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {t('home.exploreContent')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  to="/activities"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/15 backdrop-blur-md text-white rounded-xl hover:bg-white/25 transition-all duration-300 shadow-xl hover:shadow-white/15 hover:scale-105 border border-white/20 w-full sm:w-auto"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  {t('home.viewActivities')}
                </Link>
              </div>
            </div>
            
            {/* 右侧装饰区域 - 让背景图片的钻石元素显示 */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-96 h-96">
                {/* 中心装饰 - 几乎移除发光效果 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    {/* Logo发光背景 - 更大范围的柔和发光效果 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* 内层柔和发光 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-400/20 rounded-full blur-lg animate-gentle-glow" style={{animationDuration: '4s'}}></div>
                      {/* 中层呼吸光晕 */}
                      <div className="absolute inset-2 bg-gradient-to-br from-purple-400/15 to-purple-300/15 rounded-full blur-md animate-breathing-glow" style={{animationDuration: '5s'}}></div>
                      {/* 外层涟漪扩散 */}
                      <div className="absolute inset-4 bg-gradient-to-br from-purple-300/10 to-purple-200/10 rounded-full blur-sm animate-ripple-glow" style={{animationDuration: '6s'}}></div>
                    </div>
                    
                    {/* Logo直接显示 - 使用指定的PNG logo */}
                    <div className="relative w-full h-full flex items-center justify-center p-6 z-10">
                      <img 
                        src="/images/big-logo.png" 
                        alt="Big Logo" 
                        className="w-full h-full object-contain opacity-90 drop-shadow-md" 
                      />
                    </div>
                    
                    {/* 外发光效果 - 更大范围的多层柔和光晕 */}
                    <div className="absolute -inset-8 bg-gradient-to-br from-purple-600/15 to-purple-500/15 rounded-full blur-xl animate-gentle-glow" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
                    <div className="absolute -inset-14 bg-gradient-to-br from-purple-500/10 to-purple-400/10 rounded-full blur-2xl animate-breathing-glow" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
                    <div className="absolute -inset-20 bg-gradient-to-br from-purple-400/8 to-purple-300/8 rounded-full blur-3xl animate-ripple-glow" style={{animationDuration: '6s', animationDelay: '3s'}}></div>
                    <div className="absolute -inset-26 bg-gradient-to-br from-purple-300/6 to-purple-200/6 rounded-full blur-3xl animate-gentle-glow" style={{animationDuration: '4s', animationDelay: '4s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 滚动指示器 - 降低亮度 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/40 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div className="text-center flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.featuredPosts')}</h2>
              <p className="text-gray-600">{t('home.featuredDescription')}</p>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <button
                  onClick={() => setIsCreatePostModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('home.publish')}</span>
                </button>
              )}
              <Link 
                to="/trending" 
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
              >
                <span>{t('home.viewMore')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{t('home.noContent')}</p>
              {user && (
                <button
                  onClick={() => setIsCreatePostModalOpen(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {t('home.createFirstPost')}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onComment={handleComment}
                  initialCommentsCount={postStatusMap.commentsCount[post.id]}
                  initialLikesCount={postStatusMap.likesCount[post.id]}
                  initialIsLiked={postStatusMap.isLiked[post.id]}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Activities */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.upcomingActivities')}</h2>
            <p className="text-gray-600">{t('home.activitiesDescription')}</p>
          </div>
          
          {isActivitiesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{t('home.noUpcomingActivities')}</p>
              <Link
                to="/activities"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {t('home.browseAllActivities')}
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  simplified={true}
                  initialIsParticipating={activityStatusMap.isParticipating[activity.id]}
                  initialParticipantCount={activityStatusMap.participantCount[activity.id]}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Community Invitation */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
            <Star className="w-12 h-12 mx-auto mb-6 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-4">{t('home.joinCommunity')}</h2>
            <p className="text-xl mb-8 text-purple-100">
              {t('home.communityDescription')}
            </p>
            {!user ? (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {t('home.registerNow')}
              </button>
            ) : (
              <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {t('home.shareStory')}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 模态框 */}
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        postId={selectedPostId || ''}
        postTitle={selectedPostTitle}
      />
      
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="register"
      />
    </div>
  );
}

export default Home;