import { Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * BasePage - Base class for all Page Objects
 *
 * Provides common functionality for page interactions:
 * - Navigation and page load waiting
 * - Screenshot capture with directory validation
 * - Common locator helpers
 * - Utility methods for scrolling, visibility checks, etc.
 */
export class BasePage {
  /**
   * Constructor
   * @param page - Playwright Page instance
   */
  constructor(protected page: Page) {}

  /**
   * Navigate to a specific path
   * @param path - Relative or absolute URL path
   */
  async navigate(path: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
    await this.page.goto(path, { waitUntil });
  }

  /**
   * Wait for page to fully load
   * @param state - Load state to wait for (default: 'domcontentloaded')
   */
  async waitForPageLoad(state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  /**
   * Get current page title
   * @returns Page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current page URL
   * @returns Current URL
   */
  async getUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Take a screenshot and save it to the screenshots directory
   * Automatically creates the directory if it doesn't exist
   * @param name - Screenshot filename (without extension)
   */
  async screenshot(name: string): Promise<void> {
    const screenshotDir = path.join(process.cwd(), 'screenshots');

    // Create directory if it doesn't exist
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    await this.page.screenshot({
      path: path.join(screenshotDir, `${name}.png`),
      fullPage: true
    });
  }

  /**
   * Get element by role - no type casting needed
   * @param role - ARIA role
   * @param options - Additional locator options
   * @returns Locator
   */
  getByRole(
    role: 'button' | 'link' | 'textbox' | 'heading' | 'checkbox' | 'radio' | 'listitem' | 'img',
    options?: { name?: string | RegExp; exact?: boolean }
  ): Locator {
    return this.page.getByRole(role, options);
  }

  /**
   * Get element by test ID
   * @param testId - data-testid attribute value
   * @returns Locator
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Get element by text content
   * @param text - Text to search for
   * @returns Locator
   */
  getByText(text: string | RegExp): Locator {
    return this.page.getByText(text);
  }

  /**
   * Get element by label
   * @param label - Label text
   * @returns Locator
   */
  getByLabel(label: string | RegExp): Locator {
    return this.page.getByLabel(label);
  }

  /**
   * Get element by placeholder
   * @param placeholder - Placeholder text
   * @returns Locator
   */
  getByPlaceholder(placeholder: string | RegExp): Locator {
    return this.page.getByPlaceholder(placeholder);
  }

  /**
   * Wait for an element to be visible
   * @param selector - CSS selector
   * @param timeout - Maximum wait time in ms (default: 5000)
   */
  async waitForElement(selector: string, timeout = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Scroll element into view
   * @param selector - CSS selector
   */
  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Check if element is visible
   * @param selector - CSS selector
   * @returns True if visible, false otherwise
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      return await this.page.locator(selector).isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   * @param selector - CSS selector
   * @returns True if enabled, false otherwise
   */
  async isEnabled(selector: string): Promise<boolean> {
    try {
      return await this.page.locator(selector).isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Click and optionally wait for navigation
   * @param selector - CSS selector
   * @param waitForNavigation - Wait for navigation after click (default: false)
   */
  async clickAndWait(selector: string, waitForNavigation = false): Promise<void> {
    if (waitForNavigation) {
      await Promise.all([
        this.page.waitForLoadState('networkidle'),
        this.page.click(selector)
      ]);
    } else {
      await this.page.click(selector);
    }
  }

  /**
   * Fill input field
   * @param selector - CSS selector
   * @param value - Value to fill
   */
  async fill(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  /**
   * Type text with optional delay between keystrokes
   * @param selector - CSS selector
   * @param text - Text to type
   * @param delay - Delay between keystrokes in ms (default: 0)
   */
  async type(selector: string, text: string, delay = 0): Promise<void> {
    await this.page.type(selector, text, { delay });
  }

  /**
   * Select option from dropdown
   * @param selector - CSS selector
   * @param value - Option value to select
   */
  async selectOption(selector: string, value: string): Promise<void> {
    await this.page.selectOption(selector, value);
  }

  /**
   * Check a checkbox or radio button
   * @param selector - CSS selector
   */
  async check(selector: string): Promise<void> {
    await this.page.check(selector);
  }

  /**
   * Uncheck a checkbox
   * @param selector - CSS selector
   */
  async uncheck(selector: string): Promise<void> {
    await this.page.uncheck(selector);
  }

  /**
   * Wait for a specific amount of time
   * @param milliseconds - Time to wait in ms
   */
  async wait(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Reload the current page
   */
  async reload(): Promise<void> {
    await this.page.reload();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Go forward in browser history
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
  }
}
