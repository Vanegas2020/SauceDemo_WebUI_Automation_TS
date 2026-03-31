#!/bin/bash

# ============================================================================
# Setup Script for SauceDemo_WebUI_Automation_TS
# Platform: Linux/macOS
# ============================================================================

set -e  # Exit on error

echo "=============================================="
echo "  SauceDemo_WebUI_Automation_TS - Setup"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# 1. Check Prerequisites
# ============================================================================

echo "📋 Checking prerequisites..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js >= 24.x from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 24.x ]; then
    echo -e "${YELLOW}⚠️  Node.js version is $NODE_VERSION, recommended >= 24.x${NC}"
else
    echo -e "${GREEN}✓${NC} Node.js $(node -v) detected"
fi

# Detect package manager - use selected one or auto-detect
PM_SELECTED="npm"
PM="npm"

if [ -n "$PM_SELECTED" ] && [ "$PM_SELECTED" != "npm" ]; then
    # Use the selected package manager if not npm
    PM=$PM_SELECTED
else
    # Auto-detect package manager
    if command -v pnpm &> /dev/null; then
        PM="pnpm"
    elif command -v yarn &> /dev/null; then
        PM="yarn"
    fi
fi

echo "Using package manager: $PM"

# Check package manager availability
case $PM in
    yarn)
        if ! command -v yarn &> /dev/null; then
            echo -e "${RED}❌ Yarn is not installed${NC}"
            echo "Please install Yarn: https://classic.yarnpkg.com/en/docs/install"
            exit 1
        fi
        echo -e "${GREEN}✓${NC} Yarn $(yarn -v) detected"
        ;;
    pnpm)
        if ! command -v pnpm &> /dev/null; then
            echo -e "${RED}❌ pnpm is not installed${NC}"
            echo "Please install pnpm: https://pnpm.io/installation"
            exit 1
        fi
        echo -e "${GREEN}✓${NC} pnpm $(pnpm -v) detected"
        ;;
    *)
        if ! command -v npm &> /dev/null; then
            echo -e "${RED}❌ npm is not installed${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓${NC} npm $(npm -v) detected"
        ;;
esac

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}⚠️  Git is not installed${NC}"
    echo "Git is recommended for version control"
else
    echo -e "${GREEN}✓${NC} Git $(git --version | cut -d' ' -f3) detected"
fi

echo ""

# ============================================================================
# 2. Install Dependencies
# ============================================================================

# Install Dependencies
echo "📦 Installing project dependencies with $PM..."
echo ""

case $PM in
    yarn)
        yarn install
        ;;
    pnpm)
        pnpm install
        ;;
    *)
        npm install
        ;;
esac

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed successfully"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo ""

# ============================================================================
# 3. Install Playwright Browsers
# ============================================================================

echo "🌐 Installing Playwright browsers..."
echo ""

npx playwright install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Playwright browsers installed successfully"
else
    echo -e "${RED}❌ Failed to install browsers${NC}"
    exit 1
fi

echo ""

# ============================================================================
# 4. Setup Environment Variables
# ============================================================================

echo "⚙️  Setting up environment variables..."
echo ""

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓${NC} .env file created from .env.example"
    echo -e "${YELLOW}⚠️  Please edit .env file with your actual credentials${NC}"
else
    echo -e "${YELLOW}ℹ${NC}  .env file already exists, skipping..."
fi

echo ""

# ============================================================================
# 5. Initialize Git Repository (if not exists)
# ============================================================================

if command -v git &> /dev/null; then
    if [ ! -d .git ]; then
        echo "📝 Initializing Git repository..."
        git init
        echo -e "${GREEN}✓${NC} Git repository initialized"
        echo ""
    fi
fi

# ============================================================================
# 6. Summary
# ============================================================================

echo "=============================================="
echo "  ✅ Setup Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo ""
echo "  1. Edit .env file with your test credentials"
echo "     ${YELLOW}nano .env${NC}"
echo ""
echo "  2. Run tests:"
echo "     ${GREEN}npm test${NC}                 # Run all tests"
echo "     ${GREEN}npm run test:headed${NC}      # Run with visible browser"
echo "     ${GREEN}npm run test:ui${NC}          # Run with UI mode"
echo ""
echo "  3. View test reports:"
echo "     ${GREEN}npm run test:report${NC}      # Show HTML report"
echo ""
echo "For more information, see README.md"
echo ""
