# 社交服务模块化结构

本目录包含了原 `socialService.ts` 文件分离后的模块化服务结构。

## 文件结构

```
socialService/
├── index.ts              # 主服务文件，组合所有子模块
├── types.ts              # 类型定义和接口
├── utils.ts              # 工具函数和通用方法
├── posts.ts              # 帖子相关功能
├── likes.ts              # 点赞相关功能
├── comments.ts           # 评论相关功能
├── follows.ts            # 关注相关功能
└── users.ts              # 用户相关功能
```

## 功能模块说明

### 1. types.ts
- 导出所有类型定义：`Post`, `Comment`, `User`, `Like`, `Follow`
- 从主类型文件重新导出，保持类型一致性

### 2. utils.ts
- `getAuthToken()` - 获取认证token的工具函数
- `validateUserLogin()` - 验证用户登录状态的工具函数
- `clearPostCache()` - 清除帖子相关缓存的工具函数
- `clearUserCache()` - 清除用户相关缓存的工具函数

### 3. posts.ts (PostService)
- 帖子CRUD操作：获取、创建、删除
- 帖子列表和分页
- 热门帖子和趋势帖子
- 用户帖子管理
- 帖子分享功能

### 4. likes.ts (LikeService)
- 点赞和取消点赞
- 检查点赞状态
- 获取点赞数量
- 缓存管理

### 5. comments.ts (CommentService)
- 评论CRUD操作：获取、添加、删除
- 评论数量统计
- 缓存管理

### 6. follows.ts (FollowService)
- 关注和取消关注
- 关注状态检查
- 关注者和关注列表
- 关注数量统计
- 缓存管理

### 7. users.ts (UserService)
- 用户资料更新
- 用户统计信息
- 用户资料获取
- 内容分类管理
- 缓存管理

### 8. index.ts (SocialService)
- 主服务类，组合所有子服务
- 提供统一的API接口
- 保持向后兼容性
- 包含特殊的 `toggleLike` 方法

## 使用方法

在主应用中，只需要导入主服务文件：

```typescript
import { socialService } from '../lib/socialService/index';
// 或者
import socialService from '../lib/socialService/index';

// 使用方式保持不变
const posts = await socialService.getPosts();
const user = await socialService.getUserProfile(userId);
```

## 关键特性

1. **功能完全一致**: 所有原有功能都得到保留，没有重构逻辑
2. **安全分离**: 只是将代码按功能模块分离，不影响原有功能
3. **模块化设计**: 每个文件都有清晰的职责分工
4. **易于维护**: 代码结构更清晰，便于后续维护和扩展
5. **向后兼容**: 所有现有代码无需修改，只需更新导入路径
6. **类型安全**: 完整的TypeScript类型支持

## 分离后的优势

- **文件大小**: 原文件1051行 → 分离后总计约1000行，分布更均匀
- **可维护性**: 每个模块职责单一，便于定位和修改
- **可扩展性**: 新增功能可以添加到相应的模块中
- **团队协作**: 不同开发者可以并行开发不同模块
- **测试友好**: 每个模块可以独立测试

## 原文件备份

原 `socialService.ts` 文件已备份为 `socialService.ts.backup`，以防需要参考。

## 注意事项

1. 所有功能保持与原文件完全一致
2. 只是进行了代码分离，没有重构逻辑
3. 工具函数被提取到 `utils.ts` 中复用
4. 每个模块都有清晰的职责分工
5. 主服务文件 `index.ts` 负责组合所有子模块
6. 使用 `bind()` 方法确保方法调用的 `this` 上下文正确
