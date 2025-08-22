# Vercel Serverless Functions 限制问题解决方案

## 问题描述

在部署到 Vercel 时遇到错误：
```
Error: No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan.
```

## 根本原因

1. **Vercel Hobby 计划限制**：最多只能部署 12 个 Serverless Functions
2. **文件扫描机制**：Vercel 会扫描 `api` 目录下的所有 `.ts` 文件作为独立的 Serverless Functions
3. **项目现状**：`api` 目录包含 89 个 `.ts` 文件，远超限制
4. **关键错误**：`api/index.ts` 中错误导入 `./app.js` 而非 `./app.ts`

## 解决方案

### 1. 修复导入路径错误

**文件**：`api/index.ts`

**修改前**：
```typescript
import app from './app.js';
```

**修改后**：
```typescript
import app from './app';
```

**原因**：错误的导入路径可能导致 Vercel 无法正确识别单一入口点。

### 2. 验证 vercel.json 配置

确保配置正确指向单一入口点：

```json
{
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "50mb",
        "runtime": "nodejs18.x",
        "includeFiles": "api/**"
      }
    }
  ],
  "functions": {
    "api/index.ts": {
      "maxDuration": 30,
      "memory": 512
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.ts"
    }
  ]
}
```

### 3. 架构说明

- **单一入口点**：`api/index.ts` 作为所有 API 请求的统一入口
- **路由分发**：通过 `api/app.ts` 中的 Express 应用处理路由分发
- **模块化设计**：89 个 `.ts` 文件作为模块被 `app.ts` 导入和使用
- **Vercel 识别**：只有 `api/index.ts` 被识别为 Serverless Function

## 验证步骤

1. **构建测试**：
   ```bash
   npm run build
   ```

2. **API 功能测试**：
   ```bash
   curl -s http://localhost:3001/api/health | jq .
   ```

3. **预期响应**：
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-08-22T18:15:19.256Z",
     "uptime": 38.121537833,
     "memory": {
       "rss": 183,
       "heapTotal": 34,
       "heapUsed": 22,
       "external": 4
     },
     "environment": "development",
     "nodeVersion": "v24.4.0"
   }
   ```

## 最佳实践

1. **导入路径**：使用相对路径时省略文件扩展名
2. **单一入口**：确保 Vercel 只识别一个主要的 Serverless Function
3. **模块化**：将业务逻辑分散到多个模块文件中，通过主应用导入
4. **配置验证**：定期检查 `vercel.json` 配置的正确性

## 注意事项

- 此解决方案适用于 Vercel Hobby 计划的 12 函数限制
- 如需更多函数，考虑升级到 Pro 计划
- 保持单一入口点架构有助于部署稳定性和性能优化

## 相关文档

- [Vercel Functions 限制说明](https://vercel.link/function-count-limit)
- [Vercel Node.js Runtime 文档](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)

---

**创建时间**：2025-08-22  
**最后更新**：2025-08-22  
**状态**：已解决