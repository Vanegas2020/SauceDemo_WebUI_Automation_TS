/**
 * Backpack - Recording Playback Tests
 *
 * Test suite for the Backpack product page
 * Total Steps: 8
 * Execution: Sequential flow (all CPs share the same page/session)
 *
 * @generated
 */

import 'dotenv/config';
import { test, expect } from '../fixtures';

test.describe('Backpack - Recording Playback', () => {

  test('Backpack - Sequential Flow', async ({ page }) => {

    // ═══ LOGIN (inline) ═══
    // CP1: Validar que la URL de inicio de sesión responde correctamente
    await test.step('CP1: Login page loads successfully', async () => {
      const loginUrl = process.env.LOGIN_URL || 'https://www.saucedemo.com/';
      await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
      await expect.soft(page).not.toHaveURL(/about:blank/);
    });

    // CP2: Validar que la sesión autenticada está activa
    await test.step('CP2: Authenticated session is active', async () => {
      const loginUrl = process.env.LOGIN_URL || 'https://www.saucedemo.com/';
      // Navigate to the authenticated page — storageState should allow access
      await page.goto('https://www.saucedemo.com/inventory.html', { waitUntil: 'domcontentloaded' });
      // Should NOT be redirected back to the login page
      expect.soft(page.url()).not.toBe(loginUrl);
    });

    // ═══ TEST BANK CPs ═══

    // CP3: TC1: URL responds correctly
    await test.step('CP3: TC1: URL responds correctly', async () => {
      // Navigate and verify page loads
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      await expect(page).not.toHaveURL(/about:blank/);
      const currentUrl = page.url();
      const expectedHost = new URL('https://www.saucedemo.com/inventory.html').hostname;
      expect(currentUrl).toContain(expectedHost);
    });

    // CP4: TC2: Successful login
    await test.step('CP4: TC2: Successful login', async () => {
      // Already logged in via storageState
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      const loginUrl = process.env.LOGIN_URL || 'https://www.saucedemo.com/';
      expect.soft(page.url()).not.toBe(loginUrl);
    });

    // CP5: TC3: Base load time
    await test.step('CP5: TC3: Base load time', async () => {
      const loadStart = Date.now();
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      const loadTime = Date.now() - loadStart;
      expect(loadTime).toBeLessThan(15000);
    });

    // CP6: TC4: No failed network requests
    await test.step('CP6: TC4: No failed network requests', async () => {
      const failedRequests: { url: string; status: number }[] = [];
      const responseHandler = (response: any) => {
      const status = response.status();
      const url = response.url();
      if (status >= 400 && !url.includes('favicon') && !url.includes('analytics') && !url.includes('gtag') && !url.includes('hotjar')) {
      failedRequests.push({ url, status });
      }
      };
      page.on('response', responseHandler);
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      page.off('response', responseHandler);
      expect(failedRequests, `Failed requests: ${JSON.stringify(failedRequests)}`).toHaveLength(0);
    });

    // CP7: TC5: Title and favicon load
    await test.step('CP7: TC5: Title and favicon load', async () => {
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      // Check title and favicon
      // Wait for page to stabilize (WebKit may have pending navigation after goto)
      await page.waitForLoadState('domcontentloaded').catch(() => {/* ignore */});
      const title = await page.title().catch(() => '');
      expect.soft(title).not.toBe('');
    });

    // CP8: TC6: No visible error content
    await test.step('CP8: TC6: No visible error content', async () => {
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      // Check for error elements
      const errorMessages = page.locator(".error, [class*=\"error\"], [class*=\"alert\"]").filter({ hasNot: page.locator("input, select, textarea") }).filter({ hasText: /.+/ });
      await expect(errorMessages.first()).not.toBeVisible();
    });

    // CP9: TC7: No console errors
    await test.step('CP9: TC7: No console errors', async () => {
      const consoleErrors: string[] = [];
      const consoleHandler = (msg: any) => {
      if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      }
      };
      page.on('console', consoleHandler);
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      page.off('console', consoleHandler);
      const criticalErrors = consoleErrors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('deprecated') &&
      !e.includes('downloadable font') &&
      !e.includes('font-family') &&
      !e.includes('DM Sans') &&
      !e.includes('DM Mono') &&
      !e.includes('service worker')
      );
      expect(criticalErrors).toHaveLength(0);
    });

    // CP10: TC8: Base layout exists
    await test.step('CP10: TC8: Base layout exists', async () => {
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      // Inspect page structure
      const mainContent = page.locator('main, [role="main"], .content, #content, #app, #root').first();
      await expect(mainContent).toBeAttached();
    });

    // CP11: TC9: Main container not empty
    await test.step('CP11: TC9: Main container not empty', async () => {
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      // Check main content area
      const container = page.locator('main, [role="main"], .content, #content, #app, #root').first();
      await expect(container).not.toBeEmpty();
    });

    // CP12: TC10: No eternal placeholders
    await test.step('CP12: TC10: No eternal placeholders', async () => {
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      await page.waitForTimeout(2000);
      const placeholders = page.locator('.skeleton, .loading, [class*="spinner"], [class*="skeleton"]').filter({ hasText: /.+/ });
      await expect(placeholders.filter({ visible: true })).toHaveCount(0);
    });

    // CP13: TC11: Default language
    await test.step('CP13: TC11: Default language', async () => {
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      // Check html lang attribute
      const lang = await page.getAttribute('html', 'lang');
      expect(lang).toBeTruthy();
    });

    // CP14: TC12: No blocking overlays
    await test.step('CP14: TC12: No blocking overlays', async () => {
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      await page.waitForTimeout(1000);
      const overlays = page.locator('.modal, .overlay, [class*="modal"], [class*="overlay"], [role="dialog"]').filter({ hasText: /.+/ });
      await expect(overlays.filter({ visible: true })).toHaveCount(0);
    });

    // CP15: TC13: No horizontal scroll
    await test.step('CP15: TC13: No horizontal scroll', async () => {
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      // Check horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalScroll).toBe(false);
    });

    // CP16: TC14: No overlapping elements
    await test.step('CP16: TC14: No overlapping elements', async () => {
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      // Check element bounding boxes
      const hasOverlap = await page.evaluate(() => {
      const header = document.querySelector('header, [role="banner"], nav');
      const main = document.querySelector('main, [role="main"], .content, #content');
      if (!header || !main) return false;
      const headerRect = header.getBoundingClientRect();
      const mainRect = main.getBoundingClientRect();
      const overlapY = Math.max(0, Math.min(headerRect.bottom, mainRect.bottom) - Math.max(headerRect.top, mainRect.top));
      const headerHeight = headerRect.height || 1;
      return overlapY / headerHeight > 0.5;
      });
      expect(hasOverlap).toBe(false);
    });

    // CP17: TCR1: Screenshot baseline
    await test.step('CP17: TCR1: Screenshot baseline', async () => {
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `screenshots/baseline-${test.info().titlePath.join('-').replace(/[^a-zA-Z0-9-]/g, '_')}.png`, fullPage: true });
    });

    // CP18: TCR2: Key element count stable
    await test.step('CP18: TCR2: Key element count stable', async () => {
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      // Count key elements
      const container = page.locator('main, [role="main"], .content, #content, #app, #root').first();
      const childCount = await container.locator('> *').count();
      expect(childCount).toBeGreaterThan(0);
    });

    // CP19: TCR3: No new severe warnings/errors
    await test.step('CP19: TCR3: No new severe warnings/errors', async () => {
      const consoleMessages: { type: string; text: string }[] = [];
      const consoleHandler = (msg: any) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
      }
      };
      page.on('console', consoleHandler);
      const targetUrl = 'https://www.saucedemo.com/inventory.html';
      const targetPath = new URL(targetUrl).pathname;
      if (!page.url().includes(targetPath)) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
      page.off('console', consoleHandler);
      const severeMessages = consoleMessages.filter(m =>
      m.type === 'error' &&
      !m.text.includes('favicon') &&
      !m.text.includes('404') &&
      !m.text.includes('deprecated') &&
      !m.text.includes('third-party') &&
      !m.text.includes('downloadable font') &&
      !m.text.includes('font-family') &&
      !m.text.includes('DM Sans') &&
      !m.text.includes('DM Mono') &&
      !m.text.includes('service worker')
      );
      expect(severeMessages).toHaveLength(0);
    });

    // ═══ RECORDING ELEMENT CPs (8 per element) ═══

    // CP20: Validar que [data test="item 4 title link"] está presente
    await test.step('CP20: [data test="item 4 title link"] is visible', async () => {
      const element = page.locator('[data-test="item-4-title-link"]');
      await expect.soft(element).toBeVisible();
    });

    // CP21: Initial state for [data test="item 4 title link"]
    await test.step('CP21: Initial state', async () => {
      const element = page.locator('[data-test="item-4-title-link"]');
      const tag = await element.evaluate(e => (e.tagName || '').toLowerCase());
      const type = (await element.getAttribute('type')) || '';
      if (tag === 'input' && (type === 'checkbox' || type === 'radio')) {
        await expect.soft(element).not.toBeChecked();
      } else if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        await expect.soft(element).toBeEnabled();
      } else {
        await expect.soft(element).toBeVisible();
      }
    });

    // CP22: Interactable check for [data test="item 4 title link"]
    await test.step('CP22: Interactable', async () => {
      const element = page.locator('[data-test="item-4-title-link"]');
      const interactable = await element.evaluate(e => { const style = window.getComputedStyle(e); return style.pointerEvents !== 'none' && style.display !== 'none' && style.visibility !== 'hidden'; });
      await expect.soft(interactable).toBeTruthy();
    });

    // CP23: Focus check for [data test="item 4 title link"]
    await test.step('CP23: Focus', async () => {
      const element = page.locator('[data-test="item-4-title-link"]');
      const tag = await element.evaluate(e => (e.tagName || '').toLowerCase());
      const tabindex = await element.getAttribute('tabindex');
      const isFocusable = ['input','textarea','select','a','button'].includes(tag) || tabindex !== null;
      if (isFocusable) {
        await element.focus();
        await expect.soft(element).toBeFocused();
      } else {
        await expect.soft(element).toBeVisible();
      }
    });

    // CP24: Click [data test="item 4 title link"]
    await test.step('CP24: Click [data test="item 4 title link"]', async () => {
      const element = page.locator('[data-test="item-4-title-link"]');
      await expect.soft(element).toBeVisible();
      await element.click();
    });

    // CP25: No inconsistent/stuck state after [data test="item 4 title link"]
    await test.step('CP25: Stable state after action', async () => {
      const spinners = page.locator('.spinner, .loading, [class*="spinner"], [class*="loading"]');
      await expect.soft(spinners.first()).not.toBeVisible();
    });

    // CP26: Validar que no hay errores visibles después de la acción
    await test.step('CP26: No visible errors after [data test="item 4 title link"]', async () => {
      const errorMessages = page.locator('.error, [class*="error"], [class*="alert"]').filter({ hasNot: page.locator('input, select, textarea') }).filter({ hasText: /.+/ });
      await expect.soft(errorMessages.first(), 'No visible errors after [data test="item 4 title link"]').not.toBeVisible();
    });

    // CP27: Validar que no hay errores de consola después de la acción
    await test.step('CP27: No console errors after [data test="item 4 title link"]', async () => {
      const consoleErrors: string[] = [];
      const handler = (msg: any) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
      page.on('console', handler);
      await page.waitForTimeout(500);
      page.removeListener('console', handler);
      const criticalErrors = consoleErrors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('404') && 
        !e.includes('deprecated') &&
        !e.includes('401') &&
        !e.includes('unauthorized') &&
        !e.includes('downloadable font')
      );
      expect.soft(criticalErrors, 'No console errors after [data test="item 4 title link"]').toHaveLength(0);
    });

    // CP28: Validar que [data test="inventory item name"] está presente
    await test.step('CP28: [data test="inventory item name"] is visible', async () => {
      const element = page.locator('[data-test="inventory-item-name"]');
      await expect.soft(element).toBeVisible();
    });

    // CP29: Initial state for [data test="inventory item name"]
    await test.step('CP29: Initial state', async () => {
      const element = page.locator('[data-test="inventory-item-name"]');
      const tag = await element.evaluate(e => (e.tagName || '').toLowerCase());
      const type = (await element.getAttribute('type')) || '';
      if (tag === 'input' && (type === 'checkbox' || type === 'radio')) {
        await expect.soft(element).not.toBeChecked();
      } else if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        await expect.soft(element).toBeEnabled();
      } else {
        await expect.soft(element).toBeVisible();
      }
    });

    // CP30: Interactable check for [data test="inventory item name"]
    await test.step('CP30: Interactable', async () => {
      const element = page.locator('[data-test="inventory-item-name"]');
      const interactable = await element.evaluate(e => { const style = window.getComputedStyle(e); return style.pointerEvents !== 'none' && style.display !== 'none' && style.visibility !== 'hidden'; });
      await expect.soft(interactable).toBeTruthy();
    });

    // CP31: Focus check for [data test="inventory item name"]
    await test.step('CP31: Focus', async () => {
      const element = page.locator('[data-test="inventory-item-name"]');
      const tag = await element.evaluate(e => (e.tagName || '').toLowerCase());
      const tabindex = await element.getAttribute('tabindex');
      const isFocusable = ['input','textarea','select','a','button'].includes(tag) || tabindex !== null;
      if (isFocusable) {
        await element.focus();
        await expect.soft(element).toBeFocused();
      } else {
        await expect.soft(element).toBeVisible();
      }
    });

    // CP32: Click [data test="inventory item name"]
    await test.step('CP32: Click [data test="inventory item name"]', async () => {
      const element = page.locator('[data-test="inventory-item-name"]');
      await expect.soft(element).toBeVisible();
      await element.click();
    });

    // CP33: No inconsistent/stuck state after [data test="inventory item name"]
    await test.step('CP33: Stable state after action', async () => {
      const spinners = page.locator('.spinner, .loading, [class*="spinner"], [class*="loading"]');
      await expect.soft(spinners.first()).not.toBeVisible();
    });

    // CP34: Validar que no hay errores visibles después de la acción
    await test.step('CP34: No visible errors after [data test="inventory item name"]', async () => {
      const errorMessages = page.locator('.error, [class*="error"], [class*="alert"]').filter({ hasNot: page.locator('input, select, textarea') }).filter({ hasText: /.+/ });
      await expect.soft(errorMessages.first(), 'No visible errors after [data test="inventory item name"]').not.toBeVisible();
    });

    // CP35: Validar que no hay errores de consola después de la acción
    await test.step('CP35: No console errors after [data test="inventory item name"]', async () => {
      const consoleErrors: string[] = [];
      const handler = (msg: any) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
      page.on('console', handler);
      await page.waitForTimeout(500);
      page.removeListener('console', handler);
      const criticalErrors = consoleErrors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('404') && 
        !e.includes('deprecated') &&
        !e.includes('401') &&
        !e.includes('unauthorized') &&
        !e.includes('downloadable font')
      );
      expect.soft(criticalErrors, 'No console errors after [data test="inventory item name"]').toHaveLength(0);
    });

    // CP36: Validar que [data test="inventory item desc"] está presente
    await test.step('CP36: [data test="inventory item desc"] is visible', async () => {
      const element = page.locator('[data-test="inventory-item-desc"]');
      await expect.soft(element).toBeVisible();
    });

    // CP37: Initial state for [data test="inventory item desc"]
    await test.step('CP37: Initial state', async () => {
      const element = page.locator('[data-test="inventory-item-desc"]');
      const tag = await element.evaluate(e => (e.tagName || '').toLowerCase());
      const type = (await element.getAttribute('type')) || '';
      if (tag === 'input' && (type === 'checkbox' || type === 'radio')) {
        await expect.soft(element).not.toBeChecked();
      } else if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        await expect.soft(element).toBeEnabled();
      } else {
        await expect.soft(element).toBeVisible();
      }
    });

    // CP38: Interactable check for [data test="inventory item desc"]
    await test.step('CP38: Interactable', async () => {
      const element = page.locator('[data-test="inventory-item-desc"]');
      const interactable = await element.evaluate(e => { const style = window.getComputedStyle(e); return style.pointerEvents !== 'none' && style.display !== 'none' && style.visibility !== 'hidden'; });
      await expect.soft(interactable).toBeTruthy();
    });

    // CP39: Focus check for [data test="inventory item desc"]
    await test.step('CP39: Focus', async () => {
      const element = page.locator('[data-test="inventory-item-desc"]');
      const tag = await element.evaluate(e => (e.tagName || '').toLowerCase());
      const tabindex = await element.getAttribute('tabindex');
      const isFocusable = ['input','textarea','select','a','button'].includes(tag) || tabindex !== null;
      if (isFocusable) {
        await element.focus();
        await expect.soft(element).toBeFocused();
      } else {
        await expect.soft(element).toBeVisible();
      }
    });

    // CP40: Click [data test="inventory item desc"]
    await test.step('CP40: Click [data test="inventory item desc"]', async () => {
      const element = page.locator('[data-test="inventory-item-desc"]');
      await expect.soft(element).toBeVisible();
      await element.click();
    });

    // CP41: No inconsistent/stuck state after [data test="inventory item desc"]
    await test.step('CP41: Stable state after action', async () => {
      const spinners = page.locator('.spinner, .loading, [class*="spinner"], [class*="loading"]');
      await expect.soft(spinners.first()).not.toBeVisible();
    });

    // CP42: Validar que no hay errores visibles después de la acción
    await test.step('CP42: No visible errors after [data test="inventory item desc"]', async () => {
      const errorMessages = page.locator('.error, [class*="error"], [class*="alert"]').filter({ hasNot: page.locator('input, select, textarea') }).filter({ hasText: /.+/ });
      await expect.soft(errorMessages.first(), 'No visible errors after [data test="inventory item desc"]').not.toBeVisible();
    });

    // CP43: Validar que no hay errores de consola después de la acción
    await test.step('CP43: No console errors after [data test="inventory item desc"]', async () => {
      const consoleErrors: string[] = [];
      const handler = (msg: any) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
      page.on('console', handler);
      await page.waitForTimeout(500);
      page.removeListener('console', handler);
      const criticalErrors = consoleErrors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('404') && 
        !e.includes('deprecated') &&
        !e.includes('401') &&
        !e.includes('unauthorized') &&
        !e.includes('downloadable font')
      );
      expect.soft(criticalErrors, 'No console errors after [data test="inventory item desc"]').toHaveLength(0);
    });

    // CP44: Validar que [data test="inventory item price"] está presente
    await test.step('CP44: [data test="inventory item price"] is visible', async () => {
      const element = page.locator('[data-test="inventory-item-price"]');
      await expect.soft(element).toBeVisible();
    });

    // CP45: Initial state for [data test="inventory item price"]
    await test.step('CP45: Initial state', async () => {
      const element = page.locator('[data-test="inventory-item-price"]');
      const tag = await element.evaluate(e => (e.tagName || '').toLowerCase());
      const type = (await element.getAttribute('type')) || '';
      if (tag === 'input' && (type === 'checkbox' || type === 'radio')) {
        await expect.soft(element).not.toBeChecked();
      } else if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        await expect.soft(element).toBeEnabled();
      } else {
        await expect.soft(element).toBeVisible();
      }
    });

    // CP46: Interactable check for [data test="inventory item price"]
    await test.step('CP46: Interactable', async () => {
      const element = page.locator('[data-test="inventory-item-price"]');
      const interactable = await element.evaluate(e => { const style = window.getComputedStyle(e); return style.pointerEvents !== 'none' && style.display !== 'none' && style.visibility !== 'hidden'; });
      await expect.soft(interactable).toBeTruthy();
    });

    // CP47: Focus check for [data test="inventory item price"]
    await test.step('CP47: Focus', async () => {
      const element = page.locator('[data-test="inventory-item-price"]');
      const tag = await element.evaluate(e => (e.tagName || '').toLowerCase());
      const tabindex = await element.getAttribute('tabindex');
      const isFocusable = ['input','textarea','select','a','button'].includes(tag) || tabindex !== null;
      if (isFocusable) {
        await element.focus();
        await expect.soft(element).toBeFocused();
      } else {
        await expect.soft(element).toBeVisible();
      }
    });

    // CP48: Click [data test="inventory item price"]
    await test.step('CP48: Click [data test="inventory item price"]', async () => {
      const element = page.locator('[data-test="inventory-item-price"]');
      await expect.soft(element).toBeVisible();
      await element.click();
    });

    // CP49: No inconsistent/stuck state after [data test="inventory item price"]
    await test.step('CP49: Stable state after action', async () => {
      const spinners = page.locator('.spinner, .loading, [class*="spinner"], [class*="loading"]');
      await expect.soft(spinners.first()).not.toBeVisible();
    });

    // CP50: Validar que no hay errores visibles después de la acción
    await test.step('CP50: No visible errors after [data test="inventory item price"]', async () => {
      const errorMessages = page.locator('.error, [class*="error"], [class*="alert"]').filter({ hasNot: page.locator('input, select, textarea') }).filter({ hasText: /.+/ });
      await expect.soft(errorMessages.first(), 'No visible errors after [data test="inventory item price"]').not.toBeVisible();
    });

    // CP51: Validar que no hay errores de consola después de la acción
    await test.step('CP51: No console errors after [data test="inventory item price"]', async () => {
      const consoleErrors: string[] = [];
      const handler = (msg: any) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
      page.on('console', handler);
      await page.waitForTimeout(500);
      page.removeListener('console', handler);
      const criticalErrors = consoleErrors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('404') && 
        !e.includes('deprecated') &&
        !e.includes('401') &&
        !e.includes('unauthorized') &&
        !e.includes('downloadable font')
      );
      expect.soft(criticalErrors, 'No console errors after [data test="inventory item price"]').toHaveLength(0);
    });

    // CP52: Validar que [data test="add to cart"] está presente
    await test.step('CP52: [data test="add to cart"] is visible', async () => {
      const element = page.locator('[data-test="add-to-cart"]');
      await expect.soft(element).toBeVisible();
    });

    // CP53: Initial state for [data test="add to cart"]
    await test.step('CP53: Initial state', async () => {
      const element = page.locator('[data-test="add-to-cart"]');
      const tag = await element.evaluate(e => (e.tagName || '').toLowerCase());
      const type = (await element.getAttribute('type')) || '';
      if (tag === 'input' && (type === 'checkbox' || type === 'radio')) {
        await expect.soft(element).not.toBeChecked();
      } else if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        await expect.soft(element).toBeEnabled();
      } else {
        await expect.soft(element).toBeVisible();
      }
    });

    // CP54: Interactable check for [data test="add to cart"]
    await test.step('CP54: Interactable', async () => {
      const element = page.locator('[data-test="add-to-cart"]');
      const interactable = await element.evaluate(e => { const style = window.getComputedStyle(e); return style.pointerEvents !== 'none' && style.display !== 'none' && style.visibility !== 'hidden'; });
      await expect.soft(interactable).toBeTruthy();
    });

    // CP55: Focus check for [data test="add to cart"]
    await test.step('CP55: Focus', async () => {
      const element = page.locator('[data-test="add-to-cart"]');
      const tag = await element.evaluate(e => (e.tagName || '').toLowerCase());
      const tabindex = await element.getAttribute('tabindex');
      const isFocusable = ['input','textarea','select','a','button'].includes(tag) || tabindex !== null;
      if (isFocusable) {
        await element.focus();
        await expect.soft(element).toBeFocused();
      } else {
        await expect.soft(element).toBeVisible();
      }
    });

    // CP56: Click [data test="add to cart"]
    await test.step('CP56: Click [data test="add to cart"]', async () => {
      const element = page.locator('[data-test="add-to-cart"]');
      await expect.soft(element).toBeVisible();
      await element.click();
    });

    // CP57: No inconsistent/stuck state after [data test="add to cart"]
    await test.step('CP57: Stable state after action', async () => {
      const spinners = page.locator('.spinner, .loading, [class*="spinner"], [class*="loading"]');
      await expect.soft(spinners.first()).not.toBeVisible();
    });

    // CP58: Validar que no hay errores visibles después de la acción
    await test.step('CP58: No visible errors after [data test="add to cart"]', async () => {
      const errorMessages = page.locator('.error, [class*="error"], [class*="alert"]').filter({ hasNot: page.locator('input, select, textarea') }).filter({ hasText: /.+/ });
      await expect.soft(errorMessages.first(), 'No visible errors after [data test="add to cart"]').not.toBeVisible();
    });

    // CP59: Validar que no hay errores de consola después de la acción
    await test.step('CP59: No console errors after [data test="add to cart"]', async () => {
      const consoleErrors: string[] = [];
      const handler = (msg: any) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
      page.on('console', handler);
      await page.waitForTimeout(500);
      page.removeListener('console', handler);
      const criticalErrors = consoleErrors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('404') && 
        !e.includes('deprecated') &&
        !e.includes('401') &&
        !e.includes('unauthorized') &&
        !e.includes('downloadable font')
      );
      expect.soft(criticalErrors, 'No console errors after [data test="add to cart"]').toHaveLength(0);
    });

    // CP60-63: SKIPPED — "[data test="remove"]" is a conditional element (not visible on initial load)

    // CP64: Click [data test="remove"]
    await test.step('CP64: Click [data test="remove"]', async () => {
      const element = page.locator('[data-test="remove"]');
      await expect.soft(element).toBeVisible({ timeout: 10000 });
      await element.click();
    });

    // CP65: No inconsistent/stuck state after [data test="remove"]
    await test.step('CP65: Stable state after action', async () => {
      const spinners = page.locator('.spinner, .loading, [class*="spinner"], [class*="loading"]');
      await expect.soft(spinners.first()).not.toBeVisible();
    });

    // CP66: Validar que no hay errores visibles después de la acción
    await test.step('CP66: No visible errors after [data test="remove"]', async () => {
      const errorMessages = page.locator('.error, [class*="error"], [class*="alert"]').filter({ hasNot: page.locator('input, select, textarea') }).filter({ hasText: /.+/ });
      await expect.soft(errorMessages.first(), 'No visible errors after [data test="remove"]').not.toBeVisible();
    });

    // CP67: Validar que no hay errores de consola después de la acción
    await test.step('CP67: No console errors after [data test="remove"]', async () => {
      const consoleErrors: string[] = [];
      const handler = (msg: any) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
      page.on('console', handler);
      await page.waitForTimeout(500);
      page.removeListener('console', handler);
      const criticalErrors = consoleErrors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('404') && 
        !e.includes('deprecated') &&
        !e.includes('401') &&
        !e.includes('unauthorized') &&
        !e.includes('downloadable font')
      );
      expect.soft(criticalErrors, 'No console errors after [data test="remove"]').toHaveLength(0);
    });

    // CP68: Validar que [data test="back to products"] está presente
    await test.step('CP68: [data test="back to products"] is visible', async () => {
      const element = page.locator('[data-test="back-to-products"]');
      await expect.soft(element).toBeVisible();
    });

    // CP69: Initial state for [data test="back to products"]
    await test.step('CP69: Initial state', async () => {
      const element = page.locator('[data-test="back-to-products"]');
      const tag = await element.evaluate(e => (e.tagName || '').toLowerCase());
      const type = (await element.getAttribute('type')) || '';
      if (tag === 'input' && (type === 'checkbox' || type === 'radio')) {
        await expect.soft(element).not.toBeChecked();
      } else if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        await expect.soft(element).toBeEnabled();
      } else {
        await expect.soft(element).toBeVisible();
      }
    });

    // CP70: Interactable check for [data test="back to products"]
    await test.step('CP70: Interactable', async () => {
      const element = page.locator('[data-test="back-to-products"]');
      const interactable = await element.evaluate(e => { const style = window.getComputedStyle(e); return style.pointerEvents !== 'none' && style.display !== 'none' && style.visibility !== 'hidden'; });
      await expect.soft(interactable).toBeTruthy();
    });

    // CP71: Focus check for [data test="back to products"]
    await test.step('CP71: Focus', async () => {
      const element = page.locator('[data-test="back-to-products"]');
      const tag = await element.evaluate(e => (e.tagName || '').toLowerCase());
      const tabindex = await element.getAttribute('tabindex');
      const isFocusable = ['input','textarea','select','a','button'].includes(tag) || tabindex !== null;
      if (isFocusable) {
        await element.focus();
        await expect.soft(element).toBeFocused();
      } else {
        await expect.soft(element).toBeVisible();
      }
    });

    // CP72: Click [data test="back to products"]
    await test.step('CP72: Click [data test="back to products"]', async () => {
      const element = page.locator('[data-test="back-to-products"]');
      await expect.soft(element).toBeVisible();
      await element.click();
    });

    // CP73: No inconsistent/stuck state after [data test="back to products"]
    await test.step('CP73: Stable state after action', async () => {
      const spinners = page.locator('.spinner, .loading, [class*="spinner"], [class*="loading"]');
      await expect.soft(spinners.first()).not.toBeVisible();
    });

    // CP74: Validar que no hay errores visibles después de la acción
    await test.step('CP74: No visible errors after [data test="back to products"]', async () => {
      const errorMessages = page.locator('.error, [class*="error"], [class*="alert"]').filter({ hasNot: page.locator('input, select, textarea') }).filter({ hasText: /.+/ });
      await expect.soft(errorMessages.first(), 'No visible errors after [data test="back to products"]').not.toBeVisible();
    });

    // CP75: Validar que no hay errores de consola después de la acción
    await test.step('CP75: No console errors after [data test="back to products"]', async () => {
      const consoleErrors: string[] = [];
      const handler = (msg: any) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
      page.on('console', handler);
      await page.waitForTimeout(500);
      page.removeListener('console', handler);
      const criticalErrors = consoleErrors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('404') && 
        !e.includes('deprecated') &&
        !e.includes('401') &&
        !e.includes('unauthorized') &&
        !e.includes('downloadable font')
      );
      expect.soft(criticalErrors, 'No console errors after [data test="back to products"]').toHaveLength(0);
    });

  });

});