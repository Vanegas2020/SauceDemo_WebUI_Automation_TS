@echo off
REM ============================================================================
REM Setup Script for SauceDemo_WebUI_Automation_TS
REM Platform: Windows (Command Prompt)
REM ============================================================================

echo ==============================================
echo   SauceDemo_WebUI_Automation_TS - Setup
echo ==============================================
echo.

REM ============================================================================
REM 1. Check Prerequisites
REM ============================================================================

echo [1/5] Checking prerequisites...
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js detected

REM Detect package manager - use selected one or set default
set "PM_SELECTED=npm"
set "PM=npm"

if not "%PM_SELECTED%"=="" (
    if not "%PM_SELECTED%"=="npm" (
        set "PM=%PM_SELECTED%"
    )
)

REM Auto-detect if npm is selected
if "%PM%"=="npm" (
    where yarn >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set "PM=yarn"
    ) else (
        where pnpm >nul 2>nul
        if %ERRORLEVEL% EQU 0 (
            set "PM=pnpm"
        )
    )
)

echo Using package manager: %PM%

REM Check package manager
if "%PM%"=="yarn" (
    where yarn >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Yarn is not installed
        echo Please install Yarn from https://classic.yarnpkg.com/lang/en/docs/install/
        pause
        exit /b 1
    )
    for /f "delims=" %%i in ('yarn -v') do echo [OK] Yarn %%i detected
) else if "%PM%"=="pnpm" (
    where pnpm >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] pnpm is not installed
        echo Please install pnpm from https://pnpm.io/installation
        pause
        exit /b 1
    )
    for /f "delims=" %%i in ('pnpm -v') do echo [OK] pnpm %%i detected
) else (
    where npm >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm is not installed
        pause
        exit /b 1
    )
    for /f "delims=" %%i in ('npm -v') do echo [OK] npm %%i detected
)

where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Git is not installed
    echo Git is recommended for version control
) else (
    echo [OK] Git detected
)

echo.

REM ============================================================================
REM 2. Install Dependencies
REM ============================================================================

echo [2/5] Installing project dependencies with %PM%...
echo.

if "%PM%"=="yarn" (
    call yarn install
) else if "%PM%"=="pnpm" (
    call pnpm install
) else (
    call npm install
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed successfully
echo.

REM ============================================================================
REM 3. Install Playwright Browsers
REM ============================================================================

echo [3/5] Installing Playwright browsers...
echo.

call npx playwright install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install browsers
    pause
    exit /b 1
)

echo [OK] Playwright browsers installed successfully
echo.

REM ============================================================================
REM 4. Setup Environment Variables
REM ============================================================================

echo [4/5] Setting up environment variables...
echo.

if not exist .env (
    copy .env.example .env >nul
    echo [OK] .env file created from .env.example
    echo [WARNING] Please edit .env file with your actual credentials
) else (
    echo [INFO] .env file already exists, skipping...
)

echo.

REM ============================================================================
REM 5. Initialize Git Repository (if not exists)
REM ============================================================================

echo [5/5] Checking Git repository...
echo.

where git >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    if not exist .git (
        git init
        echo [OK] Git repository initialized
    ) else (
        echo [INFO] Git repository already initialized
    )
)

echo.

REM ============================================================================
REM Summary
REM ============================================================================

echo ==============================================
echo   Setup Complete!
echo ==============================================
echo.
echo Next steps:
echo.
echo   1. Edit .env file with your test credentials
echo      notepad .env
echo.
echo   2. Run tests:
echo      npm test                 -- Run all tests
echo      npm run test:headed      -- Run with visible browser
echo      npm run test:ui          -- Run with UI mode
echo.
echo   3. View test reports:
echo      npm run test:report      -- Show HTML report
echo.
echo For more information, see README.md
echo.

pause
