#!/usr/bin/env node

/**
 * 🔧 项目配置检查脚本
 * 帮助小白检查项目配置是否正确，避免常见暗坑
 */

const fs = require('fs');
const path = require('path');

// 颜色输出函数
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log('green', `✅ ${description}: ${filePath}`);
    return true;
  } else {
    log('red', `❌ ${description}: ${filePath} (文件不存在)`);
    return false;
  }
}

function checkEnvVar(envVars, varName, description, required = true) {
  const value = envVars[varName];
  if (value) {
    log('green', `✅ ${description}: ${varName} (已设置)`);
    return true;
  } else {
    if (required) {
      log('red', `❌ ${description}: ${varName} (未设置或为空)`);
    } else {
      log('yellow', `⚠️  ${description}: ${varName} (可选，未设置)`);
    }
    return !required;
  }
}

function loadEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const envVars = {};
    
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').replace(/^["']|["']$/g, '');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    return {};
  }
}

function main() {
  log('cyan', '🔧 开始检查项目配置...\n');
  
  let allGood = true;
  
  // 1. 检查基础文件
  log('blue', '📁 检查基础文件:');
  allGood &= checkFile('package.json', '项目配置文件');
  allGood &= checkFile('next.config.js', 'Next.js配置文件');
  allGood &= checkFile('tsconfig.json', 'TypeScript配置文件');
  allGood &= checkFile('tailwind.config.ts', 'Tailwind配置文件');
  console.log();
  
  // 2. 检查环境变量文件
  log('blue', '🔐 检查环境变量文件:');
  const hasEnvLocal = checkFile('.env.local', '本地环境变量文件');
  const hasEnvExample = checkFile('env.example', '环境变量示例文件');
  
  if (!hasEnvLocal) {
    log('yellow', '💡 提示: 请复制 env.example 到 .env.local 并配置实际值');
    log('yellow', '   命令: cp env.example .env.local');
  }
  console.log();
  
  // 3. 检查环境变量配置
  if (hasEnvLocal) {
    log('blue', '⚙️  检查环境变量配置:');
    const envVars = loadEnvFile('.env.local');
    
    // Supabase数据库配置
    log('magenta', '  🗄️  Supabase数据库配置:');
    allGood &= checkEnvVar(envVars, 'NEXT_PUBLIC_SUPABASE_URL', 'Supabase项目URL');
    allGood &= checkEnvVar(envVars, 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase匿名密钥');
    allGood &= checkEnvVar(envVars, 'SUPABASE_SERVICE_ROLE_KEY', 'Supabase服务角色密钥');
    
    // NextAuth配置
    log('magenta', '  🔐 NextAuth认证配置:');
    allGood &= checkEnvVar(envVars, 'NEXTAUTH_URL', 'NextAuth URL');
    allGood &= checkEnvVar(envVars, 'NEXTAUTH_SECRET', 'NextAuth密钥');
    
    // Google OAuth配置
    log('magenta', '  🔍 Google OAuth配置:');
    checkEnvVar(envVars, 'NEXT_PUBLIC_AUTH_GOOGLE_ENABLED', 'Google认证开关', false);
    checkEnvVar(envVars, 'GOOGLE_ID', 'Google客户端ID', false);
    checkEnvVar(envVars, 'GOOGLE_SECRET', 'Google客户端密钥', false);
    
    // GitHub OAuth配置
    log('magenta', '  🐙 GitHub OAuth配置:');
    checkEnvVar(envVars, 'NEXT_PUBLIC_AUTH_GITHUB_ENABLED', 'GitHub认证开关', false);
    checkEnvVar(envVars, 'AUTH_GITHUB_ID', 'GitHub客户端ID', false);
    checkEnvVar(envVars, 'AUTH_GITHUB_SECRET', 'GitHub客户端密钥', false);
    
    // Stripe支付配置
    log('magenta', '  💳 Stripe支付配置:');
    checkEnvVar(envVars, 'NEXT_PUBLIC_ENABLE_STRIPE', 'Stripe开关', false);
    checkEnvVar(envVars, 'STRIPE_PUBLIC_KEY', 'Stripe公钥', false);
    checkEnvVar(envVars, 'STRIPE_PRIVATE_KEY', 'Stripe私钥', false);
    checkEnvVar(envVars, 'STRIPE_WEBHOOK_SECRET', 'Stripe Webhook密钥', false);
    
    // Creem支付配置
    log('magenta', '  🏦 Creem支付配置:');
    checkEnvVar(envVars, 'NEXT_PUBLIC_ENABLE_CREEM', 'Creem开关', false);
    checkEnvVar(envVars, 'CREEM_API_URL', 'Creem API地址', false);
    checkEnvVar(envVars, 'CREEM_API_KEY', 'Creem API密钥', false);
    checkEnvVar(envVars, 'CREEM_WEBHOOK_SECRET', 'Creem Webhook密钥', false);
    
    console.log();
  }
  
  // 4. 检查关键配置文件
  log('blue', '🔧 检查关键配置文件:');
  
  // 检查支付配置文件
  if (checkFile('src/lib/config/payment.ts', '支付系统配置文件')) {
    try {
      const paymentConfig = fs.readFileSync('src/lib/config/payment.ts', 'utf8');
      
      if (paymentConfig.includes('MAINTENANCE_MODE: true')) {
        log('red', '❌ 支付系统处于维护模式，请检查 src/lib/config/payment.ts');
        allGood = false;
      } else {
        log('green', '✅ 支付系统配置正常');
      }
      
      if (paymentConfig.includes('STRIPE_ENABLED: false') && paymentConfig.includes('CREEM_ENABLED: false')) {
        log('red', '❌ 所有支付系统都被禁用，请至少启用一个');
        allGood = false;
      }
    } catch (error) {
      log('yellow', '⚠️  无法读取支付配置文件内容');
    }
  }
  
  // 检查认证配置文件
  checkFile('src/lib/auth.ts', '认证系统配置文件');
  
  console.log();
  
  // 5. 检查Supabase相关
  log('blue', '🗄️  检查Supabase相关:');
  checkFile('src/lib/supabase/client.ts', 'Supabase客户端文件', false) || 
  checkFile('src/utils/supabase/client.ts', 'Supabase客户端文件', false);
  checkFile('src/lib/supabase/server.ts', 'Supabase服务端文件', false) || 
  checkFile('src/utils/supabase/server.ts', 'Supabase服务端文件', false);
  checkFile('src/types/supabase.ts', 'Supabase类型定义文件', false);
  
  console.log();
  
  // 6. 检查API路由
  log('blue', '🌐 检查API路由:');
  checkFile('src/app/api/auth/[...nextauth]/route.ts', 'NextAuth API路由');
  checkFile('src/app/api/payment/create-session/route.ts', '支付会话API', false);
  checkFile('src/app/api/webhooks', 'Webhook API目录', false);
  
  console.log();
  
  // 7. 总结
  if (allGood) {
    log('green', '🎉 恭喜！项目配置检查通过，可以正常启动开发服务器！');
    log('cyan', '💡 下一步: 运行 npm run dev 或 bun dev 启动项目');
  } else {
    log('red', '⚠️  发现配置问题，请根据上述提示修复后再启动项目');
    log('cyan', '📖 详细配置指南: docs/项目配置检查和小白上手指南.md');
  }
  
  console.log();
  log('blue', '🔗 有用的命令:');
  log('white', '  npm run dev              # 启动开发服务器');
  log('white', '  npm run setup            # 一键快速设置');
  log('white', '  npm run supabase:types   # 生成Supabase类型');
  log('white', '  npm run supabase:migrate # 推送数据库结构');
  log('white', '  node scripts/check-config.js  # 重新运行此检查');
}

if (require.main === module) {
  main();
}

module.exports = { main }; 