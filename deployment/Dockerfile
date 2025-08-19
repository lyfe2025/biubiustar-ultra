# 前端构建阶段
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建前端
RUN pnpm run build

# 后端运行阶段
FROM node:18-alpine AS backend

WORKDIR /app

# 安装生产依赖
COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

# 复制构建后的前端文件
COPY --from=frontend-builder /app/dist ./dist

# 复制后端代码
COPY api ./api
COPY supabase ./supabase

# 创建上传目录
RUN mkdir -p public/uploads

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动命令
CMD ["node", "api/server.js"]
