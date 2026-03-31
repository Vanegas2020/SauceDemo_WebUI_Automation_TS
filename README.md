# SauceDemo Web UI Automation — TypeScript

[![Playwright Tests](https://github.com/Vanegas2020/SauceDemo_WebUI_Automation_TS/actions/workflows/playwright.yml/badge.svg)](https://github.com/Vanegas2020/SauceDemo_WebUI_Automation_TS/actions/workflows/playwright.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.50+-green?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue?logo=typescript)
![Tests](https://img.shields.io/badge/Tests-44%20checkpoints-brightgreen)
![Browsers](https://img.shields.io/badge/Browsers-Chromium%20%7C%20Firefox%20%7C%20WebKit-informational)

A structured **Web UI automation suite** targeting [SauceDemo](https://www.saucedemo.com) — a standard e-commerce practice application. This project demonstrates a multi-layer testing approach covering structural health, element behavior, authentication security, and end-to-end flows using the Page Object Model pattern.

---

## What This Project Tests

The suite covers two pages with **44 checkpoints** across multiple test categories:

| Page | Flow | Checkpoints |
|------|------|-------------|
| Login (`/`) | Independent tests (each CP navigates fresh) | 44 CPs |
| Backpack product (`/inventory-item.html`) | Sequential flow (shared session) | Authenticated E2E flow |

---

## Test Categories

### Health & Structural Checks
- URL responds correctly (no `about:blank`, correct hostname)
- Base load time under 15s
- No failed network requests (4xx/5xx)
- Title and favicon load
- No visible error content on initial render
- No console errors on page load
- Base layout (`main`, `[role="main"]`) present and non-empty
- No eternal placeholders/skeletons after 2 seconds
- Language attribute present on `<html>`
- No blocking overlays or modals
- No horizontal scroll at default viewport
- No overlapping header/main sections

### Regression Baselines
- Screenshot baseline captured per run
- Key element count stable (main container children > 0)
- No new severe console errors or warnings

### Authentication Security
- Empty credentials → error message visible
- Invalid credentials → error message visible
- SQL injection protection (`' OR '1'='1` → no redirect to inventory)
- XSS protection (script tags/event handlers not echoed back in page content)

### Per-Element Checks (Login: `username`, `password`, `login-button`)
For each recorded element, 8 independent checkpoints:
- Visibility on initial load
- Initial state (enabled / unchecked as appropriate for element type)
- Interactability (computed style check: no `pointer-events: none`, `display: none`, or `visibility: hidden`)
- Click action executes without crash
- Focus behavior (focusable elements receive focus after `.focus()`)
- No stuck spinner/loading state after action
- No visible error messages after action
- No console errors after action

### End-to-End Authenticated Flow (Backpack)
- Login page loads successfully
- Authenticated session active (storage state reused)
- Navigation to product detail page succeeds
- Add to cart action completes
- Cart badge updates

---

## Project Structure

```
.
├── tests/
│   ├── login.spec.ts           # Login page — 44 independent checkpoints
│   ├── backpack.spec.ts        # Backpack product — sequential authenticated flow
│   └── functional.spec.ts      # Additional functional tests
├── pages/
│   ├── base.page.ts            # Base Page Object with shared navigation
│   ├── login.page.ts           # Login Page Object
│   └── backpack.page.ts        # Backpack Page Object
├── fixtures/
│   ├── auth.fixture.ts         # Auth fixture — session reuse + stale-state refresh
│   └── index.ts
├── utils/
│   ├── test-reporter.ts        # Custom HTML + Markdown report writer
│   ├── test-report-analyzer.ts # Post-run analysis
│   └── test-stats.ts           # Aggregated pass/fail statistics
├── data/
│   └── test-data.json          # Reusable test data
├── .github/workflows/
│   └── playwright.yml          # GitHub Actions CI/CD pipeline
├── playwright.config.ts
└── .env.example
```

---

## CI/CD

Tests run automatically on every push and pull request via GitHub Actions:

- **Node.js 24** on `ubuntu-latest`
- All three browsers: Chromium, Firefox, WebKit
- Playwright HTML report and test results uploaded as artifacts (30-day retention)
- `BASE_URL`, `LOGIN_URL`, and credentials configurable via repository secrets

See [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml).

### Required Secrets

| Secret | Description |
|--------|-------------|
| `BASE_URL` | Override base URL (default: `https://www.saucedemo.com`) |
| `LOGIN_URL` | Override login page URL |
| `TEST_USER_ADMIN_USERNAME` | Test account username |
| `TEST_USER_ADMIN_PASSWORD` | Test account password |

---

## Setup

### Prerequisites
- Node.js ≥ 24.0.0
- npm

### Install

```bash
npm install
npx playwright install --with-deps
```

### Configure

```bash
cp .env.example .env
# Edit .env with your credentials
```

---

## Running Tests

```bash
# Run full suite (all browsers)
npm test

# Run in a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run a specific spec
npx playwright test tests/login.spec.ts

# Run with browser visible
npm run test:headed

# Open interactive UI mode
npm run test:ui

# Open Playwright HTML report
npm run test:report
```

---

## Authentication

The auth fixture (`fixtures/auth.fixture.ts`) handles session reuse automatically:

- On first run: performs login and saves browser storage state to `.auth/user.json`
- On subsequent runs: reuses the saved state (skips login)
- If the state file is older than 1 hour: re-authenticates automatically

Credentials are read from `.env` — never hardcoded.

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://www.saucedemo.com` | Target application base URL |
| `LOGIN_URL` | `/` | Login page path or full URL |
| `TEST_USER_ADMIN_USERNAME` | — | Test account username |
| `TEST_USER_ADMIN_PASSWORD` | — | Test account password |
| `HEADED` | `false` | Set `true` to show browser during run |

---

## Stack

| Tool | Version | Role |
|------|---------|------|
| [Playwright](https://playwright.dev/) | ^1.50 | Browser automation + test runner |
| TypeScript | ^5.7 | Type-safe test authoring |
| Node.js | ≥24 | Runtime |
| GitHub Actions | — | CI/CD |
