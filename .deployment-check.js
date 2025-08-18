#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Vercel 部署预检查工具\n');

// 检查文件数量
function countFiles() {
  try {
    const result = execSync('find . -name "node_modules" -prune -o -type f -print | wc -l', { encoding: 'utf8' });
    const count = parseInt(result.trim());
    console.log(`📁 项目文件数量（排除 node_modules）: ${count.toLocaleString()}`);
    
    if (count > 3000) {
      console.log('⚠️  警告: 文件数量较多，可能影响部署速度');
      console.log('   建议检查是否有不必要的文件可以排除');
    } else {
      console.log('✅ 文件数量在合理范围内');
    }
    return count;
  } catch (error) {
    console.log('❌ 无法统计文件数量:', error.message);
    return 0;
  }
}

// 检查大文件目录
function checkLargeDirectories() {
  console.log('\n📊 检查大文件目录:');
  try {
    const result = execSync('du -sh */ 2>/dev/null | sort -hr | head -5', { encoding: 'utf8' });
    const lines = result.trim().split('\n').filter(line => line);
    
    lines.forEach(line => {
      const [size, dir] = line.split('\t');
      const dirName = dir.replace('/', '');
      
      if (dirName === 'node_modules' && parseFloat(size) > 500) {
        console.log(`⚠️  ${dirName}: ${size} (应该被 .vercelignore 排除)`);
      } else if (dirName === 'dist' && parseFloat(size) > 100) {
        console.log(`⚠️  ${dirName}: ${size} (构建输出目录，可能过大)`);
      } else {
        console.log(`   ${dirName}: ${size}`);
      }
    });
  } catch (error) {
    console.log('❌ 无法检查目录大小:', error.message);
  }
}

// 检查必要的配置文件
function checkConfigFiles() {
  console.log('\n🔧 检查配置文件:');
  
  const requiredFiles = [
    'package.json',
    'vercel.json',
    'vite.config.ts',
    'tsconfig.json'
  ];
  
  const optionalFiles = [
    'tailwind.config.js',
    'postcss.config.js',
    '.vercelignore'
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} - 存在`);
    } else {
      console.log(`❌ ${file} - 缺失（必需）`);
    }
  });
  
  optionalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} - 存在`);
    } else {
      console.log(`⚪ ${file} - 缺失（可选）`);
    }
  });
}

// 检查 .vercelignore
function checkVercelIgnore() {
  console.log('\n🚫 检查 .vercelignore:');
  
  if (!fs.existsSync('.vercelignore')) {
    console.log('❌ .vercelignore 文件不存在');
    console.log('   建议创建此文件以排除不必要的部署文件');
    return;
  }
  
  const content = fs.readFileSync('.vercelignore', 'utf8');
  const criticalIgnores = ['node_modules', '.cache', '.temp', 'logs'];
  
  criticalIgnores.forEach(ignore => {
    if (content.includes(ignore)) {
      console.log(`✅ ${ignore} - 已排除`);
    } else {
      console.log(`⚠️  ${ignore} - 未排除（建议添加）`);
    }
  });
}

// 检查环境变量
function checkEnvironment() {
  console.log('\n🌍 环境变量提醒:');
  console.log('📝 确保在 Vercel 项目设置中配置以下环境变量:');
  console.log('   - SUPABASE_URL');
  console.log('   - SUPABASE_ANON_KEY');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY');
  console.log('   - JWT_SECRET');
  console.log('   - NODE_ENV=production');
}

// 部署建议
function deploymentTips() {
  console.log('\n💡 部署建议:');
  console.log('1. 运行 "npm run build" 确保本地构建成功');
  console.log('2. 检查 "dist" 目录是否正确生成');
  console.log('3. 确保所有环境变量在 Vercel 中配置正确');
  console.log('4. 如果部署失败，检查 Vercel 构建日志');
  console.log('5. 考虑使用 Vercel CLI 进行本地预览: vercel --prod');
}

// 主函数
function main() {
  const fileCount = countFiles();
  checkLargeDirectories();
  checkConfigFiles();
  checkVercelIgnore();
  checkEnvironment();
  deploymentTips();
  
  console.log('\n' + '='.repeat(50));
  if (fileCount > 0 && fileCount < 3000) {
    console.log('🎉 项目看起来已经准备好部署到 Vercel！');
  } else {
    console.log('⚠️  建议在部署前解决上述问题');
  }
  console.log('='.repeat(50));
}

main();
