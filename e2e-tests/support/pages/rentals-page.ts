import { Page } from '@playwright/test';

export type RentalsTab = 'Active' | 'Requests' | 'On loan' | 'Returns' | 'History';

export class RENTALS_PAGE {
  constructor(private page: Page) {}

  getTab(label: RentalsTab) {
    return this.page.getByRole('tab', { name: label });
  }

  getActiveTab() {
    return this.getTab('Active');
  }

  getHistoryTab() {
    return this.getTab('History');
  }

  getReturnsTab() {
    return this.getTab('Returns');
  }

  getRentalList() {
    return this.page.locator('[data-testid="rental-list"]');
  }

  getRentalRow(itemName: string) {
    return this.page.locator('[data-testid="rental-row"]').filter({
      has: this.page.locator('[data-testid="rental-item-name"]', { hasText: itemName }),
    });
  }

  getRentalStatus(itemName: string) {
    return this.getRentalRow(itemName).locator('[data-testid="rental-status"]');
  }

  getApproveButton(itemName: string) {
    return this.page.getByRole('button', { name: `Approve ${itemName}`, exact: true });
  }

  getRejectButton(itemName: string) {
    return this.page.getByRole('button', { name: `Reject ${itemName}`, exact: true });
  }

  getReturnButton(itemName: string) {
    return this.page.getByRole('button', { name: `Return ${itemName}`, exact: true });
  }

  getConfirmReturnButton(itemName: string) {
    return this.page.getByRole('button', { name: `Confirm return ${itemName}`, exact: true });
  }

  getSuccessToast() {
    return this.page.locator('[data-type="success"]');
  }

  async openTab(label: RentalsTab) {
    await this.getTab(label).click();
  }
}
