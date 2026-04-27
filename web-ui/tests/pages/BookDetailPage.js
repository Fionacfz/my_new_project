// @ts-check

export class BookDetailPage {
  constructor(/** @type {import('@playwright/test').Page} */ page) {
    this.page = page;

    // ── Page chrome ───────────────────────────────────────────────────────────
    this.pageHeading          = page.getByRole('heading', { name: 'Book Store' });
    this.backToBookStoreButton = page.getByRole('button', { name: 'Back To Book Store' });

    // ── Field labels ──────────────────────────────────────────────────────────
    this.isbnLabel        = page.getByText('ISBN:');
    this.titleLabel       = page.getByText('Title :', { exact: true });
    this.subTitleLabel    = page.getByText('Sub Title :');
    this.authorLabel      = page.getByText('Author :');
    this.publisherLabel   = page.getByText('Publisher :');
    this.totalPagesLabel  = page.getByText('Total Pages :');
    this.descriptionLabel = page.getByText('Description :');
    this.websiteLabel     = page.getByText('Website :');
  }

  async goBackToBookStore() {
    await this.backToBookStoreButton.click();
    await this.page.getByPlaceholder('Type to search').waitFor({ state: 'visible', timeout: 30000 });
  }

  getValueText(text) {
    return this.page.getByText(text, { exact: true }).first();
  }
}
