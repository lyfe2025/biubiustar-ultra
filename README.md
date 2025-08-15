# Biubiustar 社交媒体平台

一个现代化的社交媒体平台，致力于为用户提供优质的内容分享和社交互动体验。平台采用简洁大气的毛玻璃设计风格，以紫色为主题色，支持多语言，为全球用户提供无障碍的社交体验。

## ✨ 功能特性

### 🎯 核心功能
- **内容分享**：支持文字、图片、视频等多媒体内容发布
- **社交互动**：点赞、评论、关注等社交功能
- **活动管理**：活动发布、报名、管理等完整活动系统
- **用户系统**：完整的用户注册、登录、个人中心功能
- **管理后台**：内容审核、用户管理、系统设置等管理功能

### 🌍 多语言支持
- 🇻🇳 越南语 (Tiếng Việt)
- 🇺🇸 英语 (English)
- 🇨🇳 中文简体 (简体中文)
- 🇹🇼 中文繁体 (繁體中文)

### 🎨 设计特色
- **毛玻璃效果**：现代化的视觉设计
- **紫色主题**：优雅的品牌色彩体系
- **响应式设计**：完美适配桌面端、平板端、移动端
- **用户友好**：直观的交互设计和用户体验

## 🛠️ 技术栈

### 前端技术
- **React 18** - 现代化的前端框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 快速的构建工具
- **React Router** - 前端路由管理
- **Tailwind CSS** - 实用优先的CSS框架
- **Zustand** - 轻量级状态管理
- **Lucide React** - 现代化图标库
- **Sonner** - 优雅的通知组件

### 后端技术
- **Express.js** - Node.js Web应用框架
- **TypeScript** - 后端类型安全
- **Supabase** - 现代化的后端即服务平台
- **PostgreSQL** - 可靠的关系型数据库
- **JWT** - 安全的用户认证
- **Multer** - 文件上传处理
- **Nodemailer** - 邮件服务

### 开发工具
- **ESLint** - 代码质量检查
- **Nodemon** - 开发环境热重载
- **Concurrently** - 并行运行多个命令
- **Vercel** - 现代化部署平台

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm 或 pnpm
- Supabase 账户（用于数据库服务）

### 安装依赖
```bash
# 使用 npm
npm install

# 或使用 pnpm
pnpm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp .env.example .env
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
│   ├── pages/             # 页面组件
│   ├── contexts/          # React Context
│   ├── hooks/             # 自定义 Hooks
│   ├── services/          # API 服务
│   ├── types/             # TypeScript 类型定义
│   └── utils/             # 工具函数
├── api/                   # 后端源码
│   ├── routes/            # API 路由
│   ├── lib/               # 后端工具库
│   └── server.ts          # 服务器入口
├── supabase/              # 数据库相关
│   └── migrations/        # 数据库迁移文件
├── public/                # 静态资源
└── .trae/                 # 项目文档
    └── documents/         # 需求和架构文档
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
- `/admin/contacts` - 联系合作管理
- `/admin/settings` - 系统设置

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

## 🚀 部署

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### 手动部署
```bash
# 构建项目
npm run build

# 部署 dist 目录到服务器
```

## 📝 API 文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 内容管理
- `GET /api/content` - 获取内容列表
- `POST /api/content` - 发布内容
- `PUT /api/content/:id` - 更新内容
- `DELETE /api/content/:id` - 删除内容

### 社交功能
- `POST /api/content/:id/like` - 点赞/取消点赞
- `POST /api/content/:id/comment` - 发表评论
- `POST /api/users/:id/follow` - 关注用户

### 活动管理
- `GET /api/activities` - 获取活动列表
- `POST /api/activities` - 创建活动
- `POST /api/activities/:id/join` - 参加活动

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- 项目主页：[Biubiustar](https://biubiustar.com)
- 问题反馈：[GitHub Issues](https://github.com/your-username/biubiustar-ultra/issues)
- 邮箱：contact@biubiustar.com

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！
