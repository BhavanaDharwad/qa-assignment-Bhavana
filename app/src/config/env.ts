import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DELAY_MIN_MS: z.coerce.number().int().min(0).default(200),
  DELAY_MAX_MS: z.coerce.number().int().min(0).default(1200),
  ENABLE_TEST_ENDPOINTS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DELAY_MIN_MS: process.env.DELAY_MIN_MS,
    DELAY_MAX_MS: process.env.DELAY_MAX_MS,
    ENABLE_TEST_ENDPOINTS: process.env.ENABLE_TEST_ENDPOINTS,
  });
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}
