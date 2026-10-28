import { getEnv } from "@/config/env";

/**
 * Name of the request header that overrides the randomised delay for one request.
 * Value is the delay in milliseconds. Tests use `0` to make seeding fast and a
 * large value to force loading states.
 */
export const TEST_DELAY_HEADER = "x-test-delay";

function parseHeaderDelay(request: Request): number | null {
  const raw = request.headers.get(TEST_DELAY_HEADER);
  if (raw === null) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.min(value, 30_000);
}

function randomBetween(min: number, max: number): number {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return low + Math.floor(Math.random() * (high - low + 1));
}

/**
 * Waits a randomised amount of time to simulate network and backend latency.
 * The range comes from DELAY_MIN_MS / DELAY_MAX_MS. A request may override it
 * with the `x-test-delay` header.
 */
export async function simulateLatency(request: Request): Promise<number> {
  const override = parseHeaderDelay(request);
  const env = getEnv();
  const delay = override ?? randomBetween(env.DELAY_MIN_MS, env.DELAY_MAX_MS);
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return delay;
}
