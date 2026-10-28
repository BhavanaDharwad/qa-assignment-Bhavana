import { Page } from '@playwright/test';

export class ITEMS_PAGE {
  constructor(private page: Page) {}

  getSearchInput() {
    return this.page.getByPlaceholder('Search by name');
  }

  getRentals() {
    return this.page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Rentals', exact: true });
  }

  getCatalogue() {
    return this.page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Catalogue', exact: true });
  }

  getSessionRole() {
    return this.page.locator('[data-testid="session-role"]');
  }
  
  getSessionName() {
    return this.page.locator('[data-testid="session-name"]');
  }

  getSignOutButton() {
    return this.page.getByRole('button', { name: 'Sign out' });
  }

  getAddItemButton() {
    return this.page.getByRole('button', { name: 'Add item' });
  }

  getSuccessToast() {
    return this.page.locator('[data-type="success"]');
  }

  getItemCards() {
    return this.page.locator('[data-testid="item-card"]');
  }

  getItemCard(name: string) {
    return this.getItemCards().filter({
      has: this.page.locator('[data-testid="item-name"]', { hasText: new RegExp(`^${escapeRegExp(name)}$`) }),
    });
  }

  getErrorState() {
    return this.page.locator('[data-testid="error-state"]');
  }

  getRetryButton() {
    return this.getErrorState().getByRole('button', { name: 'Try again' });
  }

  getItemStatusFor(name: string) {
    return this.getItemCard(name).locator('[data-testid="item-status"]');
  }

  getRequestButton(name: string) {
    return this.page.getByRole('button', { name: `Request ${name}`, exact: true });
  }

  getAddItemForm() {
    return this.page.getByRole('form', { name: 'Add an item' });
  }

  getItemNameInput() {
    return this.getAddItemForm().getByLabel('Name', { exact: true });
  }

  getAddItemSubmit() {
    return this.getAddItemForm().getByRole('button', { name: 'Add item', exact: true });
  }

  getItemNameError() {
    return this.page.locator('#add-item-name-error');
  }

  getItemCategoryFor(name: string) {
    return this.getItemCard(name).locator('[data-testid="item-category"]');
  }

  getRemoveButton(name: string) {
    return this.page.getByRole('button', { name: `Remove ${name}`, exact: true });
  }

  getRemoveDialog() {
    return this.page.getByRole('dialog', { name: 'Remove item?' });
  }

  getConfirmRemoveButton() {
    return this.getRemoveDialog().getByRole('button', { name: 'Remove', exact: true });
  }

  /**
   * The search box is debounced, so the list stays stale until the items
   * response arrives. That wait is registered before the fill.
   * The current value does not send a request. A blank query omits `q`,
   * so `searchParams.get("q")` is null.
   */
  async search(name: string) {
    const input = this.getSearchInput();
    if ((await input.inputValue()) === name) return;

    const query = name.trim();
    const filtered = this.page.waitForResponse((response) => {
      const url = new URL(response.url());
      const submitted = url.searchParams.get('q');
      return (
        response.request().method() === 'GET' &&
        url.pathname === '/api/items' &&
        submitted === (query === '' ? null : query)
      );
    });
    await input.fill(name);
    await filtered;
  }

  async addItem(name: string) {
    await this.getAddItemButton().click();
    await this.getItemNameInput().fill(name);
    await this.getAddItemSubmit().click();
  }

  async removeItem(name: string) {
    await this.getRemoveButton(name).click();
    await this.getConfirmRemoveButton().click();
  }

  async openRentals() {
    await this.getRentals().click();
    await this.page.waitForURL(/\/rentals/);
  }

  async openCatalogue() {
    await this.getCatalogue().click();
    await this.page.waitForURL(/\/items/);
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
