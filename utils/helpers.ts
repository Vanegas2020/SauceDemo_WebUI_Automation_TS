/**
 * SauceDemo_WebUI_Automation_TS - Test Helpers and Utilities
 *
 * This file contains reusable helper functions for tests.
 * Import these utilities to simplify common testing operations.
 *
 * @see {@link https://playwright.dev/docs/test-assertions|Assertions}
 */

import { Page, Locator, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Wait for an element to be visible and return it
 *
 * @param page - Playwright page instance
 * @param selector - Element selector
 * @param timeout - Maximum wait time in milliseconds (default: 30000)
 * @returns The located element
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 30000
): Promise<Locator> {
  const element = page.locator(selector);
  await expect(element).toBeVisible({ timeout });
  return element;
}

/**
 * Wait for multiple elements to be visible
 *
 * @param page - Playwright page instance
 * @param selectors - Array of element selectors
 * @param timeout - Maximum wait time in milliseconds (default: 30000)
 */
export async function waitForElements(
  page: Page,
  selectors: string[],
  timeout: number = 30000
): Promise<void> {
  const promises = selectors.map(selector =>
    expect(page.locator(selector)).toBeVisible({ timeout })
  );
  await Promise.all(promises);
}

/**
 * Wait for a specific URL pattern
 *
 * @param page - Playwright page instance
 * @param urlPattern - URL pattern (string or RegExp)
 * @param timeout - Maximum wait time in milliseconds (default: 30000)
 */
export async function waitForUrl(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 30000
): Promise<void> {
  await page.waitForURL(urlPattern, { timeout });
}

/**
 * Get text content from an element
 *
 * @param page - Playwright page instance
 * @param selector - Element selector
 * @returns The text content or null if not found
 */
export async function getTextContent(page: Page, selector: string): Promise<string | null> {
  try {
    const element = page.locator(selector);
    return await element.textContent({ timeout: 5000 });
  } catch (error) {
    return null;
  }
}

/**
 * Get attribute value from an element
 *
 * @param page - Playwright page instance
 * @param selector - Element selector
 * @param attribute - Attribute name
 * @returns The attribute value or null if not found
 */
export async function getAttribute(
  page: Page,
  selector: string,
  attribute: string
): Promise<string | null> {
  try {
    const element = page.locator(selector);
    return await element.getAttribute(attribute, { timeout: 5000 });
  } catch (error) {
    return null;
  }
}

/**
 * Check if element exists in the DOM (doesn't need to be visible)
 *
 * @param page - Playwright page instance
 * @param selector - Element selector
 * @returns True if element exists, false otherwise
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    const count = await page.locator(selector).count();
    return count > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Check if element is visible
 *
 * @param page - Playwright page instance
 * @param selector - Element selector
 * @returns True if element is visible, false otherwise
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    return await element.isVisible({ timeout: 3000 });
  } catch (error) {
    return false;
  }
}

/**
 * Scroll to element
 *
 * @param page - Playwright page instance
 * @param selector - Element selector
 */
export async function scrollToElement(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector);
  await element.scrollIntoViewIfNeeded();
}

/**
 * Click and wait for navigation
 *
 * @param page - Playwright page instance
 * @param selector - Element selector to click
 */
export async function clickAndWaitForNavigation(page: Page, selector: string): Promise<void> {
  await Promise.all([
    page.waitForURL('**', { waitUntil: 'networkidle' }),
    page.click(selector),
  ]);
}

/**
 * Fill form field with retry logic
 *
 * @param page - Playwright page instance
 * @param selector - Input field selector
 * @param value - Value to fill
 * @param retries - Number of retry attempts (default: 3)
 */
export async function fillWithRetry(
  page: Page,
  selector: string,
  value: string,
  retries: number = 3
): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await page.fill(selector, value, { timeout: 5000 });
      const currentValue = await page.inputValue(selector);
      if (currentValue === value) {
        return;
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Take screenshot with custom name
 *
 * @param page - Playwright page instance
 * @param name - Screenshot file name (without extension)
 * @param fullPage - Whether to capture full page (default: false)
 * @returns Path to the screenshot file
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  fullPage: boolean = false
): Promise<string> {
  const screenshotsDir = path.join(process.cwd(), 'screenshots');

  // Ensure screenshots directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(screenshotsDir, filename);

  await page.screenshot({
    path: filepath,
    fullPage,
  });

  return filepath;
}

/**
 * Generate random string
 *
 * @param length - Length of the random string (default: 10)
 * @param charset - Character set to use (default: alphanumeric)
 * @returns Random string
 */
export function randomString(
  length: number = 10,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Generate random email address
 *
 * @param domain - Email domain (default: example.com)
 * @returns Random email address
 */
export function randomEmail(domain: string = 'example.com'): string {
  const username = randomString(8).toLowerCase();
  return `${username}@${domain}`;
}

/**
 * Generate random number within range
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random number
 */
export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format date to string
 *
 * @param date - Date object
 * @param format - Date format (default: 'YYYY-MM-DD')
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
}

/**
 * Get current date as string
 *
 * @param format - Date format (default: 'YYYY-MM-DD')
 * @returns Current date string
 */
export function getCurrentDate(format: string = 'YYYY-MM-DD'): string {
  return formatDate(new Date(), format);
}

/**
 * Add days to date
 *
 * @param date - Base date
 * @param days - Number of days to add (can be negative)
 * @returns New date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Wait for API response
 *
 * @param page - Playwright page instance
 * @param urlPattern - URL pattern to match
 * @param action - Action to perform (e.g., click button)
 * @returns API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  action: () => Promise<void>
): Promise<any> {
  const responsePromise = page.waitForResponse(urlPattern);
  await action();
  const response = await responsePromise;
  return response.json();
}

/**
 * Wait for multiple API responses
 *
 * @param page - Playwright page instance
 * @param urlPatterns - Array of URL patterns to match
 * @param action - Action to perform
 * @returns Array of API responses
 */
export async function waitForApiResponses(
  page: Page,
  urlPatterns: (string | RegExp)[],
  action: () => Promise<void>
): Promise<any[]> {
  const responsePromises = urlPatterns.map(pattern => page.waitForResponse(pattern));
  await action();
  const responses = await Promise.all(responsePromises);
  return Promise.all(responses.map(r => r.json()));
}

/**
 * Mock API response
 *
 * @param page - Playwright page instance
 * @param urlPattern - URL pattern to mock
 * @param responseData - Mock response data
 * @param status - HTTP status code (default: 200)
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  responseData: any,
  status: number = 200
): Promise<void> {
  await page.route(urlPattern, route => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseData),
    });
  });
}

/**
 * Clear all cookies
 *
 * @param page - Playwright page instance
 */
export async function clearCookies(page: Page): Promise<void> {
  await page.context().clearCookies();
}

/**
 * Get cookie by name
 *
 * @param page - Playwright page instance
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export async function getCookie(page: Page, name: string): Promise<string | null> {
  const cookies = await page.context().cookies();
  const cookie = cookies.find(c => c.name === name);
  return cookie ? cookie.value : null;
}

/**
 * Set cookie
 *
 * @param page - Playwright page instance
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options
 */
export async function setCookie(
  page: Page,
  name: string,
  value: string,
  options: { domain?: string; path?: string; expires?: number } = {}
): Promise<void> {
  await page.context().addCookies([
    {
      name,
      value,
      domain: options.domain || new URL(page.url()).hostname,
      path: options.path || '/',
      expires: options.expires,
    },
  ]);
}

/**
 * Clear local storage
 *
 * @param page - Playwright page instance
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Get local storage item
 *
 * @param page - Playwright page instance
 * @param key - Storage key
 * @returns Storage value or null if not found
 */
export async function getLocalStorageItem(page: Page, key: string): Promise<string | null> {
  return await page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
}

/**
 * Set local storage item
 *
 * @param page - Playwright page instance
 * @param key - Storage key
 * @param value - Storage value
 */
export async function setLocalStorageItem(page: Page, key: string, value: string): Promise<void> {
  await page.evaluate(
    ({ storageKey, storageValue }) => localStorage.setItem(storageKey, storageValue),
    { storageKey: key, storageValue: value }
  );
}

/**
 * Retry action until condition is met
 *
 * @param action - Action to retry
 * @param condition - Condition function that returns true when satisfied
 * @param maxRetries - Maximum number of retries (default: 5)
 * @param retryDelay - Delay between retries in ms (default: 1000)
 */
export async function retryUntil(
  action: () => Promise<void>,
  condition: () => Promise<boolean>,
  maxRetries: number = 5,
  retryDelay: number = 1000
): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    await action();

    if (await condition()) {
      return;
    }

    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error(`Condition not met after ${maxRetries} retries`);
}

/**
 * Execute action with timeout
 *
 * @param action - Action to execute
 * @param timeout - Timeout in milliseconds
 * @param errorMessage - Custom error message
 */
export async function withTimeout<T>(
  action: () => Promise<T>,
  timeout: number,
  errorMessage: string = 'Action timed out'
): Promise<T> {
  return Promise.race([
    action(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeout)
    ),
  ]);
}

/**
 * Log message to console with timestamp
 *
 * @param message - Message to log
 * @param level - Log level (default: 'info')
 */
export function log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  switch (level) {
    case 'error':
      console.error(`${prefix} ${message}`);
      break;
    case 'warn':
      console.warn(`${prefix} ${message}`);
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}


