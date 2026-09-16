import { test, expect } from '@playwright/test';

test.describe('Responsive Mobile Views', () => {
  // Use a mobile viewport for all tests in this suite
  test.use({ viewport: { width: 375, height: 812 } });

  test('should render the public homepage correctly on mobile', async ({ page }) => {
    await page.goto('/');
    
    // The "Welcome to" heading should be visible and properly stacked
    await expect(page.locator('text=Barangay Bella Luz').first()).toBeVisible();
    
    // The grid of cards should stack on mobile (verified by checking they exist)
    await expect(page.locator('text=Resident View').first()).toBeVisible();
  });

  test('should render the projects list correctly on mobile', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('text=Barangay Projects')).toBeVisible();
  });

  test('should render the feedback submit form on mobile', async ({ page }) => {
    await page.goto('/feedback/submit');
    await expect(page.locator('text=Submit Inquiry')).toBeVisible();
    
    // Check if the form is accessible
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });

});
