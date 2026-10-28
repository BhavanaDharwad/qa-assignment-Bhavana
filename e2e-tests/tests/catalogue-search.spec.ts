import { expect, test } from "@playwright/test";
import { signInViaApi } from "../support/helpers";
import { resetTestData } from "../support/test-data";

const MEMBER = "Stub Member";
const SEEDED_ITEM = "Dell XPS 13";
const OTHER_ITEM = "MacBook Pro 14";
const SERVER_ERROR = { error: "Unexpected server error", code: "internal_error" };

test.beforeEach(async ({ request }) => {
  await resetTestData(request, "default");
});

test("clearing search restores the full catalogue", async ({ page }) => {
  const itemsPage = await signInViaApi(page, "Search Member", "member");

  await expect(itemsPage.getItemCard(SEEDED_ITEM)).toBeVisible();
  await expect(itemsPage.getItemCard(OTHER_ITEM)).toBeVisible();
  const catalogueSize = await itemsPage.getItemCards().count();

  await test.step("a search shows only matching items", async () => {
    await itemsPage.search(SEEDED_ITEM);
    await expect(itemsPage.getItemCards()).toHaveCount(1);
    await expect(itemsPage.getItemCard(SEEDED_ITEM)).toBeVisible();
    await expect(itemsPage.getItemCard(OTHER_ITEM)).toHaveCount(0);
  });

  await test.step("searching again for the current value leaves that list in place", async () => {
    await itemsPage.search(SEEDED_ITEM);
    await expect(itemsPage.getItemCards()).toHaveCount(1);
    await expect(itemsPage.getItemCard(OTHER_ITEM)).toHaveCount(0);
  });

  await test.step("clearing the search shows the whole catalogue", async () => {
    await itemsPage.search("");
    await expect(itemsPage.getSearchInput()).toHaveValue("");
    await expect(itemsPage.getItemCard(SEEDED_ITEM)).toBeVisible();
    await expect(itemsPage.getItemCard(OTHER_ITEM)).toBeVisible();
    await expect(itemsPage.getItemCards()).toHaveCount(catalogueSize);
  });
});

test("member recovers the catalogue after a failed load", async ({ page }) => {
  // The catalogue query retries a 500 once, so the stub stays in place until Try again.
  await page.route("**/api/items", (route) => route.fulfill({ status: 500, json: SERVER_ERROR }));

  const itemsPage = await signInViaApi(page, MEMBER, "member");

  await expect(itemsPage.getErrorState()).toContainText("Something went wrong");
  await expect(itemsPage.getErrorState()).toContainText(SERVER_ERROR.error);
  await expect(itemsPage.getRetryButton()).toBeVisible();
  await expect(itemsPage.getItemCards()).toHaveCount(0);

  await page.unroute("**/api/items");
  await itemsPage.getRetryButton().click();

  await expect(itemsPage.getErrorState()).toHaveCount(0);
  await expect(itemsPage.getItemCard(SEEDED_ITEM)).toBeVisible();
  await expect(itemsPage.getItemStatusFor(SEEDED_ITEM)).toHaveAttribute("data-status", "available");
  await expect(itemsPage.getRequestButton(SEEDED_ITEM)).toBeVisible();
});
