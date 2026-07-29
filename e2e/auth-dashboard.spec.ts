import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Password").fill("password1234");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("owner sign-in opens the library and survives refresh", async ({ page }) => {
  await signIn(page);

  await expect(page.getByRole("heading", { name: "Library", level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "New", exact: true })).toBeVisible();

  await page.reload();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Library", level: 1 })).toBeVisible();
});

test("search filters the real SQLite-backed library and clears cleanly", async ({ page }) => {
  await signIn(page);
  const searchbox = page.getByRole("searchbox", { name: "Search snippets" });

  await searchbox.fill("Python");
  await expect(page).toHaveURL(/\/dashboard\?q=Python$/);
  await expect(page.getByRole("button", { name: /view snippet: python list comprehension/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /view snippet: react state updater pattern/i })).toHaveCount(0);

  await page.getByRole("button", { name: "Clear search" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(searchbox).toHaveValue("");
  await expect(page.getByRole("button", { name: /view snippet: react state updater pattern/i })).toBeVisible();
});

test("new snippet modal is named, responsive, and dismissible", async ({ page }) => {
  await signIn(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "New", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: "Create snippet" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Snippet title")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("protected routes redirect anonymous visitors to sign in", async ({ page }) => {
  await page.goto("/dashboard?q=private");

  await expect(page).toHaveURL(/\/sign-in\?callbackUrl=%2Fdashboard%3Fq%3Dprivate$/);
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
});

test("health endpoint remains publicly available", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({
    ok: true,
    data: { status: "ok" },
  });
});
