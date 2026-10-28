# Notes

## What I covered first

I prioritised the complete rental lifecycle because it is the application's core business journey: request, approval, return request, and confirmed return. The test checks rental states and catalogue availability across both roles.

Additional tests cover UI sign-in for both roles, admin item creation/removal, duplicate-name validation, member restrictions—including API rejection with 403—and catalogue recovery through Try again.

## Key decisions

- **Page objects:** Reusable locators and interactions stay in `support/pages`; tests describe journeys and expected behaviour.
- **Authentication:** Dedicated tests cover UI sign-in. Other tests use API sign-in to avoid repetition.
- **Isolation:** State-changing tests reset the default seed before signing in, because reset removes users. One worker prevents conflicting resets of the shared store.
- **Reliability:** Unique item names avoid seed collisions. Search waits for the debounced response; assertions use automatic waiting rather than fixed sleeps. CI starts the production server, so the Playwright web server sets `ENABLE_TEST_ENDPOINTS=true`; without it, `POST /api/test/reset` returns 404.
- **Diagnostics:** Failure traces and screenshots are retained. Retries are disabled so intermittent failures remain visible.

## Locators

Accessible roles and names identify controls and navigation links. Existing test IDs identify repeated elements such as item cards and rental rows. No application test IDs were added.

## Deferred work and next priorities

Within the two-hour scope, I deferred:

1. Request rejection and sign-in/add-item validation boundaries.
2. Category filters, empty catalogue, and no-results searches.
3. Separate member/admin browser contexts to verify changes after refetching.
4. Shared authentication fixtures and additional browser coverage.

## AI assistance

Cursor helped draft the tests, page objects, and initial notes. I reviewed the locators, reset-before-sign-in order, search synchronisation, and rental/catalogue status assertions and documentation.