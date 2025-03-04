/**
 * @description
 * Jest configuration file for the Tell a Friend application.
 * This file configures Jest to work with Next.js and TypeScript.
 * 
 * @notes
 * - Uses jsdom for browser environment simulation
 * - Sets up module name mapper for @/ imports
 * - Configures transform for TypeScript files
 */

const nextJest = require('next/jest');

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({
  dir: './',
});

// Any custom config you want to pass to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/jest-setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/tests/e2e/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'actions/**/*.ts',
    'app/**/*.tsx',
    'components/**/*.tsx',
    'lib/**/*.ts',
    '!**/node_modules/**',
    '!**/*.d.ts',
  ],
  // Add more setup options if needed
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config
module.exports = createJestConfig(customJestConfig);