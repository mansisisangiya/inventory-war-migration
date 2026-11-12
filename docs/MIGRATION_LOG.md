# Migration log

Every issue hit while building the Angular 11 baseline and upgrading it to Angular 17, in the order it happened.
Entries feed the summary in `PLAYBOOK.md` (written at the end).

**Format of each entry:** Symptom → Cause → Fix → Automatic or manual → Effort → Note for real apps.

---

## v11 baseline (tag `v11-baseline`)

**Stack:** Angular 11.2.14, Angular CLI 11.2.19, Angular Material 11.2, TypeScript 4.1, RxJS 6.6, TSLint 6.1,
Protractor 7, Karma 6.1 · Node 14.21.3 (x64 under Rosetta), npm 6.14 · Spring Boot 2.7.18, Java 17.
**Machine:** Apple Silicon Mac, Chrome 157.

### [v11] Node 14 has no Apple Silicon build
- **Symptom:** Angular 11 needs Node 10/12/14, but those versions have no native `darwin-arm64` download; only Node 16+ does.
- **Cause:** The Node versions Angular 11 supports predate Apple Silicon.
- **Fix:** Install the x64 build of Node 14 and run it through Rosetta:
  `arch -x86_64 zsh -c 'source $(brew --prefix nvm)/nvm.sh && nvm install 14'`. nvm then switches between it and native Node 16/18.
- **Automatic or manual:** Manual.
- **Effort:** 15 min.
- **Note for real apps:** Only affects developers on Apple Silicon. Linux x64 CI servers are fine.
  Everything on Node 14 under Rosetta runs noticeably slower (builds, tests, e2e).

### [v11] `~/.npmrc` `prefix=` setting conflicts with nvm
- **Symptom:** `nvm use 14` refuses to switch: "has a `globalconfig` and/or a `prefix` setting, which are incompatible with nvm".
- **Cause:** A custom global-install `prefix` in the user's `~/.npmrc`.
- **Fix:** Remove the `prefix=` line (or use `nvm use --delete-prefix <version>` every time).
- **Automatic or manual:** Manual.
- **Effort:** 5 min.
- **Note for real apps:** Check developer machines before switching Node versions per upgrade step.

### [v11] `npx -y` and `ng add … --skip-confirmation` not supported by the old toolchain
- **Symptom:** `npx -y -p @angular/cli@11 …` gave "command not found: cli"; `ng add @angular/material@11 --skip-confirmation`
  installed the package but the setup step failed with "Unknown option: '--skip-confirmation'".
- **Cause:** npm 6 has no `-y` flag for npx; CLI 11 doesn't accept that `ng add` option.
- **Fix:** `npx -p @angular/cli@11 ng new …`, and run the Material setup directly:
  `ng g @angular/material:ng-add --theme=indigo-pink --typography=true --animations=true`.
- **Automatic or manual:** Manual.
- **Effort:** 5 min.
- **Note for real apps:** Commands in current docs often assume newer npm/CLI versions. Check the docs for the version in use.

### [v11] TSLint is already deprecated
- **Symptom:** `ng lint` passes but prints "TSLint's support is discontinued and we're deprecating its support in Angular CLI".
- **Cause:** TSLint was abandoned upstream; Angular moved to ESLint (`@angular-eslint`).
- **Fix:** None at v11. Planned for the v12 step: `ng add @angular-eslint/schematics` and convert the config.
- **Automatic or manual:** Not applicable yet.
- **Effort:** 0.
- **Note for real apps:** Expect lint rule differences after the conversion; budget time for new lint errors.

### [v11] Protractor cannot download a ChromeDriver for current Chrome
- **Symptom:** `ng e2e` crashes before running any test:
  `curl … https://chromedriver.storage.googleapis.com/` → `Error: read ECONNRESET`.
- **Cause:** Protractor's `webdriver-manager update` uses the old ChromeDriver download site, which stopped at Chrome 114.
  Drivers for Chrome 115+ are published through "Chrome for Testing".
- **Fix:**
  1. Download a matching driver (needs Node 18):
     `npx @puppeteer/browsers install chromedriver@<exact Chrome version> --path frontend/.e2e-drivers`
  2. Point Protractor at it: `chromeDriver` in `e2e/protractor.conf.js` (auto-detected from `.e2e-drivers`, or `CHROMEDRIVER_PATH`).
  3. Skip the broken download: `ng e2e --webdriver-update=false` (now the `npm run e2e` script).
- **Automatic or manual:** Manual.
- **Effort:** 30 min.
- **Note for real apps:** Any project still on Protractor has this problem on any machine with a current Chrome, including CI.
  Strong reason to replace Protractor early (planned at the v12 step).

### [v11] Protractor waits for in-zone timers
- **Symptom:** E2E specs stalled after the "Saved" message appeared.
- **Cause:** Protractor waits until Angular is "stable" (no pending tasks in Angular's zone) before every command.
  The message's 3-second `setTimeout` ran inside the zone, so each message blocked the tests.
- **Fix:** Run the timer outside Angular's zone in `SavedMessageService`:
  `zone.runOutsideAngular(() => setTimeout(() => zone.run(() => ref.destroy()), ms))`.
- **Automatic or manual:** Manual.
- **Effort:** 20 min.
- **Note for real apps:** Search for `setTimeout`, `setInterval` and polling (`interval(`, `timer(`) in components and services
  if their Protractor suites hang or time out.

### [v11] Protractor under Rosetta is very slow, so short-lived UI can't be checked
- **Symptom:** The add/edit specs failed with "Wait timed out" although the app had saved the item correctly.
- **Cause:** Each Protractor command can take several seconds under Rosetta, longer than the 3-second
  "Saved" message stays on screen.
- **Fix:** Assert on lasting results (the saved row in the table) instead of the message. Raised the per-spec Jasmine
  timeout to 120 s and the script timeout to 30 s.
- **Automatic or manual:** Manual.
- **Effort:** 45 min (including debugging in a browser).
- **Note for real apps:** Flaky e2e suites can be timing problems, not bugs. Check the data before assuming the app is broken.

### [v11] Karma opens a visible Chrome window by default
- **Symptom:** `ng test` opens Chrome and keeps watching files, which doesn't suit scripted runs.
- **Cause:** The generated `karma.conf.js` uses `browsers: ['Chrome']` and `singleRun: false`.
- **Fix:** Added `npm run test:ci` → `ng test --watch=false --browsers=ChromeHeadless`.
- **Automatic or manual:** Manual.
- **Effort:** 5 min.
- **Note for real apps:** CI needs headless Chrome installed on the build agent.

### [v11] App scope reduced to the minimum
- **Decision:** The first version had search, sorting, paging, delete, an HTTP interceptor and a route guard. It was cut back
  to list/add/edit with each deprecated feature used once, so the upgrade steps are easy to follow.
- **Effect:** Fewer files to change per step; e2e run time dropped from ≈ 3½ min (5 specs) to ≈ 40 s (2 specs).

### [v11] Baseline result
| Check | Command | Result |
|---|---|---|
| Production build | `npx ng build --prod` | ✅ (initial bundle ≈ 552 kB) |
| Lint | `npx ng lint` | ✅ (TSLint deprecation notice) |
| Unit tests | `npm run test:ci` | ✅ 4/4 |
| E2E | `npm run e2e` (backend running) | ✅ 2/2 in ≈ 40 s |
| Backend tests | `mvn test` | ✅ 3/3 |

---

## v11 WAR (tag `v11-war`)

**Goal:** one `inventory.war` that contains the Angular app and the Spring Boot backend, like the legacy apps.

### [v11-war] How the WAR is built (what changed)
| File | Change | Why |
|---|---|---|
| `frontend/angular.json` | `outputPath` → `../backend/src/main/resources/static` | Angular output lands where Spring Boot serves static files |
| `frontend/package.json` | New script `build:war` = `ng build --prod --base-href /inventory/` | The app runs under `/inventory/`, so asset and API URLs need that base |
| `backend/pom.xml` | `frontend-maven-plugin`: install Node 14 → `npm ci` → `npm run build:war` (phase `generate-resources`) | `mvn package` builds frontend + backend in one go |
| `backend/.../application.properties` | `server.servlet.context-path=/inventory` | `java -jar` uses the same URL as Tomcat, where the path comes from the file name `inventory.war` |
| `frontend/proxy.conf.json` | `pathRewrite` `/api` → `/inventory/api` | See next entry |
| `.gitignore` | `backend/src/main/resources/static/`, `backend/.frontend-tools/` | Build output and downloaded Node are not committed |

Already in place from the baseline: `<packaging>war</packaging>`, `spring-boot-starter-tomcat` as `provided`,
`ServletInitializer` (entry point on external Tomcat) and `SpaForwardingController` (reload on `/items/2/edit` works).

### [v11-war] Context path broke the dev-server proxy
- **Symptom:** After adding `server.servlet.context-path=/inventory`, `ng serve` could no longer reach the API (`/api/items` → 404).
- **Cause:** The proxy forwarded `/api/...` to `localhost:8080/api/...`, but the backend now lives under `/inventory`.
- **Fix:** `"pathRewrite": { "^/api": "/inventory/api" }` in `frontend/proxy.conf.json`.
- **Automatic or manual:** Manual.
- **Effort:** 10 min.
- **Note for real apps:** Check every proxy config and hard-coded URL when a context path is involved.
  Using relative API URLs (`api/items`, not `/api/items`) is what let the built app work under `/inventory/` without code changes.

### [v11-war] frontend-maven-plugin handled Apple Silicon by itself
- **Symptom:** None. The expected failure (no Apple Silicon build of Node 14 to download) did not happen.
- **Cause:** `frontend-maven-plugin` 1.15.1 downloads the x64 build (`node-v14.21.3-darwin-x64`) on Apple Silicon for old Node versions.
- **Fix:** None needed.
- **Automatic or manual:** Automatic.
- **Effort:** 0.
- **Note for real apps:** Pin the Node and npm versions in the pom (`frontend.node.version`, `frontend.npm.version`) and
  change them at each upgrade step together with `.nvmrc` / nvm.

### [v11-war] Maven build is slow under Rosetta
- **Symptom:** `mvn clean package` takes ≈ 6½ min.
- **Cause:** `npm ci` (≈ 2¾ min, 1,467 packages) and `ng build --prod` (≈ 2½ min) on Node 14 x64 under Rosetta.
- **Fix:** For backend-only work, skip the frontend build: `mvn spring-boot:run -Dskip.installnodenpm -Dskip.npm`
  (backend up in ≈ 6 s instead of minutes).
- **Automatic or manual:** Manual.
- **Effort:** 0 (awareness only).
- **Note for real apps:** Linux x64 CI will be faster. Newer Angular versions on native Node should also build faster.

### [v11-war] External Tomcat sends HTML as ISO-8859-1, not UTF-8
- **Symptom:** `java -jar` serves `index.html` as `text/html;charset=UTF-8`; Tomcat 9 serves it as `text/html;charset=ISO-8859-1`,
  and the browser reads the page as `windows-1252` (the HTTP header wins over `<meta charset="utf-8">`).
- **Cause:** Embedded Tomcat is configured by Spring Boot with UTF-8; standalone Tomcat uses its own default.
- **Fix:** Not changed. It is harmless here: the only non-English character (the ✓ in the "Saved" message) is stored as `\u2713`
  in the production bundle and displays correctly.
- **Automatic or manual:** Not applicable.
- **Effort:** 15 min (investigation).
- **Note for real apps:** Behaviour can differ between `java -jar` and the real Tomcat servers. Test the WAR on a Tomcat like
  production, especially pages with non-English text.

### [v11-war] Background CPU load makes headless e2e extremely slow
- **Symptom:** E2E specs that normally take ≈ 25 s timed out; headless Chrome needed ≈ 58 s just to parse the page.
  The dev server was equally slow, so it was not the WAR.
- **Cause:** Other processes on the Mac (a local dev server with auto-reload at ≈ 60 % CPU, Spotlight indexing) starved
  the background Chrome.
- **Fix:** Stop heavy background processes before running e2e. Afterwards: 2/2 specs in ≈ 24 s.
- **Automatic or manual:** Manual.
- **Effort:** 1 h (most of it spent ruling out the WAR, fonts and network).
- **Note for real apps:** When e2e suddenly gets slow, check machine load before debugging the app.

### [v11-war] Result
| Check | How | Result |
|---|---|---|
| Build | `cd backend && mvn clean package` | ✅ `target/inventory.war`, 19 MB, `<base href="/inventory/">` |
| Run with `java -jar` | `java -jar target/inventory.war` → http://localhost:8080/inventory/ | ✅ pages, reload on `/items/2/edit`, API, 404 |
| E2E on `java -jar` | `npm run e2e:war` | ✅ 2/2 in ≈ 23 s |
| Run on external Tomcat 9.0.123 | copy WAR to `webapps/` → http://localhost:8080/inventory/ | ✅ deployed via `ServletInitializer` in ≈ 1.4 s; same checks pass |
| E2E on Tomcat | `npm run e2e:war` | ✅ 2/2 in ≈ 24 s |

## v12 … v17
_Not started._
