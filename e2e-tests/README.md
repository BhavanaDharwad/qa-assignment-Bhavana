# e2e-tests

Playwright end-to-end tests for the Kit Desk application in `../app`.

## Setup

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npm test              # run all tests, headless
npm run test:headed   # run with a visible browser
npm run test:ui       # open the Playwright UI
npm run report        # open the last HTML report
npm run typecheck     # type-check the test code
```

The configuration in `playwright.config.ts` starts the application in `../app` when nothing listens on port 3000. Locally that is `npm run dev`. In CI it is the production server (`npm run start`), with `ENABLE_TEST_ENDPOINTS=true` so `POST /api/test/reset` stays available. If the application is already running, the tests use it.

Set `BASE_URL` to point the tests at another address.

## Layout

```
playwright.config.ts   configuration
tests/                 test files (*.spec.ts)
```
