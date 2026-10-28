import { expect, type Page } from "@playwright/test";
import { HOME_PAGE, type HomeRole } from "./pages/home-page";
import { ITEMS_PAGE } from "./pages/items-page";

export type UserRole = HomeRole;

/** Pages a signed-in user can open straight after the API session is created. */
export type SignedInPage = "/items" | "/rentals";

/**
 * Signs in through POST /api/auth/sign-in, then opens the page the test needs.
 * The session cookie is stored on the browser, so the sign-in form is skipped.
 */
export async function signInViaApi(
  page: Page,
  name: string,
  role: UserRole,
  destination: SignedInPage = "/items",
): Promise<ITEMS_PAGE> {
  const response = await page.request.post("/api/auth/sign-in", {
    data: { name, role },
    headers: { "x-test-delay": "0" },
  });
  await expect(response).toBeOK();

  await page.goto(destination);
  return new ITEMS_PAGE(page);
}

/**
 * Signs out through the shell and waits until the sign-in form is visible.
 */
export async function signOut(page: Page): Promise<HOME_PAGE> {
  const homePage = new HOME_PAGE(page);
  const itemsPage = new ITEMS_PAGE(page);

  await itemsPage.getSignOutButton().click();

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(homePage.getHeading()).toBeVisible();

  return homePage;
}
