import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'web-ui/features/**/*.feature',
  steps: ['web-ui/tests/fixtures.js', 'web-ui/tests/step-definitions/**/*.js'],
});

const BASE_URL = process.env.BASE_URL || 'https://demoqa.com/books';
const hostname = new URL(BASE_URL).hostname;

export default defineConfig({
  testDir,
  timeout: 30000,
  globalSetup: './web-ui/tests/global-setup.js',
  use: {
    baseURL: BASE_URL,
    storageState: `web-ui/tests/.auth/state-${hostname}.json`,
    headless: !!process.env.CI,
    slowMo: process.env.CI ? 0 : 250,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 5,
  reporter: process.env.CI
    ? [['junit', { outputFile: 'test-results/results.xml' }], ['html', { open: 'never' }]]
    : 'html',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
