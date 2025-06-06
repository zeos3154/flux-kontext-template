# 🌐 API子域名配置指南

## 概述

本指南将帮你配置 `api.fluxkontext.space` 子域名，让API文档中的端点能够正常工作。

## 🚀 方案1：Vercel子域名（推荐）

### 步骤1：配置DNS记录

在你的域名提供商（如Cloudflare、阿里云等）添加CNAME记录：

```
类型: CNAME
名称: api
目标: cname.vercel-dns.com
```

### 步骤2：在Vercel添加域名

1. 进入Vercel项目设置
2. 点击"Domains"
3. 添加 `api.fluxkontext.space`
4. 等待DNS验证通过

### 步骤3：验证配置

```bash
# 测试API端点
curl -X POST "https://api.fluxkontext.space/api/v1/flux/text-to-image/pro" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}'
```

## 🔧 方案2：Cloudflare Workers代理

### 创建Worker脚本

```javascript
// api-proxy.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 将api子域名请求代理到主域名
    if (url.hostname === 'api.fluxkontext.space') {
      const targetUrl = `https://fluxkontext.space${url.pathname}${url.search}`;
      
      // 复制请求头
      const headers = new Headers(request.headers);
      
      // 创建新请求
      const newRequest = new Request(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.body
      });
      
      // 转发请求
      const response = await fetch(newRequest);
      
      // 添加CORS头
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return newResponse;
    }
    
    return new Response('Not Found', { status: 404 });
  }
}
```

### 配置步骤

1. 登录Cloudflare Dashboard
2. 进入Workers & Pages
3. 创建新Worker，粘贴上述代码
4. 配置路由：`api.fluxkontext.space/*`
5. 部署Worker

## 🎯 方案3：简单重定向（最简单）

如果你只是想让文档中的链接工作，可以使用简单的重定向：

### Cloudflare页面规则

```
URL模式: api.fluxkontext.space/*
设置: 转发URL (301重定向)
目标: https://fluxkontext.space/$1
```

### Nginx配置（如果使用自己的服务器）

```nginx
server {
    listen 80;
    server_name api.fluxkontext.space;
    
    location / {
        return 301 https://fluxkontext.space$request_uri;
    }
}
```

## 🧪 测试API端点

使用我们提供的测试脚本：

```bash
# 测试所有API端点
npm run test:api

# 或手动测试
curl -X POST "https://api.fluxkontext.space/api/v1/flux/text-to-image/pro" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "aspect_ratio": "16:9",
    "guidance_scale": 3.5,
    "num_images": 1
  }'
```

## 📊 配置验证

### 检查DNS解析

```bash
# 检查DNS记录
nslookup api.fluxkontext.space

# 检查HTTPS证书
curl -I https://api.fluxkontext.space
```

### 检查路由重写

```bash
# 测试路由重写是否正常
curl -v https://api.fluxkontext.space/api/v1/flux/text-to-image/pro
```

## 🔍 故障排除

### 常见问题

1. **DNS未生效**：等待24-48小时DNS传播
2. **SSL证书错误**：确保Vercel已正确配置域名
3. **404错误**：检查路由重写配置
4. **CORS错误**：确保API响应包含正确的CORS头

### 调试命令

```bash
# 检查域名解析
dig api.fluxkontext.space

# 测试连接
telnet api.fluxkontext.space 443

# 检查SSL证书
openssl s_client -connect api.fluxkontext.space:443
```

## 💡 最佳实践

1. **使用方案1（Vercel）**：最简单，自动SSL，高可用
2. **监控API状态**：设置监控检查API可用性
3. **版本管理**：保持v1路径，为未来版本预留空间
4. **文档同步**：确保API文档与实际端点一致

## 🎯 成本对比

| 方案 | 设置复杂度 | 维护成本 | 性能 | 推荐度 |
|------|-----------|----------|------|--------|
| Vercel子域名 | ⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Cloudflare Workers | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| 简单重定向 | ⭐ | ⭐ | ⭐⭐ | ⭐ |

推荐使用**Vercel子域名方案**，配置简单，性能优秀，维护成本低。 