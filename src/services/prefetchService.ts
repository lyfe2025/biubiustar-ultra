import { batchDataService, BatchRequest } from './batchDataService';
import { ActivityService } from '../lib/activityService';
import { socialService } from '../lib/socialService/index';

// 预取策略配置
interface PrefetchConfig {
  enabled: boolean;
  priority: 'high' | 'medium' | 'low';
  delay: number; // 延迟执行时间（毫秒）
  conditions?: () => boolean; // 执行条件
}

// 预取任务
interface PrefetchTask {
  id: string;
  name: string;
  requests: BatchRequest[];
  config: PrefetchConfig;
  lastExecuted?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

// 预取结果
interface PrefetchResult {
  taskId: string;
  success: boolean;
  duration: number;
  cacheHit: boolean;
  error?: string;
}

class PrefetchService {
  private tasks = new Map<string, PrefetchTask>();
  private results: PrefetchResult[] = [];
  private isInitialized = false;
  private prefetchQueue: string[] = [];
  private isProcessingQueue = false;

  /**
   * 初始化预取服务
   */
  initialize(): void {
    if (this.isInitialized) return;
    
    this.setupDefaultTasks();
    this.startQueueProcessor();
    this.isInitialized = true;
    
    console.log('数据预取服务已初始化');
  }

  /**
   * 设置默认的预取任务
   */
  private setupDefaultTasks(): void {
    // 首页数据预取
    this.registerTask({
      id: 'home_page_data',
      name: '首页数据预取',
      requests: [
        {
          type: 'posts',
          endpoint: '/api/posts',
          params: { limit: 3 },
          id: 'home_posts'
        },
        {
          type: 'activities',
          endpoint: '/api/activities/upcoming',
          params: { limit: 2 },
          id: 'home_activities'
        }
      ],
      config: {
        enabled: true,
        priority: 'high',
        delay: 0,
        conditions: () => this.isOnHomePage()
      },
      status: 'pending'
    });

    // 活动页面数据预取
    this.registerTask({
      id: 'activities_page_data',
      name: '活动页面数据预取',
      requests: [
        {
          type: 'activities',
          endpoint: '/api/activities',
          params: { page: 1, limit: 10 },
          id: 'activities_list'
        },
        {
          type: 'categories',
          endpoint: '/api/categories/activities',
          params: { type: 'activities' },
          id: 'activity_categories'
        }
      ],
      config: {
        enabled: true,
        priority: 'medium',
        delay: 100,
        conditions: () => this.isOnActivitiesPage()
      },
      status: 'pending'
    });

    // 帖子详情页数据预取
    this.registerTask({
      id: 'post_detail_categories',
      name: '帖子详情页分类预取',
      requests: [
        {
          type: 'categories',
          endpoint: '/api/categories/content',
          params: { type: 'content' },
          id: 'content_categories'
        }
      ],
      config: {
        enabled: true,
        priority: 'medium',
        delay: 200,
        conditions: () => this.isOnPostDetailPage()
      },
      status: 'pending'
    });

    // 用户相关数据预取（当用户登录时）
    this.registerTask({
      id: 'user_related_data',
      name: '用户相关数据预取',
      requests: [
        {
          type: 'posts',
          endpoint: '/api/posts',
          params: { limit: 10 },
          id: 'recent_posts'
        },
        {
          type: 'activities',
          endpoint: '/api/activities/upcoming',
          params: { limit: 5 },
          id: 'upcoming_activities'
        }
      ],
      config: {
        enabled: true,
        priority: 'low',
        delay: 1000,
        conditions: () => this.isUserLoggedIn()
      },
      status: 'pending'
    });
  }

  /**
   * 注册预取任务
   */
  registerTask(task: PrefetchTask): void {
    this.tasks.set(task.id, {
      ...task,
      status: 'pending'
    });
  }

  /**
   * 触发预取任务
   */
  async triggerPrefetch(taskId: string, force = false): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      console.warn(`预取任务不存在: ${taskId}`);
      return;
    }

    // 检查是否需要执行
    if (!force && !this.shouldExecuteTask(task)) {
      return;
    }

    // 添加到队列
    if (!this.prefetchQueue.includes(taskId)) {
      this.prefetchQueue.push(taskId);
    }
  }

  /**
   * 批量触发预取任务
   */
  async triggerMultiplePrefetch(taskIds: string[]): Promise<void> {
    for (const taskId of taskIds) {
      await this.triggerPrefetch(taskId);
    }
  }

  /**
   * 根据页面路由自动触发相关预取
   */
  async triggerByRoute(route: string): Promise<void> {
    const routeTaskMap: Record<string, string[]> = {
      '/': ['home_page_data'],
      '/home': ['home_page_data'],
      '/activities': ['activities_page_data'],
      '/posts': ['user_related_data'],
      '/post': ['post_detail_categories']
    };

    const exactMatch = routeTaskMap[route];
    if (exactMatch) {
      await this.triggerMultiplePrefetch(exactMatch);
      return;
    }

    // 模糊匹配
    for (const [routePattern, taskIds] of Object.entries(routeTaskMap)) {
      if (route.startsWith(routePattern)) {
        await this.triggerMultiplePrefetch(taskIds);
        break;
      }
    }
  }

  /**
   * 为特定帖子预取详情数据
   */
  async prefetchPostDetails(postId: string, userId?: string): Promise<void> {
    const taskId = `post_detail_${postId}`;
    
    const task: PrefetchTask = {
      id: taskId,
      name: `帖子${postId}详情预取`,
      requests: [
        {
          type: 'post_details',
          endpoint: `/api/posts/${postId}`,
          params: { postId, userId },
          id: `post_${postId}_details`
        },
        {
          type: 'comments',
          endpoint: `/api/posts/${postId}/comments`,
          params: { postId },
          id: `post_${postId}_comments`
        }
      ],
      config: {
        enabled: true,
        priority: 'high',
        delay: 0
      },
      status: 'pending'
    };

    this.registerTask(task);
    await this.triggerPrefetch(taskId, true);
  }

  /**
   * 智能预取：基于用户行为预测
   */
  async smartPrefetch(context: {
    currentPage: string;
    userActions: string[];
    timeOnPage: number;
  }): Promise<void> {
    const { currentPage, userActions, timeOnPage } = context;

    // 如果用户在首页停留超过3秒，预取活动页面数据
    if (currentPage === '/' && timeOnPage > 3000) {
      await this.triggerPrefetch('activities_page_data');
    }

    // 如果用户在浏览帖子列表，预取热门帖子的详情
    if (currentPage.includes('/posts') && userActions.includes('scroll')) {
      // 这里可以根据实际需求实现更复杂的预测逻辑
      await this.triggerPrefetch('user_related_data');
    }

    // 如果用户频繁查看活动，预取相关数据
    if (userActions.filter(action => action.includes('activity')).length > 2) {
      await this.triggerPrefetch('activities_page_data');
    }
  }

  /**
   * 队列处理器
   */
  private async startQueueProcessor(): Promise<void> {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    
    while (true) {
      if (this.prefetchQueue.length === 0) {
        await this.sleep(100);
        continue;
      }

      const taskId = this.prefetchQueue.shift()!;
      await this.executeTask(taskId);
      
      // 避免过于频繁的请求
      await this.sleep(50);
    }
  }

  /**
   * 执行预取任务
   */
  private async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const startTime = Date.now();
    task.status = 'running';

    try {
      // 应用延迟
      if (task.config.delay > 0) {
        await this.sleep(task.config.delay);
      }

      // 执行批量请求
      const results = await batchDataService.batchFetch(task.requests, {
        useCache: true,
        fallbackToIndividual: true
      });

      const duration = Date.now() - startTime;
      const hasErrors = results.some(r => r.error);
      const cacheHit = results.some(r => r.cached);

      task.status = hasErrors ? 'failed' : 'completed';
      task.lastExecuted = Date.now();

      // 记录结果
      this.results.push({
        taskId,
        success: !hasErrors,
        duration,
        cacheHit,
        error: hasErrors ? results.find(r => r.error)?.error : undefined
      });

      // 只保留最近50条结果
      if (this.results.length > 50) {
        this.results.shift();
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`预取任务完成: ${task.name}`, {
          duration,
          cacheHit,
          hasErrors
        });
      }

    } catch (error) {
      task.status = 'failed';
      console.error(`预取任务失败: ${task.name}`, error);
      
      this.results.push({
        taskId,
        success: false,
        duration: Date.now() - startTime,
        cacheHit: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 判断是否应该执行任务
   */
  private shouldExecuteTask(task: PrefetchTask): boolean {
    // 检查是否启用
    if (!task.config.enabled) return false;
    
    // 检查执行条件
    if (task.config.conditions && !task.config.conditions()) return false;
    
    // 检查是否正在运行
    if (task.status === 'running') return false;
    
    // 检查最近是否已执行（避免重复执行）
    if (task.lastExecuted) {
      const timeSinceLastExecution = Date.now() - task.lastExecuted;
      const minInterval = this.getMinIntervalByPriority(task.config.priority);
      if (timeSinceLastExecution < minInterval) return false;
    }
    
    return true;
  }

  /**
   * 根据优先级获取最小执行间隔
   */
  private getMinIntervalByPriority(priority: string): number {
    switch (priority) {
      case 'high': return 30 * 1000; // 30秒
      case 'medium': return 60 * 1000; // 1分钟
      case 'low': return 300 * 1000; // 5分钟
      default: return 60 * 1000;
    }
  }

  /**
   * 页面检测方法
   */
  private isOnHomePage(): boolean {
    return window.location.pathname === '/' || window.location.pathname === '/home';
  }

  private isOnActivitiesPage(): boolean {
    return window.location.pathname.includes('/activities');
  }

  private isOnPostDetailPage(): boolean {
    return window.location.pathname.includes('/post/');
  }

  private isUserLoggedIn(): boolean {
    // 这里需要根据实际的认证状态检查逻辑
    return localStorage.getItem('auth_token') !== null;
  }

  /**
   * 工具方法
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取预取统计信息
   */
  getStats() {
    const recentResults = this.results.slice(-20);
    
    if (recentResults.length === 0) {
      return {
        totalTasks: this.tasks.size,
        queueLength: this.prefetchQueue.length,
        recentExecutions: 0,
        successRate: 0,
        avgDuration: 0,
        cacheHitRate: 0
      };
    }
    
    const successCount = recentResults.filter(r => r.success).length;
    const cacheHitCount = recentResults.filter(r => r.cacheHit).length;
    const avgDuration = recentResults.reduce((sum, r) => sum + r.duration, 0) / recentResults.length;
    
    return {
      totalTasks: this.tasks.size,
      queueLength: this.prefetchQueue.length,
      recentExecutions: recentResults.length,
      successRate: successCount / recentResults.length,
      avgDuration,
      cacheHitRate: cacheHitCount / recentResults.length
    };
  }

  /**
   * 启用/禁用特定任务
   */
  setTaskEnabled(taskId: string, enabled: boolean): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.config.enabled = enabled;
    }
  }

  /**
   * 清除所有预取缓存
   */
  clearCache(): void {
    batchDataService.clearCache();
  }

  /**
   * 重置预取服务
   */
  reset(): void {
    this.prefetchQueue.length = 0;
    this.results.length = 0;
    this.tasks.clear();
    this.setupDefaultTasks();
  }
}

// 导出单例实例
export const prefetchService = new PrefetchService();
export default prefetchService;