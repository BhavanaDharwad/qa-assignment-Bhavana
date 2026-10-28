import { test, expect } from "@playwright/test";
import { signInViaApi, signOut } from "../support/helpers";
import { ITEMS_PAGE } from "../support/pages/items-page";
import { RENTALS_PAGE } from "../support/pages/rentals-page";
import { resetTestData } from "../support/test-data";

const ITEM = "Dell XPS 13";
const MEMBER = "Lifecycle Member";
const ADMIN = "Lifecycle Admin";

test.beforeEach(async ({ request }) => {
  await resetTestData(request, "default");
});

test("rental moves from available to returned and the item is available again", async ({ page }) => {
  const rentalsPage = new RENTALS_PAGE(page);

  await test.step("member sees the item available and requests it", async () => {
    const itemsPage = await signInViaApi(page, MEMBER, "member");
    await itemsPage.search(ITEM);
    await expect(itemsPage.getItemCard(ITEM)).toHaveCount(1);
    await expect(itemsPage.getItemStatusFor(ITEM)).toHaveAttribute("data-status", "available");
    await itemsPage.getRequestButton(ITEM).click();
    await expect(itemsPage.getSuccessToast().filter({ hasText: `Requested "${ITEM}". Waiting for approval.` })).toBeVisible();
    await expect(itemsPage.getItemStatusFor(ITEM)).toHaveAttribute("data-status", "requested");
    await itemsPage.openRentals();
    await expect(rentalsPage.getActiveTab()).toHaveAttribute("aria-selected", "true");
    await expect(rentalsPage.getRentalStatus(ITEM)).toHaveAttribute("data-status", "requested");
    await signOut(page);
  });

  await test.step("admin approves the request", async () => {
    const itemsPage = await signInViaApi(page, ADMIN, "admin", "/rentals");
    await rentalsPage.openTab("Requests");
    await expect(rentalsPage.getRentalStatus(ITEM)).toHaveAttribute("data-status", "requested");
    await rentalsPage.getApproveButton(ITEM).click();
    await expect(rentalsPage.getSuccessToast().filter({ hasText: `Approved "${ITEM}"` })).toBeVisible();
    await expect(rentalsPage.getRentalRow(ITEM)).toHaveCount(0);
    await rentalsPage.openTab("On loan");
    await expect(rentalsPage.getRentalStatus(ITEM)).toHaveAttribute("data-status", "approved");
    await itemsPage.openCatalogue();
    await itemsPage.search(ITEM);
    await expect(itemsPage.getItemStatusFor(ITEM)).toHaveAttribute("data-status", "on-loan");
    await signOut(page);
  });

  await test.step("member requests the return", async () => {
    const itemsPage = await signInViaApi(page, MEMBER, "member", "/rentals");
    await expect(rentalsPage.getRentalStatus(ITEM)).toHaveAttribute("data-status", "approved");
    await rentalsPage.getReturnButton(ITEM).click();
    await expect(rentalsPage.getSuccessToast().filter({ hasText: `Return requested for "${ITEM}"` })).toBeVisible();
    await expect(rentalsPage.getRentalStatus(ITEM)).toHaveAttribute("data-status", "return-pending");
    await itemsPage.openCatalogue();
    await itemsPage.search(ITEM);
    await expect(itemsPage.getItemStatusFor(ITEM)).toHaveAttribute("data-status", "return-pending");
    await signOut(page);
  });

  await test.step("admin confirms the return", async () => {
    const itemsPage = await signInViaApi(page, ADMIN, "admin", "/rentals");
    await rentalsPage.openTab("Returns");
    await expect(rentalsPage.getRentalStatus(ITEM)).toHaveAttribute("data-status", "return-pending");
    await rentalsPage.getConfirmReturnButton(ITEM).click();
    await expect(rentalsPage.getSuccessToast().filter({ hasText: `"${ITEM}" is back in the catalogue` })).toBeVisible();
    await expect(rentalsPage.getRentalRow(ITEM)).toHaveCount(0);
    await rentalsPage.openTab("History");
    await expect(rentalsPage.getRentalStatus(ITEM)).toHaveAttribute("data-status", "returned");
  });

  await test.step("item is available again in the catalogue", async () => {
    const itemsPage = new ITEMS_PAGE(page);
    await itemsPage.openCatalogue();
    await itemsPage.search(ITEM);
    await expect(itemsPage.getItemStatusFor(ITEM)).toHaveAttribute("data-status", "available");
  });
});
