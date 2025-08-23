# 多阶段构建 Dockerfile - 单机优化版
# 阶段1: 依赖安装
FROM node:18-alpine AS deps
WORKDIR /app

# 安装系统依赖 (最小化)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# 复制依赖文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 阶段2: 前端构建
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 复制源代码
COPY . .

# 构建前端 (优化构建参数)
RUN pnpm run build

# 阶段3: 后端构建
FROM node:18-alpine AS backend-builder
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 复制后端代码
COPY api ./api
COPY supabase ./supabase

# 构建后端 (如果需要)
RUN pnpm run build:server || true

# 阶段4: 生产运行环境 (单机优化)
FROM node:18-alpine AS production

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# 安装生产依赖 (最小化)
COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --prod && \
    pnpm cache clean && \
    npm cache clean --force

# 复制构建后的前端文件
COPY --from=frontend-builder /app/dist ./dist

# 复制后端代码
COPY --from=backend-builder /app/api ./api
COPY --from=backend-builder /app/supabase ./supabase

# 复制 package.json 用于启动脚本
COPY package*.json ./

# 创建必要的目录
RUN mkdir -p public/uploads logs backups temp && \
    chown -R nodejs:nodejs /app

# 切换到非 root 用户
USER nodejs

# 设置环境变量 (单机内存优化)
ENV NODE_ENV=production
ENV PORT=${APP_PORT:-3000}
ENV NODE_OPTIONS="--max-old-space-size=${MEMORY_LIMIT:-512} --optimize-for-size --gc-interval=100"
ENV UV_THREADPOOL_SIZE=4
ENV NODE_NO_WARNINGS=1

# 暴露端口
EXPOSE ${APP_PORT:-3000}

# 健康检查 (使用固定值，因为 HEALTHCHECK 不支持环境变量)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 启动命令 (优化启动参数)
CMD ["node", "--optimize-for-size", "api/server.js"]
