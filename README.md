# Biubiustar Ultra 社交媒体平台

一个现代化、高性能的社交媒体平台，致力于为用户提供优质的内容分享和社交互动体验。平台采用简洁大气的毛玻璃设计风格，以紫色为主题色，支持多语言，配备完整的缓存优化和网络错误处理系统，为全球用户提供流畅无障碍的社交体验。

## ✨ 功能特性

### 🎯 核心功能
- **内容分享**：支持文字、图片、视频等多媒体内容发布
- **社交互动**：点赞、评论、关注等社交功能  
- **活动管理**：活动发布、报名、管理等完整活动系统
- **用户系统**：完整的用户注册、登录、个人中心功能
- **管理后台**：内容审核、用户管理、系统设置等管理功能
- **多语言支持**：支持越南语、英语、中文简体、中文繁体
- **安全系统**：IP封禁、登录尝试限制、安全日志等安全功能

### ⚡ 性能优化
- **多层缓存系统**：内存缓存 + 智能预热，显著提升响应速度
- **网络错误处理**：智能重试机制，多语言友好错误提示
- **代码分割优化**：按路由懒加载，首屏加载时间减少60-70%
- **图片优化**：支持WebP格式，懒加载机制，加载时间减少70-80%
- **构建优化**：Gzip压缩，依赖优化，包大小减少25-35%

### 🌍 多语言支持
- 🇻🇳 越南语 (Tiếng Việt)
- 🇺🇸 英语 (English)
- 🇨🇳 中文简体 (简体中文)
- 🇨🇳 中文繁体 (繁體中文)

### 🎨 设计特色
- **毛玻璃效果**：现代化的视觉设计
- **紫色主题**：优雅的品牌色彩体系
- **响应式设计**：完美适配桌面端、平板端、移动端
- **用户友好**：直观的交互设计和用户体验

## 🛠️ 技术栈

### 前端技术
- **React 18.3.1** - 现代化的前端框架
- **TypeScript 5.8.3** - 类型安全的JavaScript超集
- **Vite 6.3.5** - 快速的构建工具
- **React Router v7.3.0** - 前端路由管理
- **Tailwind CSS 3.4.17** - 实用优先的CSS框架
- **Zustand 5.0.3** - 轻量级状态管理
- **Lucide React 0.511.0** - 现代化图标库
- **Sonner 2.0.7** - 优雅的通知组件
- **Date-fns 4.1.0** - 日期处理库
- **i18next 25.4.0** - 国际化框架
- **React i18next 15.7.0** - React国际化集成

### 后端技术
- **Express.js 4.21.2** - Node.js Web应用框架
- **TypeScript 5.8.3** - 后端类型安全
- **Supabase 2.55.0** - 现代化的后端即服务平台
- **PostgreSQL** - 可靠的关系型数据库
- **多层缓存架构** - 内存缓存 + 智能预热 + 失效策略
- **JWT** - 安全的用户认证
- **Multer 2.0.2** - 文件上传处理
- **Nodemailer 7.0.5** - 邮件服务
- **CORS 2.8.5** - 跨域资源共享

### 开发工具
- **ESLint 9.25.0** - 代码质量检查
- **Nodemon 3.1.10** - 开发环境热重载
- **Concurrently 9.2.0** - 并行运行多个命令
- **Vercel** - 现代化部署平台
- **TSX 4.20.3** - TypeScript执行器
- **Vite Plugin Trae Solo Badge** - 开发工具集成

## 🚀 快速开始

### 环境要求
- **Node.js** >= 18.0.0 (推荐 18.x 或 20.x)
- **npm** 或 **pnpm** (推荐 pnpm)
- **Supabase** 账户（用于数据库服务）

### 安装依赖
```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp deployment/configs/env.example .env
```

2. 配置 Supabase 连接信息：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 开发模式
```bash
# 同时启动前端和后端开发服务器
npm run dev

# 或分别启动
npm run client:dev  # 前端开发服务器 (http://localhost:5173)
npm run server:dev  # 后端开发服务器 (http://localhost:3001)
```

### 构建项目
```bash
# 类型检查
npm run check

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📁 项目结构

```
biubiustar-ultra/
├── docs/                   # 项目文档
│   ├── PROJECT_SCRIPT_GUIDE.md # project.sh 脚本使用指南
│   ├── 内存缓存实施方案.md    # 完整缓存架构方案
│   ├── 网络错误处理解决方案.md # 网络错误处理完整方案
│   ├── 多语言文字换行问题解决方案.md # UI多语言优化方案
│   ├── 预缓存性能优化清单.md  # 性能优化实施报告
│   ├── 缓存方案实施任务清单.md # 详细缓存实施清单
│   ├── 标题样式统一完成报告.md # 样式系统完成报告
│   ├── 准备的提示词.md      # 开发思路和提示词
│   ├── 项目规划.md          # 2.0版本功能规划
│   ├── vercel-optimization.md # Vercel部署优化方案
│   ├── vercel-functions-limit-solution.md # Vercel函数限制解决方案
│   ├── 配置一致性检查报告.md # 环境配置检查报告
│   └── 其他优化文档...
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   │   ├── admin/         # 管理后台组件
│   │   ├── AuthModal.tsx  # 认证模态框
│   │   ├── CommentModal.tsx # 评论模态框
│   │   ├── CreateActivityModal.tsx # 创建活动模态框
│   │   ├── CreatePostModal.tsx # 创建帖子模态框
│   │   ├── Footer.tsx     # 页脚组件
│   │   ├── LanguageSelector.tsx # 语言选择器
│   │   ├── Navbar.tsx     # 导航栏
│   │   ├── PasswordStrengthIndicator.tsx # 密码强度指示器
│   │   └── PostCard.tsx   # 帖子卡片
│   ├── pages/             # 页面组件
│   │   ├── admin/         # 管理后台页面
│   │   ├── profile/       # 用户资料页面
│   │   ├── About.tsx      # 关于页面
│   │   ├── Activities.tsx # 活动页面
│   │   ├── ActivityDetail.tsx # 活动详情
│   │   ├── Home.tsx       # 首页
│   │   ├── Trending.tsx   # 热门页面
│   │   └── DebugCategories.tsx # 调试页面
│   ├── contexts/          # React Context
│   │   ├── language/      # 多语言支持
│   │   └── AuthContext.tsx # 认证上下文
│   ├── hooks/             # 自定义 Hooks
│   ├── services/          # API 服务
│   ├── types/             # TypeScript 类型定义
│   ├── lib/               # 工具库
│   └── utils/             # 工具函数
├── api/                   # 后端源码
│   ├── config/            # 配置文件
│   ├── lib/               # 核心库
│   ├── middleware/        # 中间件
│   ├── services/          # 业务服务
│   ├── utils/             # 工具函数
│   ├── routes/            # API 路由
│   ├── app.ts             # Express 应用配置
│   ├── index.ts           # Vercel 函数入口
│   └── server.ts          # 开发服务器入口
├── supabase/              # 数据库相关
├── deployment/            # 部署相关文件
├── public/                # 静态资源
├── scripts/               # 项目脚本
└── 其他配置文件...
```

## 🌐 页面路由

### 前台页面
- `/` - 首页：品牌展示、热门内容、活动推荐
- `/trending` - 热门页面：热门内容列表和筛选
- `/activities` - 活动页面：活动列表和详情
- `/about` - 关于公司：企业介绍和联系表单
- `/profile` - 个人中心：用户概览和管理

### 后台管理
- `/admin` - 管理员登录
- `/admin/dashboard` - 管理仪表盘
- `/admin/content` - 内容管理
- `/admin/users` - 用户管理
- `/admin/activities` - 活动管理
- `/admin/categories` - 分类管理
- `/admin/contacts` - 联系合作管理
- `/admin/settings` - 系统设置
- `/admin/security` - 安全设置
- `/admin/logs` - 系统日志

## 🔧 开发指南

### 代码规范
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 配置的代码规范
- 组件文件使用 PascalCase 命名
- 工具函数使用 camelCase 命名
- 常量使用 UPPER_SNAKE_CASE 命名

### 提交规范
建议使用语义化提交信息：
- `feat:` 新功能
- `fix:` 修复问题
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

### 开发工具集成
- **Vite Plugin Trae Solo Badge**: 开发环境显示开发工具标识
- **React Dev Locator**: 快速定位组件源码
- **TypeScript Paths**: 支持路径别名导入

## 🚀 部署

### 快速部署
我们提供了完整的部署方案，支持多种部署方式：

- **[🚀 快速部署指南](./deployment/docs/QUICK_DEPLOY.md)** - 5-15分钟快速部署
- **[📚 详细部署指南](./deployment/docs/DEPLOYMENT_GUIDE.md)** - 完整的部署方案

### 部署方式
1. **Vercel 部署** (推荐) - 零配置，自动CI/CD，全球CDN
2. **Docker 部署** - 容器化，适合生产环境，易于扩展
3. **传统服务器部署** - 完全控制，适合企业环境，自定义配置

### Vercel 部署优化
项目已针对 Vercel Hobby 计划进行了优化：
- 单一入口点设计，避免12个函数限制
- 优化的 `vercel.json` 配置
- 完整的部署问题解决方案

### 一键部署
```bash
# 查看部署文件夹
cd deployment

# Docker 部署
./scripts/deploy.sh -m docker -e prod

# 传统服务器部署
./scripts/deploy.sh -m server -e prod
```

### 部署配置
- **Vercel**: 已配置 `vercel.json`，支持 API 路由和 SPA 路由
- **Docker**: 提供完整的容器化配置，包含 Nginx 反向代理
- **PM2**: 传统服务器部署的进程管理配置

更多部署信息请查看 [deployment](./deployment/) 文件夹。

## 📝 API 文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 内容管理
- `GET /api/posts` - 获取内容列表
- `POST /api/posts` - 发布内容
- `PUT /api/posts/:id` - 更新内容
- `DELETE /api/posts/:id` - 删除内容

### 社交功能
- `POST /api/posts/:id/like` - 点赞/取消点赞
- `POST /api/posts/:id/comment` - 发表评论
- `POST /api/users/:id/follow` - 关注用户

### 活动管理
- `GET /api/activities` - 获取活动列表
- `POST /api/activities` - 创建活动
- `POST /api/activities/:id/join` - 参加活动

### 管理后台
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/dashboard` - 获取仪表盘数据
- `GET /api/admin/users` - 获取用户列表
- `POST /api/admin/users` - 创建用户
- `GET /api/admin/settings` - 获取系统设置
- `PUT /api/admin/settings` - 更新系统设置

### 文件上传
- `POST /api/upload` - 文件上传
- `GET /uploads/*` - 静态文件访问

## 🔒 安全特性

- **IP封禁系统**：自动检测和封禁恶意IP
- **登录尝试限制**：防止暴力破解攻击
- **安全日志记录**：记录所有安全相关事件
- **管理员权限控制**：严格的管理员访问控制
- **文件上传安全**：安全的文件上传和存储
- **CORS 配置**：跨域资源共享安全策略
- **JWT 认证**：安全的用户身份验证

## 🌍 多语言支持

### 支持的语言
- **越南语** (Tiếng Việt) - 主要目标市场
- **英语** (English) - 国际化支持
- **中文简体** (简体中文) - 中文用户支持
- **中文繁体** (繁體中文) - 繁体中文用户支持

### 多语言特性
- 动态语言切换
- 本地化日期格式
- 多语言内容管理
- 语言偏好记忆

## 📊 数据库架构

### 核心表结构
- **user_profiles**: 用户资料表
- **posts**: 内容发布表
- **comments**: 评论表
- **activities**: 活动表
- **categories**: 分类表
- **follows**: 关注关系表
- **likes**: 点赞表
- **system_settings**: 系统设置表
- **security_logs**: 安全日志表

### 数据库特性
- **RLS (Row Level Security)**: 行级安全策略
- **多语言字段**: 支持多语言内容存储
- **软删除**: 数据安全删除机制
- **审计日志**: 完整的操作记录

## 🚀 性能优化

### 前端优化 (已完成 98%)
- **代码分割**: 按路由懒加载组件，首屏加载时间减少60-70%
- **图片优化**: 支持 WebP 格式，懒加载机制，加载时间减少70-80%
- **网络错误处理**: 智能重试机制，多语言友好错误提示
- **缓存策略**: 静态资源长期缓存，客户端智能缓存
- **构建优化**: Gzip 压缩，依赖优化，包大小减少25-35%

### 后端优化 (已完成 95%)
- **多层缓存系统**: 内存缓存 + 预热机制 + 失效策略
- **数据库优化**: 完整索引体系，查询性能提升80-90%
- **API 性能**: 批量数据获取，异步处理，响应时间显著降低
- **中间件优化**: 条件加载，顺序优化，内存监控
- **静态文件服务**: 高效的静态资源分发

### 性能监控
- **缓存监控**: 命中率统计，性能指标监控
- **内存监控**: 定期内存检查，自动清理机制
- **响应时间**: 慢请求监控，性能瓶颈识别
- **错误处理**: 完整的错误日志和监控系统

## 🎯 项目状态与规划

### 当前版本状态
- **1.0版本**: ✅ 已完成，包含核心功能、缓存系统、性能优化
- **2.0版本**: 🚧 开发中，新增社交功能、用户体验优化

### 2.0版本新功能规划
1. **热门页面关注功能** - 帖子卡片中的关注/取消关注按钮
2. **个人中心关注管理** - 关注用户列表、搜索筛选、批量管理
3. **通知系统完善** - 关注/点赞/评论通知、实时推送
4. **内容收藏功能** - 收藏管理、分类、导出
5. **搜索功能增强** - 全文搜索、用户搜索、标签搜索
6. **用户私信系统** - 实时私信聊天、消息历史
7. **内容推荐优化** - 个性化推荐、新用户冷启动
8. **用户成就系统** - 发帖成就、互动成就、特殊徽章

### 开发优先级
- 🔴 **高优先级**: 数据库慢查询优化、Supabase备份脚本
- 🟡 **中优先级**: 部署优化、Docker优化、CI/CD完善
- 🟢 **低优先级**: 监控增强、性能分析工具

## 📚 项目文档

项目提供了完整的技术文档，统一存放在 `/docs` 文件夹中：

### 🎯 核心文档
- **[项目脚本指南](./docs/PROJECT_SCRIPT_GUIDE.md)** - project.sh 脚本的完整使用说明
- **[内存缓存实施方案](./docs/内存缓存实施方案.md)** - 详细的缓存架构设计和实现方案
- **[网络错误处理解决方案](./docs/网络错误处理解决方案.md)** - 完整的网络错误处理系统

### ⚡ 性能优化文档
- **[预缓存性能优化清单](./docs/预缓存性能优化清单.md)** - 性能优化完成情况和效果报告
- **[缓存方案实施任务清单](./docs/缓存方案实施任务清单.md)** - 详细的缓存系统实施清单

### 🚀 部署优化文档
- **[Vercel优化方案](./docs/vercel-optimization.md)** - Vercel部署优化完整方案
- **[Vercel函数限制解决方案](./docs/vercel-functions-limit-solution.md)** - Hobby计划限制问题解决
- **[配置一致性检查报告](./docs/配置一致性检查报告.md)** - 环境配置检查和修正

### 🎨 UI/UX 文档
- **[多语言文字换行问题解决方案](./docs/多语言文字换行问题解决方案.md)** - UI多语言适配完整方案

### 📋 规划文档
- **[2.0版本功能规划](./docs/TODO/项目规划.md)** - 项目2.0版本功能规划和开发思路

## 🧪 测试和调试

### 调试工具
- **Debug 脚本**: 提供多个调试脚本
  - `debug-categories.js` - 分类调试
  - `debug-frontend-lang.js` - 前端语言调试
  - `debug-activity-category.js` - 活动分类调试
- **测试页面**: 提供测试和调试页面
- **日志系统**: 完整的应用日志记录

### 开发辅助
- **热重载**: 开发环境代码热更新
- **类型检查**: TypeScript 实时类型检查
- **代码格式化**: ESLint + Prettier 代码规范

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 贡献类型
- 🐛 Bug 修复
- ✨ 新功能开发
- 📚 文档更新
- 🎨 UI/UX 改进
- ⚡ 性能优化
- 🔒 安全增强

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- 项目主页：[Biubiustar](https://biubiustar.com)
- 问题反馈：[GitHub Issues](https://github.com/your-username/biubiustar-ultra/issues)
- 邮箱：contact@biubiustar.com

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！

**🚀 开始使用**: 选择适合你的部署方式，开始享受 Biubiustar Ultra 的强大功能！

**📈 项目进展**: 1.0版本已完成，2.0版本正在开发中，欢迎关注最新功能！
