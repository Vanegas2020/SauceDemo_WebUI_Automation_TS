import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * BackpackPage - Page Object for Backpack
 *
 * This is a generic page object containing locators and basic navigation methods.
 */
export class BackpackPage extends BasePage {
  /**
   * Page URL (relative to baseURL)
   */
  readonly url = '/inventory.html';

  // ============================================================================
  // Locators
  // ============================================================================

  /**
   * Automatically detected element - locator
   */
  readonly btnItem4TitleLink: Locator = this.page.getByTestId('item-4-title-link');
  /**
   * Automatically detected element - locator
   */
  readonly btnInventoryItemName: Locator = this.page.getByTestId('inventory-item-name');
  /**
   * Automatically detected element - locator
   */
  readonly btnInventoryItemDesc: Locator = this.page.getByTestId('inventory-item-desc');
  /**
   * Automatically detected element - locator
   */
  readonly btnInventoryItemPrice: Locator = this.page.getByTestId('inventory-item-price');
  /**
   * Automatically detected element - locator
   */
  readonly btnAddToCart: Locator = this.page.getByTestId('add-to-cart');
  /**
   * Automatically detected element - locator
   */
  readonly btnRemove: Locator = this.page.getByTestId('remove');
  /**
   * Automatically detected element - locator
   */
  readonly btnBackToProducts: Locator = this.page.getByTestId('back-to-products');

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
   * Navigate to the Backpack page
   */
  async navigateToPage(): Promise<void> {
    await this.navigate(this.url);
    await this.waitForPageLoad('networkidle');
  }

  // ============================================================================
  // Action Methods
  // ============================================================================


  // ============================================================================
  // Validation Methods
  // ============================================================================

  /**
   * Check if page is loaded
   * @returns True if page is loaded
   */
  async isLoaded(): Promise<boolean> {
    try {
      await this.btnItem4TitleLink.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }
}
