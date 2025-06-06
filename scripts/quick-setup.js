#!/usr/bin/env node

/**
 * 🚀 项目快速设置脚本
 * 帮助小白一键配置项目环境，避免手动配置的错误
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function generateRandomSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function createEnvFile() {
  log('blue', '📝 创建环境变量文件...');
  
  if (fs.existsSync('.env.local')) {
    log('yellow', '⚠️  .env.local 文件已存在，跳过创建');
    return;
  }
  
  if (!fs.existsSync('env.example')) {
    log('red', '❌ env.example 文件不存在，无法创建环境变量文件');
    return;
  }
  
  // 读取示例文件
  let envContent = fs.readFileSync('env.example', 'utf8');
  
  // 自动生成NextAuth密钥
  const nextAuthSecret = generateRandomSecret();
  envContent = envContent.replace(
    'NEXTAUTH_SECRET="your-nextauth-secret-key"',
    `NEXTAUTH_SECRET="${nextAuthSecret}"`
  );
  
  // 写入新文件
  fs.writeFileSync('.env.local', envContent);
  log('green', '✅ 已创建 .env.local 文件并自动生成 NextAuth 密钥');
}

function runCommand(command, description) {
  try {
    log('blue', `🔧 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    log('green', `✅ ${description} 完成`);
    return true;
  } catch (error) {
    log('red', `❌ ${description} 失败: ${error.message}`);
    return false;
  }
}

function checkPrerequisites() {
  log('blue', '🔍 检查系统环境...');
  
  // 检查Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    log('green', `✅ Node.js: ${nodeVersion}`);
  } catch (error) {
    log('red', '❌ Node.js 未安装，请先安装 Node.js');
    return false;
  }
  
  // 检查包管理器
  let packageManager = 'npm';
  try {
    execSync('bun --version', { stdio: 'ignore' });
    packageManager = 'bun';
    log('green', '✅ 检测到 Bun，将使用 Bun 作为包管理器');
  } catch (error) {
    log('yellow', '⚠️  未检测到 Bun，将使用 npm');
  }
  
  return packageManager;
}

function installDependencies(packageManager) {
  const installCommand = packageManager === 'bun' ? 'bun install' : 'npm install';
  return runCommand(installCommand, '安装项目依赖');
}

function setupSupabase() {
  log('blue', '🗄️  设置Supabase...');
  
  // 检查Supabase CLI是否安装
  try {
    execSync('npx supabase --version', { stdio: 'ignore' });
    log('green', '✅ Supabase CLI 可用');
  } catch (error) {
    log('yellow', '⚠️  Supabase CLI 未安装，将跳过本地设置');
    log('cyan', '💡 提示: 你需要在 https://supabase.com 创建项目并配置环境变量');
    return true;
  }
  
  // 检查是否已有Supabase项目
  if (fs.existsSync('supabase/config.toml')) {
    log('green', '✅ 检测到现有Supabase项目配置');
    return true;
  }
  
  // 提示用户手动配置
  log('cyan', '💡 Supabase 设置提示:');
  log('white', '1. 访问 https://supabase.com 创建新项目');
  log('white', '2. 在项目设置中获取以下信息:');
  log('white', '   - Project URL (NEXT_PUBLIC_SUPABASE_URL)');
  log('white', '   - Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  log('white', '   - Service Role Key (SUPABASE_SERVICE_ROLE_KEY)');
  log('white', '3. 将这些信息填入 .env.local 文件');
  
  return true;
}

function createSupabaseUtils() {
  log('blue', '🔧 创建Supabase工具文件...');
  
  // 创建目录
  const utilsDir = 'src/utils/supabase';
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }
  
  // 创建客户端文件
  const clientContent = `import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
`;
  
  const serverContent = `import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The \`setAll\` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
`;
  
  fs.writeFileSync(`${utilsDir}/client.ts`, clientContent);
  fs.writeFileSync(`${utilsDir}/server.ts`, serverContent);
  
  log('green', '✅ 已创建 Supabase 工具文件');
}

function showNextSteps() {
  log('cyan', '\n🎉 项目设置完成！下一步操作:');
  log('white', '');
  log('white', '1. 📝 配置 Supabase:');
  log('white', '   - 访问 https://supabase.com 创建项目');
  log('white', '   - 获取项目URL和API密钥');
  log('white', '   - 编辑 .env.local 文件，填入Supabase配置');
  log('white', '');
  log('white', '2. 🔐 配置认证 (可选):');
  log('white', '   - Google OAuth: 在Google Cloud Console配置');
  log('white', '   - GitHub OAuth: 在GitHub Developer Settings配置');
  log('white', '');
  log('white', '3. 💳 配置支付 (可选):');
  log('white', '   - Stripe: 获取测试密钥');
  log('white', '   - Creem: 获取API密钥');
  log('white', '');
  log('white', '4. 🚀 启动开发服务器:');
  log('white', '   npm run dev    # 或 bun dev');
  log('white', '');
  log('white', '5. 🔍 检查配置状态:');
  log('white', '   npm run check  # 运行配置检查');
  log('white', '');
  log('white', '📖 详细配置指南: docs/项目配置检查和小白上手指南.md');
  log('white', '🎓 学习资源: docs/小白到大师完整学习路径.md');
}

function main() {
  log('cyan', '🚀 开始项目快速设置...\n');
  
  // 1. 检查系统环境
  const packageManager = checkPrerequisites();
  if (!packageManager) {
    process.exit(1);
  }
  
  console.log();
  
  // 2. 创建环境变量文件
  createEnvFile();
  console.log();
  
  // 3. 安装依赖
  if (!installDependencies(packageManager)) {
    log('red', '❌ 依赖安装失败，请手动运行 npm install');
    process.exit(1);
  }
  console.log();
  
  // 4. 设置Supabase
  setupSupabase();
  console.log();
  
  // 5. 创建Supabase工具文件
  createSupabaseUtils();
  console.log();
  
  // 6. 运行配置检查
  log('blue', '🔧 运行配置检查...');
  try {
    execSync('node scripts/check-config.js', { stdio: 'inherit' });
  } catch (error) {
    log('yellow', '⚠️  配置检查脚本运行失败，请手动检查');
  }
  
  // 7. 显示下一步操作
  showNextSteps();
}

if (require.main === module) {
  main();
}

module.exports = { main }; 