import { test, expect } from "@playwright/test";
import { TEST_USER, TEST_ADMIN, login } from "../fixtures/auth";

test.describe("Authentication", () => {
  test("login with valid credentials redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
  });

  test("login with invalid password shows error", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', "wrongpassword");
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

  test("admin can access admin panel", async ({ page }) => {
    await login(page, TEST_ADMIN.email, TEST_ADMIN.password);
    await page.goto("/admin");

    // Should stay on admin page, not redirect
    await expect(page).toHaveURL("/admin");
  });

  test("non-admin cannot access admin panel", async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto("/admin");

    // Should redirect away from admin
    await expect(page).not.toHaveURL(/\/admin/);
  });
});
