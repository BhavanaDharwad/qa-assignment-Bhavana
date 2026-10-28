import { defineConfig, devices } from "@playwright/test";

const isCI = process.env.CI !== undefined;
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Starts the app for you. If the app is already running on port 3000 the
  // existing server is reused. CI uses the production server, which hides
  // POST /api/test/reset unless this flag is set.
  webServer: {
    command: isCI ? "npm run start" : "npm run dev",
    cwd: "../app",
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
    env: {
      ENABLE_TEST_ENDPOINTS: "true",
    },
  },
});
