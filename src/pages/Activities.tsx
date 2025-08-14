import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Activity, ActivityService } from '../lib/activityService';
import { ActivityCard } from '../components/ActivityCard';
import { CreateActivityModal } from '../components/CreateActivityModal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { usePageTitle } from '../hooks/usePageTitle';

const Activities = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  usePageTitle(t('activities.title'));
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const categories = ['全部', '文化交流', '技术分享', '户外运动', '美食聚会', '学习交流', '娱乐活动', '志愿服务', '商务网络', '艺术创作', '其他'];

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

  const handleActivityCreated = () => {
    loadActivities();
  };

  const handleParticipationChange = () => {
    loadActivities();
  };

  const filteredActivities = selectedCategory === '全部' 
    ? activities 
    : activities.filter(activity => activity.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('activities.title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('activities.subtitle')}
          </p>
        </div>

        {/* 创建活动按钮 */}
        {user && (
          <div className="text-center mb-8">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-purple-500/20 text-purple-200 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('activities.createActivity')}
            </button>
          </div>
        )}

        {/* 活动筛选 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 backdrop-blur-md rounded-full border transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-purple-500/30 text-purple-200 border-purple-500/50'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                {t(`activities.categories.${category}`)}
              </button>
            ))}
          </div>
        </div>

        {/* 活动列表 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <p className="text-gray-300 mt-4">{t('activities.loading')}</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 text-lg mb-4">
              {selectedCategory === '全部' ? t('activities.noActivities') : `${t('activities.noActivitiesFor')}${selectedCategory}${t('activities.activities')}`}
            </p>
            {user && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-purple-500/20 text-purple-200 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('activities.createFirstActivity')}
              </button>
            )}
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

      {/* 创建活动弹窗 */}
      <CreateActivityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onActivityCreated={handleActivityCreated}
      />
    </div>
  );
};

export default Activities;