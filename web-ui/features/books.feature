@regression
Feature: Book Store Application - Books
  As a user
  I want to browse, search, and view details of books
  So that I can find and learn about books in the store

  Background:
    Given I am on the Books page

  @sanity
  # ── BS-001 ─────────────────────────────────────────────────────────────────
  Scenario: BS-001 Books page loads with correct structure
    Then the books table is visible
    And at least 1 book is displayed in the table
    And the "Image" column header is visible
    And the "Title" column header is visible
    And the "Author" column header is visible
    And the "Publisher" column header is visible
    And the pagination info shows "Page 1 of 1"

  # ── BS-002 ─────────────────────────────────────────────────────────────────
  Scenario: BS-002 Search filters, returns no results, and clears correctly
    When I search for "Git"
    Then the books table shows books containing "Git"
    When I search for "zzznomatch"
    Then no books are displayed in the table
    When I clear the search
    Then at least 1 book is displayed in the table

  # ── BS-003 ─────────────────────────────────────────────────────────────────
  Scenario Outline: BS-003 Search returns correct book for known titles
    When I search for "<searchTerm>"
    Then the books table shows books containing "<expectedTitle>"

    Examples:
      | searchTerm | expectedTitle                       |
      | ECMAScript | Understanding ECMAScript 6          |
      | Eloquent   | Eloquent JavaScript, Second Edition |
      | Kyle       | You Don't Know JS                   |

  @sanity
  # ── BS-004 ─────────────────────────────────────────────────────────────────
  Scenario Outline: BS-004 Clicking a book navigates to its detail page and back
    When I click on the book title "<title>"
    Then the book detail page is displayed
    And the book title shown is "<title>"
    And the book author shown is "<author>"
    And all book detail field labels are visible
    And the book publisher shown is "<publisher>"
    And the "Back To Book Store" button is visible
    When I click "Back To Book Store"
    Then I am returned to the Books page

    Examples:
      | title                               | author               | publisher       |
      | Git Pocket Guide                    | Richard E. Silverman | O'Reilly Media  |
      | Learning JavaScript Design Patterns | Addy Osmani          | O'Reilly Media  |
      | Eloquent JavaScript, Second Edition | Marijn Haverbeke     | No Starch Press |
