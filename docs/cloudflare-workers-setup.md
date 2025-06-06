# 🌐 Cloudflare Workers 详细配置指南

## 🎯 目标：配置 api.fluxkontext.space 子域名

### 方案对比

| 方案 | 复杂度 | 成本 | 性能 | 推荐度 |
|------|--------|------|------|--------|
| Vercel子域名 | ⭐ | 免费 | ⭐⭐⭐ | ⭐⭐⭐ |
| Cloudflare Workers | ⭐⭐ | 免费 | ⭐⭐⭐ | ⭐⭐ |
| 简单重定向 | ⭐ | 免费 | ⭐⭐ | ⭐ |

## 🚀 Cloudflare Workers 详细步骤

### 步骤1：登录 Cloudflare Dashboard

1. 访问 [dash.cloudflare.com](https://dash.cloudflare.com)
2. 登录你的账户
3. 确保你的域名 `fluxkontext.space` 已经添加到 Cloudflare

### 步骤2：创建 Worker

1. **进入 Workers & Pages**
   ```
   左侧菜单 → Workers & Pages → Create application
   ```

2. **选择创建方式**
   ```
   Create Worker → Deploy
   ```

3. **命名 Worker**
   ```
   Worker 名称: api-proxy-fluxkontext
   ```

### 步骤3：编写 Worker 代码

```javascript
// 完整的 Worker 代码
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 只处理 api.fluxkontext.space 的请求
    if (url.hostname !== 'api.fluxkontext.space') {
      return new Response('Not Found', { status: 404 });
    }
    
    // 构建目标URL - 将api子域名请求代理到主域名
    const targetUrl = `https://fluxkontext.space${url.pathname}${url.search}`;
    
    // 复制原始请求的所有头部
    const headers = new Headers(request.headers);
    
    // 移除可能导致问题的头部
    headers.delete('host');
    headers.delete('cf-ray');
    headers.delete('cf-connecting-ip');
    
    // 创建新的请求对象
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    });
    
    try {
      // 转发请求到主域名
      const response = await fetch(newRequest);
      
      // 创建新的响应对象
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      
      // 添加 CORS 头部（如果需要）
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // 处理 OPTIONS 预检请求
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
          }
        });
      }
      
      return newResponse;
      
    } catch (error) {
      console.error('代理请求失败:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
}
```

### 步骤4：部署 Worker

1. **粘贴代码**
   - 将上面的代码粘贴到 Worker 编辑器中
   - 点击 "Save and Deploy"

2. **测试 Worker**
   ```bash
   # Worker 会得到一个临时域名，类似：
   https://api-proxy-fluxkontext.your-subdomain.workers.dev
   ```

### 步骤5：配置自定义域名

1. **添加自定义域名**
   ```
   Worker 设置 → Triggers → Custom Domains → Add Custom Domain
   ```

2. **输入域名**
   ```
   Domain: api.fluxkontext.space
   ```

3. **等待 SSL 证书**
   - Cloudflare 会自动为子域名生成 SSL 证书
   - 通常需要几分钟时间

### 步骤6：配置 DNS 记录

1. **进入 DNS 设置**
   ```
   Cloudflare Dashboard → 你的域名 → DNS → Records
   ```

2. **添加 CNAME 记录**
   ```
   Type: CNAME
   Name: api
   Target: api-proxy-fluxkontext.your-subdomain.workers.dev
   Proxy status: Proxied (橙色云朵)
   ```

### 步骤7：测试配置

```bash
# 测试 DNS 解析
nslookup api.fluxkontext.space

# 测试 HTTPS 连接
curl -I https://api.fluxkontext.space

# 测试 API 代理
curl -X POST "https://api.fluxkontext.space/api/v1/flux/text-to-image/pro" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}'
```

## 🔧 高级配置

### 缓存优化

```javascript
// 在 Worker 中添加缓存逻辑
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 对 GET 请求启用缓存
    if (request.method === 'GET') {
      const cache = caches.default;
      const cacheKey = new Request(url.toString(), request);
      const cachedResponse = await cache.match(cacheKey);
      
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // ... 代理逻辑 ...
    
    // 缓存响应（仅对成功的 GET 请求）
    if (request.method === 'GET' && response.status === 200) {
      const responseToCache = response.clone();
      ctx.waitUntil(cache.put(cacheKey, responseToCache));
    }
    
    return response;
  }
}
```

### 错误处理和日志

```javascript
// 添加详细的错误处理
export default {
  async fetch(request, env, ctx) {
    try {
      // ... 主要逻辑 ...
    } catch (error) {
      // 记录错误到 Cloudflare Analytics
      console.error('Worker 错误:', {
        error: error.message,
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'API 代理服务暂时不可用'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
```

## 🎯 Workers vs Pages 对比

### Cloudflare Workers（当前方案）
- ✅ **用途**：API代理、边缘计算、请求处理
- ✅ **优势**：全球边缘节点、低延迟、强大的请求处理能力
- ✅ **适合**：API网关、代理服务、中间件

### Cloudflare Pages
- ✅ **用途**：静态网站托管、JAMstack应用
- ❌ **限制**：不支持Next.js 15的服务器端功能
- ✅ **适合**：纯静态网站、SPA应用

## 💡 最佳实践

1. **监控 Worker 性能**
   ```
   Cloudflare Dashboard → Workers → 你的Worker → Metrics
   ```

2. **设置告警**
   ```
   当错误率超过5%时发送邮件通知
   ```

3. **版本管理**
   ```bash
   # 使用 Wrangler CLI 管理 Worker
   npm install -g wrangler
   wrangler login
   wrangler publish
   ```

4. **环境变量**
   ```javascript
   // 在 Worker 中使用环境变量
   const API_KEY = env.API_KEY;
   const TARGET_DOMAIN = env.TARGET_DOMAIN || 'fluxkontext.space';
   ```

## 🚨 注意事项

1. **免费限制**
   - 每天 100,000 次请求
   - 每次请求最多 10ms CPU 时间
   - 超出后按使用量计费

2. **调试技巧**
   ```javascript
   // 使用 console.log 调试
   console.log('请求URL:', request.url);
   console.log('目标URL:', targetUrl);
   ```

3. **安全考虑**
   - 验证请求来源
   - 限制请求频率
   - 过滤恶意请求

这样配置后，`api.fluxkontext.space` 就会完美代理到你的主域名了！ 