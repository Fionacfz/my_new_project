// @ts-check
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://demoqa.com/books';
const USERNAME = process.env.TEST_USERNAME || '';
const PASSWORD = process.env.TEST_PASSWORD || '';

export default async function globalSetup() {
  const hostname = new URL(BASE_URL).hostname;
  const statePath = `web-ui/tests/.auth/state-${hostname}.json`;

  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();

  if (USERNAME && PASSWORD) {
    await page.goto(`${new URL(BASE_URL).origin}/login`);
    await page.getByLabel('Username').fill(USERNAME);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await page.waitForURL(`${BASE_URL}/**`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }

  // Save session state (empty state when no credentials — unauthenticated browsing)
  await page.context().storageState({ path: statePath });

  await browser.close();
}
