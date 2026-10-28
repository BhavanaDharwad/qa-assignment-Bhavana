import { test, expect } from "@playwright/test";
import { signInViaApi } from "../support/helpers";
import { resetTestData, uniqueItemName } from "../support/test-data";

const ADMIN = "Catalogue Admin";
const MEMBER = "Catalogue Member";
const EXISTING_ITEM = "Dell XPS 13";

test.beforeEach(async ({ request }) => {
  await resetTestData(request, "default");
});

test("admin adds an item, sees it in the catalogue, and removes it", async ({ page }) => {
  const itemName = uniqueItemName();
  const itemsPage = await signInViaApi(page, ADMIN, "admin");

  await test.step("admin adds a new item", async () => {
    await expect(itemsPage.getAddItemButton()).toBeVisible();
    await itemsPage.addItem(itemName);
    await expect(itemsPage.getSuccessToast().filter({ hasText: `Added "${itemName}"` })).toBeVisible();
    await expect(itemsPage.getAddItemForm()).toBeHidden();
  });

  await test.step("new item is listed as available", async () => {
    await itemsPage.search(itemName);
    await expect(itemsPage.getItemCard(itemName)).toHaveCount(1);
    await expect(itemsPage.getItemStatusFor(itemName)).toHaveAttribute("data-status", "available");
    await expect(itemsPage.getItemCategoryFor(itemName)).toHaveAttribute("data-category", "laptops");
  });

  await test.step("admin removes the item", async () => {
    await itemsPage.removeItem(itemName);
    await expect(itemsPage.getSuccessToast().filter({ hasText: `Removed "${itemName}"` })).toBeVisible();
    await expect(itemsPage.getRemoveDialog()).toBeHidden();
    await expect(itemsPage.getItemCard(itemName)).toHaveCount(0);
  });
});

test("admin cannot add an item with a name that already exists", async ({ page }) => {
  const itemsPage = await signInViaApi(page, ADMIN, "admin");

  await itemsPage.addItem(EXISTING_ITEM);

  await expect(itemsPage.getItemNameError()).toHaveText("An item with this name already exists");
  await expect(itemsPage.getItemNameInput()).toHaveAttribute("aria-invalid", "true");
  await expect(itemsPage.getAddItemForm()).toBeVisible();
  await expect(itemsPage.getSuccessToast()).toHaveCount(0);

  await page.keyboard.press("Escape");
  await expect(itemsPage.getAddItemForm()).toBeHidden();
  await itemsPage.search(EXISTING_ITEM);
  await expect(itemsPage.getItemCard(EXISTING_ITEM)).toHaveCount(1);
});

test("member cannot add or remove items", async ({ page }) => {
  const itemsPage = await signInViaApi(page, MEMBER, "member");

  await test.step("catalogue hides admin controls", async () => {
    await expect(itemsPage.getItemCard(EXISTING_ITEM)).toBeVisible();
    await expect(itemsPage.getRequestButton(EXISTING_ITEM)).toBeVisible();
    await expect(itemsPage.getAddItemButton()).toHaveCount(0);
    await expect(itemsPage.getRemoveButton(EXISTING_ITEM)).toHaveCount(0);
  });

  await test.step("API rejects an add request from a member", async () => {
    const response = await page.request.post("/api/items", {
      data: { name: uniqueItemName(), category: "laptops" },
      headers: { "x-test-delay": "0" },
    });
    expect(response.status()).toBe(403);
    expect(await response.json()).toMatchObject({ code: "forbidden" });
  });
});
