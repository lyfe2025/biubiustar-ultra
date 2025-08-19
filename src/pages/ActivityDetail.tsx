import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  User, 
  Clock, 
  ArrowLeft,
  Share2,
  Heart,
  MessageCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/language/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ActivityService, ActivityCategory } from '../lib/activityService';
import { Activity } from '../types';
import { getCategoryName } from '../utils/categoryUtils';

const activityService = new ActivityService();
import { toast } from 'sonner';

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isParticipating, setIsParticipating] = useState(false);
  const [processing, setProcessing] = useState(false);

  // 获取返回路径
  const getBackPath = () => {
    const referrer = location.state?.from;
    if (referrer) {
      return referrer;
    }
    
    // 如果没有 referrer，根据当前路径判断
    const pathname = location.pathname;
    if (pathname.includes('/profile')) {
      return '/profile';
    } else if (pathname.includes('/admin')) {
      return '/admin';
    } else if (pathname.includes('/home') || pathname === '/') {
      return '/';
    } else {
      return '/activities';
    }
  };

  // 处理返回
  const handleBack = () => {
    const backPath = getBackPath();
    navigate(backPath);
  };

  useEffect(() => {
    const loadActivity = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const [activityData, categoriesData] = await Promise.all([
          activityService.getActivity(id),
          ActivityService.getActivityCategories(language)
        ]);
        
        setActivity(activityData);
        setCategories(categoriesData);
        
        // 检查用户参与状态
        if (user && activityData) {
          const isParticipating = await ActivityService.isUserParticipating(activityData.id, user.id);
          setIsParticipating(isParticipating);
        }
      } catch (error) {
        console.error('Failed to load activity:', error);
        toast.error(t('activities.messages.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [id, user, t]);

  // 监听语言变化，重新加载分类数据
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await ActivityService.getActivityCategories(language);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    if (categories.length > 0) {
      loadCategories();
    }
  }, [language]);

  const handleJoinActivity = async () => {
    if (!activity || !user) return;
    
    setProcessing(true);
    try {
      const result = await ActivityService.joinActivity(activity.id, user.id);
      if (result.success) {
        setIsParticipating(true);
        setActivity(prev => prev ? {
          ...prev,
          current_participants: prev.current_participants + 1
        } : null);
        toast.success(t('activities.messages.joinSuccess'));
      } else {
        // 根据错误类型显示不同的错误信息
        let errorMessage = result.error || '未知错误';
        if (errorMessage.includes('Activity not found')) {
          errorMessage = '活动不存在';
        } else if (errorMessage.includes('Activity is full')) {
          errorMessage = '活动人数已满';
        } else if (errorMessage.includes('User already joined')) {
          errorMessage = '您已经参加了此活动';
        } else if (errorMessage.includes('Network error')) {
          errorMessage = '网络连接失败，请检查网络后重试';
        }
        toast.error(`参加活动失败: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Failed to join activity:', error);
      toast.error('参加活动失败: 网络连接异常');
    } finally {
      setProcessing(false);
    }
  };

  const handleLeaveActivity = async () => {
    if (!activity || !user) return;
    
    setProcessing(true);
    try {
      const result = await ActivityService.leaveActivity(activity.id, user.id);
      if (result.success) {
        setIsParticipating(false);
        setActivity(prev => prev ? {
          ...prev,
          current_participants: Math.max(0, prev.current_participants - 1)
        } : null);
        toast.success(t('activities.messages.leaveSuccess'));
      } else {
        toast.error(`退出活动失败: ${result.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('Failed to leave activity:', error);
      toast.error('退出活动失败: 网络连接异常');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}${t('activities.ui.month')}${day}${t('activities.ui.day')} ${hours}:${minutes}`;
  };

  const getActivityStatus = () => {
    if (!activity) return { status: '', color: '' };
    
    const now = new Date();
    const startDate = new Date(activity.start_date);
    const endDate = new Date(activity.end_date);
    
    if (now < startDate) {
      return { 
        status: t('activities.status.upcoming'), 
        color: 'bg-blue-50 text-blue-800 border border-blue-200'
      };
    } else if (now >= startDate && now <= endDate) {
      return { 
        status: t('activities.status.ongoing'), 
        color: 'bg-green-50 text-green-800 border border-green-200'
      };
    } else {
      return { 
        status: t('activities.status.completed'), 
        color: 'bg-gray-50 text-gray-600 border border-gray-200'
      };
    }
  };

  const getCategoryDisplay = () => {
    if (!activity || !categories.length) return activity?.category || t('activities.ui.unknownCategory');
    
    let matchedCategory = null;
    
    // 优先通过category_id匹配（处理类型转换）
    if (activity.category_id) {
      matchedCategory = categories.find(cat => 
        String(cat.id) === String(activity.category_id)
      );
    }
    
    // 如果没有匹配到，尝试通过category字符串匹配
    if (!matchedCategory && activity.category) {
      matchedCategory = categories.find(cat => 
        cat.name === activity.category ||
        cat.name_zh === activity.category ||
        cat.name_en === activity.category ||
        cat.name_zh_tw === activity.category ||
        cat.name_vi === activity.category ||
        String(cat.id) === activity.category ||
        cat.id.toString() === activity.category
      );
    }
    
    // 使用当前语言获取分类名称
    const result = matchedCategory ? getCategoryName(matchedCategory, language) : (activity.category || t('activities.ui.unknownCategory'));
    
    // 调试信息
    console.log('ActivityDetail分类匹配:', {
      activity_id: activity.id,
      category_id: activity.category_id,
      category_string: activity.category,
      current_language: language,
      categories_count: categories.length,
      matched_category: matchedCategory ? { id: matchedCategory.id, name: matchedCategory.name } : null,
      final_result: result
    });
    
    return result;
  };

  const isActivityPast = activity ? new Date() > new Date(activity.end_date) : false;
  const isActivityFull = (activity?.current_participants || 0) >= (activity?.max_participants || 0);
  const activityStatus = getActivityStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t('activities.ui.loading')}</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">{t('activities.messages.loadFailed')}</p>
          <button 
            onClick={handleBack}
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 relative overflow-hidden pt-20">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <button
          onClick={handleBack}
          className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-purple-100 px-4 py-3 mb-8 hover:bg-white transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2 text-purple-600" />
          <span className="text-purple-600 font-medium">返回</span>
        </button>

        {/* 活动详情卡片 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
          {/* 活动图片 */}
          <div className="relative h-80 overflow-hidden">
            <img
              src={activity.image_url || '/images/placeholder-activity.svg'}
              alt={activity.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            
            {/* 状态和分类标签 */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${activityStatus.color}`}>
                {activityStatus.status}
              </span>
              <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                {getCategoryDisplay()}
              </span>
            </div>

            {/* 参与人数显示 */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 border border-gray-200">
              <div className="flex items-center text-gray-700">
                <Users className="w-4 h-4 mr-2 text-purple-600" />
                <span className="text-sm font-medium">{activity.current_participants}/{activity.max_participants}</span>
                {isActivityFull && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    {t('activities.ui.full')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 活动内容 */}
          <div className="p-8">
            {/* 活动标题 */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {activity.title}
            </h1>
            
            {/* 活动描述 */}
            {activity.description && (
              <div className="mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                    {activity.description}
                  </p>
                </div>
              </div>
            )}

            {/* 关键信息网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* 开始时间 */}
              <div className="flex items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">{t('activities.details.startTime')}</div>
                  <div className="text-base font-semibold text-gray-800">
                    {formatDate(activity.start_date)}
                  </div>
                </div>
              </div>

              {/* 结束时间 */}
              <div className="flex items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">{t('activities.details.endTime')}</div>
                  <div className="text-base font-semibold text-gray-800">
                    {formatDate(activity.end_date)}
                  </div>
                </div>
              </div>

              {/* 活动地点 */}
              <div className="flex items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 font-medium">{t('activities.details.location')}</div>
                  <div className="text-base font-semibold text-gray-800">{activity.location}</div>
                </div>
              </div>

              {/* 参与人数 */}
              <div className="flex items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">{t('activities.details.participants')}</div>
                  <div className="text-base font-semibold text-gray-800">
                    {activity.current_participants}/{activity.max_participants}
                  </div>
                </div>
              </div>
            </div>

            {/* 主办方信息 */}
            {activity.author && (
              <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium">{t('activities.details.organizer')}</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {activity.author.full_name || activity.author.username}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 参与按钮 */}
            {!isActivityPast && (
              <button
                onClick={isParticipating ? handleLeaveActivity : handleJoinActivity}
                disabled={processing || (!isParticipating && isActivityFull)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 text-lg ${
                  isParticipating
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : isActivityFull
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                } ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    {t('activities.ui.processing')}
                  </div>
                ) : isParticipating ? (
                  t('activities.actions.leave')
                ) : isActivityFull ? (
                  t('activities.messages.activityFull')
                ) : (
                  <div className="flex items-center justify-center">
                    <Users className="w-5 h-5 mr-2" />
                    {t('activities.actions.join')}
                  </div>
                )}
              </button>
            )}

            {/* 活动已结束提示 */}
            {isActivityPast && (
              <div className="w-full py-3 px-6 bg-gray-100 text-gray-600 rounded-lg text-center text-lg font-medium border border-gray-200">
                <Clock className="w-5 h-5 inline mr-2" />
                {t('activities.ui.activityEnded')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;