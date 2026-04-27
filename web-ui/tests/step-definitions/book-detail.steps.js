import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures.js';

// ─── When ─────────────────────────────────────────────────────────────────────

When('I click on the book title {string}', async ({ booksPage }, title) => {
  await booksPage.clickBookTitle(title);
});

When('I click {string}', async ({ bookDetailPage }, buttonName) => {
  if (buttonName === 'Back To Book Store') {
    await bookDetailPage.goBackToBookStore();
  }
});

// ─── Then ─────────────────────────────────────────────────────────────────────

Then('the book detail page is displayed', async ({ bookDetailPage }) => {
  await expect(bookDetailPage.backToBookStoreButton).toBeVisible({ timeout: 30000 });
  await expect(bookDetailPage.isbnLabel).toBeVisible({ timeout: 10000 });
  await expect(bookDetailPage.authorLabel).toBeVisible({ timeout: 10000 });
});

Then('all book detail field labels are visible', async ({ bookDetailPage }) => {
  const labels = [
    bookDetailPage.isbnLabel,
    bookDetailPage.titleLabel,
    bookDetailPage.subTitleLabel,
    bookDetailPage.authorLabel,
    bookDetailPage.publisherLabel,
    bookDetailPage.totalPagesLabel,
    bookDetailPage.descriptionLabel,
    bookDetailPage.websiteLabel,
  ];
  for (const label of labels) {
    await expect(label).toBeVisible({ timeout: 10000 });
  }
});

Then('the book title shown is {string}', async ({ bookDetailPage }, title) => {
  await expect(bookDetailPage.getValueText(title)).toBeVisible({ timeout: 10000 });
});

Then('the book author shown is {string}', async ({ bookDetailPage }, author) => {
  await expect(bookDetailPage.getValueText(author)).toBeVisible({ timeout: 10000 });
});

Then('the book publisher shown is {string}', async ({ bookDetailPage }, publisher) => {
  await expect(bookDetailPage.getValueText(publisher)).toBeVisible({ timeout: 10000 });
});

Then('the {string} button is visible', async ({ bookDetailPage }, buttonName) => {
  await expect(bookDetailPage.page.getByRole('button', { name: buttonName })).toBeVisible({ timeout: 10000 });
});

Then('I am returned to the Books page', async ({ bookDetailPage }) => {
  await expect(bookDetailPage.page.getByPlaceholder('Type to search')).toBeVisible({ timeout: 10000 });
});
