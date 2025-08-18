import React, { useState, useEffect } from 'react';
import { Activity, ActivityService } from '../lib/activityService';
import { ActivityCard } from '../components/ActivityCard';
import { useLanguage } from '../contexts/language';
import { toast } from 'sonner';
import { usePageTitle } from '../hooks/usePageTitle';

const Activities = () => {
  const { t } = useLanguage();
  usePageTitle(t('activities.title'));
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedStatus, setSelectedStatus] = useState('全部');

  const categories = ['全部', '文化交流', '技术分享', '户外运动', '美食聚会', '学习交流', '娱乐活动', '志愿服务', '商务网络', '艺术创作', '其他'];
  const statusOptions = ['全部', '即将开始', '进行中', '已结束'];

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const activityService = new ActivityService();
      const data = await activityService.getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('加载活动失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取活动状态
  const getActivityStatus = (activity: Activity) => {
    const now = new Date();
    const startDate = new Date(activity.start_date);
    const endDate = new Date(activity.end_date);
    
    if (now < startDate) {
      return '即将开始';
    } else if (now >= startDate && now <= endDate) {
      return '进行中';
    } else {
      return '已结束';
    }
  };

  const handleParticipationChange = () => {
    loadActivities();
  };

  const filteredActivities = activities.filter(activity => {
    const categoryMatch = selectedCategory === '全部' || activity.category === selectedCategory;
    const statusMatch = selectedStatus === '全部' || getActivityStatus(activity) === selectedStatus;
    return categoryMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
            {t('activities.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('activities.subtitle')}
          </p>
        </div>



        {/* 活动筛选 */}
        <div className="mb-8 space-y-6">
          {/* 状态筛选 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">按状态筛选</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 backdrop-blur-sm rounded-full border transition-all duration-300 ${
                    selectedStatus === status
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg'
                      : 'bg-white/80 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          {/* 分类筛选 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">按分类筛选</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 backdrop-blur-sm rounded-full border transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-lg'
                      : 'bg-white/80 text-gray-600 border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300'
                  }`}
                >
                  {t(`activities.categories.${category}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 活动列表 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-gray-600 mt-4">{t('activities.loading')}</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              {selectedCategory === '全部' ? t('activities.noActivities') : `${t('activities.noActivitiesFor')}${selectedCategory}${t('activities.activities')}`}
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onParticipationChange={handleParticipationChange}
              />
            ))}
          </div>
        )}
      </div>


    </div>
  );
};

export default Activities;