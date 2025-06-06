#!/usr/bin/env node

/**
 * API端点测试脚本
 * 测试API v1路由重写功能
 */

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// 测试数据
const testData = {
  prompt: "A beautiful sunset over mountains",
  aspect_ratio: "16:9",
  guidance_scale: 3.5,
  num_images: 1,
  safety_tolerance: 3
};

// 测试端点列表
const endpoints = [
  {
    name: 'Text to Image Pro (v1)',
    url: `${baseUrl}/api/v1/flux/text-to-image/pro`,
    expectedAction: 'text-to-image-pro'
  },
  {
    name: 'Text to Image Max (v1)',
    url: `${baseUrl}/api/v1/flux/text-to-image/max`,
    expectedAction: 'text-to-image-max'
  },
  {
    name: 'Image Edit Pro (v1)',
    url: `${baseUrl}/api/v1/flux/image-edit/pro`,
    expectedAction: 'edit-image-pro'
  },
  {
    name: 'Image Edit Max (v1)',
    url: `${baseUrl}/api/v1/flux/image-edit/max`,
    expectedAction: 'edit-image-max'
  },
  {
    name: 'Direct API (legacy)',
    url: `${baseUrl}/api/flux-kontext`,
    data: { ...testData, action: 'text-to-image-pro' }
  }
];

async function testEndpoint(endpoint) {
  console.log(`\n🧪 测试: ${endpoint.name}`);
  console.log(`📍 URL: ${endpoint.url}`);
  
  try {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-api-key'
      },
      body: JSON.stringify(endpoint.data || testData)
    });
    
    const result = await response.json();
    
    console.log(`📊 状态码: ${response.status}`);
    console.log(`📝 响应:`, JSON.stringify(result, null, 2));
    
    if (response.status === 200) {
      console.log(`✅ 测试通过`);
    } else {
      console.log(`❌ 测试失败`);
    }
    
  } catch (error) {
    console.log(`💥 请求错误:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 开始API端点测试...');
  console.log(`🌐 基础URL: ${baseUrl}`);
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
  }
  
  console.log('\n✨ 测试完成!');
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testEndpoint }; 