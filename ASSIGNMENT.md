# QA automation assignment: Kit Desk

Thank you for taking the time to do this exercise. It reflects the day-to-day work of the role. You take an application that has no tests. You build an end-to-end test suite that the team can trust and extend.

## The situation

- The `app/` folder contains a small web application called Kit Desk. It is an equipment loan desk with two roles. Members request and return equipment. Admins manage the catalogue, approve or reject requests, and confirm returns. The application has no tests of any kind.
- The `e2e-tests/` folder contains a Playwright setup. It has a configuration file and one test for the sign-in page. Nothing more.
- Your target is to cover the application with end-to-end tests. While you do this, apply the best practices you know, and build testing principles into the framework setup itself.

## What we ask you to do

1. Build on the existing setup in `e2e-tests/`. Keep the folder, the package, and the configuration file. Change and extend them as you see fit.
2. Write end-to-end tests that cover the application's user-facing behaviour for both roles. All of these are in scope: the sign-in, both pages, the tabs, adding and removing items, search and filters, validation, and error handling. The full rental flow from request to confirmed return is in scope too.
3. Structure the test code so that the next engineer can add a test in minutes. You decide and explain the page objects, fixtures, helpers, sign-in approach for different users, and test data strategy.
4. Add a short `NOTES.md` inside `e2e-tests/`. Write what you chose to cover first and why. Write what you decided, what you did not do, and what you would do next with more time.

You can use any editor and any AI tool. We do not look at which tool wrote the code. We look at whether you understand it and stand behind it. If you used AI tools, say so in `NOTES.md`, and say what you reviewed or changed by hand.

## Rules

- Do not change the application in `app/`, with one exception: you can add `data-testid` attributes when no accessible role or name identifies an element. If you do this, list the additions and the reason in `NOTES.md`.
- Do not add other test frameworks. Playwright Test is the runner.
- Keep the tests runnable with the commands below. If you change a command, update `e2e-tests/README.md`.

## How to run

The application needs Node.js 22 or later.

```bash
cd app
npm install
npm run dev
```

The application listens on `http://localhost:3000`.

In a second terminal:

```bash
cd e2e-tests
npm install
npx playwright install chromium
npm test
```

The Playwright configuration starts the application for you if it is not running. To see the tests run in a browser, use `npm run test:headed`. To open the interactive runner, use `npm run test:ui`.

## Useful facts about the application

- Sign-in needs only a name and a role. There are no passwords. The same name with the same role is the same user every time.
- Every API call has a random delay between 200 ms and 1200 ms. This is intentional.
- The application keeps its data in memory. Restarting the server restores the initial data.
- The application exposes `POST /api/test/reset` to restore the initial data. It accepts `?seed=default`, `?seed=empty`, or `?seed=large`. A reset also removes users that signed in after the last reset. Think about when it is safe to call it.
- Every API call accepts the header `x-test-delay: <milliseconds>` to replace the random delay for that one call.
- Every API call accepts the header `x-user-id: <user id>` to act as a user without a session cookie. The user id comes from the sign-in response.
- The API returns JSON errors in the shape `{ "error": string, "code": string, "fields"?: object }`.
- The application does not push updates between sessions. When one user changes something, another user sees it after the page fetches again.

Explore the application in a browser and in the network tab before you write tests. Sign in as a member in one browser and as an admin in another. The behaviour you see is the specification.

## Time and delivery

This is a take-home exercise. Plan for two hours maximum.

We do not expect a complete test setup or complete coverage in two hours. Decide what is most important to cover first. Everything you deliver must be at production quality, at a level you are happy to show us. Write the rest down in `NOTES.md`.

Send us the result as a Git repository link or a zip file. Include `e2e-tests/` with your changes. You do not need to include `node_modules` or test reports.

If a step in this document does not work on your machine, tell us. We would rather fix the setup than have you lose time on it.
