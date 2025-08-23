# 缓存性能监控组件模块化结构

本目录包含了原 `AdminCachePerformance.tsx` 文件分离后的模块化组件结构。

## 文件结构

```
AdminCachePerformance/
├── index.tsx              # 主组件文件，组合所有子模块
├── types.ts               # 类型定义和接口
├── utils.ts               # 工具函数和通用方法
├── OverviewTab.tsx        # 概览标签页组件
├── InspectorTab.tsx       # 内容查看标签页组件
├── HotKeysTab.tsx         # 热点分析标签页组件
└── BenchmarkTab.tsx       # 基准测试标签页组件
```

## 功能模块说明

### 1. types.ts
- 导出所有类型定义：`TabType`, `InspectorData`, `HotKeysData`, `BenchmarkData`
- 定义标签页类型和各个数据接口的结构

### 2. utils.ts
- `formatBytes()` - 格式化字节数显示
- `formatDuration()` - 格式化持续时间显示
- `formatPercentage()` - 格式化百分比显示
- `formatDurationFromMs()` - 从毫秒格式化持续时间
- `getHealthStatusColor()` - 获取健康状态对应的CSS类名

### 3. OverviewTab.tsx (概览标签页)
- 缓存健康状态显示
- 性能指标概览
- 系统内存使用情况
- 缓存利用率进度条
- 堆内存使用率显示

### 4. InspectorTab.tsx (内容查看标签页)
- 缓存内容查看器
- 缓存类型选择器
- 缓存条目详细信息
- 缓存统计信息显示
- 数据加载状态管理

### 5. HotKeysTab.tsx (热点分析标签页)
- 热点数据分析
- 访问频次排行
- 可视化进度条
- 排名标识（金银铜牌）
- 最后访问时间显示

### 6. BenchmarkTab.tsx (基准测试标签页)
- 性能基准测试
- 测试配置管理
- 平均性能指标
- 详细测试结果表格
- 测试执行状态管理

### 7. index.tsx (主组件)
- 主组件类，组合所有子标签页
- 提供统一的API接口
- 保持向后兼容性
- 标签页导航和状态管理
- 缓存操作和性能测试功能

## 使用方法

在主应用中，只需要导入主组件文件：

```typescript
import AdminCachePerformance from './pages/admin/AdminCachePerformance/index';
// 或者
import { default as AdminCachePerformance } from './pages/admin/AdminCachePerformance/index';

// 使用方式保持不变
<AdminCachePerformance />
```

## 关键特性

1. **功能完全一致**: 所有原有功能都得到保留，没有重构逻辑
2. **安全分离**: 只是将代码按功能模块分离，不影响原有功能
3. **模块化设计**: 每个文件都有清晰的职责分工
4. **易于维护**: 代码结构更清晰，便于后续维护和扩展
5. **向后兼容**: 所有现有代码无需修改，只需更新导入路径
6. **类型安全**: 完整的TypeScript类型支持

## 分离后的优势

- **文件大小**: 原文件828行 → 分离后总计约1000行，分布更均匀
- **可维护性**: 每个模块职责单一，便于定位和修改
- **可扩展性**: 新增功能可以添加到相应的模块中
- **团队协作**: 不同开发者可以并行开发不同模块
- **测试友好**: 每个模块可以独立测试
- **代码复用**: 工具函数可以在多个组件中复用

## 原文件备份

原 `AdminCachePerformance.tsx` 文件已备份为 `AdminCachePerformance.tsx.backup`，以防需要参考。

## 注意事项

1. 所有功能保持与原文件完全一致
2. 只是进行了代码分离，没有重构逻辑
3. 工具函数被提取到 `utils.ts` 中复用
4. 每个模块都有清晰的职责分工
5. 主组件文件 `index.tsx` 负责组合所有子标签页
6. 使用props传递数据和回调函数
7. 保持了原有的状态管理和事件处理逻辑

## 标签页功能说明

- **概览 (overview)**: 显示缓存健康状态、性能指标和内存使用情况
- **内容查看 (inspector)**: 查看具体缓存内容，支持分页和搜索
- **热点分析 (hotkeys)**: 分析缓存访问热点，显示访问频次排行
- **基准测试 (benchmark)**: 执行性能基准测试，生成详细报告
- **配置管理 (config)**: 管理缓存配置参数和策略

## 技术实现

- 使用React函数组件和TypeScript
- 通过props传递数据和回调函数
- 保持原有的状态管理逻辑
- 使用lucide-react图标库
- 支持国际化（i18n）
- 响应式设计，支持移动端
