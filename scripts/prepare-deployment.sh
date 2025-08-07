#!/bin/bash

# AI Medicine Safety App - Deployment Preparation Script
# This script helps prepare your project for GitHub upload and deployment

set -e

echo "🚀 AI Medicine Safety App - Deployment Preparation"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required files exist
echo ""
print_info "Checking project structure..."

required_files=(
    "package.json"
    "next.config.ts"
    "tsconfig.json"
    ".gitignore"
    ".env.example"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file exists"
    else
        print_error "$file is missing"
        exit 1
    fi
done

# Check if Node.js and npm are installed
echo ""
print_info "Checking system requirements..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js installed: $NODE_VERSION"
    
    # Check if Node.js version is 18 or higher
    NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2)
    if [ "$NODE_MAJOR_VERSION" -ge 18 ]; then
        print_status "Node.js version is compatible (>= 18)"
    else
        print_warning "Node.js version should be 18 or higher for best compatibility"
    fi
else
    print_error "Node.js is not installed"
    exit 1
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm installed: v$NPM_VERSION"
else
    print_error "npm is not installed"
    exit 1
fi

# Check if git is initialized
echo ""
print_info "Checking Git repository..."

if [ -d ".git" ]; then
    print_status "Git repository is initialized"
    
    # Check for remote origin
    if git remote get-url origin &> /dev/null; then
        ORIGIN=$(git remote get-url origin)
        print_status "Git remote origin: $ORIGIN"
    else
        print_warning "No Git remote origin set"
        print_info "You'll need to add a GitHub remote before pushing"
    fi
else
    print_warning "Git repository not initialized"
    read -p "Initialize Git repository? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git init
        git add .
        git commit -m "Initial commit: AI Medicine Safety App"
        print_status "Git repository initialized"
    fi
fi

# Install dependencies if node_modules doesn't exist
echo ""
print_info "Checking dependencies..."

if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not installed"
    read -p "Install dependencies now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Installing dependencies..."
        npm install
        print_status "Dependencies installed"
    fi
else
    print_status "Dependencies are installed"
fi

# Check environment variables
echo ""
print_info "Checking environment configuration..."

if [ -f ".env.local" ]; then
    print_status ".env.local exists"
    
    # Check if important variables are set
    if grep -q "GOOGLE_API_KEY=" .env.local; then
        if grep -q "GOOGLE_API_KEY=\"\"" .env.local || grep -q "GOOGLE_API_KEY=your_" .env.local; then
            print_warning "GOOGLE_API_KEY appears to be empty or placeholder"
        else
            print_status "GOOGLE_API_KEY is configured"
        fi
    else
        print_warning "GOOGLE_API_KEY not found in .env.local"
    fi
else
    print_warning ".env.local not found"
    read -p "Create .env.local from .env.example? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.example .env.local
        print_status ".env.local created from .env.example"
        print_warning "Please edit .env.local with your actual API keys"
    fi
fi

# Test build
echo ""
print_info "Testing build process..."

if npm run build &> /dev/null; then
    print_status "Build successful"
else
    print_error "Build failed"
    print_info "Run 'npm run build' manually to see detailed errors"
fi

# Generate Prisma client
echo ""
print_info "Checking database setup..."

if [ -f "prisma/schema.prisma" ]; then
    print_status "Prisma schema exists"
    
    if npx prisma generate &> /dev/null; then
        print_status "Prisma client generated successfully"
    else
        print_warning "Failed to generate Prisma client"
    fi
    
    if npx prisma db push &> /dev/null; then
        print_status "Database schema pushed successfully"
    else
        print_warning "Failed to push database schema"
    fi
else
    print_warning "Prisma schema not found"
fi

# Check for sensitive data in git
echo ""
print_info "Security check..."

sensitive_patterns=(
    "\.env$"
    "\.env\.local$"
    "\.env\.production$"
    "api.*key"
    "secret.*key"
    "password"
    "\.db$"
    "\.sqlite$"
)

git_status=$(git status --porcelain 2>/dev/null || echo "")
security_issues=false

for pattern in "${sensitive_patterns[@]}"; do
    if echo "$git_status" | grep -i "$pattern" &> /dev/null; then
        print_error "Potentially sensitive file staged: $(echo "$git_status" | grep -i "$pattern" | head -1)"
        security_issues=true
    fi
done

if [ "$security_issues" = false ]; then
    print_status "No sensitive files detected in git staging"
else
    print_warning "Please review staged files and ensure no sensitive data is included"
fi

# Final recommendations
echo ""
echo "======================================"
print_info "Deployment Preparation Complete!"
echo "======================================"

echo ""
echo "📋 Next Steps:"
echo "1. Review and update .env.local with your actual API keys"
echo "2. Test your application locally: npm run dev"
echo "3. Commit your changes: git add . && git commit -m 'Ready for deployment'"
echo "4. Push to GitHub: git push origin main"
echo "5. Choose your deployment platform:"
echo "   • Vercel (Recommended): https://vercel.com"
echo "   • Netlify: https://netlify.com"
echo "   • Railway: https://railway.app"
echo "   • Docker: docker build -t ai-medicine-app ."

echo ""
echo "📚 Documentation:"
echo "• README.md - Getting started guide"
echo "• DEPLOYMENT.md - Detailed deployment instructions"
echo "• CONTRIBUTING.md - How to contribute"
echo "• SECURITY.md - Security guidelines"

echo ""
echo "🔑 Required API Keys:"
echo "• Google Gemini AI: https://aistudio.google.com/"
echo "• NextAuth Secret: openssl rand -base64 32"

echo ""
print_status "Your AI Medicine Safety App is ready for deployment! 🚀"
