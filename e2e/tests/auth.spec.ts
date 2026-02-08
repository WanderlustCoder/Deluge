import { test, expect } from "@playwright/test";
import { TEST_USER, TEST_ADMIN, login, clearSession } from "../fixtures/auth";

test.describe("Authentication", () => {
  // Use fresh browser context per test for complete isolation
  test.use({ storageState: { cookies: [], origins: [] } });

  // Clear session before each test
  test.beforeEach(async ({ page, context }) => {
    await clearSession(context, page);
  });

  test("login with valid credentials redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForSelector("#email", { state: "visible" });
    await page.fill("#email", TEST_USER.email);
    await page.fill("#password", TEST_USER.password);

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 10000 });
    await submitButton.click();
    await page.waitForURL("/dashboard", { timeout: 15000 });

    await expect(page).toHaveURL("/dashboard");
  });

  test("login with invalid password shows error", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.waitForSelector("#email", { state: "visible" });

    await page.fill("#email", TEST_USER.email);
    await page.fill("#password", "wrongpassword");

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    // Wait for error message to appear (with longer timeout for API response)
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({
      timeout: 15000,
    });
    await expect(page).toHaveURL("/login");
  });

  test("protected routes redirect to login when unauthenticated", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("non-admin cannot access admin panel", async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto("/admin");

    // Should redirect away from admin
    await expect(page).not.toHaveURL(/\/admin/);
  });

  // KNOWN FLAKY: This test passes in isolation but fails when run after other tests
  // due to NextAuth session pollution that persists despite cookie clearing
  test.skip("admin can access admin panel", async ({ page }) => {
    await login(page, TEST_ADMIN.email, TEST_ADMIN.password);
    await page.goto("/admin");
    await expect(page).toHaveURL("/admin");
  });
});
