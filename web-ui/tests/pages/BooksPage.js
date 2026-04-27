// @ts-check

export const BOOKS_URL = '/books';

export class BooksPage {
  constructor(/** @type {import('@playwright/test').Page} */ page) {
    this.page = page;

    // ── Search ────────────────────────────────────────────────────────────────
    this.searchInput = page.getByPlaceholder('Type to search');

    // ── Books table ───────────────────────────────────────────────────────────
    this.booksTable = page.getByRole('table');
    this.imageColumnHeader = page.getByRole('columnheader', { name: 'Image' });
    this.titleColumnHeader = page.getByRole('columnheader', { name: 'Title' });
    this.authorColumnHeader = page.getByRole('columnheader', { name: 'Author' });
    this.publisherColumnHeader = page.getByRole('columnheader', { name: 'Publisher' });
    this.bookRows = page.locator('tbody tr');

    // ── Pagination ─────────────────────────────────────────────────────────────
    this.paginationInfo = page.getByText(/Page \d+ of \d+/);
  }

  async navigate() {
    await this.page.goto(BOOKS_URL, { waitUntil: 'commit' });
    await this.searchInput.waitFor({ state: 'visible', timeout: 60000 });
  }

  async searchForBook(term) {
    await this.searchInput.fill(term);
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  async clickBookTitle(title) {
    await this.page.getByRole('link', { name: title }).click();
    await this.page.waitForURL(/\/books\?search=/, { timeout: 30000 });
  }

  getColumnHeader(name) {
    return this.page.getByRole('columnheader', { name });
  }
}
