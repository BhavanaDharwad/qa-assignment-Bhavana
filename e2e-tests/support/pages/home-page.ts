import { Page } from '@playwright/test';

const ROLE_LABEL = {
  member: 'Member',
  admin: 'Admin',
} as const;

export type HomeRole = keyof typeof ROLE_LABEL;

export class HOME_PAGE {
  constructor(private page: Page) {}

  getHeading() {
    return this.page.getByRole('heading', { name: 'Sign in to Kit Desk' });
  }

  getNameInput() {
    return this.page.getByLabel('Your name');
  }

  getRole(role: HomeRole) {
    return this.page.getByRole('radio', { name: ROLE_LABEL[role] });
  }

  getSignInButton() {
    return this.page.getByRole('button', { name: 'Sign in' });
  }

  async open(path: '/' | '/sign-in' = '/sign-in') {
    await this.page.goto(path);
  }
}
