#!/usr/bin/env node

/**
 * 🔍 SEO配置检查脚本
 * 帮助检查项目的SEO配置是否完整，包括Meta标签、结构化数据、图标文件等
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkSEOFiles() {
  log('blue', '\n🔍 检查SEO相关文件...\n');
  
  const requiredFiles = [
    'public/favicon.ico',
    'public/robots.txt',
    'public/manifest.json',
    'src/app/sitemap.ts',
    'src/components/StructuredData.tsx'
  ];
  
  let allGood = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log('green', `✅ ${file}`);
    } else {
      log('red', `❌ ${file} (缺失)`);
      allGood = false;
    }
  });
  
  return allGood;
}

function checkMetaTags() {
  log('blue', '\n📝 检查Meta标签配置...\n');
  
  const layoutPath = 'src/app/layout.tsx';
  if (!fs.existsSync(layoutPath)) {
    log('red', '❌ layout.tsx 文件不存在');
    return false;
  }
  
  const content = fs.readFileSync(layoutPath, 'utf8');
  
  const checks = [
    { pattern: /title:/, name: '页面标题' },
    { pattern: /description:/, name: '页面描述' },
    { pattern: /keywords:/, name: '关键词配置' },
    { pattern: /openGraph:/, name: 'Open Graph标签' },
    { pattern: /twitter:/, name: 'Twitter Card标签' },
    { pattern: /robots:/, name: 'Robots配置' },
    { pattern: /canonical:/, name: 'Canonical链接' }
  ];
  
  let allGood = true;
  
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      log('green', `✅ ${check.name}`);
    } else {
      log('red', `❌ ${check.name} (未配置)`);
      allGood = false;
    }
  });
  
  return allGood;
}

function checkHeadingStructure() {
  log('blue', '\n📝 检查标题结构...\n');
  
  const pageComponentMap = [
    { page: 'src/app/page.tsx', component: 'src/components/HomeContent.tsx', name: 'home' },
    { page: 'src/app/pricing/page.tsx', component: 'src/components/PricingContent.tsx', name: 'pricing' },
    { page: 'src/app/generate/page.tsx', component: 'src/components/GenerateContent.tsx', name: 'generate' },
    { page: 'src/app/resources/page.tsx', component: 'src/components/ResourcesContent.tsx', name: 'resources' }
  ];
  
  let allGood = true;
  
  pageComponentMap.forEach(item => {
    // 检查页面文件是否存在
    if (!fs.existsSync(item.page)) {
      log('red', `❌ ${item.name}: 页面文件不存在`);
      allGood = false;
      return;
    }
    
    // 检查组件文件中的H1标签
    if (fs.existsSync(item.component)) {
      const content = fs.readFileSync(item.component, 'utf8');
      
      // 检查H1标签
      const h1Matches = content.match(/<h1[^>]*>/g);
      if (h1Matches) {
        if (h1Matches.length === 1) {
          log('green', `✅ ${item.name}: 有且仅有一个H1标签`);
        } else {
          log('red', `❌ ${item.name}: 发现${h1Matches.length}个H1标签，应该只有一个`);
          allGood = false;
        }
      } else {
        log('red', `❌ ${item.name}: 缺少H1标签`);
        allGood = false;
      }
      
      // 检查标题层级
      const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      const foundHeadings = [];
      
      headings.forEach(tag => {
        const matches = content.match(new RegExp(`<${tag}[^>]*>`, 'g'));
        if (matches) {
          foundHeadings.push(`${tag.toUpperCase()}(${matches.length})`);
        }
      });
      
      if (foundHeadings.length > 0) {
        log('cyan', `  📊 ${item.name}标题分布: ${foundHeadings.join(', ')}`);
      }
    } else {
      log('yellow', `⚠️  ${item.name}: 组件文件不存在，检查页面文件`);
      
      // 如果组件文件不存在，检查页面文件
      const pageContent = fs.readFileSync(item.page, 'utf8');
      const h1Matches = pageContent.match(/<h1[^>]*>/g);
      if (h1Matches) {
        if (h1Matches.length === 1) {
          log('green', `✅ ${item.name}: 页面文件中有且仅有一个H1标签`);
        } else {
          log('red', `❌ ${item.name}: 页面文件中发现${h1Matches.length}个H1标签，应该只有一个`);
          allGood = false;
        }
      } else {
        log('red', `❌ ${item.name}: 页面文件中缺少H1标签`);
        allGood = false;
      }
    }
  });
  
  return allGood;
}

function checkStructuredData() {
  log('blue', '\n🔗 检查结构化数据...\n');
  
  const componentsDir = 'src/components';
  if (!fs.existsSync(componentsDir)) {
    log('red', '❌ components目录不存在');
    return false;
  }
  
  const files = fs.readdirSync(componentsDir);
  
  const schemaFiles = files.filter(file => 
    file.includes('Schema') || file.includes('StructuredData')
  );
  
  if (schemaFiles.length > 0) {
    log('green', `✅ 发现结构化数据组件: ${schemaFiles.join(', ')}`);
    
    // 检查具体的Schema类型
    const schemaTypes = [
      'Organization',
      'Product', 
      'FAQ',
      'WebSite',
      'BreadcrumbList'
    ];
    
    schemaTypes.forEach(type => {
      const hasSchema = schemaFiles.some(file => {
        const filePath = path.join(componentsDir, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          return content.includes(`"@type": "${type}"`);
        }
        return false;
      });
      
      if (hasSchema) {
        log('green', `  ✅ ${type} Schema`);
      } else {
        log('yellow', `  ⚠️  ${type} Schema (建议添加)`);
      }
    });
    
    return true;
  } else {
    log('red', '❌ 缺少结构化数据配置');
    log('cyan', '💡 建议创建 StructuredData.tsx 组件');
    return false;
  }
}

function checkImageOptimization() {
  log('blue', '\n🖼️ 检查图片优化...\n');
  
  const componentFiles = [
    'src/components/KeyFeatures.tsx',
    'src/components/HowToSteps.tsx',
    'src/components/GenerateContent.tsx'
  ];
  
  let allGood = true;
  
  componentFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath, '.tsx');
      
      // 检查img标签的alt属性
      const imgTags = content.match(/<img[^>]*>/g);
      if (imgTags) {
        const hasAltTags = imgTags.every(tag => tag.includes('alt='));
        if (hasAltTags) {
          log('green', `✅ ${fileName}: 所有图片都有alt属性`);
        } else {
          log('red', `❌ ${fileName}: 部分图片缺少alt属性`);
          allGood = false;
        }
        
        // 检查loading="lazy"
        const hasLazyLoading = imgTags.some(tag => tag.includes('loading="lazy"'));
        if (hasLazyLoading) {
          log('green', `✅ ${fileName}: 使用了懒加载`);
        } else {
          log('yellow', `⚠️  ${fileName}: 建议添加懒加载`);
        }
      }
    }
  });
  
  return allGood;
}

function checkKeywordDensity() {
  log('blue', '\n🎯 检查关键词密度...\n');
  
  const homeContentPath = 'src/components/HomeContent.tsx';
  if (!fs.existsSync(homeContentPath)) {
    log('red', '❌ HomeContent.tsx 文件不存在');
    return false;
  }
  
  const content = fs.readFileSync(homeContentPath, 'utf8').toLowerCase();
  const totalWords = content.split(/\s+/).length;
  
  const keywords = [
    'script to video',
    'ai generator',
    'video generator',
    'free',
    'professional'
  ];
  
  keywords.forEach(keyword => {
    const matches = (content.match(new RegExp(keyword.replace(/\s+/g, '\\s+'), 'g')) || []).length;
    const density = ((matches / totalWords) * 100).toFixed(2);
    
    if (density <= 2.5 && density >= 0.5) {
      log('green', `✅ "${keyword}": ${density}% (合理)`);
    } else if (density > 2.5) {
      log('yellow', `⚠️  "${keyword}": ${density}% (偏高，建议控制在2.5%以内)`);
    } else {
      log('cyan', `ℹ️  "${keyword}": ${density}% (可适当增加)`);
    }
  });
  
  return true;
}

function checkCanonicalLinks() {
  log('blue', '\n🔗 检查Canonical链接...\n');
  
  const pages = [
    { path: 'src/app/page.tsx', canonical: '/' },
    { path: 'src/app/pricing/page.tsx', canonical: '/pricing' },
    { path: 'src/app/generate/page.tsx', canonical: '/generate' },
    { path: 'src/app/resources/page.tsx', canonical: '/resources' }
  ];
  
  let allGood = true;
  
  pages.forEach(page => {
    if (fs.existsSync(page.path)) {
      const content = fs.readFileSync(page.path, 'utf8');
      const hasCanonical = content.includes('canonical:');
      
      if (hasCanonical) {
        log('green', `✅ ${page.canonical}: 已配置Canonical链接`);
      } else {
        log('red', `❌ ${page.canonical}: 缺少Canonical链接`);
        allGood = false;
      }
    }
  });
  
  return allGood;
}

function generateSEOReport() {
  log('blue', '\n📊 生成SEO优化报告...\n');
  
  const checks = [
    { name: 'SEO文件', passed: checkSEOFiles() },
    { name: 'Meta标签', passed: checkMetaTags() },
    { name: '标题结构', passed: checkHeadingStructure() },
    { name: '结构化数据', passed: checkStructuredData() },
    { name: '图片优化', passed: checkImageOptimization() },
    { name: '关键词密度', passed: checkKeywordDensity() },
    { name: 'Canonical链接', passed: checkCanonicalLinks() }
  ];
  
  const passedChecks = checks.filter(check => check.passed).length;
  const totalChecks = checks.length;
  const score = Math.round((passedChecks / totalChecks) * 100);
  
  log('cyan', `\n📈 SEO优化得分: ${score}/100`);
  
  if (score >= 90) {
    log('green', '🎉 SEO优化状态: 优秀');
  } else if (score >= 70) {
    log('yellow', '⚠️  SEO优化状态: 良好，还有改进空间');
  } else {
    log('red', '❌ SEO优化状态: 需要改进');
  }
  
  log('cyan', '\n📋 改进建议:');
  checks.forEach(check => {
    if (!check.passed) {
      log('red', `  • 修复 ${check.name} 相关问题`);
    }
  });
  
  return score;
}

function main() {
  log('blue', '🚀 开始SEO配置检查...\n');
  
  const score = generateSEOReport();
  
  if (score >= 90) {
    log('green', '\n🎉 SEO配置检查通过！');
  } else {
    log('yellow', '\n📖 详细优化指南: docs/SEO配置检查和优化指南.md');
  }
  
  log('cyan', '\n💡 提示: 定期运行此脚本以监控SEO状态');
}

if (require.main === module) {
  main();
}

module.exports = { main }; 