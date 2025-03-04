/**
 * @description
 * Playwright configuration file for end-to-end tests in the Tell a Friend application.
 * This file configures Playwright to run tests against the Next.js development server.
 * 
 * @dependencies
 * - @playwright/test: End-to-end testing framework
 */

import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  // Directory where tests are located
  testDir: './tests/e2e',
  
  // Maximum time one test can run for
  timeout: 30 * 1000,
  
  // Run tests in parallel when possible
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry tests on CI to avoid flakiness
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['list']
  ],
  
  // Shared settings for all projects (browsers)
  use: {
    // Base URL to use in navigation
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Capture screenshot after each test failure
    screenshot: 'only-on-failure',
    
    // Record trace for each failing test
    trace: 'retain-on-failure',
    
    // Record video for each failing test
    video: 'on-first-retry',
  },
  
  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
  ],
  
  // Run Next.js dev server before starting tests
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
};

export default config;