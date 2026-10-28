import { APIRequestContext, expect } from "@playwright/test";

type SeedName = "default" | "empty" | "large";

/**
 * Resets the shared in-memory test database.
 *
 * IMPORTANT:
 * Run before signing in because reset also removes
 * dynamically created users.
 */
export async function resetTestData(request: APIRequestContext, seed: SeedName = "default"): Promise<void> {
  const response = await request.post(`/api/test/reset?seed=${seed}`);

  expect(response.ok(), `Reset endpoint failed: ${response.status()}`).toBeTruthy();

  const body: { ok: boolean; seed: string } = await response.json();

  expect(body.ok).toBe(true);
  expect(body.seed).toBe(seed);
}

/**
 * Generates a name for a newly created item.
 */
export function uniqueItemName(): string {
  return `QA Laptop ${Date.now()}`;
}
