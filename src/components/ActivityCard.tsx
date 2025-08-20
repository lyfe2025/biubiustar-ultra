import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, MapPin, Users, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Activity, ActivityService } from '../lib/activityService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/language/LanguageContext';
import { getCategoryName } from '../utils/categoryUtils';
import { toast } from 'sonner';
import LazyImage from './LazyImage';
import { categoriesCache, type ActivityCategory } from '../services/categoriesCache';
import { batchStatusService } from '../services/batchStatusService';


interface ActivityCardProps {
  activity: Activity;
  onParticipationChange?: () => void;
  simplified?: boolean; // 新增：是否为简化模式
  // 新增：用于批量获取的数据
  initialIsParticipating?: boolean;
  initialParticipantCount?: number;
}

export const ActivityCard: React.FC<ActivityCardProps> = React.memo(({ 
  activity, 
  onParticipationChange, 
  simplified = false,
  initialIsParticipating,
  initialParticipantCount
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [isParticipating, setIsParticipating] = useState<boolean>(initialIsParticipating ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [participantCount, setParticipantCount] = useState<number>(initialParticipantCount ?? (activity.current_participants || 0));
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    // 只有在没有初始数据且用户已登录时才检查参与状态
    if (user && initialIsParticipating === undefined) {
      checkParticipation();
    }
  }, [user, activity.id, initialIsParticipating]);

  useEffect(() => {
    loadCategories();
  }, [language]);

  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await categoriesCache.getActivityCategories(language);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    }
  }, [language]);

  const checkParticipation = useCallback(async () => {
    if (!user) return;
    
    // 如果已有初始数据，则不需要重新检查
    if (initialIsParticipating !== undefined) return;
    
    try {
      const participating = await ActivityService.isUserParticipating(activity.id, user.id);
      setIsParticipating(participating);
    } catch (error) {
      console.error('Error checking participation:', error);
      // 如果检查失败，默认设置为未参与状态
      setIsParticipating(false);
    }
  }, [user, activity.id, initialIsParticipating]);

  const handleParticipation = useCallback(async () => {
    if (!user) {
      toast.error(t('activities.messages.loginRequired'));
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isParticipating) {
        const result = await ActivityService.leaveActivity(activity.id, user.id);
        if (result.success) {
          setParticipantCount(prev => Math.max(0, prev - 1));
          toast.success('已退出活动');
          // 重新检查参与状态以确保同步
          await checkParticipation();
          onParticipationChange?.();
        } else {
          toast.error(`退出活动失败: ${result.error || '未知错误'}`);
        }
      } else {
        if (participantCount >= activity.max_participants) {
          toast.error('活动人数已满');
          return;
        }
        
        const result = await ActivityService.joinActivity(activity.id, user.id);
        if (result.success) {
          setParticipantCount(prev => prev + 1);
          toast.success(t('activities.messages.joinSuccess'));
          // 重新检查参与状态以确保同步
          await checkParticipation();
          onParticipationChange?.();
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
      }
    } catch (error) {
      console.error('Error handling participation:', error);
      toast.error(t('activities.messages.operationFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [user, t, isLoading, isParticipating, activity.id, activity.max_participants, participantCount, checkParticipation, onParticipationChange]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    const monthText = t('activities.ui.month');
    const dayText = t('activities.ui.day');
    
    // 对于英文等不需要月日文字的语言，直接返回数字格式
    if (!monthText && !dayText) {
      return `${month}/${day} ${hours}:${minutes}`;
    }
    
    return `${month}${monthText}${day}${dayText} ${hours}:${minutes}`;
  }, [t]);

  // 获取活动状态
  const activityStatus = useMemo(() => {
    const now = new Date();
    const startDate = new Date(activity.start_date);
    const endDate = new Date(activity.end_date);
    
    if (now < startDate) {
      return { status: t('activities.status.upcoming'), color: 'bg-blue-500/30 text-blue-200' };
    } else if (now >= startDate && now <= endDate) {
      return { status: t('activities.status.ongoing'), color: 'bg-green-500/30 text-green-200' };
    } else {
      return { status: t('activities.status.completed'), color: 'bg-gray-500/30 text-gray-300' };
    }
  }, [activity.start_date, activity.end_date, t]);

  const isActivityFull = useMemo(() => participantCount >= activity.max_participants, [participantCount, activity.max_participants]);
  const isActivityPast = useMemo(() => activityStatus.status === t('activities.status.completed'), [activityStatus.status, t]);

  // 简化模式渲染
  if (simplified) {
    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200 group">
        {/* 活动图片 */}
        <div className="aspect-video overflow-hidden relative">
          <LazyImage
            src={activity.image_url || '/images/placeholder-activity.svg'}
            alt={activity.title}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
            objectFit="cover"
            loading="lazy"
          />
          {/* 状态标签 */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              activityStatus.status === t('activities.status.ongoing') 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : activityStatus.status === t('activities.status.upcoming') 
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              {activityStatus.status}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* 活动标题 */}
          <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-purple-700 transition-colors">
            {activity.title}
          </h3>
          
          {/* 关键信息 */}
          <div className="space-y-4 mb-6">
            {/* 时间 */}
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-purple-600" />
              <span className="text-sm">{new Date(activity.start_date).toLocaleDateString()}</span>
            </div>
            
            {/* 参与人数 */}
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2 text-purple-600" />
              <span className="text-sm">{participantCount} {t('activities.ui.participantsJoined')}</span>
            </div>
          </div>

          {/* 查看详情按钮 */}
          <Link
            to={`/activities/${activity.id}`}
            className="block w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm font-semibold text-center"
          >
            {t('activities.actions.viewDetails')}
          </Link>
        </div>
      </div>
    );
  }

  // 完整模式渲染
  return (
    <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-50 hover:border-purple-100 group transform hover:-translate-y-2">
      {/* 活动图片 */}
      <Link to={`/activities/${activity.id}`} className="block relative overflow-hidden">
        <LazyImage
          src={activity.image_url || '/images/placeholder-activity.svg'}
          alt={activity.title}
          className="w-full h-64 group-hover:scale-110 transition-transform duration-500"
          objectFit="cover"
          loading="lazy"
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* 状态标签 */}
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md border-2 ${
            activityStatus.status === t('activities.status.ongoing') 
              ? 'bg-green-50/90 text-green-800 border-green-200 shadow-lg shadow-green-200/50'
              : activityStatus.status === t('activities.status.upcoming') 
              ? 'bg-blue-50/90 text-blue-800 border-blue-200 shadow-lg shadow-blue-200/50'
              : 'bg-gray-50/90 text-gray-600 border-gray-200 shadow-lg shadow-gray-200/50'
          }`}>
            {activityStatus.status}
          </span>
        </div>
        {/* 分类标签 */}
        <div className="absolute top-4 right-4">
          <span className="px-4 py-2 bg-purple-600/90 text-white rounded-full text-sm font-bold backdrop-blur-md border-2 border-white/20 shadow-lg shadow-purple-600/30">
            {useMemo(() => {
              // 如果categories还没有加载完成，显示loading或者原始分类名
              if (!categories || categories.length === 0) {
                return activity.category || '未知分类';
              }

              // 优先通过 category_id 匹配
              if (activity.category_id) {
                const foundCategory = categories.find(cat => String(cat.id) === String(activity.category_id));
                if (foundCategory) {
                  return getCategoryName(foundCategory, language);
                }
              }

              // 如果没有找到，尝试通过字符串匹配
              if (activity.category) {
                const foundCategory = categories.find(cat => 
                  cat.name === activity.category ||
                  cat.name_zh === activity.category ||
                  cat.name_en === activity.category ||
                  cat.name_zh_tw === activity.category ||
                  cat.name_vi === activity.category ||
                  String(cat.id) === activity.category
                );
                if (foundCategory) {
                  return getCategoryName(foundCategory, language);
                }
              }

              return activity.category || '未知分类';
            }, [categories, activity.category_id, activity.category, language])}
          </span>
        </div>
        
        {/* 参与人数快速显示 */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 border border-white/50 shadow-lg">
          <div className="flex items-center text-gray-700">
            <Users className="w-4 h-4 mr-2 text-purple-600" />
            <span className="text-sm font-semibold">{participantCount}/{activity.max_participants}</span>
            {isActivityFull && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                {t('activities.ui.full')}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-8">
        {/* 活动标题 */}
        <Link to={`/activities/${activity.id}`} className="block">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-purple-700 transition-colors leading-tight hover:text-purple-600">
            {activity.title}
          </h3>
        </Link>

        {/* 活动描述 */}
        <p className="text-gray-600 text-base mb-6 line-clamp-3 leading-relaxed">
          {activity.description}
        </p>

        {/* 关键信息 - 更大气的布局 */}
        <div className="space-y-4 mb-6">
          {/* 时间 */}
          <div className="flex items-center text-gray-700 bg-gray-50 rounded-xl p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">{t('activities.ui.activityTime')}</div>
              <div className="text-base font-bold text-gray-800">
                {formatDate(activity.start_date)}
              </div>
            </div>
          </div>
          
          {/* 地点 */}
          <div className="flex items-center text-gray-700 bg-gray-50 rounded-xl p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 font-medium">{t('activities.ui.activityLocation')}</div>
              <div className="text-base font-bold text-gray-800 truncate">{activity.location}</div>
            </div>
          </div>
        </div>

        {/* 作者信息 */}
        {activity.author && (
          <div className="flex items-center text-gray-500 mb-6 pb-6 border-b border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mr-3 shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('activities.ui.organizer')}</div>
              <div className="font-bold text-gray-800">{activity.author.full_name || activity.author.username}</div>
            </div>
          </div>
        )}

        {/* 参与按钮 */}
        {!isActivityPast && (
          <button
            onClick={handleParticipation}
            disabled={isLoading || (!isParticipating && isActivityFull)}
            className={`relative w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 text-base overflow-hidden group/btn ${
              isParticipating
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-1'
                : isActivityFull
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-1'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <span className="relative z-10 flex items-center justify-center">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {t('activities.ui.processing')}
                </>
              ) : isParticipating ? (
                t('activities.actions.leave')
              ) : isActivityFull ? (
                t('activities.messages.activityFull')
              ) : (
                <>
                  <Users className="w-5 h-5 mr-2" />
                  {t('activities.actions.join')}
                </>
              )}
            </span>
            {!isActivityFull && !isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
            )}
          </button>
        )}

        {/* 活动已结束提示 */}
        {isActivityPast && (
          <div className="w-full py-4 px-6 bg-gray-100 text-gray-600 rounded-2xl text-center text-base font-bold border border-gray-200">
            <Clock className="w-5 h-5 inline mr-2" />
            {t('activities.ui.activityEnded')}
          </div>
        )}
      </div>
    </div>
  );
});

export default ActivityCard;