#!/bin/bash

# AI Medicine Safety App - Deployment Preparation Script
# This script prepares your project for deployment

set -e

echo "🚀 AI Medicine Safety App - Deployment Preparation"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    print_error "Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi

print_status "Node.js version check passed: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi

print_status "npm version check passed: $(npm -v)"

# Install dependencies
print_info "Installing dependencies..."
npm install

print_status "Dependencies installed successfully"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_warning ".env.local created from .env.example - Please update with your actual values"
    else
        print_error ".env.example not found. Please create environment configuration."
        exit 1
    fi
else
    print_status "Environment configuration found"
fi

# Generate Prisma client
print_info "Generating Prisma client..."
npx prisma generate

print_status "Prisma client generated successfully"

# Initialize database
print_info "Initializing database..."
npx prisma db push

print_status "Database initialized successfully"

# Run linting
print_info "Running linter..."
if npm run lint; then
    print_status "Linting passed"
else
    print_warning "Linting found issues - please fix before deployment"
fi

# Test build
print_info "Testing production build..."
if npm run build; then
    print_status "Build successful"
else
    print_error "Build failed - please fix errors before deployment"
    exit 1
fi

# Check for sensitive files
print_info "Checking for sensitive files..."
SENSITIVE_FILES=()

if [ -f ".env" ]; then
    SENSITIVE_FILES+=(".env")
fi

if [ -f ".env.local" ]; then
    if ! grep -q ".env.local" .gitignore; then
        SENSITIVE_FILES+=(".env.local (not in .gitignore)")
    fi
fi

if [ ${#SENSITIVE_FILES[@]} -gt 0 ]; then
    print_warning "Sensitive files detected that might be committed:"
    for file in "${SENSITIVE_FILES[@]}"; do
        echo "  - $file"
    done
fi

# Git status check
if command -v git &> /dev/null && [ -d ".git" ]; then
    print_info "Checking Git status..."
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes. Consider committing them before deployment."
        git status --short
    else
        print_status "Git working directory is clean"
    fi
else
    print_warning "Git repository not initialized. Run 'git init' to set up version control."
fi

echo ""
echo "🎉 Deployment Preparation Complete!"
echo "=================================="
echo ""
echo "Next Steps:"
echo "1. Update .env.local with your actual API keys"
echo "2. Test the application locally: npm run dev"
echo "3. Choose a deployment platform (Vercel recommended)"
echo "4. Follow the deployment guide in DEPLOYMENT.md"
echo ""
echo "For Vercel deployment:"
echo "1. Push to GitHub: git add . && git commit -m 'Ready for deployment' && git push"
echo "2. Visit https://vercel.com and import your repository"
echo "3. Add environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""
print_status "Your AI Medicine Safety App is ready for deployment! 🚀"
