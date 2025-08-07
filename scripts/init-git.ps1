# Quick Git Setup and GitHub Upload Script
# Run this in PowerShell from your project directory

# Initialize git repository
Write-Host "🔄 Initializing Git repository..." -ForegroundColor Blue
git init

# Add all files
Write-Host "📁 Adding all files to git..." -ForegroundColor Blue
git add .

# Initial commit
Write-Host "💾 Creating initial commit..." -ForegroundColor Blue
git commit -m "Initial commit: AI Medicine Safety App ready for deployment

Features:
- AI-powered medicine search with Google Gemini
- Real-time chat interface for medical queries
- WebSocket support for live communication
- Database integration with Prisma
- Responsive UI with shadcn/ui components
- Production-ready build configuration
- Docker support for containerized deployment

Ready for deployment to Vercel, Netlify, or any cloud platform."

Write-Host "✅ Git repository initialized successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Create a new repository on GitHub.com" -ForegroundColor Yellow
Write-Host "2. Copy the repository URL" -ForegroundColor Yellow
Write-Host "3. Run these commands (replace YOUR_GITHUB_URL):" -ForegroundColor Yellow
Write-Host ""
Write-Host "   git remote add origin YOUR_GITHUB_URL" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "4. Then deploy to Vercel by importing your GitHub repo!" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 Your AI Medicine Safety App will be live in minutes!" -ForegroundColor Green
