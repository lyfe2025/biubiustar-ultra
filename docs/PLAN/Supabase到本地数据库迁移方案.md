# Supabase 到本地数据库迁移方案

## 1. 项目概述

### 1.1 当前架构
- **前端**: React + TypeScript + Vite
- **后端**: Node.js + Express + TypeScript
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: 本地文件存储 (Multer + Express 静态文件)
- **实时功能**: Supabase Realtime

### 1.2 迁移目标
将现有的 Supabase 云服务迁移到本地数据库，实现完全自主可控的数据管理。

### 1.3 迁移范围
- ✅ **需要迁移**: 数据库、认证系统
- ❌ **无需迁移**: 文件存储系统（已使用本地存储）

## 2. 数据库结构分析

### 2.1 核心表结构

#### 用户相关表
```sql
-- 用户资料表
user_profiles (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  full_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(100),
  website VARCHAR(255),
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  role VARCHAR(20) DEFAULT 'user',
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- 用户认证表 (需要新建)
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### 内容相关表
```sql
-- 帖子表
posts (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[],
  category VARCHAR(50) DEFAULT 'general',
  user_id UUID NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- 评论表
comments (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_id UUID,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- 点赞表
likes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID,
  comment_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### 活动相关表
```sql
-- 活动表
activities (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location VARCHAR(255),
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  user_id UUID NOT NULL,
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- 活动参与表
activity_participants (
  id UUID PRIMARY KEY,
  activity_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'joined',
  joined_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### 系统管理表
```sql
-- 系统设置表
system_settings (
  id UUID PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- 缓存配置表
cache_configs (
  id UUID PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  cache_value TEXT,
  ttl INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- 安全相关表
login_attempts (
  id UUID PRIMARY KEY,
  ip_address INET NOT NULL,
  email VARCHAR(255),
  success BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

ip_blacklist (
  id UUID PRIMARY KEY,
  ip_address INET UNIQUE NOT NULL,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### 2.2 索引和约束
- 主键约束
- 外键约束
- 唯一性约束
- 性能优化索引

### 2.3 当前文件存储分析
**无需迁移的文件存储系统：**
- 使用 Multer 中间件处理上传
- 文件存储在 `public/uploads/` 目录
- 通过 Express 静态文件中间件提供访问
- 已实现上传安全控制

**存储目录结构：**
```
public/uploads/
├── avatars/          # 用户头像
├── posts/            # 帖子图片/视频
├── activities/       # 活动图片
└── site-logo/        # 网站Logo
```

## 3. 迁移方案设计

### 3.1 数据库选择

#### 推荐方案：PostgreSQL
**优势:**
- 与 Supabase 完全兼容
- 支持 JSON 数据类型
- 强大的全文搜索功能
- 优秀的性能表现
- 丰富的扩展功能

**替代方案:**
- MySQL/MariaDB (需要数据类型调整)
- SQLite (适合开发环境)

### 3.2 迁移步骤

#### 第一阶段：环境准备
1. **安装 PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # Windows
   # 下载 PostgreSQL 安装包
   ```

2. **创建数据库和用户**
   ```sql
   CREATE DATABASE biubiustar_ultra;
   CREATE USER biubiustar_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE biubiustar_ultra TO biubiustar_user;
   ```

3. **安装必要的扩展**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

#### 第二阶段：数据迁移
1. **导出 Supabase 数据**
   ```bash
   # 使用 pg_dump 导出数据
   pg_dump -h db.supabase.co -U postgres -d postgres > supabase_backup.sql
   ```

2. **数据清理和转换**
   - 移除 Supabase 特有的表 (auth.users, storage.*)
   - 调整数据类型和约束
   - 处理外键关系
   - 创建新的 users 表结构

3. **导入本地数据库**
   ```bash
   psql -h localhost -U biubiustar_user -d biubiustar_ultra < cleaned_backup.sql
   ```

#### 第三阶段：代码适配
1. **替换数据库连接**
2. **实现本地认证系统**
3. **移除 Supabase 依赖**
4. **保持文件存储系统不变**

### 3.3 认证系统重构

#### 当前 Supabase Auth 功能
- 用户注册/登录
- JWT Token 管理
- 密码重置
- 邮箱验证
- 社交登录

#### 本地认证实现
```typescript
// 使用 bcrypt 进行密码加密
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class LocalAuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  static generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  }
  
  static verifyToken(token: string): any {
    return jwt.verify(token, process.env.JWT_SECRET!);
  }
}
```

### 3.4 文件存储保持不变
**优势:**
- 无需重构文件上传逻辑
- 保持现有的安全控制
- 减少迁移风险
- 节省开发时间

**当前实现已包含:**
- 文件类型验证
- 文件大小限制
- 安全目录结构
- 访问控制策略

## 4. 实施计划

### 4.1 时间安排

#### 第一周：环境搭建
- 安装和配置 PostgreSQL
- 创建本地数据库
- 设置开发环境
- 准备迁移脚本

#### 第二周：数据迁移
- 导出 Supabase 数据
- 数据清理和转换
- 导入本地数据库
- 验证数据完整性

#### 第三周：代码重构
- 替换数据库连接
- 实现本地认证
- 移除 Supabase 依赖
- 测试核心功能

#### 第四周：测试和优化
- 功能测试
- 性能测试
- 安全测试
- 部署准备

### 4.2 风险评估

#### 高风险项
- 数据迁移过程中的数据丢失
- 认证系统重构的安全漏洞
- 用户密码迁移（需要重新设置）

#### 缓解措施
- 完整的数据备份
- 分阶段迁移和测试
- 安全代码审查
- 用户密码重置流程

### 4.3 回滚方案
- 保留 Supabase 环境
- 准备快速回滚脚本
- 监控系统运行状态
- 数据同步机制

## 5. 技术实现细节

### 5.1 数据库连接配置

#### 环境变量配置
```bash
# .env.local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=biubiustar_ultra
DB_USER=biubiustar_user
DB_PASSWORD=secure_password
JWT_SECRET=your_jwt_secret_key
```

#### 数据库连接
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

### 5.2 API 路由重构

#### 认证路由
```typescript
// api/routes/auth.ts
import express from 'express';
import { LocalAuthService } from '../services/LocalAuthService';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const hashedPassword = await LocalAuthService.hashPassword(password);
    
    // 创建用户逻辑
    const user = await createUser({ email, password: hashedPassword, username });
    const token = LocalAuthService.generateToken(user.id);
    
    res.json({ success: true, data: { user, token } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 验证用户逻辑
    const user = await verifyUser(email, password);
    const token = LocalAuthService.generateToken(user.id);
    
    res.json({ success: true, data: { user, token } });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
});

export default router;
```

### 5.3 中间件重构

#### 认证中间件
```typescript
// api/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { LocalAuthService } from '../services/LocalAuthService';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '访问令牌缺失' });
  }
  
  try {
    const decoded = LocalAuthService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: '访问令牌无效' });
  }
};
```

### 5.4 数据迁移脚本

#### 创建用户表脚本
```sql
-- 创建新的用户认证表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为现有用户创建密码记录（需要用户重新设置密码）
INSERT INTO users (id, email, password_hash, email_verified)
SELECT 
  up.id,
  up.email,
  'temp_password_hash_' || up.id, -- 临时密码哈希
  up.email_verified
FROM user_profiles up
WHERE up.email IS NOT NULL;

-- 添加外键约束
ALTER TABLE user_profiles 
ADD CONSTRAINT fk_user_profiles_users 
FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;
```

## 6. 部署和运维

### 6.1 生产环境配置

#### 数据库配置
- 启用连接池
- 配置适当的缓存参数
- 设置日志记录
- 配置备份策略

#### 应用配置
- 使用 PM2 或 Docker 部署
- 配置反向代理 (Nginx)
- 设置 SSL 证书
- 配置监控和告警

### 6.2 性能优化

#### 数据库优化
- 创建合适的索引
- 优化查询语句
- 配置查询缓存
- 定期维护和清理

#### 应用优化
- 实现数据缓存
- 优化文件上传
- 启用压缩
- 配置 CDN

### 6.3 监控和维护

#### 监控指标
- 数据库连接数
- 查询响应时间
- 系统资源使用
- 错误率和异常

#### 维护任务
- 定期数据备份
- 日志清理
- 性能调优
- 安全更新

## 7. 成本分析

### 7.1 当前成本 (Supabase)
- 数据库服务: $25/月 (Pro 计划)
- 存储服务: $0.02/GB/月
- 带宽: $0.09/GB
- 总成本: 约 $30-50/月

### 7.2 迁移后成本
- 服务器费用: $20-40/月 (VPS)
- 域名和 SSL: $10-20/年
- 维护成本: 开发时间
- 总成本: 约 $25-45/月

### 7.3 成本效益分析
- **短期**: 成本略有降低
- **长期**: 完全控制，无服务依赖
- **风险**: 需要自行维护和扩展

## 8. 总结和建议

### 8.1 迁移优势
1. **完全控制**: 数据和应用完全自主可控
2. **成本可控**: 长期成本更低
3. **定制化**: 可根据需求定制功能
4. **隐私保护**: 数据存储在本地，隐私性更好
5. **文件存储**: 无需重构，保持现有系统

### 8.2 迁移挑战
1. **技术复杂度**: 需要重构认证系统
2. **维护成本**: 需要自行维护数据库和服务器
3. **扩展性**: 需要自行实现扩展功能
4. **安全风险**: 需要自行保障系统安全
5. **用户影响**: 需要用户重新设置密码

### 8.3 建议
1. **分阶段迁移**: 建议采用分阶段迁移策略
2. **充分测试**: 每个阶段都要充分测试
3. **保留回滚**: 保留快速回滚到 Supabase 的能力
4. **团队培训**: 确保团队具备维护本地数据库的能力
5. **用户通知**: 提前通知用户密码重置需求

### 8.4 下一步行动
1. 确认迁移决策
2. 准备开发环境
3. 开始第一阶段实施
4. 建立监控和测试流程

---

**文档版本**: 1.0  
**创建日期**: 2024年12月  
**最后更新**: 2024年12月  
**负责人**: 开发团队  
**审核人**: 技术负责人
