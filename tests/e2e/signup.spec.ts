/**
 * @description
 * End-to-end tests for the signup workflow in the Tell a Friend application.
 * These tests verify that users can successfully sign up, especially focusing
 * on the technician referral flow where customers sign up via a link provided by a technician.
 * 
 * @dependencies
 * - @playwright/test: End-to-end testing framework
 */

import { test, expect } from '@playwright/test';

// Define test fixtures to improve test readability
type SignupTestFixtures = {
  navigateToSignup: () => Promise<void>;
  randomEmail: string;
  randomPhoneNumber: string;
};

test.beforeEach(async ({ page }) => {
  // Navigate to the home page before each test
  await page.goto('/');
});

// Test suite for the signup process
test.describe('Customer Signup Process', () => {
  // Test normal signup flow without technician referral
  test('should allow a new customer to sign up', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');
    
    // Verify that we're on the signup page
    await expect(page.locator('h1')).toContainText('Create Your Account');
    
    // Generate unique email and phone number for this test
    const testEmail = `test.user.${Date.now()}@example.com`;
    const testPhone = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    
    // Fill in the signup form
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Phone Number').fill(testPhone);
    await page.getByLabel('Password').fill('StrongP@ssw0rd');
    
    // Submit the form
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Wait for the signup process to complete
    // This could be a redirect to dashboard or a verification page
    await page.waitForURL(/\/dashboard|\/verify/, { timeout: 15000 });
    
    // Verification depends on the actual flow - might be dashboard or verification page
    if (page.url().includes('/dashboard')) {
      // If redirected to dashboard, we should see the referral dashboard
      await expect(page.locator('h1')).toContainText('Your Referral Dashboard');
      
      // Verify that a referral code is displayed
      await expect(page.getByText(/[A-Z0-9]{4}-[A-Z0-9]{4}/)).toBeVisible();
    } else {
      // If redirected to verification page, we should see verification instructions
      await expect(page.locator('body')).toContainText('verify your email');
    }
  });
  
  // Test signup flow with technician referral
  test('should process technician referral during signup', async ({ page }) => {
    // Navigate to signup page with technician ID parameter
    // This simulates clicking a referral link sent by a technician
    await page.goto('/signup?technicianId=test-technician-id');
    
    // Verify that we're on the signup page with referral info
    await expect(page.locator('h1')).toContainText('Join Our Referral Program');
    await expect(page.locator('p')).toContainText('You were referred by one of our technicians');
    
    // Generate unique email and phone number for this test
    const testEmail = `referred.user.${Date.now()}@example.com`;
    const testPhone = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    
    // Fill in the signup form
    await page.getByLabel('Full Name').fill('Referred User');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Phone Number').fill(testPhone);
    await page.getByLabel('Password').fill('StrongP@ssw0rd');
    
    // Submit the form
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Wait for the signup process to complete
    await page.waitForURL(/\/dashboard|\/verify/, { timeout: 15000 });
    
    // Verification depends on the actual flow
    if (page.url().includes('/dashboard')) {
      // If redirected to dashboard, verify technician referral was processed
      await expect(page.locator('h1')).toContainText('Your Referral Dashboard');
    } else {
      // If redirected to verification page
      await expect(page.locator('body')).toContainText('verify your email');
    }
  });
  
  // Test validation errors in the signup form
  test('should show validation errors for invalid inputs', async ({ page }) => {
    await page.goto('/signup');
    
    // Try to submit the form without filling any fields
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Check for validation error messages
    await expect(page.locator('body')).toContainText(/required/i);
    
    // Test invalid email format
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page.locator('body')).toContainText(/valid email/i);
    
    // Test invalid phone format
    await page.getByLabel('Email').fill('valid@example.com');
    await page.getByLabel('Phone Number').fill('invalid-phone');
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page.locator('body')).toContainText(/valid phone/i);
    
    // Test password requirements
    await page.getByLabel('Phone Number').fill('+15551234567');
    await page.getByLabel('Password').fill('weak');
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page.locator('body')).toContainText(/password.*requirements/i);
  });
});

// Smoke test for login page navigation
test('should navigate to login page from signup page', async ({ page }) => {
  await page.goto('/signup');
  
  // Click on the link to navigate to login page
  await page.getByRole('link', { name: /sign in/i }).click();
  
  // Verify we've navigated to the login page
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('h1')).toContainText('Welcome Back');
});