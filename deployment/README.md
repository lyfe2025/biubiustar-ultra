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
cp deployment/configs/env.example .env

# 编辑 .env 文件，配置你的 Supabase 信息
nano .env
```

### 3. 选择部署方式

#### 🐳 Docker 部署 (推荐)
**优势**: 环境一致、易于扩展、快速部署
```bash
# 从项目根目录运行
./deployment/scripts/deploy.sh -m docker -e prod

# 或者手动部署
cd deployment
docker-compose up -d --build
```

#### 🖥️ 传统服务器部署
**优势**: 完全控制、成本可控、适合生产环境
```bash
# 从项目根目录运行
./deployment/scripts/deploy.sh -m server -e prod

# 或者手动部署
npm install
npm run build
pm2 start deployment/configs/ecosystem.config.js
```

## 🔧 配置文件说明

### Docker 相关
- **Dockerfile**: 定义应用容器镜像，基于 Node.js 18 Alpine
- **docker-compose.yml**: 定义多容器服务编排，包含应用、Nginx、数据库等

### Nginx 相关
- **nginx.conf**: Nginx 主配置文件，优化了性能和安全设置
- **conf.d/default.conf**: 站点配置文件，支持静态文件服务和反向代理

### 进程管理
- **ecosystem.config.js**: PM2 进程管理配置，支持集群模式和自动重启

### 环境配置
- **env.example**: 环境变量配置模板，包含所有必需的配置项

## 🚀 部署方式对比

| 特性 | Docker 部署 | 传统服务器部署 |
|------|-------------|----------------|
| **部署速度** | ⚡ 快速 (5-10分钟) | 🐌 中等 (15-30分钟) |
| **环境一致性** | ✅ 完全一致 | ⚠️ 需要手动配置 |
| **扩展性** | ✅ 易于水平扩展 | ⚠️ 需要额外配置 |
| **维护成本** | 🟡 中等 | 🟢 较低 |
| **学习曲线** | 🟡 中等 | 🟢 简单 |
| **生产环境** | ✅ 推荐 | ✅ 适合 |

## 📋 部署前检查清单

- [ ] 环境变量配置完成 (`.env` 文件)
- [ ] Supabase 项目配置有效
- [ ] 目标服务器端口未被占用
- [ ] 部署脚本有执行权限 (`chmod +x deployment/scripts/deploy.sh`)
- [ ] 服务器满足最低系统要求
- [ ] 数据库连接正常

## 🔍 系统要求

### Docker 部署
- Docker Engine 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 10GB 可用磁盘空间

### 传统服务器部署
- Node.js 18+
- PM2 5.0+
- Nginx 1.18+
- 至少 4GB 可用内存
- 至少 20GB 可用磁盘空间

## 🚨 注意事项

1. **环境变量**: 部署前必须配置 `.env` 文件
2. **Supabase**: 需要有效的 Supabase 项目配置
3. **权限**: 确保部署脚本有执行权限
4. **端口**: 确保目标端口未被占用
5. **防火墙**: 配置服务器防火墙规则
6. **SSL 证书**: 生产环境建议配置 HTTPS

## 🆘 故障排除

### 常见问题
1. **端口冲突**: 检查端口占用情况 `netstat -tulpn | grep :3000`
2. **权限不足**: 确保脚本有执行权限 `chmod +x deployment/scripts/deploy.sh`
3. **环境变量**: 验证 `.env` 文件配置正确
4. **数据库连接**: 测试 Supabase 连接

### 获取帮助
- 查看 [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) 的故障排除部分
- 检查部署日志: `pm2 logs` 或 `docker-compose logs`
- 运行健康检查: `curl http://localhost:3000/health`

## 📚 进阶配置

### 自定义 Nginx 配置
编辑 `deployment/nginx/conf.d/default.conf` 文件

### 调整 PM2 配置
修改 `deployment/configs/ecosystem.config.js` 文件

### 优化 Docker 配置
调整 `deployment/docker-compose.yml` 中的资源限制

---

**开始部署**: 选择适合你的部署方式，按照对应文档进行操作！

> 💡 **推荐**: 首次部署建议使用 Docker 方式，环境一致性好；生产环境可根据团队技术栈选择 Docker 或传统部署。
