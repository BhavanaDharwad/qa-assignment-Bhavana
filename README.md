# QA automation assignment

Start with `ASSIGNMENT.md`. It describes the task, the rules, and how to run everything.

| Folder | Content |
| --- | --- |
| `app/` | The Kit Desk application you will test. Do not change it, except as `ASSIGNMENT.md` allows. |
| `e2e-tests/` | The Playwright setup you build on. |

Quick start:

```bash
cd app && npm install && npm run dev
```

```bash
cd e2e-tests && npm install && npx playwright install chromium && npm test
```
