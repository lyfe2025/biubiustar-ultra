import React, { useState, useEffect } from 'react';
import { ActivityService, ActivityCategory } from '../lib/activityService';
import { useLanguage } from '../contexts/language';

const TestCategories = () => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('🧪 测试页面: 开始加载分类...');
        const data = await ActivityService.getActivityCategories(language);
        console.log('🧪 测试页面: 获取到的数据:', data);
        console.log('🧪 测试页面: 数据类型:', typeof data);
        console.log('🧪 测试页面: 是否为数组:', Array.isArray(data));
        console.log('🧪 测试页面: 数组长度:', data?.length);
        
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error('🧪 测试页面: 加载失败:', err);
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [language]);

  useEffect(() => {
    console.log('🧪 测试页面: categories状态更新:', categories);
    console.log('🧪 测试页面: categories长度:', categories.length);
  }, [categories]);

  if (loading) {
    return <div className="p-8">加载中...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">错误: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">分类测试页面</h1>
      <p className="mb-4">获取到 {categories.length} 个分类:</p>
      <div className="grid gap-2">
        {categories.map((category, index) => (
          <div key={category.id || index} className="p-2 border rounded">
            <div className="font-medium">{category.name}</div>
            <div className="text-sm text-gray-600">{category.description}</div>
            <div className="text-xs text-gray-400">ID: {category.id}</div>
          </div>
        ))}
      </div>
      {categories.length === 0 && (
        <div className="text-yellow-600">没有获取到任何分类数据</div>
      )}
    </div>
  );
};

export default TestCategories;