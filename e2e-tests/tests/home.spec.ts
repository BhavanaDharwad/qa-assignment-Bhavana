import { expect, test, type Page } from "@playwright/test";
import { HOME_PAGE, type HomeRole } from "../support/pages/home-page";
import { ITEMS_PAGE } from "../support/pages/items-page";

test("home page asks the visitor to sign in", async ({ page }) => {
  const homePage = new HOME_PAGE(page);
  await homePage.open("/");
  await expect(homePage.getHeading()).toBeVisible();
});

test("member signs in through the form", async ({ page }) => {
  await signInAs(page, "Kit Member", "member");
});

test("admin signs in through the form", async ({ page }) => {
  await signInAs(page, "Kit Admin", "admin");
});

/**
 * Signs in through the Kit Desk form and waits until the session is visible.
 * The same name and role always resolve to the same user.
 */
async function signInAs(page: Page, name: string, role: HomeRole): Promise<ITEMS_PAGE> {
  const homePage = new HOME_PAGE(page);
  const itemsPage = new ITEMS_PAGE(page);

  await homePage.open("/sign-in");
  await homePage.getNameInput().fill(name);
  await homePage.getRole(role).check();
  await homePage.getSignInButton().click();

  await expect(page).toHaveURL(/\/items$/);
  await expect(itemsPage.getSessionName()).toHaveText(name.trim());
  await expect(itemsPage.getSessionRole()).toHaveAttribute("data-role", role);

  return itemsPage;
}
