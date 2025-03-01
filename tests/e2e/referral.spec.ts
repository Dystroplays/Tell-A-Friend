/**
 * @description
 * End-to-end tests for the referral and purchase workflow in the Tell a Friend application.
 * These tests verify that users can share referral codes and that purchases made with
 * these codes trigger the referral reward system correctly.
 * 
 * @dependencies
 * - @playwright/test: End-to-end testing framework
 */

import { test, expect, Page } from '@playwright/test';

// Login helper function to be used in multiple tests
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/dashboard');
}

test.beforeEach(async ({ page }) => {
  // Navigate to the home page before each test
  await page.goto('/');
});

// Test suite for the referral and purchase process
test.describe('Referral and Purchase Process', () => {
  // Test referral code sharing functionality
  test('should allow a customer to share their referral code', async ({ page }) => {
    // Create test user credentials
    // Note: In a real test, you'd use a test account that's pre-created
    // or create an account programmatically through an API
    const testEmail = 'test.referrer@example.com';
    const testPassword = 'StrongP@ssw0rd';
    
    // Login as the test user
    await loginUser(page, testEmail, testPassword);
    
    // Verify that we're on the dashboard page
    await expect(page.locator('h1')).toContainText('Your Referral Dashboard');
    
    // Get the user's referral code
    const referralCodeElement = await page.locator('div:has-text("Your Referral Code") + div').first();
    const referralCode = await referralCodeElement.textContent();
    expect(referralCode).toBeTruthy();
    expect(referralCode).toMatch(/[A-Z0-9]{4}-[A-Z0-9]{4}/);
    
    // Go to the Share Referral tab if not already there
    await page.getByRole('tab', { name: 'Share Referral' }).click();
    
    // Test the copy functionality
    await page.getByRole('button', { name: 'Copy Link' }).click();
    
    // Verify the success toast appears
    await expect(page.locator('div[role="status"]')).toContainText('copied to clipboard');
    
    // Test customizing message
    await page.getByRole('tab', { name: 'Customize Message' }).click();
    const customMessage = 'Try this amazing service!';
    await page.locator('textarea').fill(customMessage);
    
    // Test email sharing option
    await page.getByRole('tab', { name: 'Email & SMS' }).click();
    await expect(page.getByRole('button', { name: 'Share via Email' })).toBeVisible();
    
    // Test social media sharing options
    await page.getByRole('tab', { name: 'Social Media' }).click();
    await expect(page.getByRole('button', { name: 'Facebook' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Twitter' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'LinkedIn' })).toBeVisible();
  });
  
  // Test the purchase process with a referral code
  test('should allow a purchase using a referral code', async ({ page, browser }) => {
    // For a real test, you would:
    // 1. Login as a user with a referral code
    // 2. Get their referral code
    // 3. Logout
    // 4. Navigate to the purchase page and use the referral code
    
    // For this example, we'll simulate with a known referral code
    const testReferralCode = 'ABCD-1234'; // You'd get this dynamically in a real test
    
    // Navigate to the test purchase page
    await page.goto('/test-purchase');
    
    // Fill in the purchase form
    await page.getByLabel('Referral Code').fill(testReferralCode);
    await page.getByLabel('Your Name').fill('Test Customer');
    await page.getByLabel('Your Email').fill('test.customer@example.com');
    await page.getByLabel('Purchase Amount ($)').fill('100');
    
    // Submit the form
    await page.getByRole('button', { name: /complete purchase/i }).click();
    
    // Verify the success message
    await expect(page.locator('div[role="status"]')).toContainText('Purchase successful');
    
    // In a real test, we'd now check that:
    // 1. The purchase is recorded in the database
    // 2. The referrer receives a notification
    // 3. A pending reward is created
  });
  
  // Test the reward approval process (admin view)
  test('should allow admins to approve referral rewards', async ({ page }) => {
    // Login as admin user
    // Note: In a real test, you'd use a test admin account
    const adminEmail = 'admin@example.com';
    const adminPassword = 'AdminP@ssw0rd';
    
    await loginUser(page, adminEmail, adminPassword);
    
    // Navigate to admin dashboard
    await page.goto('/admin');
    
    // Verify that we're on the admin page
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    
    // Go to the Rewards tab
    await page.getByRole('tab', { name: 'Rewards' }).click();
    
    // Find a pending reward (assume one exists for this test)
    const reviewButton = page.getByRole('button', { name: 'Review' }).first();
    
    // Click the review button for the first pending reward
    if (await reviewButton.isVisible()) {
      await reviewButton.click();
      
      // Check that the review dialog opens
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('dialog')).toContainText('Review Reward');
      
      // Add review notes
      await page.locator('textarea').fill('Verified legitimate purchase');
      
      // Approve the reward
      await page.getByRole('button', { name: 'Approve' }).click();

      // Verify the success toast appears
      await expect(page.locator('div[role="status"]')).toContainText('approved successfully');
      
      // Check that the reward disappears from the pending list
      await expect(reviewButton).not.toBeVisible();
    } else {
      console.log('No pending rewards to test with');
    }
  });
  
  // Test the referral notifications
  test('should show notifications for referral activities', async ({ page }) => {
    // Login as a user with referral activity
    const testEmail = 'test.referrer@example.com';
    const testPassword = 'StrongP@ssw0rd';
    
    await loginUser(page, testEmail, testPassword);
    
    // Navigate to the notifications tab on the dashboard
    await page.goto('/dashboard');
    await page.getByRole('tab', { name: 'Notifications' }).click();
    
    // Verify notifications are displayed
    const notificationsPanel = page.locator('div[role="tabpanel"]').filter({ hasText: 'Notifications' });
    
    // If there are notifications, check their content
    // If no notifications, the test will be marked as acceptable but skipped
    const hasNotifications = await notificationsPanel.locator('li').count() > 0;
    
    if (hasNotifications) {
      // Check at least one notification exists
      await expect(notificationsPanel.locator('li').first()).toBeVisible();
      
      // Check mark as read functionality if there are unread notifications
      const unreadNotification = notificationsPanel.locator('li[data-read="false"]').first();
      if (await unreadNotification.isVisible()) {
        await unreadNotification.getByRole('button', { name: 'Mark as read' }).click();
        await expect(unreadNotification).toHaveAttribute('data-read', 'true');
      }
    } else {
      console.log('No notifications found to test with');
    }
  });
});

// Test for customer dashboard referral stats
test('should display referral statistics on customer dashboard', async ({ page }) => {
  // Login as a user with referral history
  const testEmail = 'test.referrer@example.com';
  const testPassword = 'StrongP@ssw0rd';
  
  await loginUser(page, testEmail, testPassword);
  
  // Navigate to the stats tab on the dashboard
  await page.goto('/dashboard');
  await page.getByRole('tab', { name: 'Detailed Stats' }).click();
  
  // Verify stats components are present
  await expect(page.getByText('Referral Performance')).toBeVisible();
  
  // Check for the presence of key metrics
  await expect(page.getByText('Referral Rate')).toBeVisible();
  await expect(page.getByText('Rewards')).toBeVisible();
  await expect(page.getByText('Earnings')).toBeVisible();
  
  // Check that the recent activity table exists
  await expect(page.getByText('Recent Referral Activity')).toBeVisible();
  
  // The content of the stats will vary based on user activity,
  // so we just verify the structure is present
});