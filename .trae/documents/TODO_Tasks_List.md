# TODO 任务列表

根据用户提出的三个需求，生成详细的TODO任务列表：

## 1. 修复添加用户失败的Unauthorized错误 ✅

**问题分析**: 前端使用硬编码adminToken但后端需要真实Supabase认证

### 1.1 前端认证修复 ✅

* [x] **修复AdminService.ts中的认证机制**

  * 移除硬编码的adminToken

  * 实现真实的Supabase认证token获取

  * 确保每个API请求都携带有效的Authorization头

* [x] **修复管理后台登录流程**

  * 检查AdminLogin.tsx组件的登录逻辑

  * 确保登录成功后正确存储认证token

  * 实现token过期处理和自动刷新机制

### 1.2 后端认证验证 ✅

* [x] **检查admin.ts路由的认证中间件**

  * 验证所有管理员API端点都有正确的认证验证

  * 确保使用supabaseAdmin客户端进行权限验证

  * 添加管理员角色权限检查

* [x] **测试用户创建API**

  * 验证POST /admin/users端点的认证流程

  * 确保数据库操作使用正确的权限

  * 测试完整的用户创建流程

**修复内容**:

* 修改AdminService.ts中的认证逻辑，支持管理员token和普通用户token

* 启用admin.ts中所有API端点的权限验证

## 2. 活动分类管理整合到活动管理页面 ✅

### 2.1 前端页面整合 ✅

* [x] **修改AdminActivities.tsx组件**

  * 添加标签页切换功能（活动管理 / 分类管理）

  * 将AdminCategories.tsx的分类管理功能整合进来

  * 保持现有活动管理功能不变

* [x] **更新路由配置**

  * 移除独立的分类管理路由

  * 确保活动管理页面包含分类管理功能

  * 更新导航菜单，移除独立的分类管理入口

### 2.2 组件重构 ✅

* [x] **提取分类管理组件**

  * 将AdminCategories.tsx的核心功能提取为可复用组件

  * 确保在AdminActivities.tsx中正确集成

  * 保持分类管理的完整功能（增删改查）

* [x] **更新语言文件**

  * 添加活动管理页面的标签页翻译键

  * 确保中英越三语言的完整支持

**实现内容**:

* AdminActivities.tsx已包含完整的标签页切换功能

* 活动分类管理功能已完全集成，包括创建、编辑、删除分类

* 所有必要的函数和状态管理都已实现

* UI界面保持一致的设计风格

## 3. 内容管理添加内容分类管理功能 ✅

### 3.1 数据库层 ✅

* [x] **创建content\_categories表**

  * 表结构已存在：id, name, description, color, icon, is\_active, sort\_order, created\_at, updated\_at

  * 已有RLS策略和权限配置

  * 已插入默认分类数据

### 3.2 后端API ✅

* [x] **实现内容分类管理API端点**

  * GET /admin/content-categories - 获取分类列表

  * POST /admin/content-categories - 创建分类

  * PUT /admin/content-categories/:id - 更新分类

  * DELETE /admin/content-categories/:id - 删除分类

  * PUT /admin/content-categories/:id/toggle - 切换分类状态

### 3.3 前端服务层 ✅

* [x] **AdminService.ts添加内容分类API方法**

  * getContentCategories() - 获取分类列表

  * createContentCategory() - 创建分类

  * updateContentCategory() - 更新分类

  * deleteContentCategory() - 删除分类

  * toggleContentCategoryStatus() - 切换状态

### 3.4 前端界面 ✅

* [x] **AdminContent.tsx组件改造**

  * 添加标签页切换（内容管理 / 分类管理）

  * 实现分类管理界面（列表、搜索、CRUD操作）

  * 添加创建/编辑/删除分类的模态框

  * 集成完整的分类管理功能

### 3.5 国际化支持 ✅

* [x] **LanguageContext.tsx添加翻译键**

  * 英文翻译键：admin.content.categories.\*

  * 中文翻译键：admin.content.categories.\*

  * 越南语翻译键：admin.content.categories.\*

  * 包含所有界面文本、表单字段、状态等

### 3.6 前台分类筛选功能

* [ ] **实现前台热门内容的分类筛选**

  * 修改热门内容页面，添加分类筛选标签

  * 实现"全部"、"分类1"、"分类2"等筛选功能

  * 从content\_categories表获取活跃分类

  * 根据选择的分类筛选显示内容

* [ ] **更新posts表关联**

  * 确保posts表的category字段与content\_categories表正确关联

  * 实现分类筛选的后端API支持

  * 测试分类筛选功能的完整流程

## 4. 测试和验证

### 4.1 功能测试

* [ ] **测试用户管理功能**

  * 验证添加用户功能正常工作

  * 测试用户列表、编辑、删除功能

  * 确保认证问题已解决

* [ ] **测试活动分类管理整合**

  * 验证活动管理页面的标签页切换

  * 测试分类管理功能的完整性

  * 确保活动创建时可以选择分类

* [ ] **测试内容分类管理**

  * 验证管理后台的内容分类CRUD功能

  * 测试前台分类筛选功能

  * 确保分类与内容的正确关联

### 4.2 集成测试

* [ ] **端到端测试**

  * 测试完整的管理后台工作流程

  * 验证前后台数据一致性

  * 确保所有功能稳定运行

## 优先级说明

* **高优先级**: 任务1（修复认证错误）- 影响核心功能

* **中优先级**: 任务2（活动分类整合）- 改善用户体验

* **低优先级**: 任务3.6（前台分类筛选）- 新增功能

## 技术方案总结

### 认证修复方案

* 使用Supabase的auth.getSession()获取真实token

* 实现token自动刷新机制

* 添加管理员角色验证

### 页面整合方案

* 使用标签页组件实现功能整合

* 保持现有功能完整性

* 提取可复用组件减少代码重复

### 分类管理方案

* 独立的content\_categories表设计

* RESTful API设计模式

* 完整的CRUD操作支持

* 多语言国际化支持

