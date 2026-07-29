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
  await expect(dialog.getByLabel("Snippet language")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Save" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("snippet create, attachment, edit, and refresh journey persists", async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole("button", { name: "New", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: "Create snippet" });
  await dialog.getByLabel("Snippet title").fill("Playwright journey");
  await dialog
    .getByLabel("Snippet description")
    .fill("Created through the full browser flow");
  const editor = dialog.getByRole("textbox", { name: "Editor content" });
  await editor.click({ force: true });
  await page.keyboard.insertText("export const journey = true;");

  await dialog.getByRole("button", { name: "Add tag" }).click();
  await dialog.getByLabel("New snippet tag").fill("e2e");
  await dialog.getByLabel("New snippet tag").press("Enter");
  await dialog.locator('input[type="file"]').setInputFiles({
    name: "journey.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("# Journey\n\nBrowser attachment."),
  });

  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(page).toHaveURL(/\/snippets\/[a-f0-9-]+$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Playwright journey" }),
  ).toBeVisible();
  await expect(page.getByText("journey.md")).toBeVisible();

  const viewLink = page.getByRole("link", { name: "View" });
  const viewHref = await viewLink.getAttribute("href");
  expect(viewHref).toBeTruthy();

  const attachmentResponse = await page.request.get(
    new URL(viewHref!, page.url()).toString(),
  );
  expect(attachmentResponse.ok()).toBe(true);
  expect(attachmentResponse.headers()["content-disposition"]).toContain(
    "inline",
  );
  expect(await attachmentResponse.text()).toContain("Browser attachment.");

  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel(/^Title/).fill("Playwright journey updated");
  await page.getByLabel("Notes").fill("Persisted after refresh.");
  await page.getByRole("button", { name: "Save Changes" }).click();

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Playwright journey updated",
    }),
  ).toBeVisible();
  await expect(page.getByText("Persisted after refresh.")).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Playwright journey updated",
    }),
  ).toBeVisible();
  await expect(page.getByText("Persisted after refresh.")).toBeVisible();
  await expect(page.getByText("journey.md")).toBeVisible();
});

test("mobile landing content stays inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const heading = page.getByRole("heading", {
    level: 1,
    name: "Your personal code library, on your machine.",
  });
  await expect(heading).toBeVisible();

  const box = await heading.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBe(390);
});

test("mobile docs navigation opens in view and closes after navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/getting-started/installation");
  const initialScroll = await page.evaluate(() => window.scrollY);

  await page
    .getByRole("button", { name: "Open documentation navigation" })
    .click();

  const navigation = page.getByRole("dialog", {
    name: "Documentation navigation",
  });
  await expect(navigation).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(initialScroll);

  await navigation.getByRole("link", { name: "CLI" }).click();
  await expect(page).toHaveURL(/\/docs\/cli$/);
  await expect(navigation).toBeHidden();
});

test("protected routes redirect anonymous visitors to sign in", async ({ page }) => {
  await page.goto("/dashboard?q=private");

  await expect(page).toHaveURL(/\/sign-in\?callbackUrl=%2Fdashboard%3Fq%3Dprivate$/);
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
});

test("sign-in restores a protected nested callback with its query", async ({
  page,
}) => {
  await page.goto("/dashboard?q=Python");
  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Password").fill("password1234");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();

  await expect(page).toHaveURL(/\/dashboard\?q=Python$/);
  await expect(page.getByRole("searchbox", { name: "Search snippets" })).toHaveValue(
    "Python",
  );
  await expect(
    page.getByRole("button", { name: /view snippet: python list comprehension/i }),
  ).toBeVisible();
});

test("health endpoint remains publicly available", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({
    ok: true,
    data: { status: "ok" },
  });
});
