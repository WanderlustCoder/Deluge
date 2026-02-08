import { test as base, Page, expect as baseExpect, BrowserContext } from "@playwright/test";

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

// Clear all session state
export async function clearSession(context: BrowserContext, page?: Page) {
  await context.clearCookies();
  // If page is provided, navigate to a clean slate
  if (page) {
    await page.goto("about:blank");
  }
}

// Login helper function with retry logic
export async function login(page: Page, email: string, password: string, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await attemptLogin(page, email, password);
      return; // Success
    } catch (error) {
      if (attempt === maxRetries) throw error;
      // Wait before retry
      await page.waitForTimeout(1000);
      await page.context().clearCookies();
    }
  }
}

async function attemptLogin(page: Page, email: string, password: string) {
  // Clear any existing session first
  await page.context().clearCookies();

  // Navigate to login page
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.waitForSelector("#email", { state: "visible", timeout: 10000 });

  // Ensure form is ready and not in loading state
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeEnabled({ timeout: 15000 });

  // Fill form
  await page.fill("#email", email);
  await page.fill("#password", password);

  // Verify button is still enabled after filling
  await expect(submitButton).toBeEnabled({ timeout: 5000 });

  // Click button
  await submitButton.click();

  // Wait for navigation
  await page.waitForURL(/\/(dashboard|admin)/, { timeout: 30000 });
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
