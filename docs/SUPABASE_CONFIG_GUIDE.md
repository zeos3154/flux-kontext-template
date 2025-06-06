# 🗄️ Supabase 完整配置指南

## 📍 需要配置的环境变量

### 1. API 配置 (Settings → API)
```bash
# 项目URL
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"

# 公开密钥 (anon key)
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

# 服务角色密钥 (service_role key)
SUPABASE_SERVICE_ROLE_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

### 2. 数据库连接 (Settings → Database)
```bash
# 数据库连接字符串
DATABASE_URL="postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres"

# 或者使用连接池 (推荐用于生产环境)
DATABASE_URL="postgresql://postgres.your-project-ref:your_password@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

## 🔍 获取步骤详解

### 步骤1: 获取API配置
1. 登录 https://supabase.com/dashboard
2. 选择你的项目
3. 点击 **Settings** → **API**
4. 复制以下信息：
   - **Project URL**: 就是 `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: 就是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role**: 就是 `SUPABASE_SERVICE_ROLE_KEY`

### 步骤2: 获取数据库连接
1. 在同一个项目中，点击 **Settings** → **Database**
2. 向下滚动找到 **"Connection string"** 部分
3. 你会看到：
   ```
   URI: postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
4. **⚠️ 重要**: 完全替换中括号和里面的内容
   - `[YOUR-PASSWORD]` → 你的实际密码 (不要保留中括号)
   - `[YOUR-PROJECT-REF]` → 你的项目ID (不要保留中括号)

### 步骤3: 如果忘记数据库密码
1. 在 **Settings** → **Database** 页面
2. 找到 **"Database password"** 部分
3. 点击 **"Reset database password"**
4. 设置新密码并记住它
5. 使用新密码更新 `DATABASE_URL`

## 📋 完整的环境变量模板

```bash
# 🗄️ Supabase 配置
NEXT_PUBLIC_SUPABASE_URL="https://abcdefghijklmnop.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyNTEzNzY4NCwiZXhwIjoxOTQwNzEzNjg0fQ.example"
SUPABASE_SERVICE_ROLE_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjI1MTM3Njg0LCJleHAiOjE5NDA3MTM2ODR9.example"
DATABASE_URL="postgresql://postgres:MySecurePass123@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

## 🎯 **DATABASE_URL 替换示例**

### ❌ 错误的格式 (保留了中括号):
```bash
DATABASE_URL="postgresql://postgres:[MyPassword123]@db.[abcdef123456].supabase.co:5432/postgres"
```

### ✅ 正确的格式 (完全替换):
```bash
DATABASE_URL="postgresql://postgres:MyPassword123@db.abcdef123456.supabase.co:5432/postgres"
```

## ⚠️ 重要提醒

1. **DATABASE_URL** 包含数据库密码，绝对不能泄露
2. **service_role key** 有管理员权限，只能在服务器端使用
3. **anon key** 可以在客户端使用，相对安全
4. 生产环境建议使用连接池版本的 DATABASE_URL
5. **完全删除所有中括号** `[` 和 `]`，只保留实际值

## 🔧 验证配置

配置完成后，可以运行项目的配置检查：
```bash
npm run check:supabase
``` 