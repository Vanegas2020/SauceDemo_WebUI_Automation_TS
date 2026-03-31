/**
 * SauceDemo_WebUI_Automation_TS - Authentication Fixture
 *
 * This fixture provides authenticated browser contexts and pages.
 * Use this to skip login steps in tests that require authentication.
 *
 * @see {@link https://playwright.dev/docs/auth|Authentication Guide}
 * @see {@link https://playwright.dev/docs/test-fixtures|Test Fixtures}
 */

import { test as base, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

/**
 * ESM compatibility: get __dirname equivalent
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Storage state file path for authenticated sessions
 */
const STORAGE_STATE_PATH = path.join(__dirname, '..', '.auth', 'user.json');

/**
 * Maximum age of the auth state file in milliseconds (default: 1 hour).
 * If the file is older than this, it will be regenerated.
 */
const AUTH_STATE_MAX_AGE_MS = 60 * 60 * 1000;

/**
 * Login URL — read from environment, fall back to detected login page URL
 */
const LOGIN_URL = process.env.LOGIN_URL || '/';

/**
 * Check if the auth state file is stale (older than max age)
 */
function isAuthStateStale(): boolean {
  try {
    if (!fs.existsSync(STORAGE_STATE_PATH)) return true;
    const stats = fs.statSync(STORAGE_STATE_PATH);
    const ageMs = Date.now() - stats.mtimeMs;
    return ageMs > AUTH_STATE_MAX_AGE_MS;
  } catch {
    return true;
  }
}

/**
 * Delete auth state file to force re-authentication
 */
function clearAuthState(): void {
  try {
    if (fs.existsSync(STORAGE_STATE_PATH)) {
      fs.unlinkSync(STORAGE_STATE_PATH);
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Extended test fixtures with authentication
 */
type AuthFixtures = {
  /**
   * Authenticated page - automatically logged in
   */
  authenticatedPage: Page;

  /**
   * Authenticated context - reusable browser context with auth state
   */
  authenticatedContext: BrowserContext;
};

/**
 * Setup authentication storage state using direct page locators.
 * Does NOT depend on Page Object classes — uses selectors from recorded elements.
 *
 * @param page - Playwright page instance
 * @returns Promise that resolves when authentication is complete
 */
async function setupAuthState(page: Page): Promise<void> {
  const username = process.env.TEST_USER_ADMIN_USERNAME || '';
  const password = process.env.TEST_USER_ADMIN_PASSWORD || '';

  if (!username || !password) {
    throw new Error(
      'Missing credentials: set TEST_USER_ADMIN_USERNAME and TEST_USER_ADMIN_PASSWORD in .env'
    );
  }

  // Navigate to login page
  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });

  // Fill credentials using recorded element selectors
  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="password"]').fill(password);
  await page.locator('[data-test="login-button"]').click();

  // Wait for navigation to complete after login
  await page.waitForLoadState('networkidle');

  // Ensure .auth directory exists
  const authDir = path.dirname(STORAGE_STATE_PATH);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Save authentication state
  await page.context().storageState({ path: STORAGE_STATE_PATH });
}

/**
 * Extended test with authentication fixtures
 * Overrides the default 'page' fixture to provide an authenticated page
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Override default page fixture with authenticated page
   * Automatically provides a page with authentication state loaded
   */
  page: async ({ browser }, use) => {
    // Check if auth state file exists and is not stale
    if (!fs.existsSync(STORAGE_STATE_PATH) || isAuthStateStale()) {
      clearAuthState();
      const setupContext = await browser.newContext();
      const setupPage = await setupContext.newPage();

      try {
        await setupAuthState(setupPage);
      } finally {
        await setupContext.close();
      }
    }

    // Create context with stored auth state
    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATH,
    });

    const page = await context.newPage();

    // Use the authenticated page in the test
    await use(page);

    // Cleanup
    await context.close();
  },

  /**
   * Authenticated page fixture (alias for page)
   * For explicit usage when you want to be clear about authentication
   */
  authenticatedPage: async ({ page }, use) => {
    // Just use the already-authenticated page
    await use(page);
  },

  /**
   * Authenticated context fixture
   * Provides a reusable browser context with authentication
   */
  authenticatedContext: async ({ browser }, use) => {
    // Check if auth state file exists and is not stale
    if (!fs.existsSync(STORAGE_STATE_PATH) || isAuthStateStale()) {
      clearAuthState();
      const setupContext = await browser.newContext();
      const setupPage = await setupContext.newPage();

      try {
        await setupAuthState(setupPage);
      } finally {
        await setupContext.close();
      }
    }

    // Create context with stored auth state
    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATH,
    });

    // Use the authenticated context in the test
    await use(context);

    // Cleanup
    await context.close();
  },
});

/**
 * Re-export expect for convenience
 */
export { expect } from '@playwright/test';

/**
 * Helper function to clear all authentication states
 * Useful for test cleanup or resetting authentication
 */
export function clearAuthStates(): void {
  const authDir = path.join(__dirname, '..', '.auth');

  if (fs.existsSync(authDir)) {
    const files = fs.readdirSync(authDir);
    files.forEach(file => {
      const filePath = path.join(authDir, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    });
  }
}

/**
 * Helper function to check if user is authenticated
 * Can be used in tests to verify auth state
 *
 * @param page - Playwright page instance
 * @returns Promise resolving to true if authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Check if user is NOT on the login page (authenticated = redirected away from login)
    const currentUrl = page.url();
    const loginUrl = LOGIN_URL;
    return currentUrl !== loginUrl && !currentUrl.startsWith(loginUrl + '?');
  } catch (error) {
    return false;
  }
}
