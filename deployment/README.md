# 🚀 Biubiustar Ultra 部署文件夹

这个文件夹包含了 Biubiustar Ultra 项目的所有部署相关文件和配置。

## 📁 文件夹结构

```
deployment/
├── README.md                 # 本说明文件
├── Dockerfile               # Docker 容器化配置
├── docker-compose.yml       # Docker 编排配置
├── docs/                    # 部署文档
│   ├── DEPLOYMENT_GUIDE.md  # 详细部署指南
│   └── QUICK_DEPLOY.md      # 快速部署指南
├── nginx/                   # Nginx 配置
│   ├── nginx.conf          # Nginx 主配置
│   └── conf.d/             # 站点配置
│       └── default.conf    # 默认站点配置
├── configs/                 # 配置文件
│   ├── env.example         # 环境变量模板
│   └── ecosystem.config.js # PM2 进程管理配置
└── scripts/                 # 部署脚本
    └── deploy.sh           # 自动化部署脚本
```

## 🎯 快速开始

### 1. 查看部署文档
- [快速部署指南](./docs/QUICK_DEPLOY.md) - 5-15分钟快速部署
- [详细部署指南](./docs/DEPLOYMENT_GUIDE.md) - 完整的部署方案

### 2. 配置环境变量
```bash
# 复制环境变量模板
cp configs/env.example .env

# 编辑 .env 文件，配置你的 Supabase 信息
nano .env
```

### 3. 选择部署方式

#### Vercel 部署 (推荐)
```bash
npm i -g vercel
vercel --prod
```

#### Docker 部署
```bash
# 从项目根目录运行
./deployment/scripts/deploy.sh -m docker -e prod
```

#### 传统服务器部署
```bash
# 从项目根目录运行
./deployment/scripts/deploy.sh -m server -e prod
```

## 🔧 配置文件说明

### Docker 相关
- **Dockerfile**: 定义应用容器镜像
- **docker-compose.yml**: 定义多容器服务编排

### Nginx 相关
- **nginx.conf**: Nginx 主配置文件
- **conf.d/default.conf**: 站点配置文件

### 进程管理
- **ecosystem.config.js**: PM2 进程管理配置

### 环境配置
- **env.example**: 环境变量配置模板

## 📚 部署文档

- **DEPLOYMENT_GUIDE.md**: 包含三种部署方式的详细步骤
- **QUICK_DEPLOY.md**: 快速部署的简化步骤

## 🚨 注意事项

1. **环境变量**: 部署前必须配置 `.env` 文件
2. **Supabase**: 需要有效的 Supabase 项目配置
3. **权限**: 确保部署脚本有执行权限 (`chmod +x`)
4. **端口**: 确保目标端口未被占用

## 🆘 获取帮助

- 查看 [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) 的故障排除部分
- 检查环境变量配置
- 查看部署日志
- 运行健康检查

---

**开始部署**: 选择适合你的部署方式，按照对应文档进行操作！
