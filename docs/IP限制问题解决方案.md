# IP限制问题解决方案

## 问题描述

你遇到的问题是：**IP被限制了，但是用 `project.sh` 脚本查看时没有看到被限制的IP**。

## 问题原因

这是因为你的项目有两套IP限制机制：

### 1. 数据库IP黑名单系统 (`ip_blacklist` 表)
- 这是 `project.sh` 脚本检查的系统
- 存储持久的IP限制记录
- 可以通过数据库查询查看

### 2. 内存中的频率限制器 (`rateLimiter.ts`)
- 这是实时运行在内存中的限制系统
- **不会存储到数据库中**
- 服务器重启后会自动清除
- `project.sh` 脚本无法看到这个系统的限制

## 频率限制器的工作原理

```typescript
// 默认配置
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 3,           // 最大登录尝试次数
  LOCKOUT_DURATION: 30 * 60 * 1000, // 锁定时长：30分钟
  ATTEMPT_WINDOW: 15 * 60 * 1000,   // 尝试窗口：15分钟
};

// 频率限制器配置
export const statsRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,        // 1分钟
  maxRequests: 10,            // 最多10次请求
});

export const adminRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,        // 1分钟
  maxRequests: 30,            // 最多30次请求
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,   // 5分钟
  maxRequests: 5,             // 最多5次请求
});
```

## 解决方案

### 方案1：使用新的检查脚本（推荐）

我创建了两个脚本来帮助你解决这个问题：

#### 1. 检查频率限制状态
```bash
node scripts/check-rate-limit.js
```

这个脚本会：
- 检查数据库中的IP黑名单
- 查看最近的登录尝试记录
- 显示安全事件日志
- 帮助你了解IP被限制的原因

#### 2. 清除IP频率限制
```bash
node scripts/clear-rate-limit.js <IP地址>
```

示例：
```bash
node scripts/check-rate-limit.js 192.168.1.1
node scripts/clear-rate-limit.js ::1
```

这个脚本会：
- 检查IP是否在数据库黑名单中
- 解除数据库黑名单限制
- 清理相关的登录尝试记录
- 记录操作日志

### 方案2：使用更新后的 project.sh 脚本

我已经更新了 `project.sh` 脚本，添加了新的功能：

```bash
./project.sh ip
```

选择选项：
- `4. 检查频率限制状态` - 运行检查脚本
- `5. 清除指定IP的频率限制` - 运行清除脚本

### 方案3：重启服务器

如果上述方法都不行，最简单的解决方案是重启服务器：

```bash
./project.sh restart
```

因为频率限制器存储在内存中，服务器重启后会自动清除所有限制。

## 如何预防IP被限制

### 1. 避免频繁登录失败
- 确保密码正确
- 不要短时间内多次尝试登录
- 使用正确的用户名/邮箱

### 2. 避免频繁请求
- 不要短时间内发送大量请求
- 遵循API的速率限制
- 使用适当的请求间隔

### 3. 监控登录尝试
- 定期检查安全日志
- 关注异常登录行为
- 及时处理安全事件

## 常见问题

### Q: 为什么我的IP被限制了？
A: 可能的原因：
- 登录失败次数过多（超过3次）
- 请求频率过高（超过限制）
- 被管理员手动封禁
- 触发了安全策略

### Q: 限制会持续多久？
A: 取决于限制类型：
- 临时封禁：通常30分钟
- 频率限制：1-5分钟
- 永久封禁：需要手动解除

### Q: 如何知道我的IP是否被限制？
A: 使用检查脚本：
```bash
node scripts/check-rate-limit.js
```

### Q: 清除限制后多久生效？
A: 
- 数据库限制：立即生效
- 内存限制：需要重启服务器或等待时间窗口过期

## 技术支持

如果问题仍然存在，请：

1. 运行检查脚本查看详细信息
2. 检查服务器日志
3. 确认环境变量配置正确
4. 联系技术支持

## 相关文件

- `scripts/check-rate-limit.js` - 频率限制检查脚本
- `scripts/clear-rate-limit.js` - 频率限制清除脚本
- `project.sh` - 项目管理脚本（已更新）
- `api/middleware/security.ts` - 安全中间件
- `api/middleware/rateLimiter.ts` - 频率限制器
