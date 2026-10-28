import { getEnv } from "@/config/env";
import { store } from "@/server/store";
import { errorResponse, jsonResponse } from "@/server/http";
import { SEED_NAMES, type SeedName } from "@/types/domain";

export const dynamic = "force-dynamic";

function isSeedName(value: string): value is SeedName {
  return (SEED_NAMES as readonly string[]).includes(value);
}

/**
 * Test hook: resets the in-memory store (users, items, rentals) to a named seed.
 * Enabled in development. In production it needs ENABLE_TEST_ENDPOINTS=true.
 * This endpoint has no simulated latency on purpose.
 */
export async function POST(request: Request): Promise<Response> {
  const env = getEnv();
  if (env.NODE_ENV === "production" && !env.ENABLE_TEST_ENDPOINTS) {
    return errorResponse(404, { error: "Not found", code: "not_found" });
  }
  const seed = new URL(request.url).searchParams.get("seed") ?? "default";
  if (!isSeedName(seed)) {
    return errorResponse(400, { error: `Unknown seed "${seed}"`, code: "unknown_seed" });
  }
  store.reset(seed);
  return jsonResponse({ ok: true, seed, items: store.listItems({}).length });
}
