import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { useLanguage } from '../contexts/language'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/utils'
import { socialService } from '../lib/socialService'
import { batchStatusService } from '../services/batchStatusService'
import { apiCache } from '../services/apiCache'
import type { Post } from '../types'
import PostCard from '../components/PostCard'
import CommentModal from '../components/CommentModal'
import { usePageTitle } from '../hooks/usePageTitle'
import { headingStyles } from '../utils/cn'
import { usePaginatedData, useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { LoadingSpinner, CardSkeleton } from '../components/LoadingSpinner'
import LoadingIndicator from '../components/LoadingIndicator'
import ErrorMessage from '../components/ErrorMessage'
import { toast } from 'sonner'

// 内容分类接口
interface ContentCategory {
  id: string
  name: string
  name_zh: string
  name_zh_tw: string
  name_en: string
  name_vi: string
  description?: string
  color?: string
  icon?: string
}

function TrendingContent() {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  usePageTitle(t('trending.title'))
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<ContentCategory[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [selectedPostTitle, setSelectedPostTitle] = useState('')
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [postStatusMap, setPostStatusMap] = useState<Map<string, {
    commentsCount: number;
    likesCount: number;
    isLiked: boolean;
  }>>(new Map())
  
  // 使用分页数据获取
  const {
    data: posts,
    loading: isLoading,
    error,
    hasMore,
    loadNextPage: loadMore,
    reset
  } = usePaginatedData({
    onFetchPage: async (page, limit) => {
       const result = await socialService.getTrendingPostsPaginated(
         page, 
         limit, 
         selectedCategory === 'all' ? undefined : selectedCategory,
         searchTerm || undefined
       )
       return result.posts
     }
  })
  
  // 无限滚动设置
  const { targetRef: loadMoreRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    enabled: hasMore && !isLoading
  })

  // 根据当前语言获取分类名称
  const getCategoryName = (category: ContentCategory): string => {
    switch (language) {
      case 'zh':
        return category.name_zh || category.name
      case 'zh-TW':
        return category.name_zh_tw || category.name_zh || category.name
      case 'en':
        return category.name_en || category.name
      case 'vi':
        return category.name_vi || category.name
      default:
        return category.name_zh || category.name
    }
  }

  // 加载分类数据
  const loadCategories = async () => {
    try {
      console.log(`正在加载分类数据，当前语言: ${language}`)
      const categoriesData = await socialService.getContentCategories(language)
      console.log('加载到的分类数据:', categoriesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('加载分类失败:', error)
      setCategories([])
    }
  }

  // 组件挂载和语言变化时加载分类（合并到一个useEffect中避免重复调用）
  useEffect(() => {
    loadCategories();
  }, [language]); // 只依赖language，组件挂载时language已经有初始值
  
  // 当筛选条件改变时重置数据
  useEffect(() => {
    reset();
  }, [selectedCategory, searchTerm]); // 移除reset依赖，避免无限循环

  const loadPostsStatus = async (postsData: Post[]) => {
    if (!user) return
    
    try {
      const postIds = postsData.map(post => post.id)
      const [commentsCountMap, likesCountMap, likedStatusMap] = await Promise.all([
        batchStatusService.batchGetCommentsCount(postIds),
        batchStatusService.batchGetLikesCount(postIds),
        batchStatusService.batchCheckLikedStatus(postIds, user.id)
      ])
      
      const statusMap = new Map<string, {
        commentsCount: number;
        likesCount: number;
        isLiked: boolean;
      }>()
      
      postIds.forEach(postId => {
        statusMap.set(postId, {
          commentsCount: commentsCountMap[postId] || 0,
          likesCount: likesCountMap[postId] || 0,
          isLiked: likedStatusMap[postId] || false
        })
      })
      
      setPostStatusMap(statusMap)
    } catch (error) {
      console.error('批量获取帖子状态失败:', error)
    }
  }

  const handleComment = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      setSelectedPostId(postId)
      setSelectedPostTitle(post.title)
      setIsCommentModalOpen(true)
    }
  }

  // 处理评论成功后的状态更新
  const handleCommentSuccess = async (postId: string) => {
    try {
      // 清除相关缓存，确保数据一致性
      // 清除批量评论数缓存
      batchStatusService.clearPostBatchCache(postId)
      
      // 清除apiCache中的评论数缓存
      apiCache.invalidatePattern(`post_comments_count:*:${postId}:*`)
      
      // 更新对应帖子的评论数
      const newCommentsCount = await socialService.getPostCommentsCount(postId)
      setPostStatusMap(prev => {
        const newMap = new Map(prev)
        const currentStatus = newMap.get(postId)
        if (currentStatus) {
          newMap.set(postId, {
            ...currentStatus,
            commentsCount: newCommentsCount
          })
        }
        return newMap
      })
      
      console.log(`✅ 帖子 ${postId} 评论数已更新为: ${newCommentsCount}`)
    } catch (error) {
      console.error('更新评论数失败:', error)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) {
      console.error('用户未登录，无法点赞')
      return
    }
    
    try {
      // 检查当前点赞状态
      const isLiked = await socialService.isPostLiked(postId, user.id)
      
      if (isLiked) {
        await socialService.unlikePost(postId, user.id)
      } else {
        await socialService.likePost(postId, user.id)
      }
      
      // 重新加载帖子数据以更新点赞状态
      reset()
    } catch (error) {
      console.error('点赞失败:', error)
    }
  }

  const handleShare = async (postId: string) => {
    try {
      await socialService.sharePost(postId)
    } catch (error) {
      console.error('分享失败:', error)
    }
  }

  // 构建分类选项（包含"全部"选项）
  const categoryOptions = [
    { id: 'all', label: t('trending.categories.all') },
    ...categories.map(category => ({
      id: category.id,
      label: getCategoryName(category)
    }))
  ]

  // 筛选现在在API层面处理，直接使用posts数据
  const filteredPosts = posts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 text-white overflow-hidden min-h-[50vh] flex items-center justify-center pt-16">
        {/* 动态背景效果 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-purple-800/90"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {t('trending.title')}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-purple-100 max-w-4xl mx-auto leading-relaxed">
              {t('trending.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-4 md:p-8 mb-8 md:mb-12 transform hover:scale-[1.02] transition-all duration-500">
          {/* 搜索栏 */}
          <div className="mb-8">
            <div className="text-center mb-4 md:mb-6">
              <h3 className={headingStyles.h3}>
                {t('trending.searchTitle')}
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto"></div>
            </div>
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 transition-all duration-300 group-focus-within:text-purple-600 group-hover:text-purple-500">
                <Search className="text-purple-400 w-6 h-6 drop-shadow-sm" />
              </div>
              <input
                type="text"
                placeholder={t('trending.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 border-2 border-purple-200/60 rounded-2xl 
                          focus:ring-4 focus:ring-purple-500/25 focus:border-purple-500 focus:shadow-xl focus:shadow-purple-500/10
                          hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5
                          transition-all duration-300 ease-in-out
                          bg-white/90 backdrop-blur-md 
                          text-lg placeholder-purple-300/80 
                          transform hover:scale-[1.02] focus:scale-[1.02]
                          outline-none"
              />
            </div>
          </div>

          {/* 分类筛选 */}
          <div>
            <div className="text-center mb-4 md:mb-6">
              <h3 className={headingStyles.h3}>
                {t('trending.filterByCategory')}
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto"></div>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
              {categoryOptions.map((category, index) => (
                <button
                  key={`category-${category.id}-${index}`}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'group relative px-3 md:px-6 py-2 md:py-3 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-sm md:text-base',
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-xl shadow-purple-500/25'
                      : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-700 hover:border-purple-300 hover:shadow-lg'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="relative z-10 font-medium">
                    {category.label}
                  </span>
                  {selectedCategory !== category.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/10 group-hover:to-purple-600/10 rounded-2xl transition-all duration-300"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-16 md:py-24">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 md:h-16 w-12 md:w-16 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-12 md:h-16 w-12 md:w-16 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-600 font-medium">{t('trending.loading')}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="relative inline-block">
              <div className="text-6xl md:text-8xl mb-4 md:mb-6 animate-bounce">📝</div>
              <div className="absolute -top-2 -right-2 w-4 md:w-6 h-4 md:h-6 bg-purple-500 rounded-full animate-ping"></div>
            </div>
            <h3 className={headingStyles.h3}>{t('trending.noPosts')}</h3>
            <p className="text-base md:text-lg text-gray-500 mb-6 md:mb-8 max-w-md mx-auto">{t('trending.noPostsDescription')}</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-medium hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              {t('trending.resetFilters')}
            </button>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center">
              <h2 className={headingStyles.h2}>
                {t('trending.foundPosts').replace('{count}', filteredPosts.length.toString())}
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
              {filteredPosts.map((post, index) => (
                <div 
                  key={`post-${post.id}-${index}`} 
                  className="transform hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <PostCard
                    post={post}
                    onLike={() => handleLike(post.id)}
                    onComment={() => handleComment(post.id)}
                    onShare={() => handleShare(post.id)}
                    initialCommentsCount={postStatusMap.get(post.id)?.commentsCount}
                      initialLikesCount={postStatusMap.get(post.id)?.likesCount}
                      initialIsLiked={postStatusMap.get(post.id)?.isLiked}
                  />
                </div>
              ))}
            </div>
            
            {/* 加载更多区域 */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex flex-col items-center py-8">
                {isLoading ? (
                  <LoadingIndicator 
                    size="lg" 
                    color="blue" 
                    text="加载更多帖子..." 
                    className="py-4"
                  />
                ) : (
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-medium hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    加载更多
                  </button>
                )}
              </div>
            )}
            
            {/* 错误处理 */}
            {error && (
              <div className="py-8">
                <ErrorMessage
                  title="加载失败"
                  message="获取帖子数据时出现错误，请稍后重试。"
                  error={error}
                  onRetry={reset}
                  variant="compact"
                  className="max-w-md mx-auto"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {selectedPostId && (
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          postId={selectedPostId}
          postTitle={selectedPostTitle}
          onCommentSuccess={handleCommentSuccess}
        />
      )}
    </div>
  );
}

// 用ErrorBoundary包装的默认导出
export default function Trending() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Trending page error:', error, errorInfo);
        toast.error('页面加载出现问题，请刷新重试');
      }}
    >
      <TrendingContent />
    </ErrorBoundary>
  );
}