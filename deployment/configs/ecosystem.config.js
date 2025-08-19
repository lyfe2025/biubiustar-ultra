module.exports = {
  apps: [
    {
      name: 'biubiustar-api',
      script: 'api/server.ts',
      interpreter: 'tsx',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 自动重启配置
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // 健康检查
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      // 优雅关闭
      kill_timeout: 5000,
      listen_timeout: 3000,
      // 环境变量
      env_file: '.env'
    }
  ],

  deploy: {
    production: {
      user: 'www-data',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/biubiustar-ultra.git',
      path: '/var/www/biubiustar-ultra',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
