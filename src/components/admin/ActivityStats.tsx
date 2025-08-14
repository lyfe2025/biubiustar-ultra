import React, { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/language';
import { adminService, AdminActivity } from '../../services/AdminService';

interface ActivityStatsData {
  totalActivities: number;
  activeActivities: number;
  completedActivities: number;
  totalParticipants: number;
  upcomingActivities: number;
  popularActivities: number;
}

interface ActivityStatsProps {
  activities: AdminActivity[];
  refreshTrigger?: number;
}

const ActivityStats: React.FC<ActivityStatsProps> = ({ activities, refreshTrigger }) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<ActivityStatsData>({
    totalActivities: 0,
    activeActivities: 0,
    completedActivities: 0,
    totalParticipants: 0,
    upcomingActivities: 0,
    popularActivities: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStats();
      setStats({
        totalActivities: data.totalActivities || 0,
        activeActivities: data.activeActivities || 0,
        completedActivities: 0, // DashboardStats中没有此字段，使用默认值
        totalParticipants: 0, // DashboardStats中没有此字段，使用默认值
        upcomingActivities: data.upcomingActivities || 0,
        popularActivities: 0 // 改为数字类型
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      // 如果获取失败，使用默认值
      setStats({
        totalActivities: 0,
        activeActivities: 0,
        completedActivities: 0,
        totalParticipants: 0,
        upcomingActivities: 0,
        popularActivities: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t('admin.activities.totalActivities'),
      value: stats.totalActivities,
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: t('admin.activities.activeActivities'),
      value: stats.activeActivities,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: t('admin.activities.completedActivities'),
      value: stats.completedActivities,
      icon: Clock,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600'
    },
    {
      title: t('admin.activities.totalParticipants'),
      value: stats.totalParticipants,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityStats;