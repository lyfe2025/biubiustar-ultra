# Scripts 目录

这个目录包含了项目的各种工具脚本，用于管理、维护和调试项目。

## 脚本列表

### 缓存配置脚本
- `init-cache-config.js` - 初始化缓存配置
- `init-cache-configs.js` - 批量初始化缓存配置

### IP限制管理脚本
- `check-rate-limit.js` - 检查频率限制状态
- `clear-rate-limit.js` - 清除指定IP的频率限制

## 使用方法

### 直接运行
```bash
# 检查频率限制状态
node scripts/check-rate-limit.js

# 清除IP限制
node scripts/clear-rate-limit.js <IP地址>

# 初始化缓存配置
node scripts/init-cache-config.js
```

### 通过 project.sh 运行
```bash
./project.sh ip
```
然后选择相应的选项。

## 注意事项

1. 运行脚本前请确保已安装项目依赖
2. 某些脚本需要正确的环境变量配置
3. 建议先备份重要数据再运行维护脚本
4. 如遇问题，请查看脚本的错误输出信息

## 脚本开发规范

- 使用 ES6+ 语法
- 添加适当的错误处理
- 提供清晰的日志输出
- 遵循项目的代码风格
- 添加必要的注释说明
