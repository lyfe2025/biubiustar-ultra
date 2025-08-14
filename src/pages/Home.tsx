import { useState, useEffect } from 'react'
import { Plus, Calendar, Users, ArrowRight, TrendingUp, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/language'
import { allTranslations } from '../contexts/language/translationLoader'
import { socialService } from '../lib/socialService'
import type { Post } from '../types'
import { ActivityService, Activity as ActivityType } from '../lib/activityService'
import PostCard from '../components/PostCard'
import CommentModal from '../components/CommentModal'
import CreatePostModal from '../components/CreatePostModal'
import AuthModal from '../components/AuthModal'
import { usePageTitle } from '../hooks/usePageTitle'

const Home = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  

  
  usePageTitle(t('home.title'))
  const [posts, setPosts] = useState<Post[]>([])
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [selectedPostTitle, setSelectedPostTitle] = useState('')
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)



  useEffect(() => {
    loadPosts()
    loadActivities()
  }, [])

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await socialService.getPosts(1, 3); // 只获取前3个帖子
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      setIsActivitiesLoading(true);
      const data = await ActivityService.getUpcomingActivities(2); // 获取前2个即将到来的活动
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  const handleComment = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      setSelectedPostId(postId)
      setSelectedPostTitle(post.title)
      setIsCommentModalOpen(true)
    }
  }

  const handlePostCreated = () => {
    loadPosts() // 重新加载帖子列表
  }





  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-purple-800/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-6">
              {t('home.welcome')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/trending"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                {t('home.exploreContent')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/activities"
                className="inline-flex items-center px-8 py-3 bg-white/80 backdrop-blur-sm text-purple-600 rounded-lg hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl border border-purple-200"
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t('home.viewActivities')}
              </Link>
            </div>
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
                <div key={activity.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-purple-100">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={activity.image_url || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=community%20activity%20event&image_size=landscape_4_3'}
                      alt={activity.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(activity.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{activity.current_participants} {t('home.participants')}</span>
                      </div>
                      <Link
                        to="/activities"
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm"
                      >
                        {t('home.learnMore')}
                      </Link>
                    </div>
                  </div>
                </div>
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