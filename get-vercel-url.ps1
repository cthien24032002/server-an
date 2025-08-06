# Script để deploy và lấy URL mới
Write-Host "🚀 Getting Vercel URL..." -ForegroundColor Green

# Check if in server directory
if (!(Test-Path "server.js")) {
    Write-Host "❌ Please run from server directory" -ForegroundColor Red
    exit 1
}

# Deploy và capture output
Write-Host "📦 Deploying to get URL..." -ForegroundColor Yellow
$output = vercel --prod 2>&1

# Extract URL from output
$url = $output | Select-String -Pattern "https://.*\.vercel\.app" | ForEach-Object { $_.Matches.Value }

if ($url) {
    Write-Host "✅ Production URL: $url" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update README.md with new URL" -ForegroundColor White
    Write-Host "2. Update client/src/config/server.js" -ForegroundColor White
    
    # Copy to clipboard if possible
    try {
        $url | Set-Clipboard
        Write-Host "📎 URL copied to clipboard!" -ForegroundColor Green
    } catch {
        Write-Host "📎 Please copy URL manually: $url" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Could not extract URL from output" -ForegroundColor Red
    Write-Host "Output:" -ForegroundColor Gray
    Write-Host $output
}

Read-Host "Press Enter to exit"