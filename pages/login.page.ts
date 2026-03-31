import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * LoginPage - Page Object for Login
 *
 * This page handles login/authentication functionality
 */
export class LoginPage extends BasePage {
  /**
   * Page URL (relative to baseURL)
   */
  readonly url = '/';

  // ============================================================================
  // Locators
  // ============================================================================

  /**
   * Automatically detected element - locator
   */
  readonly btnUsername: Locator = this.page.getByTestId('username');
  /**
   * Automatically detected element - locator
   */
  readonly btnPassword: Locator = this.page.getByTestId('password');
  /**
   * Automatically detected element - locator
   */
  readonly btnLoginButton: Locator = this.page.getByTestId('login-button');

  /**
   * Constructor
   * @param page - Playwright Page instance
   */
  constructor(page: Page) {
    super(page);
  }

  // ============================================================================
  // Navigation Methods
  // ============================================================================

  /**
   * Navigate to the Login page
   */
  async navigateToPage(): Promise<void> {
    await this.navigate(this.url, 'domcontentloaded');
  }

  // ============================================================================
  // Action Methods
  // ============================================================================


  /**
   * Login using predefined credentials
   * Uses credentials from .env file
   */
  async loginWithCredentials(): Promise<void> {
    const username = process.env.TEST_USER_ADMIN_USERNAME || '';
    const password = process.env.TEST_USER_ADMIN_PASSWORD || '';

    if (!username || !password) {
      throw new Error('Credentials not found in environment variables');
    }

    // Navigate to login page and wait for it to be ready
    await this.navigateToPage();

    // Fill username field: first input/username type whose selector does NOT contain 'password'
    await this.btnUsername.fill(username);
    // Fill password field: type='password' OR selector/name contains 'password'
    await this.btnPassword.fill(password);
    // Click submit button
    await this.btnLoginButton.click();

    await this.page.waitForLoadState('networkidle');
  }

  // ============================================================================
  // Validation Methods
  // ============================================================================

  /**
   * Check if login was successful
   * @returns True if login successful (no error message visible)
   */
  async isLoginSuccessful(): Promise<boolean> {
    try {
      await this.page.waitForURL(/dashboard|home|account/, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get error message if login failed
   * @returns Error message text or null if no error
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if username field is visible
   * @returns True if visible
   */
  async isUsernameFieldVisible(): Promise<boolean> {
    try {
    return await this.btnUsername.isVisible({ timeout: 5000 });
    } catch { return false; }
  }

  /**
   * Check if password field is visible
   * @returns True if visible
   */
  async isPasswordFieldVisible(): Promise<boolean> {
    try {
    return await this.btnPassword.isVisible({ timeout: 5000 });
    } catch { return false; }
  }

  /**
   * Check if login button is enabled
   * @returns True if enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    try {
    return await this.btnLoginButton.isEnabled({ timeout: 5000 });
    } catch { return false; }
  }
}
