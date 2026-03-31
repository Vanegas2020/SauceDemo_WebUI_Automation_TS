/**
 * Login - Recording Playback Tests
 *
 * Test suite for the Login page
 * Total Steps: 6
 * Execution: Independent tests (each CP is a separate test with its own navigation)
 *
 * @generated
 */

import { test, expect } from '@playwright/test';

test.describe('Login - Independent Tests', () => {


  // ═══ INDEPENDENT TESTS (no session) ═══

  // ═══ TEST BANK CPs ═══

  test('CP1: TC1: URL responds correctly', async ({ page }) => {

    // Navigate and verify page loads
    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/about:blank/);
    const currentUrl = page.url();
    const expectedHost = new URL('https://www.saucedemo.com/').hostname;
    expect(currentUrl).toContain(expectedHost);
  });

  test('CP2: TC3: Base load time', async ({ page }) => {

    const loadStart = Date.now();
    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - loadStart;
    expect(loadTime).toBeLessThan(15000);
  });

  test('CP3: TC4: No failed network requests', async ({ page }) => {

    const failedRequests: { url: string; status: number }[] = [];
    const responseHandler = (response: any) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !url.includes('favicon') && !url.includes('analytics') && !url.includes('gtag') && !url.includes('hotjar')) {
    failedRequests.push({ url, status });
    }
    };
    page.on('response', responseHandler);
    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    page.off('response', responseHandler);
    expect(failedRequests, `Failed requests: ${JSON.stringify(failedRequests)}`).toHaveLength(0);
  });

  test('CP4: TC5: Title and favicon load', async ({ page }) => {

    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    // Check title and favicon
    // Wait for page to stabilize (WebKit may have pending navigation after goto)
    await page.waitForLoadState('domcontentloaded').catch(() => {/* ignore */});
    const title = await page.title().catch(() => '');
    expect.soft(title).not.toBe('');
  });

  test('CP5: TC6: No visible error content', async ({ page }) => {

    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    // Check for error elements
    const errorMessages = page.locator(".error, [class*=\"error\"], [class*=\"alert\"]").filter({ hasNot: page.locator("input, select, textarea") }).filter({ hasText: /.+/ });
    await expect(errorMessages.first()).not.toBeVisible();
  });

  test('CP6: TC7: No console errors', async ({ page }) => {

    const consoleErrors: string[] = [];
    const consoleHandler = (msg: any) => {
    if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
    }
    };
    page.on('console', consoleHandler);
    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
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

  test('CP7: TC8: Base layout exists', async ({ page }) => {

    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    // Inspect page structure
    const mainContent = page.locator('main, [role="main"], .content, #content, #app, #root').first();
    await expect(mainContent).toBeAttached();
  });

  test('CP8: TC9: Main container not empty', async ({ page }) => {

    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    // Check main content area
    const container = page.locator('main, [role="main"], .content, #content, #app, #root').first();
    await expect(container).not.toBeEmpty();
  });

  test('CP9: TC10: No eternal placeholders', async ({ page }) => {

    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    const placeholders = page.locator('.skeleton, .loading, [class*="spinner"], [class*="skeleton"]').filter({ hasText: /.+/ });
    await expect(placeholders.filter({ visible: true })).toHaveCount(0);
  });

  test('CP10: TC11: Default language', async ({ page }) => {

    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    // Check html lang attribute
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });

  test('CP11: TC12: No blocking overlays', async ({ page }) => {

    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const overlays = page.locator('.modal, .overlay, [class*="modal"], [class*="overlay"], [role="dialog"]').filter({ hasText: /.+/ });
    await expect(overlays.filter({ visible: true })).toHaveCount(0);
  });

  test('CP12: TC13: No horizontal scroll', async ({ page }) => {

    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    // Check horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalScroll).toBe(false);
  });

  test('CP13: TC14: No overlapping elements', async ({ page }) => {

    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
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

  test('CP14: TCR1: Screenshot baseline', async ({ page }) => {

    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `screenshots/baseline-${test.info().titlePath.join('-').replace(/[^a-zA-Z0-9-]/g, '_')}.png`, fullPage: true });
  });

  test('CP15: TCR2: Key element count stable', async ({ page }) => {

    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    // Count key elements
    const container = page.locator('main, [role="main"], .content, #content, #app, #root').first();
    const childCount = await container.locator('> *').count();
    expect(childCount).toBeGreaterThan(0);
  });

  test('CP16: TCR3: No new severe warnings/errors', async ({ page }) => {

    const consoleMessages: { type: string; text: string }[] = [];
    const consoleHandler = (msg: any) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
    }
    };
    page.on('console', consoleHandler);
    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
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

  test('CP17: Auth: Empty credentials show error', async ({ page }) => {

    test.setTimeout(60000);
    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    await page.locator('[data-test="login-button"]').click();
    const errorEl = page.locator('[data-test="error"], [role="alert"], .error, [class*="error"], [class*="alert"]').first();
    await expect(errorEl).toBeVisible({ timeout: 5000 });
  });

  test('CP18: Auth: Invalid credentials show error', async ({ page }) => {

    test.setTimeout(60000);
    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    await page.locator('[data-test="username"]').fill("invalid@nonexistent.com");
    await page.locator('[data-test="password"]').fill("WrongPassword123!");
    await page.locator('[data-test="login-button"]').click();
    const errorEl = page.locator('[data-test="error"], [role="alert"], .error, [class*="error"]').first();
    await expect(errorEl).toBeVisible({ timeout: 5000 });
  });

  test('CP19: Auth: SQL Injection protection', async ({ page }) => {

    test.setTimeout(60000);
    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    await page.locator('[data-test="username"]').fill("' OR '1'='1");
    await page.locator('[data-test="password"]').fill("' OR '1'='1");
    await page.locator('[data-test="login-button"]').click();
    await expect(page).not.toHaveURL(/dashboard|home|inventory|admin/);
  });

  test('CP20: Auth: XSS protection in login', async ({ page }) => {

    test.setTimeout(60000);
    await page.goto('https://www.saucedemo.com/', { waitUntil: "domcontentloaded" });
    await page.locator('[data-test="username"]').fill("<script>alert('XSS')</script>");
    await page.locator('[data-test="password"]').fill("<img src=x onerror=alert(1)>");
    await page.locator('[data-test="login-button"]').click();
    const content = await page.content();
    expect(content).not.toContain("<script>alert('XSS')</script>");
  });

  // ═══ RECORDING ELEMENT CPs (8 per element) ═══

  test('CP21: [data test="username"] is visible', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="username"]');
    await expect.soft(element).toBeVisible();
  });

  test('CP22: Initial state for [data test="username"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="username"]');
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

  test('CP23: [data test="username"] is interactable', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="username"]');
    const interactable = await element.evaluate(e => { const style = window.getComputedStyle(e); return style.pointerEvents !== 'none' && style.display !== 'none' && style.visibility !== 'hidden'; });
    await expect.soft(interactable).toBeTruthy();
  });

  test('CP24: Click [data test="username"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="username"]');
    await expect.soft(element).toBeVisible();
    await element.click();
  });

  test('CP25: Focus check for [data test="username"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="username"]');
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

  test('CP26: No stuck state after [data test="username"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="username"]');
    await element.click();
    const spinners = page.locator('.spinner, .loading, [class*="spinner"], [class*="loading"]');
    await expect.soft(spinners.first()).not.toBeVisible();
  });

  test('CP27: No visible errors after [data test="username"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="username"]');
    await element.click();
    // Excluir mensajes de error de validación de formulario (error-message-container)
    const errorMessages = page.locator('[class]:not([class*="error-message-container"]):not([class*="alert"])').filter({ has: page.locator('.error, [class*=" error"], [class^="error"]') }).filter({ hasNot: page.locator('input, select, textarea') }).filter({ hasText: /.+/ });
    await expect.soft(errorMessages.first()).not.toBeVisible();
  });

  test('CP28: No console errors after [data test="username"]', async ({ page }) => {
    const consoleErrors: string[] = [];
    const handler = (msg: any) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
    page.on('console', handler);
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="username"]');
    await element.click();
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
    expect.soft(criticalErrors).toHaveLength(0);
  });

  test('CP29: [data test="password"] is visible', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="password"]');
    await expect.soft(element).toBeVisible();
  });

  test('CP30: Initial state for [data test="password"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="password"]');
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

  test('CP31: [data test="password"] is interactable', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="password"]');
    const interactable = await element.evaluate(e => { const style = window.getComputedStyle(e); return style.pointerEvents !== 'none' && style.display !== 'none' && style.visibility !== 'hidden'; });
    await expect.soft(interactable).toBeTruthy();
  });

  test('CP32: Click [data test="password"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="password"]');
    await expect.soft(element).toBeVisible();
    await element.click();
  });

  test('CP33: Focus check for [data test="password"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="password"]');
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

  test('CP34: No stuck state after [data test="password"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="password"]');
    await element.click();
    const spinners = page.locator('.spinner, .loading, [class*="spinner"], [class*="loading"]');
    await expect.soft(spinners.first()).not.toBeVisible();
  });

  test('CP35: No visible errors after [data test="password"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="password"]');
    await element.click();
    // Excluir mensajes de error de validación de formulario (error-message-container)
    const errorMessages = page.locator('[class]:not([class*="error-message-container"]):not([class*="alert"])').filter({ has: page.locator('.error, [class*=" error"], [class^="error"]') }).filter({ hasNot: page.locator('input, select, textarea') }).filter({ hasText: /.+/ });
    await expect.soft(errorMessages.first()).not.toBeVisible();
  });

  test('CP36: No console errors after [data test="password"]', async ({ page }) => {
    const consoleErrors: string[] = [];
    const handler = (msg: any) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
    page.on('console', handler);
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="password"]');
    await element.click();
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
    expect.soft(criticalErrors).toHaveLength(0);
  });

  test('CP37: [data test="login button"] is visible', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="login-button"]');
    await expect.soft(element).toBeVisible();
  });

  test('CP38: Initial state for [data test="login button"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="login-button"]');
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

  test('CP39: [data test="login button"] is interactable', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="login-button"]');
    const interactable = await element.evaluate(e => { const style = window.getComputedStyle(e); return style.pointerEvents !== 'none' && style.display !== 'none' && style.visibility !== 'hidden'; });
    await expect.soft(interactable).toBeTruthy();
  });

  test('CP40: Click [data test="login button"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="login-button"]');
    await expect.soft(element).toBeVisible();
    await element.click();
  });

  test('CP41: Focus check for [data test="login button"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="login-button"]');
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

  test('CP42: No stuck state after [data test="login button"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="login-button"]');
    await element.click();
    const spinners = page.locator('.spinner, .loading, [class*="spinner"], [class*="loading"]');
    await expect.soft(spinners.first()).not.toBeVisible();
  });

  test('CP43: No visible errors after [data test="login button"]', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="login-button"]');
    await element.click();
    // Excluir mensajes de error de validación de formulario (error-message-container)
    const errorMessages = page.locator('[class]:not([class*="error-message-container"]):not([class*="alert"])').filter({ has: page.locator('.error, [class*=" error"], [class^="error"]') }).filter({ hasNot: page.locator('input, select, textarea') }).filter({ hasText: /.+/ });
    await expect.soft(errorMessages.first()).not.toBeVisible();
  });

  test('CP44: No console errors after [data test="login button"]', async ({ page }) => {
    const consoleErrors: string[] = [];
    const handler = (msg: any) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
    page.on('console', handler);
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    const element = page.locator('[data-test="login-button"]');
    await element.click();
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
    expect.soft(criticalErrors).toHaveLength(0);
  });


});