# 管理后台功能完善 TODO 列表

## 1. 修复添加用户时的"Unauthorized"错误

**状态**: ✅ 已完成

**问题分析**:
- 前端使用硬编码的 `adminToken`，而后端需要真实的 Supabase 用户 token 进行认证
- `AdminLogin` 组件没有调用真实的后端登录 API
- 后端 `admin.ts` 路由缺少管理员登录端点

**解决方案**:
1. **后端**: 在 `admin.ts` 中添加 `/admin/login` API 端点 ✅
   - 使用 Supabase 进行用户认证
   - 验证用户是否具有管理员权限
   - 返回真实的 access token

2. **前端**: 修改 `AdminLogin.tsx` 组件 ✅
   - 调用真实的管理员登录 API
   - 存储真实的 token 而不是硬编码值
   - 处理登录错误和成功状态
   - 更新表单字段为邮箱输入

3. **语言文件**: 添加缺失的翻译键 ✅
   - 添加 `admin.login.email` 和 `admin.login.emailPlaceholder`

**技术实现**:
```typescript
// 后端 API 端点
POST /api/admin/login
{
  "email": "admin@example.com",
  "password": "password"
}

// 响应
{
  "success": true,
  "token": "real_supabase_token",
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## 2. 活动分类管理整合到活动管理页面

### 需求分析
- **当前状态**: 活动分类管理是独立页面（/admin/categories）
- **目标**: 将分类管理功能整合到活动管理页面中
- **好处**: 减少页面跳转，提升用户体验，便于分类和活动的联动管理

### 设计方案
#### UI布局设计
1. **主要区域**: 活动列表（保持现有功能）
2. **侧边栏/标签页**: 添加"分类管理"区域
3. **分类管理功能**:
   - 分类列表展示
   - 添加新分类
   - 编辑分类（名称、颜色、图标、描述）
   - 删除分类（需检查是否有关联活动）
   - 启用/禁用分类

#### 功能整合
1. **分类选择器**: 活动创建/编辑时从分类管理中动态获取
2. **分类筛选**: 活动列表按分类筛选时使用最新的分类数据
3. **数据同步**: 分类修改后立即更新活动相关显示

### 实施步骤
- [ ] **步骤1**: 设计新的AdminActivities页面布局（标签页或侧边栏）
- [ ] **步骤2**: 将AdminCategories组件的功能迁移到AdminActivities中
- [ ] **步骤3**: 实现分类管理和活动管理的数据联动
- [ ] **步骤4**: 更新导航菜单，移除独立的分类管理入口
- [ ] **步骤5**: 测试整合后的功能完整性
- [ ] **步骤6**: 优化UI/UX，确保操作流畅

---

## 3. 内容管理添加内容分类管理功能

### 需求分析
- **目标**: 在内容管理中添加内容分类管理
- **前台展示**: 热门内容页面显示分类筛选（全部、分类1、分类2...）
- **管理功能**: 管理员可以创建、编辑、删除内容分类
- **内容关联**: 发布内容时可以选择分类

### 数据库设计
#### 新增表: post_categories
```sql
CREATE TABLE post_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1', -- 十六进制颜色
  icon VARCHAR(50) DEFAULT 'folder', -- 图标名称
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 修改posts表
```sql
ALTER TABLE posts ADD COLUMN category_id UUID REFERENCES post_categories(id);
CREATE INDEX idx_posts_category_id ON posts(category_id);
```

### 后端API设计
#### 内容分类管理API
- `GET /api/admin/post-categories` - 获取所有内容分类
- `POST /api/admin/post-categories` - 创建新分类
- `PUT /api/admin/post-categories/:id` - 更新分类
- `DELETE /api/admin/post-categories/:id` - 删除分类
- `PUT /api/admin/post-categories/:id/toggle` - 启用/禁用分类

#### 前台API
- `GET /api/posts/categories` - 获取启用的分类列表
- `GET /api/posts?category_id=xxx` - 按分类筛选内容

### 前端实现
#### 管理后台
1. **AdminContent页面改造**:
   - 添加"分类管理"标签页
   - 分类列表、添加、编辑、删除功能
   - 内容列表添加分类筛选
   - 内容编辑时添加分类选择

2. **分类管理组件**:
   - PostCategoryManager组件
   - 分类表单组件
   - 颜色选择器
   - 图标选择器

#### 前台页面
1. **热门内容页面**:
   - 添加分类筛选标签
   - 实现分类切换功能
   - 优化加载和缓存机制

2. **内容发布**:
   - CreatePostModal添加分类选择
   - 分类数据动态获取

### 实施步骤
- [ ] **步骤1**: 创建数据库迁移文件，添加post_categories表
- [ ] **步骤2**: 在后端admin.ts中添加内容分类管理API
- [ ] **步骤3**: 创建PostCategoryManager组件
- [ ] **步骤4**: 修改AdminContent页面，整合分类管理功能
- [ ] **步骤5**: 修改posts相关API，支持分类筛选
- [ ] **步骤6**: 更新前台热门内容页面，添加分类筛选
- [ ] **步骤7**: 修改内容发布功能，支持分类选择
- [ ] **步骤8**: 添加数据迁移脚本，为现有内容设置默认分类
- [ ] **步骤9**: 全面测试分类管理和筛选功能
- [ ] **步骤10**: 优化UI/UX和性能

---

## 优先级和时间安排

### 高优先级（立即执行）
1. **修复添加用户Unauthorized错误** - 阻塞性问题，影响所有管理功能
2. **活动分类管理整合** - 已有基础，改进用户体验

### 中优先级（后续执行）
3. **内容分类管理功能** - 新功能开发，需要数据库变更

### 风险评估
- **数据库变更风险**: 内容分类功能需要新增表和字段
- **认证机制风险**: 管理员登录涉及安全认证
- **UI重构风险**: 页面整合可能影响现有功能

### 测试策略
- 每个功能完成后立即进行功能测试
- 重点测试数据一致性和用户体验
- 确保现有功能不受影响
- 添加错误处理和用户反馈机制