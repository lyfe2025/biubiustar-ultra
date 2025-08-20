import React, { useState } from 'react';
import { apiCache } from '../services/apiCache';
import { socialService } from '../lib/socialService';
import { ActivityService } from '../lib/activityService';

const CacheTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSocialServiceCache = async () => {
    setLoading(true);
    addResult('开始测试社交服务缓存...');
    
    try {
      // 测试获取帖子点赞数
      const start1 = Date.now();
      await socialService.getPostLikesCount('test-post-id');
      const time1 = Date.now() - start1;
      addResult(`首次获取点赞数耗时: ${time1}ms`);
      
      // 再次获取相同数据（应该从缓存获取）
      const start2 = Date.now();
      await socialService.getPostLikesCount('test-post-id');
      const time2 = Date.now() - start2;
      addResult(`缓存获取点赞数耗时: ${time2}ms`);
      
      addResult(`缓存加速比: ${(time1 / time2).toFixed(2)}x`);
    } catch (error) {
      addResult(`社交服务测试失败: ${error}`);
    }
    
    setLoading(false);
  };

  const testActivityServiceCache = async () => {
    setLoading(true);
    addResult('开始测试活动服务缓存...');
    
    try {
      // 测试获取用户活动列表
      const start1 = Date.now();
      await ActivityService.getUserActivities('test-user-id');
      const time1 = Date.now() - start1;
      addResult(`首次获取用户活动列表耗时: ${time1}ms`);
      
      // 再次获取相同数据（应该从缓存获取）
      const start2 = Date.now();
      await ActivityService.getUserActivities('test-user-id');
      const time2 = Date.now() - start2;
      addResult(`缓存获取用户活动列表耗时: ${time2}ms`);
      
      addResult(`缓存加速比: ${(time1 / time2).toFixed(2)}x`);
    } catch (error) {
      addResult(`活动服务测试失败: ${error}`);
    }
    
    setLoading(false);
  };

  const testCacheStats = () => {
    const stats = apiCache.getStats();
    addResult(`缓存统计信息:`);
    addResult(`内存缓存条目: ${stats.memoryItems}`);
    addResult(`localStorage条目: ${stats.storageItems}`);
    addResult(`总缓存条目: ${stats.memoryItems + stats.storageItems}`);
  };

  const clearCache = () => {
    apiCache.clear();
    addResult('缓存已清空');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API 缓存测试</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">缓存功能测试</h2>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={testSocialServiceCache}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                测试社交服务缓存
              </button>
              
              <button
                onClick={testActivityServiceCache}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                测试活动服务缓存
              </button>
              
              <button
                onClick={testCacheStats}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                查看缓存统计
              </button>
              
              <button
                onClick={clearCache}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                清空缓存
              </button>
              
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                清空结果
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          
          <div className="bg-gray-100 rounded p-4 h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">点击上方按钮开始测试...</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">缓存优化说明</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• 社交服务缓存：点赞数(1分钟)、评论数(1分钟)、用户关注状态(2分钟)、用户资料(10分钟)</li>
            <li>• 活动服务缓存：活动列表(5分钟)、活动详情(10分钟)、参与状态(2分钟)、分类(15分钟)</li>
            <li>• 支持内存缓存和localStorage持久化缓存</li>
            <li>• 写操作会自动清除相关缓存，确保数据一致性</li>
            <li>• 定期清理过期缓存，优化内存使用</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CacheTest;