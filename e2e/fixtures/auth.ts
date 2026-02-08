import { test as base, Page } from "@playwright/test";

// Test user credentials (from seed data)
export const TEST_USER = {
  email: "angela@example.com",
  password: "password123",
  name: "Angela",
};

export const TEST_ADMIN = {
  email: "admin@deluge.fund",
  password: "password123",
  name: "Admin",
};

// Login helper function
export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect to complete
  await page.waitForURL(/\/(dashboard|admin)/);
}

// Logout helper
export async function logout(page: Page) {
  // Look for signout button or navigate to signout
  await page.goto("/api/auth/signout");
  await page.click('button[type="submit"]');
  await page.waitForURL("/login");
}

// Extended test with pre-authenticated page
export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await use(page);
  },
});

export { expect } from "@playwright/test";
