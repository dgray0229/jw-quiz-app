const { test, expect } = require('@playwright/test');

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Check if the page title contains expected text
  await expect(page).toHaveTitle(/JW Quiz App/i);
  
  // You can add more specific tests based on your app's content
  // For example:
  // await expect(page.locator('text=Welcome')).toBeVisible();
});

test('app is responsive', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  
  // Test desktop viewport
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.waitForTimeout(1000);
  
  // Add assertions based on your responsive design
});
