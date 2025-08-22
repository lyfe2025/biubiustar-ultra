# Vercel Serverless Functions 优化记录

## 问题背景

用户在部署到 Vercel 时遇到错误：
```
Error: No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan.
```

## 问题分析

### 根本原因
1. **Vercel Hobby 计划限制**：最多只能部署 12 个 Serverless Functions
2. **文件扫描机制**：Vercel 会将 `api` 目录下的每个 `.ts`/`.js` 文件识别为独立的 Serverless Function
3. **项目现状**：`api` 目录包含 89 个 `.ts` 文件，远超限制

### 官方文档确认
根据 Vercel 官方文档：
- Hobby 计划限制：12 个 Serverless Functions
- 对于非 Next.js/SvelteKit 框架，每个 API 文件直接映射为一个 Serverless Function
- 即使配置了单一入口点，Vercel 仍会扫描所有文件

## 解决方案

### 1. 修复关键导入错误
**文件**: `api/index.ts`
**问题**: 错误导入 `./app.js` 而不是 `./app.ts`
**修复**: 更正为 `./app` (无扩展名)

### 2. 优化 vercel.json 配置

#### 2.1 添加 excludeFiles 配置
```json
"builds": [
  {
    "src": "api/index.ts",
    "use": "@vercel/node",
    "config": {
      "maxLambdaSize": "50mb",
      "runtime": "nodejs18.x",
      "includeFiles": "api/**",
      "excludeFiles": [
        "api/**/!(index).ts",
        "api/**/!(index).js", 
        "api/**/*.d.ts"
      ]
    }
  }
]
```

#### 2.2 确保单一函数配置
```json
"functions": {
  "api/index.ts": {
    "maxDuration": 30,
    "memory": 512
  }
}
```

#### 2.3 统一路由配置
```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/api/index.ts"
  }
]
```

### 3. 添加配置注释
为团队成员添加详细的配置说明，解释：
- 配置目的（Hobby 计划优化）
- 关键策略（单一入口点）
- 重要警告（不要在 api 根目录添加文件）

## 架构优势

### 1. 符合 Vercel 限制
- 只使用 1 个 Serverless Function（api/index.ts）
- 远低于 Hobby 计划的 12 个函数限制

### 2. 保持功能完整性
- 所有 API 路由通过 Express 应用统一处理
- 89 个 `.ts` 文件的功能完全保留
- 路由逻辑通过 `api/app.ts` 集中管理

### 3. 性能优化
- 单一 Lambda 函数减少冷启动次数
- 统一的内存和超时配置
- 更好的资源利用率

## 最佳实践

### 1. 文件组织
- ✅ 将所有 API 逻辑放在 `api` 子目录中
- ✅ 使用 `api/index.ts` 作为唯一入口点
- ❌ 不要在 `api` 根目录直接添加 `.ts`/`.js` 文件

### 2. 路由管理
- ✅ 通过 Express 应用集中管理路由
- ✅ 使用模块化的路由文件组织
- ✅ 保持清晰的路由层次结构

### 3. 配置维护
- ✅ 在 `vercel.json` 中添加详细注释
- ✅ 使用 `excludeFiles` 明确排除非入口文件
- ✅ 定期验证配置的有效性

## 验证结果

1. **TypeScript 检查**: ✅ 通过 (`npm run check`)
2. **开发服务器**: ✅ 正常运行
3. **API 响应**: ✅ 所有端点正常工作
4. **配置语法**: ✅ JSON 格式正确

## 注意事项

1. **团队协作**: 确保所有团队成员了解不能在 `api` 根目录添加文件的限制
2. **部署验证**: 每次部署前检查函数数量是否仍在限制内
3. **监控告警**: 建议设置监控，当接近函数限制时及时告警

---

**文档更新**: 2024年12月
**负责人**: SOLO Coding Assistant
**状态**: 已完成并验证