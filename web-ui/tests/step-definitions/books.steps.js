import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures.js';

// ─── Background ───────────────────────────────────────────────────────────────

Given('I am on the Books page', async ({ booksPage }) => {
  await booksPage.navigate();
  await expect(booksPage.searchInput).toBeVisible({ timeout: 10000 });
});

// ─── When ─────────────────────────────────────────────────────────────────────

When('I search for {string}', async ({ booksPage }, term) => {
  await booksPage.searchForBook(term);
});

When('I clear the search', async ({ booksPage }) => {
  await booksPage.clearSearch();
});

// ─── Then ─────────────────────────────────────────────────────────────────────

Then('the books table is visible', async ({ booksPage }) => {
  await expect(booksPage.booksTable).toBeVisible({ timeout: 10000 });
});

Then('at least 1 book is displayed in the table', async ({ booksPage }) => {
  await expect(booksPage.bookRows.first()).toBeVisible({ timeout: 10000 });
});

Then('no books are displayed in the table', async ({ booksPage }) => {
  await expect(booksPage.bookRows).toHaveCount(0, { timeout: 10000 });
});

Then('the {string} column header is visible', async ({ booksPage }, columnName) => {
  await expect(booksPage.getColumnHeader(columnName)).toBeVisible({ timeout: 10000 });
});

Then('the pagination info shows {string}', async ({ booksPage }, text) => {
  await expect(booksPage.paginationInfo).toContainText(text, { timeout: 10000 });
});

Then('the books table shows books containing {string}', async ({ booksPage }, text) => {
  await expect(booksPage.bookRows.first()).toBeVisible({ timeout: 10000 });
  const rows = booksPage.bookRows;
  const count = await rows.count();
  let found = false;
  for (let i = 0; i < count; i++) {
    const rowText = await rows.nth(i).textContent();
    if (rowText && rowText.includes(text)) {
      found = true;
      break;
    }
  }
  expect(found, `Expected at least one row to contain "${text}"`).toBe(true);
});
