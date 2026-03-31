# ============================================================================
# Setup Script for SauceDemo_WebUI_Automation_TS
# Platform: Windows (PowerShell)
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  SauceDemo_WebUI_Automation_TS - Setup" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# 1. Check Prerequisites
# ============================================================================

Write-Host "[1/5] Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Detect package manager - use selected one or set default
$PM_SELECTED = "npm"
$PM = "npm"

if ($PM_SELECTED -and $PM_SELECTED -ne "npm") {
    $PM = $PM_SELECTED
}

# Auto-detect if npm is selected
if ($PM -eq "npm") {
    if (Get-Command yarn -ErrorAction SilentlyContinue) {
        $PM = "yarn"
    } elseif (Get-Command pnpm -ErrorAction SilentlyContinue) {
        $PM = "pnpm"
    }
}

Write-Host "Using package manager: $PM" -ForegroundColor Cyan

# Check package manager
switch ($PM) {
    "yarn" {
        if (-not (Get-Command yarn -ErrorAction SilentlyContinue)) {
            Write-Host "[ERROR] Yarn is not installed" -ForegroundColor Red
            Write-Host "Please install Yarn from https://classic.yarnpkg.com/lang/en/docs/install/" -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit 1
        }
        $yarnVersion = yarn --version
        Write-Host "[OK] Yarn $yarnVersion detected" -ForegroundColor Green
    }
    "pnpm" {
        if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
            Write-Host "[ERROR] pnpm is not installed" -ForegroundColor Red
            Write-Host "Please install pnpm from https://pnpm.io/installation" -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit 1
        }
        $pnpmVersion = pnpm --version
        Write-Host "[OK] pnpm $pnpmVersion detected" -ForegroundColor Green
    }
    default {
        if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
            Write-Host "[ERROR] npm is not installed" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
        $npmVersion = npm --version
        Write-Host "[OK] npm $npmVersion detected" -ForegroundColor Green
    }
}

# Check Git
try {
    $gitVersion = git --version
    Write-Host "[OK] $gitVersion detected" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Git is not installed" -ForegroundColor Yellow
    Write-Host "Git is recommended for version control" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# 2. Install Dependencies
# ============================================================================

Write-Host "[2/5] Installing project dependencies with $PM..." -ForegroundColor Yellow
Write-Host ""

try {
    switch ($PM) {
        "yarn" { yarn install }
        "pnpm" { pnpm install }
        default { npm install }
    }
    Write-Host "[OK] Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# ============================================================================
# 3. Install Playwright Browsers
# ============================================================================

Write-Host "[3/5] Installing Playwright browsers..." -ForegroundColor Yellow
Write-Host ""

try {
    npx playwright install
    Write-Host "[OK] Playwright browsers installed successfully" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to install browsers" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# ============================================================================
# 4. Setup Environment Variables
# ============================================================================

Write-Host "[4/5] Setting up environment variables..." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "[OK] .env file created from .env.example" -ForegroundColor Green
    Write-Host "[WARNING] Please edit .env file with your actual credentials" -ForegroundColor Yellow
} else {
    Write-Host "[INFO] .env file already exists, skipping..." -ForegroundColor Cyan
}

Write-Host ""

# ============================================================================
# 5. Initialize Git Repository (if not exists)
# ============================================================================

Write-Host "[5/5] Checking Git repository..." -ForegroundColor Yellow
Write-Host ""

try {
    if (-not (Test-Path .git)) {
        git init
        Write-Host "[OK] Git repository initialized" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Git repository already initialized" -ForegroundColor Cyan
    }
} catch {
    Write-Host "[INFO] Git not available, skipping repository initialization" -ForegroundColor Cyan
}

Write-Host ""

# ============================================================================
# Summary
# ============================================================================

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Edit .env file with your test credentials"
Write-Host "     " -NoNewline
Write-Host "notepad .env" -ForegroundColor Green
Write-Host ""
Write-Host "  2. Run tests:"
Write-Host "     " -NoNewline
Write-Host "npm test" -ForegroundColor Green -NoNewline
Write-Host "                 # Run all tests"
Write-Host "     " -NoNewline
Write-Host "npm run test:headed" -ForegroundColor Green -NoNewline
Write-Host "      # Run with visible browser"
Write-Host "     " -NoNewline
Write-Host "npm run test:ui" -ForegroundColor Green -NoNewline
Write-Host "          # Run with UI mode"
Write-Host ""
Write-Host "  3. View test reports:"
Write-Host "     " -NoNewline
Write-Host "npm run test:report" -ForegroundColor Green -NoNewline
Write-Host "      # Show HTML report"
Write-Host ""
Write-Host "For more information, see README.md" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
