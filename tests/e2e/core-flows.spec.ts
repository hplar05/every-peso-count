import { test, expect } from '@playwright/test';

test.describe('Core Public Flows', () => {
  
  test.skip('should allow a resident to submit feedback and receive a tracking code (requires manual DB migration)', async ({ page }) => {
    await page.goto('/feedback/submit');
    
    // Fill out the form
    await page.fill('input[name="resident_name"]', 'Test Resident');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'This is a test inquiry about the road repairs.');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success page
    await expect(page.locator('text=Feedback Submitted')).toBeVisible();
    await expect(page.locator('text=Your Tracking Code')).toBeVisible();
    
    // Grab the tracking code
    const trackingCodeElement = await page.locator('.tracking-widest').innerText();
    expect(trackingCodeElement.length).toBe(8);
  });

  test('should block inappropriate content in feedback submission', async ({ page }) => {
    await page.goto('/feedback/submit');
    
    // Fill out the form with profanity (from our custom filter list)
    await page.fill('textarea[name="message"]', 'This is a test message containing a bad word: crap.');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify error is shown
    await expect(page.locator('text=inappropriate content')).toBeVisible();
  });
  
  test('should allow checking feedback status with a tracking code', async ({ page }) => {
    // We expect "Invalid tracking code" if we type a fake one
    await page.goto('/feedback/status');
    await page.fill('input[name="tracking_code"]', 'FAKECODE');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid tracking code or feedback not found.')).toBeVisible();
  });

});
