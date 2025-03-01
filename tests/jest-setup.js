/**
 * @description
 * Setup file for Jest tests in the Tell a Friend application.
 * This file runs before each test file and sets up the global test environment.
 * 
 * @dependencies
 * - @testing-library/jest-dom: Provides custom jest matchers for DOM assertions
 */

// Import jest-dom extensions for enhanced DOM element assertions
import '@testing-library/jest-dom';

// Mock the global fetch API if needed
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Clean up after each test if needed
afterEach(() => {
  // Any global cleanup you want to perform after each test
});

// Mock Next.js router if needed
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => ({ get: () => null }),
}));

// Mock environment variables if needed
process.env = {
  ...process.env,
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
};

// Suppress console errors during tests (optional)
// You might want to comment this out when debugging tests
// const originalConsoleError = console.error;
// console.error = (...args) => {
//   if (args[0].includes('Warning:')) {
//     return;
//   }
//   originalConsoleError(...args);
// };