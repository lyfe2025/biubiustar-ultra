import React, { useState, useEffect } from 'react';
import { User, FileText, Users, Settings, Bell, Plus, Heart, MessageCircle, Edit3, Trash2, Calendar, MapPin, Camera, LogOut, Award, TrendingUp, Edit, Shield, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { socialService } from '../lib/socialService';
import type { Post } from '../types';
import { ActivityService, Activity } from '../lib/activityService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import CreatePostModal from '../components/CreatePostModal';
import { usePageTitle } from '../hooks/usePageTitle';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likes: number;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  usePageTitle(t('profile.title'));
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'social' | 'settings' | 'notifications'>('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    likes: 0
  });
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userActivities, setUserActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: false,
    sms: true
  });
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: ''
  });

  // 加载用户数据
  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // 获取用户资料
      const profile = await socialService.getUserProfile(user.id);
      setUserProfile(profile);
      
      if (profile) {
        setEditForm({
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          location: profile.location || '',
          website: profile.website || ''
        });
      } else {
        console.warn('用户资料为空，可能需要创建用户资料');
        setEditForm({
          full_name: '',
          bio: '',
          location: '',
          website: ''
        });
      }
      
      // 获取用户统计
       const stats = await socialService.getUserStats(user.id);
        setUserStats({
          postsCount: stats.postsCount || 0,
          followersCount: stats.followersCount || 0,
          followingCount: stats.followingCount || 0,
          likes: 0
        });

       // 获取用户帖子
       const postsData = await socialService.getUserPosts(user.id);
       setUserPosts(postsData.posts || []);
      
      // 获取用户活动
      const activities = await ActivityService.getUserActivities(user.id);
      setUserActivities(activities);
      
      // 获取关注者和关注数
      const followersCount = await socialService.getUserFollowersCount(user.id);
      const followingCount = await socialService.getUserFollowingCount(user.id);
      
      // 更新统计数据
      setUserStats(prevStats => ({
        ...prevStats,
        followersCount: followersCount,
        followingCount: followingCount
      }));
      
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('加载用户数据失败');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadUserData();
  }, [user]);
  
  // 更新用户资料
  const handleUpdateProfile = async () => {
    if (!user || !userProfile) return;
    
    try {
      await socialService.updateUserProfile(user.id, editForm);
      
      setUserProfile({
        ...userProfile,
        ...editForm
      });
      
      setIsEditingProfile(false);
      toast.success('资料更新成功');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('资料更新失败');
    }
  };
  
  // 处理评论点击
  const handleCommentClick = (postId: string) => {
    setSelectedPostId(postId);
    setIsCommentModalOpen(true);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return t('profile.content.status.published');
      case 'draft':
        return t('profile.content.status.draft');
      case 'pending':
        return t('profile.content.status.pending');
      default:
        return t('profile.content.status.unknown');
    }
  };
  
  // 处理退出登录
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('已退出登录');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('退出登录失败');
    }
  };
  
  // 删除帖子
  const handleDeletePost = async (postId: string) => {
    if (!confirm('确定要删除这篇帖子吗？')) return;
    
    try {
      await socialService.deletePost(postId);
      setUserPosts(userPosts.filter(post => post.id !== postId));
      toast.success('帖子删除成功');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('删除帖子失败');
    }
  };

  // 头像上传处理
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }

    try {
      // 创建FormData
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('user_id', user.id);

      // 获取认证token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('请先登录');
        return;
      }

      // 上传头像
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // 更新用户资料
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          avatar_url: result.avatar_url
        });
      }
      
      toast.success('头像更新成功');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error(error instanceof Error ? error.message : '头像上传失败');
    }
  };
  
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'like',
      message: 'Alice 点赞了你的文章「我的第一篇文章」',
      time: '2小时前',
      read: false
    },
    {
      id: '2',
      type: 'comment',
      message: 'Bob 评论了你的文章「关于摄影的一些思考」',
      time: '4小时前',
      read: false
    },
    {
      id: '3',
      type: 'follow',
      message: 'Charlie 开始关注你',
      time: '1天前',
      read: true
    },
    {
      id: '4',
      type: 'system',
      message: '你的文章「旅行日记：越南之行」已通过审核',
      time: '2天前',
      read: true
    }
  ]);
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h2>
          <p className="text-gray-600">您需要登录才能访问个人中心</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }



  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'system':
        return <Bell className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 用户信息卡片 */}
      <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <img
              src={userProfile?.avatar_url || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20of%20a%20person%20with%20friendly%20smile%2C%20clean%20background%2C%20high%20quality&image_size=square'}
              alt="用户头像"
              className="w-24 h-24 rounded-full object-cover border-4 border-white/50"
            />
            <label className="absolute bottom-0 right-0 p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors cursor-pointer">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-800">{userProfile?.full_name || userProfile?.username || '用户名'}</h2>
              <button 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>{isEditingProfile ? '取消编辑' : '编辑资料'}</span>
              </button>
            </div>
            <p className="text-gray-600 mb-2">@{userProfile?.username}</p>
            <p className="text-gray-700 mb-4">{userProfile?.bio || '这个人很懒，什么都没有留下...'}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>加入于 {userProfile?.created_at ? format(new Date(userProfile.created_at), 'yyyy年MM月') : '未知'}</span>
              </span>
              {userProfile?.location && (
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{userProfile.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 编辑表单 */}
        {isEditingProfile && (
          <div className="mt-6 pt-6 border-t border-white/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">位置</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.settings.bio')}</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="介绍一下自己..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网站</label>
                <input
                  type="url"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleUpdateProfile}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 text-center">
          <div className="text-2xl font-bold text-purple-600">{userStats?.postsCount || 0}</div>
          <div className="text-sm text-gray-600">{t('profile.overview.posts')}</div>
        </div>
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 text-center">
          <div className="text-2xl font-bold text-purple-600">{userStats?.followersCount || 0}</div>
          <div className="text-sm text-gray-600">{t('profile.overview.followers')}</div>
        </div>
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 text-center">
          <div className="text-2xl font-bold text-purple-600">{userStats?.followingCount || 0}</div>
          <div className="text-sm text-gray-600">{t('profile.overview.following')}</div>
        </div>
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 text-center">
          <div className="text-2xl font-bold text-purple-600">{userStats?.likes || 0}</div>
          <div className="text-sm text-gray-600">{t('profile.overview.likes')}</div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('profile.overview.quickActions')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-2 p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            <Plus className="w-4 h-4" />
            <span>{t('profile.overview.publishContent')}</span>
          </button>
          <button className="flex items-center space-x-2 p-3 bg-white/30 text-gray-700 rounded-lg hover:bg-white/40 transition-colors">
            <FileText className="w-4 h-4" />
            <span>{t('profile.overview.drafts')}</span>
          </button>
          <button className="flex items-center space-x-2 p-3 bg-white/30 text-gray-700 rounded-lg hover:bg-white/40 transition-colors">
            <Settings className="w-4 h-4" />
            <span>{t('profile.overview.settings')}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      {/* 内容管理头部 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('profile.content.title')}</h2>
        <button 
          onClick={() => setIsCreatePostModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('profile.content.publishNew')}</span>
        </button>
      </div>

      {/* 内容列表 */}
      <div className="space-y-4">
        {userPosts.length === 0 ? (
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 border border-white/30 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('profile.content.noContent')}</h3>
            <p className="text-gray-500 mb-4">{t('profile.content.startCreating')}</p>
            <button 
              onClick={() => setIsCreatePostModalOpen(true)}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              {t('profile.content.publishNew')}
            </button>
          </div>
        ) : (
          userPosts.map((post) => (
            <div key={post.id} className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{post.title || '无标题'}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {t('profile.content.published')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{format(new Date(post.created_at), 'yyyy-MM-dd')}</span>
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes_count}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments_count}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-purple-600 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSocial = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{t('profile.social.title')}</h2>
      
      {/* 关注统计 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{userStats?.followingCount || 0}</div>
          <div className="text-gray-600">{t('profile.social.following')}</div>
        </div>
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{userStats?.followersCount || 0}</div>
          <div className="text-gray-600">{t('profile.social.followers')}</div>
        </div>
      </div>

      {/* 活动参与 */}
      <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>{t('profile.social.activities')}</span>
        </h3>
        <div className="space-y-3">
          {userActivities.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">{t('profile.social.noActivities')}</h4>
              <p className="text-gray-500 mb-4">{t('profile.social.discoverActivities')}</p>
              <button className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                {t('profile.social.browseActivities')}
              </button>
            </div>
          ) : (
            userActivities.map((activity) => {
              const isUpcoming = new Date(activity.start_date) > new Date();
              const isPast = new Date(activity.start_date) < new Date();
              return (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-white/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{activity.title}</h4>
                      <p className="text-sm text-gray-500">{format(new Date(activity.start_date), 'yyyy-MM-dd HH:mm')}</p>
                    </div>
                  </div>
                  <span className={cn('px-2 py-1 rounded-full text-xs font-medium', {
                    'bg-green-100 text-green-800': isPast,
                    'bg-blue-100 text-blue-800': isUpcoming,
                    'bg-gray-100 text-gray-800': false
                  })}>
                    {isPast ? t('profile.social.completed') : isUpcoming ? t('profile.social.upcoming') : t('profile.social.ongoing')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{t('profile.settings.title')}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基础信息 */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('profile.settings.basicInfo')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.settings.username')}</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" defaultValue="用户名" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.settings.email')}</label>
              <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" defaultValue="user@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" rows={3} placeholder={t('profile.settings.bioPlaceholder')}></textarea>
            </div>
          </div>
        </div>

        {/* 隐私设置 */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('profile.settings.privacy')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{t('profile.settings.publicProfile')}</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{t('profile.settings.allowFollow')}</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{t('profile.settings.showOnlineStatus')}</span>
              <input type="checkbox" className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{t('profile.settings.emailNotifications')}</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
          </div>
        </div>

        {/* 账户安全 */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('profile.settings.accountSecurity')}</h3>
          <div className="space-y-4">
            <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              {t('profile.settings.changePassword')}
            </button>
            <button className="w-full px-4 py-2 bg-white/30 text-gray-700 rounded-lg hover:bg-white/40 transition-colors">
              {t('profile.settings.enableTwoFactor')}
            </button>
            <button className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              {t('profile.settings.deleteAccount')}
            </button>
          </div>
        </div>

        {/* 语言设置 */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('profile.settings.language')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.settings.interfaceLanguage')}</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="zh">{t('profile.settings.chinese')}</option>
                <option value="zh-TW">{t('profile.settings.traditionalChinese')}</option>
                <option value="en">{t('profile.settings.english')}</option>
                <option value="vi">{t('profile.settings.vietnamese')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const toggleNotificationSetting = (type: 'email' | 'push' | 'sms') => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const renderNotifications = () => {

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('profile.notifications.title')}</h2>
        
        {/* 通知设置 */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('profile.notifications.settings')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">{t('profile.notifications.email')}</h4>
                <p className="text-sm text-gray-600">{t('profile.notifications.emailDesc')}</p>
              </div>
              <button 
                onClick={() => toggleNotificationSetting('email')}
                className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', {
                  'bg-purple-600': notificationSettings.email,
                  'bg-gray-200': !notificationSettings.email
                })}
              >
                <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition', {
                  'translate-x-6': notificationSettings.email,
                  'translate-x-1': !notificationSettings.email
                })} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">{t('profile.notifications.push')}</h4>
                <p className="text-sm text-gray-600">{t('profile.notifications.pushDesc')}</p>
              </div>
              <button 
                onClick={() => toggleNotificationSetting('push')}
                className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', {
                  'bg-purple-600': notificationSettings.push,
                  'bg-gray-200': !notificationSettings.push
                })}
              >
                <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition', {
                  'translate-x-6': notificationSettings.push,
                  'translate-x-1': !notificationSettings.push
                })} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">{t('profile.notifications.sms')}</h4>
                <p className="text-sm text-gray-600">{t('profile.notifications.smsDesc')}</p>
              </div>
              <button 
                onClick={() => toggleNotificationSetting('sms')}
                className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', {
                  'bg-purple-600': notificationSettings.sms,
                  'bg-gray-200': !notificationSettings.sms
                })}
              >
                <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition', {
                  'translate-x-6': notificationSettings.sms,
                  'translate-x-1': !notificationSettings.sms
                })} />
              </button>
            </div>
          </div>
        </div>

        {/* 最近通知 */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{t('profile.notifications.recent')}</h3>
            <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              {t('profile.notifications.markAllRead')}
            </button>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">{t('profile.notifications.noNotifications')}</h4>
                <p className="text-gray-500">{t('profile.notifications.noNotificationsDesc')}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className={cn(
                  'bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 flex items-start space-x-3',
                  !notification.read && 'bg-purple-50/50'
                )}>
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className={cn('text-gray-800', !notification.read && 'font-semibold')}>
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: t('profile.tabs.overview'), icon: User },
    { id: 'content', label: t('profile.tabs.content'), icon: FileText },
    { id: 'social', label: t('profile.tabs.social'), icon: Users },
    { id: 'settings', label: t('profile.tabs.settings'), icon: Settings },
    { id: 'notifications', label: t('profile.tabs.notifications'), icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
          <p className="text-gray-600 mt-2">{t('profile.subtitle')}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 侧边栏导航 */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors',
                        activeTab === tab.id
                          ? 'bg-purple-500 text-white'
                          : 'text-gray-700 hover:bg-white/30'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="flex-1">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'content' && renderContent()}
            {activeTab === 'social' && renderSocial()}
            {activeTab === 'settings' && renderSettings()}
            {activeTab === 'notifications' && renderNotifications()}
          </div>
        </div>
      </div>

      {/* 发布内容模态框 */}
      <CreatePostModal 
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={() => {
          setIsCreatePostModalOpen(false);
          loadUserData(); // 重新加载用户数据以显示新发布的内容
        }}
      />
    </div>
  );
};

export default Profile;