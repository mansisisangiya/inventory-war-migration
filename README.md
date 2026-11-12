# Inventory WAR migration (Angular 11 → 17)

A deliberately small inventory app (list, add, edit items) built the "legacy" way, with an Angular 11 frontend and
a Spring Boot backend packaged together into one WAR. It is upgraded one Angular version at a time to Angular 17, and every
breaking change is written down in [`docs/MIGRATION_LOG.md`](docs/MIGRATION_LOG.md).

The app is kept minimal on purpose: two screens, one form. Each feature that is deprecated or removed by
Angular 17 is used **exactly once** and marked in the code with a `// DEPRECATED …` comment, so it is easy to see
what each upgrade step breaks:

| Deprecated feature | Where | Breaks or changes in |
|---|---|---|
| TSLint | `frontend/tslint.json` | v12 (move to ESLint) |
| Protractor e2e | `frontend/e2e/` (2 specs) | v12 (deprecated, move to Cypress) |
| `entryComponents` | `app.module.ts` | v13 (no effect after View Engine is removed) |
| `ComponentFactoryResolver` | `saved-message/saved-message.service.ts` | v13 (deprecated) |
| RxJS `toPromise()` | `item.service.ts` | RxJS 7 / v13 (use `firstValueFrom`) |
| Untyped reactive form | `item-form/item-form.component.ts` | v14 (typed forms) |
| Pre-MDC Angular Material | `material.module.ts` | v15 (MDC migration), v17 (legacy removed) |
| Router `relativeLinkResolution` | `app-routing.module.ts` | v15 (removed) |

**Screens:** `/items` (table + "Add item") and `/items/new` · `/items/:id/edit` (one shared form).
After saving, a small "Saved" message appears for 3 seconds.

## Layout

```
backend/    Spring Boot 2.7 stub (WAR packaging, in-memory /api/items: list, get, add, update)
frontend/   Angular app
docs/       MIGRATION_LOG.md (and PLAYBOOK.md at the end)
```

## Tags

| Tag | State |
|---|---|
| `v11-baseline` | Angular 11 app, all checks green |
| `v11-war` | v11 packaged as one WAR _(next)_ |
| `v12-done` … `v17-done` | One tag per upgrade step _(planned)_ |
| `v17-war` | v17 packaged as one WAR _(planned)_ |

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| nvm | any | Switch Node per Angular version |
| Node | 14 for Angular 11–12 | On Apple Silicon, install the x64 build under Rosetta (see the migration log) |
| JDK | 17 | |
| Maven | 3.8+ | |
| Chrome | current | Unit and e2e tests |
| Tomcat | 9 | Only for testing the WAR on an external server |

## Run it (v11)

**1. Backend** (port 8080):

```bash
cd backend
mvn spring-boot:run
```

**2. Frontend dev server** (port 4200, `/api` is proxied to 8080):

```bash
cd frontend
nvm use 14
npm install
npx ng serve
```

Open http://localhost:4200.

## Checks

From `frontend/` with `nvm use 14`:

| Check | Command |
|---|---|
| Production build | `npx ng build --prod` |
| Lint (TSLint) | `npx ng lint` |
| Unit tests (headless) | `npm run test:ci` |
| E2E (needs the backend running) | `npm run e2e` |

Backend tests: `cd backend && mvn test`.

### E2E setup: fetch ChromeDriver once

Protractor's built-in driver download no longer works for Chrome 115+. Fetch a driver that matches your Chrome version
from Chrome for Testing (this needs Node 18):

```bash
cd frontend
nvm use 18
npx @puppeteer/browsers install chromedriver@<your Chrome version> --path "$PWD/.e2e-drivers"
nvm use 14
```

Find your Chrome version at `chrome://version`. The driver folder is git-ignored.
To watch the tests in a visible browser, run `E2E_HEADED=1 npm run e2e`. A full run takes under a minute.
