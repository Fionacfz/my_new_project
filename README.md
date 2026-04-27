# Test Automation Suite

Automated test suite covering the [DemoQA Book Store](https://demoqa.com/books) web UI and the [Restful Booker](https://restful-booker.herokuapp.com) REST API.

## Framework

### Web UI (Task 1)

| Tool | Purpose |
|------|---------|
| [Playwright](https://playwright.dev) | Browser automation |
| [playwright-bdd](https://vitalets.github.io/playwright-bdd) | Gherkin/BDD layer on top of Playwright |
| Node.js (ESM) | Runtime |

**Why Playwright + BDD?**
Playwright provides fast, reliable cross-browser automation with built-in retry logic and tracing. The BDD layer (Gherkin feature files) makes test intent readable to non-engineers, which supports collaboration and sign-off in a delivery pipeline.

### REST API (Task 2)

| Tool | Purpose |
|------|---------|
| [Postman](https://www.postman.com) | Collection authoring and manual execution |
| [Newman](https://github.com/postmanlabs/newman) | CLI runner for CI/CD integration |
| [newman-reporter-htmlextra](https://github.com/DannyDainton/newman-reporter-htmlextra) | Rich HTML report generation |

## Design Patterns

### Web UI
- **Page Object Model** — each page has its own class (`BooksPage`, `BookDetailPage`) encapsulating locators and actions. Tests never reach into the DOM directly.
- **Playwright Fixtures** — page objects are injected via `test.extend`, keeping step definitions clean and test-scoped.
- **Data-driven scenarios** — Scenario Outlines with Examples tables keep test data separate from test logic and easy to extend.
- **Tag-based suite segmentation** — `@sanity` for fast smoke checks, `@regression` for the full suite. Run subsets with `--grep @sanity`.

### REST API
- **`[Setup]` pattern** — each test that needs specific data creates it via a preceding `[Setup]` request, stores the ID in an environment variable, and cleans up via `pm.sendRequest` DELETE after assertion. No test depends on pre-existing data.
- **Collection-level auto-auth** — a pre-request script fetches a token once and caches it in the environment variable `token`, so individual requests never need to manage auth themselves.
- **Chained flow** — the `Chained Flow` folder explicitly threads `token` and `bookingId` through all 9 steps (Auth → Create → GET → PUT → GET → PATCH → GET → DELETE → GET) to demonstrate end-to-end data flow.
- **Data-driven iteration** — the `CreateBooking — Data Driven` folder uses Newman's `-d` flag with `create-booking-testdata.json` (8 rows) to run the same request template across positive, boundary, and edge-case payloads.
- **Known API bugs documented** — where the API deviates from REST conventions (e.g. DELETE returns 201, missing-field validation returns 500 instead of 400), tests assert the actual behaviour and annotate it with `(known issue: should be X)` so failures are explicit rather than silent.

## Project Structure

```
web-ui/
  features/               # Gherkin feature files (source of truth for test coverage)
  tests/
    pages/                # Page Object Model classes
    step-definitions/     # Cucumber step implementations
    fixtures.js           # Playwright fixture wiring
    global-setup.js       # One-time auth state setup
api/
  postman/
    restful-booker.collection.json   # Full Postman collection (all 7 endpoints)
    restful-booker.environment.json  # Environment variables (baseUrl, token, testBookingId)
    data/
      create-booking-testdata.json   # 8-row data file for data-driven CreateBooking run
    results/                         # Newman HTML and JUnit reports (gitignored — generated on each run)
    part-b-ai-generated.md           # Part B: raw AI output + annotated corrections
playwright.config.js
azure-pipelines.yml       # CI/CD pipeline definition
.env                      # Local environment variables (gitignored)
```

## Running Locally

**Prerequisites:** Node.js 20+

```bash
npm ci
```

### Web UI tests

```bash
# Install all Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install --with-deps

# Generate BDD glue code (required before first run and after feature changes)
npx bddgen

# Run all tests on all browsers (Chromium, Firefox, WebKit)
# Runs up to 5 workers in parallel locally (1 in CI)
npx playwright test

# Run on a specific browser only
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run only sanity tests (all browsers)
npx playwright test --grep @sanity

# Run only sanity tests on a specific browser
npx playwright test --grep @sanity --project=chromium

# View the HTML report after a run (browser is shown in the report per test)
npx playwright show-report
```

#### Optional: run as a logged-in user

Fill in your credentials in the `.env` file at the project root:

```
TEST_USERNAME=your_username
TEST_PASSWORD=your_password
```

Playwright loads `.env` automatically. Auth state is saved to `web-ui/tests/.auth/` and reused across tests (gitignored).

### API tests

Newman is included in `node_modules` — no separate install needed after `npm ci`.

```bash
# Full suite — all 7 endpoints, JUnit + HTML report
npm run test:api

# Full suite — HTML report only (richer output)
npm run test:api:html

# Data-driven CreateBooking — 8 rows from create-booking-testdata.json
npm run test:api:data

# Chained Flow only — end-to-end booking lifecycle
npm run test:api:chained
```

Reports are written to `api/postman/results/` (gitignored — generated on each run).

```bash
# Open report in browser after each run
npm run report:api          # after test:api or test:api:html
npm run report:api:data     # after test:api:data
npm run report:api:chained  # after test:api:chained
```

#### Running in Postman GUI (optional)

1. Open Postman and click **Import**
2. Import `api/postman/restful-booker.collection.json`
3. Import `api/postman/restful-booker.environment.json`
4. Select the **Restful Booker - Stage** environment from the environment dropdown
5. Run individual requests or use the **Collection Runner** to run the full suite

## CI/CD — Azure Pipelines

The pipeline is defined in [azure-pipelines.yml](azure-pipelines.yml). It triggers on pushes and PRs to `main` and `develop`.

**Pipeline steps:**
1. Install Node.js and dependencies
2. Install Playwright Chromium browser with OS dependencies
3. Generate BDD glue code
4. Run tests in headless mode
5. Publish JUnit results to the Azure Test Plans tab
6. Publish the Playwright HTML report as a pipeline artifact

**Pipeline variables** (set in Azure DevOps Library or variable groups):

| Variable | Required | Description |
|----------|----------|-------------|
| `BASE_URL` | No | Override base URL (default: `https://demoqa.com/books`) |
| `TEST_USERNAME` | No | Username for authenticated test runs |
| `TEST_PASSWORD` | No | Password for authenticated test runs |

## Test Coverage

### Web UI

| ID | Scenario | Tags |
|----|----------|------|
| BS-001 | Books page loads with correct structure (table, columns, pagination) | `@sanity` `@regression` |
| BS-002 | Search filters results, handles no-match, and clears correctly | `@regression` |
| BS-003 | Search by keyword returns correct book (data-driven, 3 examples) | `@regression` |
| BS-004 | Clicking a book navigates to its detail page, verifies all field labels and publisher, and navigates back (data-driven, 3 examples) | `@sanity` `@regression` |

> **Scope note:** Login and the Profile page (add/remove book from collection) are excluded from this suite. Those flows require a registered account, and User Registration is explicitly out of scope per the task requirements.

### REST API

All 7 Restful Booker endpoints are covered across the following test groups:

| Folder | Endpoint | Tests |
|--------|----------|-------|
| Health | `GET /ping` | 1 positive |
| Auth | `POST /auth` | 1 positive, 5 negative (wrong password, wrong user, missing field, empty body, SQL injection) |
| GetBookingIds | `GET /booking` | 4 (all IDs, filter by name, no-match, date range filter) |
| GetBooking | `GET /booking/:id` | 4 (fields + values, non-existent numeric ID, non-numeric ID, XML response) |
| CreateBooking | `POST /booking` | 7 (valid, retrievable, optional field, missing fields, empty body, negative price, invalid date) |
| UpdateBooking (PUT) | `PUT /booking/:id` | 4 (valid update, no token, invalid token, missing required field) |
| PartialUpdateBooking (PATCH) | `PATCH /booking/:id` | 6 (partial update, no token, invalid token, empty body no-op, wrong type, checkout before checkin) |
| DeleteBooking | `DELETE /booking/:id` | 5 (valid delete + 404 verify, no token, invalid token, already deleted, non-existent ID) |
| CreateBooking — Data Driven | `POST /booking` | 8 rows via `-d` flag (standard, no additional needs, negative price, zero price, large price, special chars, same dates, invalid date) |
| Chained Flow | All write endpoints | 9-step end-to-end lifecycle (Auth → Create → GET → PUT → GET → PATCH → GET → DELETE → GET) |

## AI Assistance

Claude (Anthropic) was used to assist with:
- Scaffolding the initial Page Object Model class structure
- Drafting the `global-setup.js` auth pattern
- Generating the Azure Pipelines YAML

**Validation approach:**
- Every generated code block was reviewed line-by-line before being kept. Locators were verified against the live site using Playwright's `--debug` mode and the browser inspector.
- The `waitForURL` regex patterns and `waitFor` timeout values were adjusted after observing actual navigation behaviour on the site (demoqa.com is slow and has ad overlays).
- All scenarios were run against the live site and passed before being committed. Failure output (screenshot + trace) was inspected for at least one intentionally broken test to confirm the reporting pipeline works end-to-end.
- Step definitions that Claude drafted with overly broad selectors (e.g. `getByText` without `exact: true`) were tightened to prevent false positives on partial matches.

### Part B — AI-Generated Endpoint (API)

Claude was used to generate Postman tests for the `GET /booking/:id` endpoint from scratch. The raw output and a full annotation of the 8 corrections and improvements made to it are documented in [api/postman/part-b-ai-generated.md](api/postman/part-b-ai-generated.md).

**Summary of corrections made to the AI output:**

| # | Issue in AI output | Fix applied |
|---|---|---|
| 1 | Hardcoded booking ID `1` (fragile, may not exist) | `[Setup]` request creates a booking and stores `{{testBookingId}}` dynamically |
| 2 | Hardcoded base URL | Replaced with `{{baseUrl}}` variable |
| 3 | Only 3 of 6 fields checked, no value assertions | `have.all.keys` for all fields + value comparison against setup data |
| 4 | No test data cleanup | `pm.sendRequest` DELETE cleans up after each test |
| 5 | Missing `Accept: application/json` header | Added to all GET requests — without it, JSON parsing can silently fail |
| 6 | Non-existent ID `99999` could actually exist | Changed to `999999999` |
| 7 | No string ID edge case tested | Added `RB-G-003` for `/booking/notanid` |
| 8 | No XML content negotiation test | Added `RB-G-004` with `Accept: application/xml` |
