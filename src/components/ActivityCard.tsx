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

  const isActivityFull = participantCount >= activity.max_participants;
  const isActivityPast = new Date(activity.start_date) < new Date();

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
      {/* 活动图片 */}
      {activity.image_url && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={activity.image_url}
            alt={activity.title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* 活动标题和分类 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-white">{activity.title}</h3>
          <span className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm">
            {activity.category}
          </span>
        </div>
        
        {/* 作者信息 */}
        {activity.author && (
          <div className="flex items-center text-gray-300 text-sm mb-2">
            <User className="w-4 h-4 mr-1" />
            <span>由 {activity.author.full_name || activity.author.username} 发起</span>
          </div>
        )}
      </div>

      {/* 活动描述 */}
      <p className="text-gray-300 mb-4 line-clamp-3">{activity.description}</p>

      {/* 活动信息 */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-300">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {formatDate(activity.start_date)}
          </span>
        </div>
        
        <div className="flex items-center text-gray-300">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-sm">{activity.location}</span>
        </div>
        
        <div className="flex items-center text-gray-300">
          <Users className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {participantCount}/{activity.max_participants} 人参加
          </span>
          {isActivityFull && (
            <span className="ml-2 px-2 py-1 bg-red-500/30 text-red-200 rounded text-xs">
              已满
            </span>
          )}
        </div>
        
        {isActivityPast && (
          <div className="flex items-center text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm">活动已结束</span>
          </div>
        )}
      </div>

      {/* 参与按钮 */}
      {!isActivityPast && (
        <button
          onClick={handleParticipation}
          disabled={isLoading || (!isParticipating && isActivityFull)}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            isParticipating
              ? 'bg-red-500/20 text-red-200 border border-red-500/30 hover:bg-red-500/30'
              : isActivityFull
              ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
              : 'bg-purple-500/20 text-purple-200 border border-purple-500/30 hover:bg-purple-500/30'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading
            ? '处理中...'
            : isParticipating
            ? '退出活动'
            : isActivityFull
            ? '活动已满'
            : '参加活动'
          }
        </button>
      )}
    </div>
  );
};