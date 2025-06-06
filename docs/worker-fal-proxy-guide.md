# 🚀 Worker 直接代理 FAL.AI 完整指南

## 🎯 目标：api.fluxkontext.space 直接代理到 FAL.AI

### 💡 **为什么直接代理到 FAL.AI？**

```bash
# 传统方式：
用户 → api.fluxkontext.space → fluxkontext.space → FAL.AI
延迟：100ms + 200ms + 300ms = 600ms

# Worker直接代理：
用户 → api.fluxkontext.space (Worker) → FAL.AI
延迟：100ms + 300ms = 400ms

# 优势：
✅ 减少33%延迟
✅ 节省服务器资源
✅ 更好的错误处理
✅ 全球边缘节点加速
```

---

## 🔧 **Worker 代码配置**

### 完整的 FAL.AI 代理代码

```javascript
// fal-api-proxy-worker.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 🎯 只处理 api.fluxkontext.space 的请求
    if (url.hostname !== 'api.fluxkontext.space') {
      return new Response('Not Found', { status: 404 });
    }
    
    // 🔄 将 API 路径映射到 FAL.AI
    const pathMapping = {
      '/api/v1/flux/text-to-image/pro': '/fal-ai/flux-pro',
      '/api/v1/flux/text-to-image/dev': '/fal-ai/flux/dev',
      '/api/v1/flux/text-to-image/schnell': '/fal-ai/flux/schnell',
      '/api/v1/flux/image-to-image': '/fal-ai/flux/dev/image-to-image',
      '/api/v1/flux/inpainting': '/fal-ai/flux/dev/inpainting'
    };
    
    // 🎯 检查路径是否支持
    const falPath = pathMapping[url.pathname];
    if (!falPath) {
      return new Response(JSON.stringify({
        error: 'Unsupported API endpoint',
        supported_endpoints: Object.keys(pathMapping)
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 🔑 构建 FAL.AI 请求
    const falUrl = `https://fal.run${falPath}`;
    
    // 📋 处理请求头
    const headers = new Headers();
    headers.set('Authorization', `Key ${env.FAL_KEY}`); // 从环境变量获取
    headers.set('Content-Type', 'application/json');
    headers.set('User-Agent', 'FluxKontext-API-Proxy/1.0');
    
    // 🚀 处理请求体
    let requestBody = null;
    if (request.method === 'POST') {
      try {
        const originalBody = await request.json();
        
        // 🔄 转换请求格式（如果需要）
        requestBody = JSON.stringify({
          prompt: originalBody.prompt,
          image_size: originalBody.aspect_ratio || "landscape_4_3",
          num_inference_steps: originalBody.num_inference_steps || 28,
          guidance_scale: originalBody.guidance_scale || 3.5,
          num_images: originalBody.num_images || 1,
          enable_safety_checker: originalBody.safety_tolerance !== "6",
          seed: originalBody.seed
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'Invalid JSON in request body'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    try {
      // 📡 发送请求到 FAL.AI
      console.log(`🚀 代理请求到: ${falUrl}`);
      const startTime = Date.now();
      
      const falResponse = await fetch(falUrl, {
        method: request.method,
        headers: headers,
        body: requestBody
      });
      
      const endTime = Date.now();
      console.log(`⚡ FAL.AI 响应时间: ${endTime - startTime}ms`);
      
      // 📦 处理响应
      const responseData = await falResponse.json();
      
      // 🔄 转换响应格式（保持与原API兼容）
      let transformedResponse;
      if (falResponse.ok) {
        transformedResponse = {
          success: true,
          data: {
            images: responseData.images || [],
            seed: responseData.seed,
            has_nsfw_concepts: responseData.has_nsfw_concepts || [false],
            prompt: responseData.prompt
          },
          processing_time: endTime - startTime
        };
      } else {
        transformedResponse = {
          success: false,
          error: responseData.detail || 'FAL.AI request failed',
          fal_error: responseData
        };
      }
      
      // 🌐 返回响应
      return new Response(JSON.stringify(transformedResponse), {
        status: falResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'X-Powered-By': 'Cloudflare-Workers',
          'X-Proxy-Target': 'FAL.AI'
        }
      });
      
    } catch (error) {
      console.error('🚨 FAL.AI 代理错误:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'FAL.AI proxy error',
        message: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
```

---

## 💰 **Worker 费用和限制详解**

### 🆓 **免费额度（非常慷慨）**

```bash
# Cloudflare Workers 免费计划
✅ 每天 100,000 次请求
✅ 每次请求最多 10ms CPU 时间
✅ 每次请求最多 128MB 内存
✅ 全球边缘节点部署
✅ 自定义域名支持
✅ SSL 证书自动管理

# 实际使用估算
📊 假设每次 AI 生成需要 5ms CPU 时间
📊 每天可以处理 20,000 次 AI 生成请求
📊 每月可以处理 600,000 次请求
📊 对于个人项目完全够用！
```

### 💳 **付费计划（超出免费额度后）**

```bash
# Workers Paid 计划
💰 $5/月 基础费用
💰 $0.50 每百万请求（超出免费额度后）
💰 $12.50 每百万 GB-s CPU 时间

# 成本计算示例
📈 每月 1,000,000 次请求
📈 超出免费额度：1,000,000 - 3,000,000 = 0（免费额度足够）
📈 实际费用：$0/月（在免费额度内）

📈 每月 5,000,000 次请求
📈 超出免费额度：5,000,000 - 3,000,000 = 2,000,000
📈 超出费用：2,000,000 / 1,000,000 × $0.50 = $1
📈 实际费用：$5 + $1 = $6/月
```

### ⚠️ **限制说明**

```bash
# 技术限制
⏱️ 单次请求最长 30 秒（对 AI 生成足够）
💾 响应大小最大 100MB（对图片足够）
🔄 并发请求无限制
🌍 全球 200+ 边缘节点

# 实际影响
✅ 对 AI 图片生成完全够用
✅ 比自建服务器更便宜
✅ 比 Vercel Functions 限制更少
✅ 比 AWS Lambda 更简单
```

---

## 🔧 **Worker 环境变量配置**

### 在 Cloudflare Dashboard 设置

```bash
# 1. 进入 Worker 设置
🌐 Cloudflare Dashboard → Workers → 你的 Worker → Settings

# 2. 添加环境变量
📝 Variables → Add variable
Name: FAL_KEY
Value: your_fal_api_key_here
Type: Secret (加密存储)

# 3. 可选的其他变量
ALLOWED_ORIGINS=https://fluxkontext.space,https://www.fluxkontext.space
RATE_LIMIT_PER_MINUTE=60
ENABLE_LOGGING=true
```

### 使用 Wrangler CLI 配置

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录
wrangler login

# 设置密钥
wrangler secret put FAL_KEY
# 输入你的 FAL API 密钥

# 部署
wrangler publish
```

---

## 🚀 **部署步骤**

### 1. 创建 Worker

```bash
# 按照之前的指南创建基础 Worker
Worker 名称: fal-api-proxy
```

### 2. 配置环境变量

```bash
# 在 Worker 设置中添加
FAL_KEY: your_fal_api_key_here
```

### 3. 部署代码

```bash
# 复制上面的完整代码到 Worker 编辑器
# 保存并部署
```

### 4. 配置域名和 DNS

```bash
# 添加自定义域名: api.fluxkontext.space
# 配置 DNS CNAME 记录
```

### 5. 测试功能

```bash
# 测试 API 代理
curl -X POST "https://api.fluxkontext.space/api/v1/flux/text-to-image/pro" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "aspect_ratio": "16:9",
    "guidance_scale": 3.5,
    "num_images": 1
  }'
```

---

## 📊 **性能对比**

| 方案 | 延迟 | 成本 | 复杂度 | 推荐度 |
|------|------|------|--------|--------|
| **Worker → FAL.AI** | 400ms | 免费 | ⭐⭐ | ⭐⭐⭐ |
| Worker → 主域名 → FAL.AI | 600ms | 免费 | ⭐⭐⭐ | ⭐⭐ |
| 直接调用 FAL.AI | 300ms | 免费 | ⭐ | ⭐ |

**推荐使用 Worker 直接代理 FAL.AI**，既有 API 统一管理的优势，又有最佳的性能表现！ 