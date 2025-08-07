# AI Medicine Safety App - Deployment Preparation Script (PowerShell)
# This script helps prepare your project for GitHub upload and deployment

param(
    [switch]$SkipBuild,
    [switch]$Verbose
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$script:Colors = @{
    Red = "Red"
    Green = "Green" 
    Yellow = "Yellow"
    Blue = "Cyan"
    White = "White"
}

function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $script:Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $script:Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $script:Colors.Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $script:Colors.Blue
}

# Main script
Write-Host "🚀 AI Medicine Safety App - Deployment Preparation" -ForegroundColor $script:Colors.White
Write-Host "==================================================" -ForegroundColor $script:Colors.White

# Check if required files exist
Write-Host ""
Write-Info "Checking project structure..."

$requiredFiles = @(
    "package.json",
    "next.config.ts", 
    "tsconfig.json",
    ".gitignore",
    ".env.example"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Status "$file exists"
    } else {
        Write-Error "$file is missing"
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Error "Required files are missing. Please ensure all required files exist."
    exit 1
}

# Check system requirements
Write-Host ""
Write-Info "Checking system requirements..."

try {
    $nodeVersion = node --version
    Write-Status "Node.js installed: $nodeVersion"
    
    # Check Node.js version
    $nodeMajorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeMajorVersion -ge 18) {
        Write-Status "Node.js version is compatible (>= 18)"
    } else {
        Write-Warning "Node.js version should be 18 or higher for best compatibility"
    }
} catch {
    Write-Error "Node.js is not installed or not in PATH"
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Status "npm installed: v$npmVersion"
} catch {
    Write-Error "npm is not installed or not in PATH"
    exit 1
}

# Check Git repository
Write-Host ""
Write-Info "Checking Git repository..."

if (Test-Path ".git") {
    Write-Status "Git repository is initialized"
    
    try {
        $origin = git remote get-url origin 2>$null
        Write-Status "Git remote origin: $origin"
    } catch {
        Write-Warning "No Git remote origin set"
        Write-Info "You'll need to add a GitHub remote before pushing"
    }
} else {
    Write-Warning "Git repository not initialized"
    $response = Read-Host "Initialize Git repository? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        git init
        git add .
        git commit -m "Initial commit: AI Medicine Safety App"
        Write-Status "Git repository initialized"
    }
}

# Check dependencies
Write-Host ""
Write-Info "Checking dependencies..."

if (!(Test-Path "node_modules")) {
    Write-Warning "Dependencies not installed"
    $response = Read-Host "Install dependencies now? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Info "Installing dependencies..."
        npm install
        Write-Status "Dependencies installed"
    }
} else {
    Write-Status "Dependencies are installed"
}

# Check environment variables
Write-Host ""
Write-Info "Checking environment configuration..."

if (Test-Path ".env.local") {
    Write-Status ".env.local exists"
    
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match 'GOOGLE_API_KEY=') {
        if ($envContent -match 'GOOGLE_API_KEY=""' -or $envContent -match 'GOOGLE_API_KEY=your_') {
            Write-Warning "GOOGLE_API_KEY appears to be empty or placeholder"
        } else {
            Write-Status "GOOGLE_API_KEY is configured"
        }
    } else {
        Write-Warning "GOOGLE_API_KEY not found in .env.local"
    }
} else {
    Write-Warning ".env.local not found"
    $response = Read-Host "Create .env.local from .env.example? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Copy-Item ".env.example" ".env.local"
        Write-Status ".env.local created from .env.example"
        Write-Warning "Please edit .env.local with your actual API keys"
    }
}

# Test build (if not skipped)
if (!$SkipBuild) {
    Write-Host ""
    Write-Info "Testing build process..."
    
    try {
        $buildOutput = npm run build 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Build successful"
        } else {
            Write-Error "Build failed"
            if ($Verbose) {
                Write-Host $buildOutput
            }
            Write-Info "Run 'npm run build' manually to see detailed errors"
        }
    } catch {
        Write-Error "Build failed with exception: $_"
    }
}

# Prisma setup
Write-Host ""
Write-Info "Checking database setup..."

if (Test-Path "prisma/schema.prisma") {
    Write-Status "Prisma schema exists"
    
    try {
        npx prisma generate 2>$null
        Write-Status "Prisma client generated successfully"
    } catch {
        Write-Warning "Failed to generate Prisma client"
    }
    
    try {
        npx prisma db push 2>$null
        Write-Status "Database schema pushed successfully"
    } catch {
        Write-Warning "Failed to push database schema"
    }
} else {
    Write-Warning "Prisma schema not found"
}

# Security check
Write-Host ""
Write-Info "Security check..."

$sensitivePatterns = @(
    "\.env$",
    "\.env\.local$", 
    "\.env\.production$",
    "\.db$",
    "\.sqlite$"
)

try {
    $gitStatus = git status --porcelain 2>$null
    $securityIssues = $false
    
    foreach ($pattern in $sensitivePatterns) {
        $matches = $gitStatus | Select-String -Pattern $pattern -CaseSensitive
        if ($matches) {
            Write-Error "Potentially sensitive file staged: $($matches[0])"
            $securityIssues = $true
        }
    }
    
    if (!$securityIssues) {
        Write-Status "No sensitive files detected in git staging"
    } else {
        Write-Warning "Please review staged files and ensure no sensitive data is included"
    }
} catch {
    Write-Info "Could not check git status (this is normal if git is not initialized)"
}

# Final recommendations
Write-Host ""
Write-Host "======================================" -ForegroundColor $script:Colors.White
Write-Info "Deployment Preparation Complete!"
Write-Host "======================================" -ForegroundColor $script:Colors.White

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor $script:Colors.White
Write-Host "1. Review and update .env.local with your actual API keys"
Write-Host "2. Test your application locally: npm run dev"
Write-Host "3. Commit your changes: git add . && git commit -m 'Ready for deployment'"
Write-Host "4. Push to GitHub: git push origin main"
Write-Host "5. Choose your deployment platform:"
Write-Host "   • Vercel (Recommended): https://vercel.com"
Write-Host "   • Netlify: https://netlify.com" 
Write-Host "   • Railway: https://railway.app"
Write-Host "   • Docker: docker build -t ai-medicine-app ."

Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor $script:Colors.White
Write-Host "• README.md - Getting started guide"
Write-Host "• DEPLOYMENT.md - Detailed deployment instructions" 
Write-Host "• CONTRIBUTING.md - How to contribute"
Write-Host "• SECURITY.md - Security guidelines"

Write-Host ""
Write-Host "🔑 Required API Keys:" -ForegroundColor $script:Colors.White
Write-Host "• Google Gemini AI: https://aistudio.google.com/"
Write-Host "• NextAuth Secret: Use online generator or PowerShell: [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))"

Write-Host ""
Write-Status "Your AI Medicine Safety App is ready for deployment! 🚀"
