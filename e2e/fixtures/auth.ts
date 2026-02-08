import { test as base, Page, expect as baseExpect } from "@playwright/test";

const expect = baseExpect;

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
  await page.waitForSelector("#email");
  await page.fill("#email", email);
  await page.fill("#password", password);

  // Wait for button to be enabled (not in loading state)
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeEnabled({ timeout: 5000 });

  // Click and wait for navigation
  await submitButton.click();
  await page.waitForURL(/\/(dashboard|admin)/, { timeout: 15000 });
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
