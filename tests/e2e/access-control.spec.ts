import { test, expect } from '@playwright/test';

test.describe('Access Control & Security', () => {

  test('should redirect unauthenticated users away from /admin routes', async ({ page }) => {
    // Attempt to access admin dashboard
    await page.goto('/admin');
    
    // Should be redirected to the public index or login page
    // Actually, in our app, unauthenticated /admin goes to /login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should redirect unauthenticated users away from /admin/budget routes', async ({ page }) => {
    await page.goto('/admin/budget');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should allow public access to resident view routes', async ({ page }) => {
    // These should not redirect
    await page.goto('/projects');
    await expect(page.locator('h1', { hasText: 'Barangay Projects' }).first()).toBeVisible();
    
    await page.goto('/budget');
    await expect(page.locator('h1', { hasText: 'Budget' }).first()).toBeVisible();
    
    await page.goto('/kagawads');
    await expect(page.locator('h1', { hasText: 'Sangguniang Barangay Members' }).first()).toBeVisible();
  });

});
