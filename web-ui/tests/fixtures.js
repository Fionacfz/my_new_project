// @ts-check
import { test as base, createBdd } from 'playwright-bdd';
import { BooksPage } from './pages/BooksPage.js';
import { BookDetailPage } from './pages/BookDetailPage.js';

export const test = base.extend({
  booksPage: async ({ page }, use) => {
    await use(new BooksPage(page));
  },
  bookDetailPage: async ({ page }, use) => {
    await use(new BookDetailPage(page));
  },
});

export const { Given, When, Then } = createBdd(test);
