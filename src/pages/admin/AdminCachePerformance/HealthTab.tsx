/**
 * 缓存健康监控标签页组件
 * 显示缓存健康状态、失效频率分析和优化建议
 */

import React, { useState, useCallback } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  RotateCcw,
  Activity,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { useCacheHealth, type HealthReport, type StatsOverview } from '../../../hooks/useCacheHealth';

interface HealthTabProps {
  // 可以接收外部传入的缓存类型选择等参数
  selectedCacheType?: string;
  onCacheTypeChange?: (cacheType: string) => void;
}

const HealthTab: React.FC<HealthTabProps> = ({
  selectedCacheType = 'all',
  onCacheTypeChange
}) => {
  const {
    healthData,
    overview,
    loading,
    error,
    refresh,
    reset,
    isAutoRefreshEnabled,
    startAutoRefresh,
    stopAutoRefresh
  } = useCacheHealth();

  // 刷新成功状态
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  // 增强的刷新函数，添加成功反馈
  const handleRefresh = useCallback(async () => {
    try {
      await refresh();
      setRefreshSuccess(true);
      // 3秒后隐藏成功提示
      setTimeout(() => {
        setRefreshSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('刷新失败:', error);
    }
  }, [refresh]);

  // 调试日志
  React.useEffect(() => {
    console.log('🔍 [HealthTab] 组件渲染，数据状态:', {
      healthData: healthData ? {
        totalInvalidations: healthData.totalInvalidations,
        highImpactKeysCount: healthData.highImpactKeys?.length,
        healthScore: healthData.healthScore,
        recommendationsCount: healthData.recommendations?.length,
        hasData: !!healthData
      } : null,
      overview: overview ? {
        totalKeys: overview.totalKeys,
        highImpactCount: overview.highImpactCount,
        hasOverview: !!overview
      } : null,
      loading,
      error,
      componentMounted: true
    });
  }, [healthData, overview, loading, error]);

  // 添加页面调试信息显示
  const debugInfo = {
    loading,
    error: error?.toString() || null,
    hasHealthData: !!healthData,
    hasOverview: !!overview,
    healthScore: healthData?.healthScore,
    totalInvalidations: healthData?.totalInvalidations,
    highImpactKeysCount: healthData?.highImpactKeys?.length || 0,
    recommendationsCount: healthData?.recommendations?.length || 0
  };

  // 添加组件挂载调试
  React.useEffect(() => {
    console.log('🚀 [HealthTab] 组件已挂载，开始初始化');
    return () => {
      console.log('🔄 [HealthTab] 组件即将卸载');
    };
  }, []);

  /**
   * 获取健康评分的颜色和图标
   */
  const getHealthScoreDisplay = (score: number) => {
    if (score >= 80) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: CheckCircle,
        label: '健康'
      };
    } else if (score >= 60) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: AlertTriangle,
        label: '警告'
      };
    } else {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: AlertTriangle,
        label: '危险'
      };
    }
  };

  /**
   * 获取建议的优先级颜色
   */
  const getRecommendationColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  /**
   * 获取建议的图标
   */
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      case 'success':
        return CheckCircle;
      default:
        return Info;
    }
  };

  /**
   * 格式化时间戳
   */
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  /**
   * 格式化频率显示 - 修复NaN问题
   */
  const formatFrequency = (frequency: number | undefined | null) => {
    // 处理无效值
    if (frequency === undefined || frequency === null || isNaN(frequency) || frequency === 0) {
      return '0/分钟';
    }

    // 确保frequency是有效数字
    const validFrequency = Number(frequency);
    if (isNaN(validFrequency)) {
      return '0/分钟';
    }

    if (validFrequency < 1) {
      return `${(validFrequency * 60).toFixed(1)}/分钟`;
    } else if (validFrequency < 60) {
      return `${validFrequency.toFixed(1)}/秒`;
    } else {
      return `${(validFrequency / 60).toFixed(1)}/分钟`;
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <h3 className="text-lg font-medium text-red-800">加载失败</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          重试
        </button>
      </div>
    );
  }

  // 显示加载状态
  if (loading && !healthData) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mr-3" />
            <span className="text-lg text-gray-600">正在加载缓存健康数据...</span>
          </div>
        </div>
      </div>
    );
  }

  // 如果没有数据且不在加载中，显示空状态
  if (!loading && !healthData) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无缓存健康数据</h3>
            <p className="text-gray-500 mb-4">请点击刷新按钮获取最新的缓存健康监控数据</p>
            <button
              onClick={refresh}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              获取数据
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 调试信息显示 */}


      {/* 控制面板 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">缓存健康监控</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={isAutoRefreshEnabled ? stopAutoRefresh : startAutoRefresh}
              className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isAutoRefreshEnabled
                  ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-purple-500'
              }`}
            >
              <Activity className={`h-4 w-4 mr-2 ${isAutoRefreshEnabled ? 'animate-pulse' : ''}`} />
              {isAutoRefreshEnabled ? '停止自动刷新' : '启动自动刷新'}
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 ${
                refreshSuccess 
                  ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-purple-500'
              }`}
            >
              <RefreshCw className={`h-4 w-4 mr-2 transition-transform duration-200 ${
                loading ? 'animate-spin' : refreshSuccess ? 'text-green-600' : ''
              }`} />
              {loading ? '刷新中...' : refreshSuccess ? '刷新成功!' : '手动刷新'}
            </button>
            
            <button
              onClick={reset}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              重置统计
            </button>
          </div>
        </div>
        
        {/* 自动刷新状态提示 */}
        {isAutoRefreshEnabled && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-green-600 mr-2 animate-pulse" />
              <span className="text-sm text-green-700">自动刷新已启用，每30秒更新一次数据</span>
            </div>
          </div>
        )}

        {/* 刷新成功提示 */}
        {refreshSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 animate-pulse">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm text-green-700">数据刷新成功！缓存健康状态已更新</span>
            </div>
          </div>
        )}
      </div>

      {/* 调试信息 */}


      {/* 健康概览 */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 健康评分 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              {(() => {
                const { color, bgColor, icon: Icon, label } = getHealthScoreDisplay(healthData.healthScore);
                return (
                  <>
                    <div className={`${bgColor} rounded-full p-2 mr-3`}>
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">健康评分</p>
                      <p className={`text-2xl font-bold ${color}`}>{healthData.healthScore}</p>
                      <p className={`text-sm ${color}`}>{label}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* 总失效次数 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">总失效次数</p>
                <p className="text-2xl font-bold text-gray-900">{healthData.totalInvalidations}</p>
              </div>
            </div>
          </div>

          {/* 平均失效频率 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-2 mr-3">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">平均失效频率</p>
                <p className="text-2xl font-bold text-gray-900">{formatFrequency(healthData.averageFrequency)}</p>
              </div>
            </div>
          </div>

          {/* 高影响键数量 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-full p-2 mr-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">高影响键</p>
                <p className="text-2xl font-bold text-gray-900">{healthData.highImpactKeys?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 统计概览 */}
      {overview && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">统计概览</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{overview.totalKeys}</p>
              <p className="text-sm text-gray-500">总键数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{overview.highImpactCount}</p>
              <p className="text-sm text-gray-500">高影响</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{overview.mediumImpactCount}</p>
              <p className="text-sm text-gray-500">中影响</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{overview.lowImpactCount}</p>
              <p className="text-sm text-gray-500">低影响</p>
            </div>
          </div>
        </div>
      )}

      {/* 高影响键列表 */}
      {healthData && healthData.highImpactKeys && healthData.highImpactKeys.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">高影响缓存键</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">缓存键</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">失效频率</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">失效次数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">影响级别</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后失效</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {healthData.highImpactKeys?.map((key, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{key.key}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFrequency(key.frequency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {key.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        key.impact === 'high' ? 'bg-red-100 text-red-800' :
                        key.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {key.impact === 'high' ? '高' : key.impact === 'medium' ? '中' : '低'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTimestamp(new Date(key.lastInvalidation).toISOString())}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 优化建议 */}
      {healthData && healthData.recommendations && healthData.recommendations.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">优化建议</h3>
          <div className="space-y-4">
            {healthData.recommendations?.map((recommendation, index) => {
              const Icon = getRecommendationIcon(recommendation.type);
              return (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getRecommendationColor(recommendation.priority)}`}
                >
                  <div className="flex items-start">
                    <Icon className={`h-5 w-5 mr-3 mt-0.5 ${
                      recommendation.type === 'warning' ? 'text-yellow-600' :
                      recommendation.type === 'success' ? 'text-green-600' :
                      'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{recommendation.message}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                          recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {recommendation.priority === 'high' ? '高优先级' :
                           recommendation.priority === 'medium' ? '中优先级' : '低优先级'}
                        </span>
                      </div>
                      {recommendation.keys && recommendation.keys.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">相关缓存键:</p>
                          <div className="flex flex-wrap gap-1">
                            {recommendation.keys.map((key, keyIndex) => (
                              <code key={keyIndex} className="bg-white px-2 py-1 rounded text-xs text-gray-700">
                                {key}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 最后更新时间 */}
      {healthData && (
        <div className="text-center text-sm text-gray-500">
          最后更新: {formatTimestamp(healthData.timestamp)}
        </div>
      )}
    </div>
  );
};

export default HealthTab;