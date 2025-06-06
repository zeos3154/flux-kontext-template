#!/usr/bin/env node

// 🔍 支付配置检查脚本
// 运行: node scripts/check-payment-config.js

const path = require('path')

// 模拟导入配置（实际项目中会从编译后的文件导入）
const PAYMENT_CONFIG = {
  STRIPE_ENABLED: true,
  CREEM_ENABLED: true,
  DEFAULT_PROVIDER: "creem",
  MAINTENANCE_MODE: false,
  FORCE_PROVIDER: null,
  ALLOW_USER_CHOICE: true,
  CHINA_ONLY_CREEM: true,
  INTERNATIONAL_PREFER_STRIPE: true,
  LARGE_AMOUNT_THRESHOLD: 10000,
  LARGE_AMOUNT_PROVIDER: "stripe",
  LAST_UPDATED: "2025-01-20",
  UPDATED_BY: "管理员",
  NOTES: "初始配置 - 双系统均启用"
}

console.log("🔧 支付系统配置状态检查")
console.log("=" * 50)

// 基本状态
console.log("📊 基本配置:")
console.log(`  Stripe启用: ${PAYMENT_CONFIG.STRIPE_ENABLED ? '✅' : '❌'}`)
console.log(`  Creem启用: ${PAYMENT_CONFIG.CREEM_ENABLED ? '✅' : '❌'}`)
console.log(`  默认提供商: ${PAYMENT_CONFIG.DEFAULT_PROVIDER}`)
console.log(`  维护模式: ${PAYMENT_CONFIG.MAINTENANCE_MODE ? '🚧 是' : '✅ 否'}`)

// 高级配置
console.log("\n🎯 高级配置:")
console.log(`  强制提供商: ${PAYMENT_CONFIG.FORCE_PROVIDER || '无'}`)
console.log(`  允许用户选择: ${PAYMENT_CONFIG.ALLOW_USER_CHOICE ? '✅' : '❌'}`)

// 地区配置
console.log("\n🌍 地区配置:")
console.log(`  中国用户强制Creem: ${PAYMENT_CONFIG.CHINA_ONLY_CREEM ? '✅' : '❌'}`)
console.log(`  国际用户优先Stripe: ${PAYMENT_CONFIG.INTERNATIONAL_PREFER_STRIPE ? '✅' : '❌'}`)

// 金额配置
console.log("\n💰 金额配置:")
console.log(`  大额阈值: ¥${PAYMENT_CONFIG.LARGE_AMOUNT_THRESHOLD / 100}`)
console.log(`  大额提供商: ${PAYMENT_CONFIG.LARGE_AMOUNT_PROVIDER}`)

// 更新信息
console.log("\n📝 更新信息:")
console.log(`  最后更新: ${PAYMENT_CONFIG.LAST_UPDATED}`)
console.log(`  更新人员: ${PAYMENT_CONFIG.UPDATED_BY}`)
console.log(`  备注: ${PAYMENT_CONFIG.NOTES}`)

// 环境变量检查
console.log("\n🔑 环境变量检查:")
console.log(`  STRIPE_PRIVATE_KEY: ${process.env.STRIPE_PRIVATE_KEY ? '✅ 已配置' : '❌ 未配置'}`)
console.log(`  STRIPE_PUBLIC_KEY: ${process.env.STRIPE_PUBLIC_KEY ? '✅ 已配置' : '❌ 未配置'}`)
console.log(`  CREEM_API_KEY: ${process.env.CREEM_API_KEY ? '✅ 已配置' : '❌ 未配置'}`)
console.log(`  CREEM_API_URL: ${process.env.CREEM_API_URL ? '✅ 已配置' : '❌ 未配置'}`)

// 配置验证
console.log("\n✅ 配置验证:")
let hasError = false

if (!PAYMENT_CONFIG.STRIPE_ENABLED && !PAYMENT_CONFIG.CREEM_ENABLED) {
  console.log("❌ 错误: 至少需要启用一个支付系统")
  hasError = true
}

if (PAYMENT_CONFIG.DEFAULT_PROVIDER === "stripe" && !PAYMENT_CONFIG.STRIPE_ENABLED) {
  console.log("❌ 错误: 默认提供商Stripe未启用")
  hasError = true
}

if (PAYMENT_CONFIG.DEFAULT_PROVIDER === "creem" && !PAYMENT_CONFIG.CREEM_ENABLED) {
  console.log("❌ 错误: 默认提供商Creem未启用")
  hasError = true
}

if (!hasError) {
  console.log("✅ 配置验证通过")
}

console.log("\n" + "=" * 50)
console.log("💡 修改配置请编辑: src/lib/config/payment.ts")
console.log("⚠️  修改后需要重启服务器生效") 