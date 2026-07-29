import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const PLAYWRIGHT_PORT = 3200;
const PLAYWRIGHT_BASE_URL = `http://localhost:${PLAYWRIGHT_PORT}`;
const PLAYWRIGHT_DATA_ROOT = path.join(process.cwd(), ".cache", "e2e");

/**
 * Playwright E2E test configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: PLAYWRIGHT_BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: `npm run build && npx next start --port ${PLAYWRIGHT_PORT}`,
    env: {
      ATTACHMENTS_ROOT: path.join(PLAYWRIGHT_DATA_ROOT, "attachments"),
      NEXT_PUBLIC_DEPLOYMENT_MODE: "full",
      NEXT_PUBLIC_APP_URL: PLAYWRIGHT_BASE_URL,
      NEXT_PUBLIC_SITE_URL: PLAYWRIGHT_BASE_URL,
      SESSION_SECRET: "playwright-session-secret-at-least-32-characters",
      SQLITE_DATABASE_PATH: path.join(PLAYWRIGHT_DATA_ROOT, "cache.sqlite"),
    },
    url: PLAYWRIGHT_BASE_URL,
    reuseExistingServer: false,
  },
});
