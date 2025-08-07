# AI Medicine Safety App - Deployment Preparation Script (PowerShell)
# This script prepares your project for deployment on Windows

param(
    [switch]$SkipBuild = $false,
    [switch]$Verbose = $false
)

# Function to print colored output
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

Clear-Host
Write-Host "🚀 AI Medicine Safety App - Deployment Preparation" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Check if Node.js is installed
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) {
        Write-ErrorMsg "Node.js is not installed. Please install Node.js 18+ first."
        Write-Host "Download from: https://nodejs.org/" -ForegroundColor Blue
        exit 1
    }

    $nodeVersionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeVersionNumber -lt 18) {
        Write-ErrorMsg "Node.js version must be 18 or higher. Current: $nodeVersion"
        exit 1
    }

    Write-Success "Node.js version check passed: $nodeVersion"

    # Check if npm is installed
    $npmVersion = npm --version 2>$null
    if (-not $npmVersion) {
        Write-ErrorMsg "npm is not installed."
        exit 1
    }

    Write-Success "npm version check passed: $npmVersion"

    # Check if we're in the right directory
    if (-not (Test-Path "package.json")) {
        Write-ErrorMsg "package.json not found. Please run this script from the project root directory."
        exit 1
    }

    # Install dependencies
    Write-Info "Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Failed to install dependencies"
        exit 1
    }
    Write-Success "Dependencies installed successfully"

    # Check if .env.local exists
    if (-not (Test-Path ".env.local")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env.local"
            Write-Warning ".env.local created from .env.example - Please update with your actual values"
        } else {
            Write-ErrorMsg ".env.example not found. Please create environment configuration."
            exit 1
        }
    } else {
        Write-Success "Environment configuration found"
    }

    # Generate Prisma client
    Write-Info "Generating Prisma client..."
    npx prisma generate
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Failed to generate Prisma client"
        exit 1
    }
    Write-Success "Prisma client generated successfully"

    # Initialize database
    Write-Info "Initializing database..."
    npx prisma db push
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Database initialization had issues - please check manually"
    } else {
        Write-Success "Database initialized successfully"
    }

    # Run linting
    Write-Info "Running linter..."
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Linting found issues - please fix before deployment"
    } else {
        Write-Success "Linting passed"
    }

    # Test build (unless skipped)
    if (-not $SkipBuild) {
        Write-Info "Testing production build..."
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMsg "Build failed - please fix errors before deployment"
            exit 1
        }
        Write-Success "Build successful"
    }

    # Check for sensitive files
    Write-Info "Checking for sensitive files..."
    $sensitiveFiles = @()

    if (Test-Path ".env") {
        $sensitiveFiles += ".env"
    }

    if (Test-Path ".env.local") {
        $gitignoreContent = Get-Content ".gitignore" -Raw -ErrorAction SilentlyContinue
        if (-not $gitignoreContent -or $gitignoreContent -notmatch "\.env\.local") {
            $sensitiveFiles += ".env.local (not in .gitignore)"
        }
    }

    if ($sensitiveFiles.Count -gt 0) {
        Write-Warning "Sensitive files detected that might be committed:"
        foreach ($file in $sensitiveFiles) {
            Write-Host "  - $file" -ForegroundColor Yellow
        }
    }

    # Git status check
    $gitExists = Get-Command git -ErrorAction SilentlyContinue
    if ($gitExists -and (Test-Path ".git")) {
        Write-Info "Checking Git status..."
        
        $gitStatus = git status --porcelain 2>$null
        if ($gitStatus) {
            Write-Warning "You have uncommitted changes. Consider committing them before deployment."
            git status --short
        } else {
            Write-Success "Git working directory is clean"
        }
    } else {
        Write-Warning "Git repository not initialized. Run 'git init' to set up version control."
    }

    Write-Host ""
    Write-Host "🎉 Deployment Preparation Complete!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Update .env.local with your actual API keys"
    Write-Host "2. Test the application locally: npm run dev"
    Write-Host "3. Choose a deployment platform (Vercel recommended)"
    Write-Host "4. Follow the deployment guide in DEPLOYMENT.md"
    Write-Host ""
    Write-Host "For Vercel deployment:" -ForegroundColor Yellow
    Write-Host "1. Push to GitHub: git add . && git commit -m 'Ready for deployment' && git push"
    Write-Host "2. Visit https://vercel.com and import your repository"
    Write-Host "3. Add environment variables in Vercel dashboard"
    Write-Host "4. Deploy!"
    Write-Host ""
    Write-Success "Your AI Medicine Safety App is ready for deployment! 🚀"

} catch {
    Write-ErrorMsg "An error occurred: $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
