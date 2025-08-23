# 缓存管理路由模块化结构

本目录包含了原 `cache-management.ts` 文件分离后的模块化路由结构。

## 文件结构

```
cache-management/
├── index.ts              # 主路由文件，组合所有子模块
├── middleware.ts         # 中间件和工具函数
├── config.ts            # 配置管理相关路由
├── monitoring.ts        # 监控和统计相关路由
├── prewarming.ts        # 缓存预热相关路由
├── import-export.ts     # 配置导入导出相关路由
├── environment.ts       # 环境变量配置相关路由
├── events.ts            # 事件和通知相关路由
└── status.ts            # 系统状态相关路由
```

## 功能模块说明

### 1. middleware.ts
- 错误处理中间件 `handleError`
- 参数验证中间件 `validateInstanceType`

### 2. config.ts
- 获取所有缓存配置
- 获取特定实例配置
- 更新缓存配置
- 验证配置
- 重载缓存实例

### 3. monitoring.ts
- 性能报告
- 统计摘要
- 时间序列数据
- 性能趋势
- 异常检测
- 分析数据收集控制
- 分析统计信息

### 4. prewarming.ts
- 缓存预热
- 预热任务状态管理
- 批量操作（get/set/delete）

### 5. import-export.ts
- 配置导出（JSON/YAML/ENV/TypeScript）
- 配置导入
- 配置备份
- 备份恢复

### 6. environment.ts
- 环境变量配置获取
- 环境变量模板生成
- 环境覆盖历史

### 7. events.ts
- 事件历史
- 事件统计
- 事件监听器管理

### 8. status.ts
- 系统状态
- 健康检查

## 使用方法

在主应用中，只需要导入主路由文件：

```typescript
import cacheManagementRoutes from './routes/cache-management/index.js';
app.use('/api/cache-management', cacheManagementRoutes);
```

## 注意事项

1. 所有功能保持与原文件完全一致
2. 只是进行了代码分离，没有重构逻辑
3. 中间件和工具函数被提取到 `middleware.ts` 中复用
4. 每个模块都有清晰的职责分工
5. 主路由文件 `index.ts` 负责组合所有子模块

## 原文件备份

原 `cache-management.ts` 文件已备份为 `cache-management.ts.backup`，以防需要参考。
