const { test, expect } = require('@playwright/test');

test('debug app state and structure', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Take screenshot of initial state
  await page.screenshot({ path: 'tests/screenshots/initial-state.png', fullPage: true });
  
  // Log the page content
  const bodyText = await page.textContent('body');
  console.log('=== Initial Page Content ===');
  console.log(bodyText.substring(0, 500));
  
  // Try to navigate to Dashboard
  const dashboardButton = page.locator('text="Dashboard"');
  if (await dashboardButton.isVisible()) {
    await dashboardButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/dashboard.png', fullPage: true });
  }
  
  // Look for any category elements
  const categories = await page.locator('[style*="backgroundColor"]').count();
  console.log(`Found ${categories} elements with background color`);
  
  // Look for navigation tabs
  const tabs = await page.locator('[role="tab"]').count();
  console.log(`Found ${tabs} tab elements`);
  
  // Check if there's any error message
  const errorBoundary = await page.locator('text="Something went wrong"').count();
  console.log(`Error boundary active: ${errorBoundary > 0}`);
  
  // Try Categories tab
  const categoriesTab = page.locator('[role="tab"]:has-text("Categories")');
  if (await categoriesTab.isVisible()) {
    await categoriesTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/categories.png', fullPage: true });
    
    // Look for category cards
    const categoryCards = await page.locator('[data-testid="button"]').count();
    console.log(`Found ${categoryCards} button elements`);
  }
});