import { test, expect } from "@playwright/test";
import { TEST_USER, TEST_ADMIN, login } from "../fixtures/auth";

test.describe("Authentication", () => {
  // Use fresh browser context per test for complete isolation
  test.use({ storageState: { cookies: [], origins: [] } });

  test("login with valid credentials redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForSelector("#email");
    await page.fill("#email", TEST_USER.email);
    await page.fill("#password", TEST_USER.password);

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    await page.waitForURL("/dashboard", { timeout: 15000 });

    await expect(page).toHaveURL("/dashboard");
  });

  test("login with invalid password shows error", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", TEST_USER.email);
    await page.fill("#password", "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
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

  // This test runs last as it can cause session pollution
  test("admin can access admin panel", async ({ page }) => {
    await login(page, TEST_ADMIN.email, TEST_ADMIN.password);
    await page.goto("/admin");

    // Should stay on admin page, not redirect
    await expect(page).toHaveURL("/admin");
  });
});
