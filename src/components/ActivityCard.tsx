import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Activity, ActivityService } from '../lib/activityService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface ActivityCardProps {
  activity: Activity;
  onParticipationChange?: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onParticipationChange }) => {
  const { user } = useAuth();
  const [isParticipating, setIsParticipating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [participantCount, setParticipantCount] = useState(activity.current_participants || 0);

  useEffect(() => {
    if (user) {
      checkParticipation();
    }
  }, [user, activity.id]);

  const checkParticipation = async () => {
    if (!user) return;
    
    try {
      const participating = await ActivityService.isUserParticipating(activity.id, user.id);
      setIsParticipating(participating);
    } catch (error) {
      console.error('Error checking participation:', error);
    }
  };

  const handleParticipation = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isParticipating) {
        const success = await ActivityService.leaveActivity(activity.id, user.id);
        if (success) {
          setIsParticipating(false);
          setParticipantCount(prev => Math.max(0, prev - 1));
          toast.success('已退出活动');
          onParticipationChange?.();
        } else {
          toast.error('退出活动失败');
        }
      } else {
        if (participantCount >= activity.max_participants) {
          toast.error('活动人数已满');
          return;
        }
        
        const success = await ActivityService.joinActivity(activity.id, user.id);
        if (success) {
          setIsParticipating(true);
          setParticipantCount(prev => prev + 1);
          toast.success('成功参加活动');
          onParticipationChange?.();
        } else {
          toast.error('参加活动失败');
        }
      }
    } catch (error) {
      console.error('Error handling participation:', error);
      toast.error('操作失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MM月dd日 HH:mm', { locale: zhCN });
    } catch {
      return dateString;
    }
  };

  // 获取活动状态
  const getActivityStatus = () => {
    const now = new Date();
    const startDate = new Date(activity.start_date);
    const endDate = new Date(activity.end_date);
    
    if (now < startDate) {
      return { status: '即将开始', color: 'bg-blue-500/30 text-blue-200' };
    } else if (now >= startDate && now <= endDate) {
      return { status: '进行中', color: 'bg-green-500/30 text-green-200' };
    } else {
      return { status: '已结束', color: 'bg-gray-500/30 text-gray-300' };
    }
  };

  const activityStatus = getActivityStatus();
  const isActivityFull = participantCount >= activity.max_participants;
  const isActivityPast = activityStatus.status === '已结束';

  return (
    <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl md:rounded-3xl p-3 md:p-6 border border-white/20 hover:border-purple-400/40 hover:bg-white/15 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 animate-fade-in-up">
      {/* 活动图片 */}
      {activity.image_url && (
        <div className="mb-3 md:mb-4 rounded-xl overflow-hidden relative group">
          <img
            src={activity.image_url}
            alt={activity.title}
            className="w-full h-32 md:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      )}

      {/* 活动标题和分类 */}
      <div className="mb-3 md:mb-4">
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <h3 className="text-base md:text-xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300 flex-1 mr-2 md:mr-4">{activity.title}</h3>
          <div className="flex flex-col gap-1 md:gap-2 items-end">
            <span className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border ${activityStatus.color} ${activityStatus.status === '进行中' ? 'border-green-400/30 animate-pulse' : activityStatus.status === '即将开始' ? 'border-blue-400/30' : 'border-gray-400/30'}`}>
              {activityStatus.status}
            </span>
            <span className="px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-purple-500/30 to-purple-600/30 text-purple-200 rounded-full text-xs font-medium border border-purple-400/30 backdrop-blur-sm hover:from-purple-500/40 hover:to-purple-600/40 transition-all duration-300">
              {activity.category}
            </span>
          </div>
        </div>
        
        {/* 作者信息 */}
        {activity.author && (
          <div className="flex items-center text-gray-300 text-xs md:text-sm mb-2 md:mb-3 group-hover:text-gray-200 transition-colors duration-300">
            <div className="w-5 md:w-6 h-5 md:h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-2">
              <User className="w-2.5 md:w-3 h-2.5 md:h-3 text-white" />
            </div>
            <span>由 <span className="font-medium text-purple-300">{activity.author.full_name || activity.author.username}</span> 发起</span>
          </div>
        )}
      </div>

      {/* 活动描述 */}
      <p className="text-gray-300 text-xs md:text-sm mb-3 md:mb-5 line-clamp-2 md:line-clamp-3 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">{activity.description}</p>

      {/* 活动信息 */}
      <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 bg-black/10 rounded-xl p-3 md:p-4 border border-white/10">
        <div className="flex items-center text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
          <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mr-2 md:mr-3 border border-purple-400/20">
            <Calendar className="w-3 md:w-4 h-3 md:h-4 text-purple-300" />
          </div>
          <span className="text-xs md:text-sm font-medium">
            {formatDate(activity.start_date)}
          </span>
        </div>
        
        <div className="flex items-center text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
          <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mr-2 md:mr-3 border border-purple-400/20">
            <MapPin className="w-3 md:w-4 h-3 md:h-4 text-purple-300" />
          </div>
          <span className="text-xs md:text-sm font-medium">{activity.location}</span>
        </div>
        
        <div className="flex items-center text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
          <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mr-2 md:mr-3 border border-purple-400/20">
            <Users className="w-3 md:w-4 h-3 md:h-4 text-purple-300" />
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-xs md:text-sm font-medium">
              {participantCount}/{activity.max_participants} 人参加
            </span>
            {isActivityFull && (
              <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-gradient-to-r from-red-500/30 to-red-600/30 text-red-200 rounded-full text-xs font-medium border border-red-400/30 animate-pulse">
                已满
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
          <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mr-2 md:mr-3 border border-purple-400/20">
            <Clock className="w-3 md:w-4 h-3 md:h-4 text-purple-300" />
          </div>
          <span className={`text-xs md:text-sm font-medium ${
            activityStatus.status === '进行中' ? 'text-green-300' :
            activityStatus.status === '即将开始' ? 'text-blue-300' :
            'text-gray-400'
          }`}>
            状态：{activityStatus.status}
          </span>
        </div>
      </div>

      {/* 参与按钮 */}
      {!isActivityPast && (
        <button
          onClick={handleParticipation}
          disabled={isLoading || (!isParticipating && isActivityFull)}
          className={`relative w-full py-2 md:py-3 px-4 md:px-6 rounded-xl font-medium transition-all duration-300 overflow-hidden group/btn text-sm md:text-base ${
            isParticipating
              ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-200 border border-red-500/30 hover:from-red-500/30 hover:to-red-600/30 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/20'
              : isActivityFull
              ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-200 border border-purple-500/30 hover:from-purple-500/30 hover:to-purple-600/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="relative z-10">
            {isLoading
              ? '处理中...'
              : isParticipating
              ? '退出活动'
              : isActivityFull
              ? '活动已满'
              : '参加活动'
            }
          </span>
          {!isActivityFull && !isLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/10 to-purple-400/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
          )}
        </button>
      )}
      
      {/* 装饰性元素 */}
      <div className="absolute top-2 md:top-4 right-2 md:right-4 w-12 md:w-20 h-12 md:h-20 bg-gradient-to-br from-purple-500/5 to-purple-600/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 w-10 md:w-16 h-10 md:h-16 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    </div>
  );
};