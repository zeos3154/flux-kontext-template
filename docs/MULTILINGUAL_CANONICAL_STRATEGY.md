# 🌐 多语言网站Canonical链接策略

## 🚨 **当前问题分析**

### ❌ **发现的问题**

1. **Canonical链接配置不一致**
   ```typescript
   // ❌ 问题1: layout.tsx中的配置
   alternates: {
     canonical: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://fluxkontext.space').origin,
     languages: {
       'en-US': '/en-US',  // ❌ 只配置了en-US，缺少其他13种语言
     },
   }
   
   // ❌ 问题2: 各页面配置不统一
   // page.tsx: canonical: '/'
   // generate/page.tsx: canonical: '/generate'
   // 缺少完整的多语言hreflang配置
   ```

2. **支持14种语言但hreflang配置缺失**
   ```typescript
   // ✅ locale.ts中定义了14种语言
   export const SUPPORTED_LOCALES = [
     'en', 'zh', 'de', 'es', 'fr', 'it', 'ja', 'ko', 
     'nl', 'pl', 'pt', 'ru', 'tr', 'ar', 'hi', 'bn'
   ]
   
   // ❌ 但metadata中只有en-US配置
   ```

3. **缺少多语言路由中间件**
   ```typescript
   // ❌ middleware.ts中没有多语言路由处理
   // 只有API重写和安全头配置
   ```

## 🎯 **完整解决方案**

### 1️⃣ **多语言路由架构设计**

#### **URL结构策略**
```
默认语言 (英语):
https://fluxkontext.space/           → 首页
https://fluxkontext.space/generate   → 生成页面
https://fluxkontext.space/pricing    → 定价页面

其他语言:
https://fluxkontext.space/zh/        → 中文首页
https://fluxkontext.space/zh/generate → 中文生成页面
https://fluxkontext.space/de/pricing  → 德语定价页面
```

#### **Canonical + hreflang策略**
```html
<!-- 英语页面 (默认) -->
<link rel="canonical" href="https://fluxkontext.space/generate" />
<link rel="alternate" hreflang="en" href="https://fluxkontext.space/generate" />
<link rel="alternate" hreflang="zh" href="https://fluxkontext.space/zh/generate" />
<link rel="alternate" hreflang="de" href="https://fluxkontext.space/de/generate" />
<link rel="alternate" hreflang="x-default" href="https://fluxkontext.space/generate" />

<!-- 中文页面 -->
<link rel="canonical" href="https://fluxkontext.space/zh/generate" />
<link rel="alternate" hreflang="en" href="https://fluxkontext.space/generate" />
<link rel="alternate" hreflang="zh" href="https://fluxkontext.space/zh/generate" />
<link rel="alternate" hreflang="x-default" href="https://fluxkontext.space/generate" />
```

### 2️⃣ **技术实现方案**

#### **方案A: 统一Metadata生成器 (推荐)**
```typescript
// src/lib/seo/metadata-generator.ts
import { Metadata } from 'next'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/content/locale'

interface MetadataConfig {
  title: string
  description: string
  keywords: string[]
  path: string
  locale?: string
  images?: string[]
}

export function generateMultilingualMetadata(config: MetadataConfig): Metadata {
  const { title, description, keywords, path, locale = DEFAULT_LOCALE, images } = config
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fluxkontext.space'
  
  // 生成当前页面的canonical URL
  const canonicalPath = locale === DEFAULT_LOCALE ? path : `/${locale}${path}`
  const canonicalUrl = `${baseUrl}${canonicalPath}`
  
  // 生成所有语言的hreflang链接
  const languages: Record<string, string> = {}
  
  // 默认语言
  languages['x-default'] = `${baseUrl}${path}`
  languages[DEFAULT_LOCALE] = `${baseUrl}${path}`
  
  // 其他语言
  SUPPORTED_LOCALES.forEach(lang => {
    if (lang !== DEFAULT_LOCALE) {
      languages[lang] = `${baseUrl}/${lang}${path}`
    }
  })
  
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      locale: locale === 'zh' ? 'zh_CN' : locale,
      alternateLocale: SUPPORTED_LOCALES.filter(l => l !== locale),
      images: images?.map(img => ({
        url: `${baseUrl}${img}`,
        width: 1200,
        height: 630,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images?.map(img => `${baseUrl}${img}`),
    },
  }
}
```

#### **方案B: 中间件路由处理**
```typescript
// middleware.ts (新增多语言处理)
import { NextRequest, NextResponse } from 'next/server'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/content/locale'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 多语言路由处理
  const pathnameIsMissingLocale = SUPPORTED_LOCALES.every(
    locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )
  
  // 如果URL没有语言前缀，检查Accept-Language头
  if (pathnameIsMissingLocale) {
    const acceptLanguage = request.headers.get('accept-language') || ''
    const preferredLocale = getPreferredLocale(acceptLanguage)
    
    // 如果首选语言不是默认语言，重定向到对应语言版本
    if (preferredLocale !== DEFAULT_LOCALE) {
      return NextResponse.redirect(
        new URL(`/${preferredLocale}${pathname}`, request.url)
      )
    }
  }
  
  // 现有的API重写和安全头逻辑...
  return NextResponse.next()
}

function getPreferredLocale(acceptLanguage: string): string {
  // 解析Accept-Language头，返回最匹配的支持语言
  const languages = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim().toLowerCase())
  
  for (const lang of languages) {
    if (SUPPORTED_LOCALES.includes(lang as any)) {
      return lang
    }
    // 处理zh-CN -> zh的情况
    const shortLang = lang.split('-')[0]
    if (SUPPORTED_LOCALES.includes(shortLang as any)) {
      return shortLang
    }
  }
  
  return DEFAULT_LOCALE
}
```

### 3️⃣ **页面级实现示例**

#### **首页多语言配置**
```typescript
// src/app/page.tsx
import { generateMultilingualMetadata } from '@/lib/seo/metadata-generator'

export const metadata = generateMultilingualMetadata({
  title: 'Flux Kontext AI - Professional AI Image Generation Platform',
  description: 'Advanced AI image generation platform powered by Flux Kontext...',
  keywords: ['flux kontext ai', 'ai image generation', 'text to image ai'],
  path: '/',
  images: ['/og-home.png'],
})
```

#### **多语言页面结构**
```
src/app/
├── page.tsx                    # 默认语言首页
├── generate/page.tsx           # 默认语言生成页面
├── [locale]/                   # 多语言页面目录
│   ├── page.tsx               # 多语言首页
│   ├── generate/page.tsx      # 多语言生成页面
│   └── layout.tsx             # 多语言布局
└── layout.tsx                 # 根布局
```

### 4️⃣ **SEO最佳实践**

#### **Canonical链接规则**
1. **默认语言页面**: canonical指向自己，不带语言前缀
2. **其他语言页面**: canonical指向自己，带语言前缀
3. **x-default**: 始终指向默认语言版本
4. **hreflang**: 包含所有语言版本的链接

#### **避免常见错误**
```typescript
// ❌ 错误做法
canonical: '/'  // 所有语言都指向根路径

// ✅ 正确做法
canonical: locale === 'en' ? '/generate' : '/zh/generate'
```

#### **sitemap.xml配置**
```xml
<!-- 每个页面包含所有语言版本 -->
<url>
  <loc>https://fluxkontext.space/generate</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://fluxkontext.space/generate"/>
  <xhtml:link rel="alternate" hreflang="zh" href="https://fluxkontext.space/zh/generate"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://fluxkontext.space/generate"/>
</url>
```

## 🚀 **实施计划**

### **阶段1: 基础架构 (1-2天)**
1. ✅ 创建metadata生成器
2. ✅ 更新middleware.ts
3. ✅ 修复现有页面的canonical配置

### **阶段2: 页面迁移 (3-5天)**
1. ✅ 更新所有现有页面使用新的metadata生成器
2. ✅ 创建多语言页面结构
3. ✅ 测试所有canonical和hreflang链接

### **阶段3: 内容本地化 (1-2周)**
1. ✅ 创建各语言的JSON文件
2. ✅ 实现动态内容加载
3. ✅ 优化多语言SEO

### **阶段4: 测试和优化 (3-5天)**
1. ✅ Google Search Console验证
2. ✅ 修复发现的问题
3. ✅ 性能优化

## 📊 **预期效果**

### **SEO改进**
- ✅ 消除重复内容问题
- ✅ 提升多语言搜索排名
- ✅ 改善用户体验
- ✅ 符合Google多语言SEO最佳实践

### **技术优势**
- ✅ 统一的metadata管理
- ✅ 自动化的hreflang生成
- ✅ 类型安全的多语言支持
- ✅ 易于维护和扩展

## 🔧 **故障排除**

### **常见问题**
1. **hreflang错误**: 使用Google Search Console检查
2. **canonical冲突**: 确保每个页面只有一个canonical
3. **语言检测失败**: 检查Accept-Language解析逻辑
4. **重复内容**: 验证所有语言版本的canonical配置

### **调试工具**
- Google Search Console
- Screaming Frog SEO Spider
- hreflang Tags Testing Tool
- 浏览器开发者工具 