# Biubiustar Ultra 🚀

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.55.0-green.svg)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 一个现代化、高性能的社交媒体平台，采用毛玻璃设计风格，支持多语言，配备完整的缓存优化和网络错误处理系统。

## ✨ 主要特性

### 🎯 核心功能
- **📱 内容分享** - 支持文字、图片、视频等多媒体内容发布
- **💬 社交互动** - 点赞、评论、关注等完整社交功能  
- **🎉 活动管理** - 活动发布、报名、管理等完整活动系统
- **👤 用户系统** - 完整的用户注册、登录、个人中心功能
- **⚙️ 管理后台** - 内容审核、用户管理、系统设置等管理功能
- **🌍 多语言支持** - 支持越南语、英语、中文简体、中文繁体
- **🔒 安全系统** - IP封禁、登录尝试限制、安全日志等安全功能

### ⚡ 性能优化
- **🚀 多层缓存系统** - 内存缓存 + 智能预热，显著提升响应速度
- **🌐 网络错误处理** - 智能重试机制，多语言友好错误提示
- **📦 代码分割优化** - 按路由懒加载，首屏加载时间减少60-70%
- **🖼️ 图片优化** - 支持WebP格式，懒加载机制，加载时间减少70-80%
- **🔧 构建优化** - Gzip压缩，依赖优化，包大小减少25-35%

### 🎨 设计特色
- **✨ 毛玻璃效果** - 现代化的视觉设计
- **💜 紫色主题** - 优雅的品牌色彩体系
- **📱 响应式设计** - 完美适配桌面端、平板端、移动端
- **👥 用户友好** - 直观的交互设计和用户体验

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

### 后端技术
- **Express.js 4.21.2** - Node.js Web应用框架
- **TypeScript 5.8.3** - 后端类型安全
- **Supabase 2.55.0** - 现代化的后端即服务平台
- **PostgreSQL** - 可靠的关系型数据库
- **多层缓存架构** - 内存缓存 + 智能预热 + 失效策略
- **JWT** - 安全的用户认证
- **Multer 2.0.2** - 文件上传处理
- **Nodemailer 7.0.5** - 邮件服务

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
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   │   ├── admin/         # 管理后台组件
│   │   ├── PostCard.tsx   # 帖子卡片组件
│   │   ├── AuthModal.tsx  # 认证模态框
│   │   └── ...            # 其他组件
│   ├── pages/             # 页面组件
│   │   ├── admin/         # 管理后台页面
│   │   ├── profile/       # 用户资料页面
│   │   ├── Home.tsx       # 首页
│   │   └── ...            # 其他页面
│   ├── contexts/          # React Context
│   │   ├── language/      # 多语言支持
│   │   └── AuthContext.tsx # 认证上下文
│   ├── hooks/             # 自定义 Hooks
│   ├── services/          # API 服务
│   └── utils/             # 工具函数
├── api/                   # 后端源码
│   ├── lib/               # 核心库
│   │   ├── cache/         # 缓存系统
│   │   ├── CacheAnalytics.ts # 缓存分析
│   │   └── ...            # 其他核心库
│   ├── middleware/        # 中间件
│   ├── routes/            # API 路由
│   └── server.ts          # 开发服务器入口
├── supabase/              # 数据库相关
├── deployment/            # 部署相关文件
├── scripts/               # 项目脚本
└── docs/                  # 项目文档
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
- `/admin/settings` - 系统设置

## 📊 项目状态

### 🎯 当前版本
- **1.0版本** ✅ 已完成 - 基础功能完整
- **2.0版本** 🚧 开发中 - 新增社交功能、用户体验优化

### 2.0版本新功能规划
1. **🔥 热门页面关注功能** - 帖子卡片中的关注/取消关注按钮
2. **👥 个人中心关注管理** - 关注用户列表、搜索筛选、批量管理
3. **🔔 通知系统完善** - 关注/点赞/评论通知、实时推送
4. **⭐ 内容收藏功能** - 收藏管理、分类、导出
5. **🔍 搜索功能增强** - 全文搜索、用户搜索、标签搜索
6. **💬 用户私信系统** - 实时私信聊天、消息历史
7. **🎯 内容推荐优化** - 个性化推荐、新用户冷启动
8. **🏆 用户成就系统** - 发帖成就、互动成就、特殊徽章

### 开发进度
- **缓存系统** 🟢 90% 完成 - 多层缓存架构、智能预热、失效策略
- **前端优化** 🟢 98% 完成 - 代码分割、图片优化、网络错误处理
- **后端优化** 🟢 95% 完成 - API性能、数据库优化、中间件优化
- **多语言支持** 🟢 100% 完成 - 4种语言完整支持
- **安全系统** 🟢 100% 完成 - IP封禁、登录限制、安全日志

## 🚀 部署

### 快速部署
我们提供了完整的部署方案，支持多种部署方式：

- **🚀 Vercel 部署** (推荐) - 零配置，自动CI/CD，全球CDN
- **🐳 Docker 部署** - 容器化，适合生产环境，易于扩展
- **🖥️ 传统服务器部署** - 完全控制，适合企业环境，自定义配置

### 一键部署
```bash
# 查看部署文件夹
cd deployment

# Docker 部署
./scripts/deploy.sh -m docker -e prod

# 传统服务器部署
./scripts/deploy.sh -m server -e prod
```

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
- **[配置一致性检查报告](./docs/配置一致性检查报告.md)** - 环境配置检查和修正

## 🧪 测试和调试

### 调试工具
- **Debug 脚本**: 提供多个调试脚本
- **测试页面**: 提供测试和调试页面
- **日志系统**: 完整的应用日志记录

### 缓存测试
- **缓存功能测试**: 完整的缓存系统功能验证
- **性能测试**: 缓存命中率、响应时间测试
- **失效测试**: 缓存失效机制验证

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

**📈 项目进展**: 2.0版本正在开发中，缓存系统已完成90%，欢迎关注最新功能！
