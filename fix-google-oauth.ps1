# 修复Google OAuth环境变量脚本
# 使用方法: .\fix-google-oauth.ps1

Write-Host "🔧 修复Google OAuth环境变量..." -ForegroundColor Green

# 从现有配置中提取Google OAuth信息
$googleClientId = "283696436674-t4cbpe82cpuklf1ij6ep48bal4lqd7e4.apps.googleusercontent.com"
$googleClientSecret = "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"

# 需要设置的环境变量 (使用正确的变量名)
$envVars = @{
    "GOOGLE_ID" = $googleClientId
    "GOOGLE_SECRET" = $googleClientSecret
    "NEXTAUTH_URL" = "https://fluxkontext.space"
}

Write-Host "📊 需要设置的环境变量:" -ForegroundColor Yellow
foreach ($envVar in $envVars.GetEnumerator()) {
    $name = $envVar.Key
    $value = if ($name -eq "GOOGLE_SECRET") { "GOCSPX-***" } else { $envVar.Value }
    Write-Host "   $name = $value" -ForegroundColor Cyan
}

Write-Host ""
$confirmation = Read-Host "⚠️  确定要设置这些环境变量吗？(输入 'YES' 确认)"
if ($confirmation -ne "YES") {
    Write-Host "❌ 操作已取消" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🔄 开始设置环境变量..." -ForegroundColor Blue

try {
    # 设置GOOGLE_ID
    Write-Host "➕ 设置 GOOGLE_ID..." -ForegroundColor Cyan
    echo $googleClientId | vercel env add GOOGLE_ID production
    
    # 设置GOOGLE_SECRET
    Write-Host "➕ 设置 GOOGLE_SECRET..." -ForegroundColor Cyan
    echo $googleClientSecret | vercel env add GOOGLE_SECRET production
    
    # 设置NEXTAUTH_URL
    Write-Host "➕ 设置 NEXTAUTH_URL..." -ForegroundColor Cyan
    echo "https://fluxkontext.space" | vercel env add NEXTAUTH_URL production
    
    Write-Host ""
    Write-Host "✅ 环境变量设置完成！" -ForegroundColor Green
    Write-Host "🔄 请重新部署项目以使更改生效：" -ForegroundColor Yellow
    Write-Host "   vercel --prod" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ 设置环境变量时出错: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 请确保已安装并登录 Vercel CLI" -ForegroundColor Yellow
} 