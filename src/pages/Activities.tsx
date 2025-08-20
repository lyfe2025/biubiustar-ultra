import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/language';
import { ActivityService, ActivityCategory } from '../lib/activityService';
import { ActivityCard } from '../components/ActivityCard';
import { Activity, Category } from '../types';
import { useActivitiesPageData } from '../hooks/useOptimizedData';


const Activities: React.FC = () => {
  const { t, language } = useLanguage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedStatus, setSelectedStatus] = useState('全部');
  
  // 使用优化的数据获取Hook
  const {
    activities: optimizedActivities,
    categories: optimizedCategories,
    isLoading: optimizedLoading,
    error: optimizedError,
    refetch: optimizedRefetch
  } = useActivitiesPageData();

  // 硬编码分类作为降级处理
  const fallbackCategories = ['全部', '文化交流', '技术分享', '户外运动', '美食聚会', '学习交流', '娱乐活动', '志愿服务', '商务网络', '艺术创作', '其他'];
  const statusOptions = ['全部', '即将开始', '进行中', '已结束'];

  useEffect(() => {
    loadActivities();
    loadCategories();
  }, [language]);
  
  // 处理优化数据更新
  useEffect(() => {
    if (optimizedActivities && optimizedCategories && !optimizedLoading && !optimizedError) {
      console.log('🚀 Activities页面使用批量数据:', { activities: optimizedActivities, categories: optimizedCategories });
      setActivities(optimizedActivities || []);
      setCategories(optimizedCategories || []);
      setIsLoading(false);
      setIsCategoriesLoading(false);
    } else if (optimizedError) {
      console.warn('⚠️ 批量数据获取失败，降级到独立API调用:', optimizedError);
      // 降级到原有逻辑
      loadActivities();
      loadCategories();
    }
  }, [optimizedActivities, optimizedCategories, optimizedLoading, optimizedError]);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const activityService = new ActivityService();
      const data = await activityService.getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const data = await ActivityService.getActivityCategories(language);
      // 转换ActivityCategory到Category类型
      const categories: Category[] = data.map((cat: ActivityCategory) => ({
        ...cat,
        name_zh: cat.name_zh || cat.name,
        name_zh_tw: cat.name_zh_tw || cat.name,
        name_en: cat.name_en || cat.name,
        name_vi: cat.name_vi || cat.name,
        created_at: new Date().toISOString() // ActivityCategory没有created_at，使用当前时间
      }));
      setCategories(categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsCategoriesLoading(false);
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

  // 获取分类的本地化名称
  const getCategoryName = (category: Category, language: string) => {
    // 根据语言返回对应的本地化名称
    switch (language) {
      case 'zh':
        return category.name_zh || category.name || category.name_en || '未知分类';
      case 'en':
        return category.name_en || category.name || category.name_zh || 'Unknown Category';
      case 'zh-TW':
        return category.name_zh_tw || category.name_zh || category.name || category.name_en || '未知分類';
      case 'vi':
        return category.name_vi || category.name_en || category.name || category.name_zh || 'Danh mục không xác định';
      default:
        return category.name || category.name_zh || category.name_en || '未知分类';
    }
  };

  // 获取显示的分类列表（API分类 + 降级处理）
  const displayCategories = useMemo(() => {
    if (isCategoriesLoading) {
      return ['全部']; // 加载中只显示全部
    }
    
    if (categories.length > 0) {
      return ['全部', ...categories.map(cat => getCategoryName(cat, language))];
    }
    
    // 降级到硬编码分类
    return fallbackCategories;
  }, [categories, isCategoriesLoading, language, t]);

  const filteredActivities = activities.filter(activity => {
    let categoryMatch = selectedCategory === '全部';
    
    if (!categoryMatch) {
      // 如果有API分类数据，根据本地化名称匹配
      if (categories.length > 0) {
        const matchedCategory = categories.find(cat => getCategoryName(cat, language) === selectedCategory);
        categoryMatch = matchedCategory ? activity.category === matchedCategory.name : false;
      } else {
        // 降级到直接匹配
        categoryMatch = activity.category === selectedCategory;
      }
    }
    
    const statusMatch = selectedStatus === '全部' || getActivityStatus(activity) === selectedStatus;
    return categoryMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 relative overflow-hidden">
      
      
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 text-white pt-20 pb-12 md:pt-24 md:pb-24 overflow-hidden">
        {/* 动态背景效果 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-purple-800/90"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-8 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {t('activities.title')}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-purple-100 max-w-4xl mx-auto leading-relaxed">
              {t('activities.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">



        {/* 筛选器 */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-4 md:p-8 mb-8 md:mb-12 transform hover:scale-[1.02] transition-all duration-500">
            {/* 分类筛选 */}
            <div className="mb-6 md:mb-8">
              <div className="text-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
                  {t('activities.ui.filterByCategory')}
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto"></div>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
                {displayCategories.map((category, index) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`group relative px-3 md:px-6 py-2 md:py-3 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-sm md:text-base ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-xl shadow-purple-500/25'
                        : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-700 hover:border-purple-300 hover:shadow-lg'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="relative z-10 font-medium">
                      {category === '全部' ? t('activities.categories.全部') : category}
                    </span>
                    {selectedCategory !== category && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/10 group-hover:to-purple-600/10 rounded-2xl transition-all duration-300"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 状态筛选 */}
            <div>
              <div className="text-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
                  {t('activities.ui.filterByStatus')}
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto"></div>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
                {statusOptions.map((status, index) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`group relative px-3 md:px-6 py-2 md:py-3 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-sm md:text-base ${
                      selectedStatus === status
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-xl shadow-purple-500/25'
                        : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-700 hover:border-purple-300 hover:shadow-lg'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="relative z-10 font-medium">
                       {t(`activities.status.${status}`)}
                     </span>
                    {selectedStatus !== status && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/10 group-hover:to-purple-600/10 rounded-2xl transition-all duration-300"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 活动列表 */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-16 md:py-24">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 md:h-16 w-12 md:w-16 border-4 border-purple-200"></div>
                <div className="animate-spin rounded-full h-12 md:h-16 w-12 md:w-16 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-600 font-medium">{t('activities.ui.loading')}</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-16 md:py-24">
              <div className="relative inline-block">
                <div className="text-6xl md:text-8xl mb-4 md:mb-6 animate-bounce">🎯</div>
                <div className="absolute -top-2 -right-2 w-4 md:w-6 h-4 md:h-6 bg-purple-500 rounded-full animate-ping"></div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-4">{t('activities.ui.noMatchingActivities')}</h3>
              <p className="text-base md:text-lg text-gray-500 mb-6 md:mb-8 max-w-md mx-auto">{t('activities.ui.tryAdjustFilters')}</p>
              <button 
                onClick={() => {
                  setSelectedCategory('全部');
                  setSelectedStatus('全部');
                }}
                className="px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-medium hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base"
              >
{t('activities.ui.resetFilters')}
              </button>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
                  {t('activities.ui.foundActivities').replace('{count}', filteredActivities.length.toString())}
                </h2>
                <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
                {filteredActivities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="transform hover:scale-105 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ActivityCard
                      activity={activity}
                      onParticipationChange={handleParticipationChange}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default Activities;