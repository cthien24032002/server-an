# GoSafe Server - Deploy to Vercel

Write-Host "🚀 Deploying GoSafe Server to Vercel..." -ForegroundColor Green
Write-Host ""

# Check if in server directory
if (!(Test-Path "server.js")) {
    Write-Host "❌ Please run this script from the server directory" -ForegroundColor Red
    Write-Host "   cd server" -ForegroundColor Yellow
    Write-Host "   Then run this script again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Vercel CLI is installed
Write-Host "📦 Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

Write-Host ""
Write-Host "🔑 Environment Variables Setup:" -ForegroundColor Cyan
Write-Host "You need to set these in Vercel dashboard:" -ForegroundColor White
Write-Host "   ZALO_APP_ID=your_app_id" -ForegroundColor Gray
Write-Host "   ZALO_APP_SECRET=your_app_secret" -ForegroundColor Gray
Write-Host "   NODE_ENV=production" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "Follow the prompts to:" -ForegroundColor White
Write-Host "   1. Link to your Vercel account" -ForegroundColor White
Write-Host "   2. Set project name (e.g., gosafe-backend)" -ForegroundColor White
Write-Host "   3. Deploy!" -ForegroundColor White
Write-Host ""

# Deploy
vercel --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy the production URL from Vercel" -ForegroundColor White
Write-Host "2. Update SERVER_URL in client/src/hooks/useServerAuth.js" -ForegroundColor White
Write-Host "3. Add environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "4. Test the client!" -ForegroundColor White

Read-Host "Press Enter to exit"
