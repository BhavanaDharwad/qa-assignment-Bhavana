# Kit Desk

A small equipment loan desk with two roles. It is the target application for an end-to-end testing exercise, so it favours observable behaviour over features.

## Run

Node.js 22 or later.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The app sends you to the sign-in page.

Other commands:

```bash
npm run build && npm run start   # production build and server
npm run lint
npm run typecheck
```

## Roles

- **Member**: browse the catalogue, request an available item, return an approved item, see your own rentals.
- **Admin**: add and remove items, approve or reject requests, confirm returns, see all rentals.

Sign in with a name and a role. There are no passwords.

## Behaviour to know

- Every API call under `/api` waits a random time between 200 ms and 1200 ms. Set `DELAY_MIN_MS` and `DELAY_MAX_MS` to change the range. Send the header `x-test-delay: <ms>` to replace the delay for one call.
- Send the header `x-user-id: <id>` to call the API as a user without a session cookie.
- Data lives in memory. A restart restores the initial data. `POST /api/test/reset?seed=default|empty|large` restores it without a restart. In a production build this endpoint needs `ENABLE_TEST_ENDPOINTS=true`.
- See `.env.example` for all variables.

## Pages

- `/sign-in`: name and role.
- `/items`: the catalogue. Search, filter by category. Members request items. Admins add and remove items.
- `/rentals`: rentals with tabs. Admins see Requests, On loan, Returns, History. Members see Active and History. The tab is in the URL as `?tab=`.
