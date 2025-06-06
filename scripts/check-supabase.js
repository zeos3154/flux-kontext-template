#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Supabase 配置检查工具\n');

// 检查环境变量文件
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ 未找到 .env.local 文件');
  console.log('📝 请复制 env.example 到 .env.local：');
  console.log('   cp env.example .env.local\n');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('✅ 找到 env.example 模板文件');
    console.log('📋 需要配置的 Supabase 变量：');
    console.log('   NEXT_PUBLIC_SUPABASE_URL');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('   SUPABASE_SERVICE_ROLE_KEY\n');
  }
  process.exit(1);
}

// 读取环境变量
require('dotenv').config({ path: envPath });

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const optionalVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_AUTH_CREDENTIALS_ENABLED'
];

console.log('📋 Supabase 配置状态：\n');

// 检查必需变量
let allRequired = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== `your-${varName.toLowerCase().replace(/_/g, '-')}`) {
    console.log(`✅ ${varName}: 已配置`);
  } else {
    console.log(`❌ ${varName}: 未配置或使用默认值`);
    allRequired = false;
  }
});

console.log('\n📋 NextAuth 配置状态：\n');

// 检查可选变量
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== `your-${varName.toLowerCase().replace(/_/g, '-')}`) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: 未配置或使用默认值`);
  }
});

console.log('\n🎯 认证模式分析：\n');

if (allRequired) {
  console.log('🚀 Supabase 模式：已配置完整的 Supabase 连接');
  console.log('   - 支持测试账户：test@example.com / password');
  console.log('   - 支持 Supabase 用户认证');
  console.log('   - 可以注册新用户到 Supabase');
} else {
  console.log('🧪 测试模式：仅支持测试账户');
  console.log('   - 测试账户：test@example.com / password');
  console.log('   - 不支持用户注册');
  console.log('   - 不连接真实数据库');
}

console.log('\n📚 下一步操作：\n');

if (!allRequired) {
  console.log('🔧 升级到 Supabase 模式：');
  console.log('1. 访问 https://supabase.com 创建项目');
  console.log('2. 获取项目 URL 和 API Keys');
  console.log('3. 更新 .env.local 文件中的 Supabase 配置');
  console.log('4. 重新运行此检查脚本');
} else {
  console.log('🎉 配置完成！可以使用以下功能：');
  console.log('1. 访问 /test-auth 测试认证功能');
  console.log('2. 使用测试账户或 Supabase 用户登录');
  console.log('3. 体验一行代码保护页面');
}

console.log('\n🧪 测试页面：');
console.log('   http://localhost:3000/test-auth');
console.log('   http://localhost:3000/dashboard');

console.log('\n✨ 完成！'); 