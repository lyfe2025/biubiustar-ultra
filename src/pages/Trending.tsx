import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useLanguage } from '../contexts/language'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/utils'
import { socialService } from '../lib/socialService'
import type { Post } from '../types'
import PostCard from '../components/PostCard'
import CommentModal from '../components/CommentModal'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Trending() {
  const { t } = useLanguage()
  const { user } = useAuth()
  usePageTitle(t('trending.title'))
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [selectedPostTitle, setSelectedPostTitle] = useState('')
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)

  useEffect(() => {
    console.log('=== Trending页面已加载，开始调用API ===');
    loadTrendingPosts();
    
    // 3秒后强制再次调用
    const timer = setTimeout(() => {
      console.log('=== 3秒后强制调用API ===');
      loadTrendingPosts();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const loadTrendingPosts = async () => {
    setIsLoading(true)
    try {
      console.log('开始加载热门帖子...')
      const trendingData = await socialService.getTrendingPosts(20)
      console.log('热门帖子数据:', trendingData)
      console.log('数据类型:', typeof trendingData, '是否为数组:', Array.isArray(trendingData))
      console.log('数据长度:', trendingData?.length)
      setPosts(trendingData)
    } catch (error) {
      console.error('加载热门帖子失败:', error)
      setPosts([])
    } finally {
      setIsLoading(false)
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

  const handleLike = async (postId: string) => {
    if (!user) {
      console.error('用户未登录，无法点赞')
      return
    }
    
    try {
      await socialService.likePost(postId, user.id)
      // 重新加载帖子数据以更新点赞状态
      await loadTrendingPosts()
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

  const categories = [
    { id: 'all', label: t('trending.all') },
    { id: 'culture', label: t('trending.culture') },
    { id: 'tech', label: t('trending.tech') },
    { id: 'food', label: t('trending.food') }
  ]

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (post.category && post.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pt-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
              {t('trending.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('trending.subtitle')}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('trending.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Debug Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => {
                console.log('强制刷新热门帖子...')
                loadTrendingPosts()
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              强制刷新数据
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'flex items-center px-6 py-3 rounded-xl transition-all duration-200',
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-purple-200'
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onComment={() => handleComment(post.id)}
                onLike={() => handleLike(post.id)}
                onShare={() => handleShare(post.id)}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">{t('trending.noContent')}</h3>
            <p className="text-gray-500">{t('trending.adjustSearch')}</p>
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
        />
      )}
    </div>
  );
}