/**
 * 批量调度器
 * 
 * 负责管理预热任务的调度、队列管理和并发控制
 */

import { PrewarmTask, ScheduleConfig } from './types';
import { cacheEventNotification, CacheEventType, EventSeverity } from '../../CacheEventNotification';

export class BatchScheduler {
  private taskQueue: string[] = [];
  private runningTasks: Set<string> = new Set();
  private tasks: Map<string, PrewarmTask> = new Map();
  private config: ScheduleConfig;
  private isRunning = false;
  private scheduleTimer?: NodeJS.Timeout;

  constructor(config: Partial<ScheduleConfig> = {}) {
    this.config = {
      maxConcurrentTasks: 3,
      taskTimeout: 300000, // 5分钟
      retryAttempts: 3,
      retryDelay: 5000, // 5秒
      ...config
    };
  }

  /**
   * 添加任务到队列
   */
  public addTask(task: PrewarmTask): void {
    this.tasks.set(task.id, task);
    this.taskQueue.push(task.id);
    
    if (this.isRunning) {
      this.processQueue();
    }
  }

  /**
   * 开始调度
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.processQueue();
    
    // 定期检查任务状态
    this.scheduleTimer = setInterval(() => {
      this.checkTaskTimeouts();
      this.processQueue();
    }, 5000);
  }

  /**
   * 停止调度
   */
  public stop(): void {
    this.isRunning = false;
    
    if (this.scheduleTimer) {
      clearInterval(this.scheduleTimer);
      this.scheduleTimer = undefined;
    }

    // 取消所有运行中的任务
    for (const taskId of this.runningTasks) {
      const task = this.tasks.get(taskId);
      if (task && task.status === 'running') {
        task.status = 'cancelled';
      }
    }
    
    this.runningTasks.clear();
  }

  /**
   * 处理任务队列
   */
  private async processQueue(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    // 检查是否可以启动新任务
    while (
      this.runningTasks.size < this.config.maxConcurrentTasks &&
      this.taskQueue.length > 0
    ) {
      const taskId = this.taskQueue.shift();
      if (!taskId) {
        break;
      }

      const task = this.tasks.get(taskId);
      if (!task || task.status !== 'pending') {
        continue;
      }

      await this.startTask(task);
    }
  }

  /**
   * 启动任务
   */
  private async startTask(task: PrewarmTask): Promise<void> {
    try {
      task.status = 'running';
      task.startTime = new Date();
      this.runningTasks.add(task.id);

      await cacheEventNotification.emitEvent(CacheEventType.CACHE_CLEANUP_STARTED, {
        timestamp: new Date(),
        severity: EventSeverity.INFO,
        source: 'BatchScheduler',
        message: `Starting prewarming task ${task.id}`,
        metadata: { taskId: task.id, itemCount: task.items.length }
      });

      // 这里应该调用实际的预热执行逻辑
      // 由于需要与CachePrewarmingBatch解耦，这里只是标记任务开始
      // 实际执行由外部调用者负责
      
    } catch (error) {
      await this.handleTaskError(task, error as Error);
    }
  }

  /**
   * 完成任务
   */
  public completeTask(taskId: string, success: boolean, error?: Error): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      return;
    }

    task.endTime = new Date();
    this.runningTasks.delete(taskId);

    if (success) {
      task.status = 'completed';
    } else {
      task.status = 'failed';
      if (error) {
        this.handleTaskError(task, error);
      }
    }

    // 继续处理队列
    if (this.isRunning) {
      this.processQueue();
    }
  }

  /**
   * 取消任务
   */
  public cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    if (task.status === 'pending') {
      // 从队列中移除
      const index = this.taskQueue.indexOf(taskId);
      if (index > -1) {
        this.taskQueue.splice(index, 1);
      }
    } else if (task.status === 'running') {
      // 标记为取消
      this.runningTasks.delete(taskId);
    }

    task.status = 'cancelled';
    task.endTime = new Date();
    
    return true;
  }

  /**
   * 获取任务状态
   */
  public getTask(taskId: string): PrewarmTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 获取所有任务
   */
  public getAllTasks(): PrewarmTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 获取队列状态
   */
  public getQueueStatus(): {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  } {
    const tasks = Array.from(this.tasks.values());
    
    return {
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length
    };
  }

  /**
   * 检查任务超时
   */
  private checkTaskTimeouts(): void {
    const now = Date.now();
    
    for (const taskId of this.runningTasks) {
      const task = this.tasks.get(taskId);
      if (!task || !task.startTime) {
        continue;
      }

      const runningTime = now - task.startTime.getTime();
      if (runningTime > this.config.taskTimeout) {
        // 任务超时
        task.status = 'failed';
        task.endTime = new Date();
        this.runningTasks.delete(taskId);

        cacheEventNotification.emitError({
          source: 'BatchScheduler',
          message: `Task ${taskId} timed out after ${runningTime}ms`,
          error: new Error('Task timeout'),
          metadata: { taskId, runningTime, timeout: this.config.taskTimeout }
        });
      }
    }
  }

  /**
   * 处理任务错误
   */
  private async handleTaskError(task: PrewarmTask, error: Error): Promise<void> {
    await cacheEventNotification.emitError({
      source: 'BatchScheduler',
      message: `Task ${task.id} failed`,
      error,
      metadata: { taskId: task.id, itemCount: task.items.length }
    });
  }

  /**
   * 清理已完成的任务
   */
  public cleanupCompletedTasks(olderThanMs: number = 3600000): number {
    const cutoffTime = Date.now() - olderThanMs;
    let cleaned = 0;

    for (const [taskId, task] of this.tasks) {
      if (
        (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') &&
        task.endTime &&
        task.endTime.getTime() < cutoffTime
      ) {
        this.tasks.delete(taskId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<ScheduleConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取统计信息
   */
  public getStatistics(): {
    totalTasks: number;
    queueLength: number;
    runningTasks: number;
    maxConcurrentTasks: number;
    averageTaskDuration: number;
  } {
    const tasks = Array.from(this.tasks.values());
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.startTime && t.endTime);
    
    const averageTaskDuration = completedTasks.length > 0
      ? completedTasks.reduce((sum, task) => {
          const duration = task.endTime!.getTime() - task.startTime!.getTime();
          return sum + duration;
        }, 0) / completedTasks.length
      : 0;

    return {
      totalTasks: tasks.length,
      queueLength: this.taskQueue.length,
      runningTasks: this.runningTasks.size,
      maxConcurrentTasks: this.config.maxConcurrentTasks,
      averageTaskDuration
    };
  }

  /**
   * 销毁调度器
   */
  public destroy(): void {
    this.stop();
    this.tasks.clear();
    this.taskQueue = [];
    this.runningTasks.clear();
  }
}