import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
* Playwright Configuration
*
* Documentation: https://playwright.dev/docs/test-configuration
*/
export default defineConfig({
// Test directory
testDir: './tests',

// Maximum time one test can run
timeout: 30000,

// Maximum time for expect() calls
expect: {
timeout: 5000
},

// Run tests in files in parallel
fullyParallel: true,

// Fail the build on CI if you accidentally left test.only in the source code
forbidOnly: !!process.env.CI,

// Retry on CI only
retries: process.env.CI ? 2 : 0,

// Limit workers to avoid memory exhaustion when running many browser instances in parallel
workers: process.env.CI ? 1 : 2,

// Reporter to use
reporter: [
['html', { outputFolder: 'playwright-report' }],
['github'],
['list'],
// Custom reporter: auto-generates reports/test-report.html and reports/test-report-summary.md
['./utils/test-reporter']
],

// Shared settings for all the projects below
use: {
// Base URL to use in actions like `await page.goto('/')`
baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',

// Collect trace
trace: 'on-first-retry',

// Screenshot capture
screenshot: 'on-failure',

// Video recording
video: 'off',

// Maximum time each action (click, fill, etc.) can take
actionTimeout: 10000,

// Navigation timeout
navigationTimeout: 30000,
},

// Global setup for authentication
// Note: Authentication is handled via fixtures (see fixtures/auth.fixture.ts)
// globalSetup: './utils/auth.setup.ts',

// Configure projects for major browsers
projects: [
{
name: 'chromium',
use: { ...devices['Desktop Chrome'] },
},

{
name: 'firefox',
use: { ...devices['Desktop Firefox'] },
},

{
name: 'webkit',
use: { ...devices['Desktop Safari'] },
},




],

// Output directory for test artifacts
outputDir: 'test-results/',

// Run your local dev server before starting the tests (optional)
// webServer: {
// command: 'npm run start',
// url: 'https://www.saucedemo.com',
// reuseExistingServer: !process.env.CI,
// },
});