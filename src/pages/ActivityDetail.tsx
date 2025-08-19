import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isParticipating, setIsParticipating] = useState(false);
  const [processing, setProcessing] = useState(false);

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
        color: 'bg-blue-50/90 text-blue-800 border-blue-200 shadow-lg shadow-blue-200/50'
      };
    } else if (now >= startDate && now <= endDate) {
      return { 
        status: t('activities.status.ongoing'), 
        color: 'bg-green-50/90 text-green-800 border-green-200 shadow-lg shadow-green-200/50'
      };
    } else {
      return { 
        status: t('activities.status.completed'), 
        color: 'bg-gray-50/90 text-gray-600 border-gray-200 shadow-lg shadow-gray-200/50'
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t('activities.ui.loading')}</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">{t('activities.messages.loadFailed')}</p>
          <Link 
            to="/activities" 
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回活动列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-20">
      {/* 返回按钮 */}
      <div className="sticky top-16 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/activities')}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回活动列表
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 活动主图和基本信息 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          {/* 活动图片 */}
          <div className="relative h-96 overflow-hidden">
            <img
              src={activity.image_url || '/images/placeholder-activity.svg'}
              alt={activity.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            
            {/* 状态和分类标签 */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
              <span className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md border-2 ${activityStatus.color}`}>
                {activityStatus.status}
              </span>
              <span className="px-4 py-2 bg-purple-600/90 text-white rounded-full text-sm font-bold backdrop-blur-md border-2 border-white/20 shadow-lg">
                {getCategoryDisplay()}
              </span>
            </div>

            {/* 参与人数显示 */}
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 border border-white/50 shadow-lg">
              <div className="flex items-center text-gray-700">
                <Users className="w-5 h-5 mr-2 text-purple-600" />
                <span className="text-base font-semibold">{activity.current_participants}/{activity.max_participants}</span>
                {isActivityFull && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                    {t('activities.ui.full')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 活动标题和描述 */}
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {activity.title}
            </h1>
            
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8">
              <p className="text-lg whitespace-pre-wrap">{activity.description}</p>
            </div>

            {/* 关键信息网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* 开始时间 */}
              <div className="flex items-center bg-gray-50 rounded-xl p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">{t('activities.details.startTime')}</div>
                  <div className="text-lg font-bold text-gray-800">
                    {formatDate(activity.start_date)}
                  </div>
                </div>
              </div>

              {/* 结束时间 */}
              <div className="flex items-center bg-gray-50 rounded-xl p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">{t('activities.details.endTime')}</div>
                  <div className="text-lg font-bold text-gray-800">
                    {formatDate(activity.end_date)}
                  </div>
                </div>
              </div>

              {/* 活动地点 */}
              <div className="flex items-center bg-gray-50 rounded-xl p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 font-medium">{t('activities.details.location')}</div>
                  <div className="text-lg font-bold text-gray-800">{activity.location}</div>
                </div>
              </div>

              {/* 参与人数 */}
              <div className="flex items-center bg-gray-50 rounded-xl p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">{t('activities.details.participants')}</div>
                  <div className="text-lg font-bold text-gray-800">
                    {activity.current_participants}/{activity.max_participants} {t('activities.ui.participantsJoined')}
                  </div>
                </div>
              </div>
            </div>

            {/* 主办方信息 */}
            {activity.author && (
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium">{t('activities.details.organizer')}</div>
                    <div className="text-xl font-bold text-gray-800">
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
                className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 text-lg overflow-hidden group/btn ${
                  isParticipating
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-1'
                    : isActivityFull
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-1'
                } ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {processing ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      {t('activities.ui.processing')}
                    </>
                  ) : isParticipating ? (
                    t('activities.actions.leave')
                  ) : isActivityFull ? (
                    t('activities.messages.activityFull')
                  ) : (
                    <>
                      <Users className="w-6 h-6 mr-3" />
                      {t('activities.actions.join')}
                    </>
                  )}
                </span>
                {!isActivityFull && !processing && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                )}
              </button>
            )}

            {/* 活动已结束提示 */}
            {isActivityPast && (
              <div className="w-full py-4 px-6 bg-gray-100 text-gray-600 rounded-2xl text-center text-lg font-bold border border-gray-200">
                <Clock className="w-6 h-6 inline mr-3" />
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