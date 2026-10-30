# MealFlow v6 review and handoff

Changes are local to `fix/weekly-navigation-and-diet-v6`. Nothing was pushed, merged, published or deployed. GitHub branch creation returned `403 Resource not accessible by integration`; further GitHub attempts were stopped at the user's request. A draft PR description is included below for manual publication.

## Changes

- Plan, Shop and Cook share a selected week, show Monday–Sunday dates including years, and mark selection with a checkmark, outline, bold text and `aria-pressed`. Cook has week and three/four-day controls. Old selected weeks reset to current on reopening; historical weeks can be opened explicitly from History.
- Weight opens at the actual current local week on startup and every tab entry. Arrows retain historical navigation; This week returns to today’s week. Today's input saves to the local date at save time. Historical editing is retained. Invalid/non-finite weights are excluded from averages; four-week change compares calendar weeks 28 days apart instead of five potentially nonconsecutive recorded weeks.
- Fixed daily foods count three bananas and 40 g cheese once. Whey is a 30 g scoop with 100 kcal / 23 g protein; creatine and water are listed. Daily snack portions use exact weekly divisions (900 g chicken, 250 g breadsticks, 150 g salami, 170 g sausage), displayed rounded. Dried mango is 80 g / 248.8 kcal daily from Monday 26 October 2026, or 560 g weekly. Its E223 and no-added-sugar information is visible.
- Supplied nutrition values replace eligible old defaults. Ingredient names remain stable to retain product links. Noodles use 433.6 kcal per 100 g dry; their other macros remain explicitly estimated. Sweetcorn uses the supplied boiled-label basis, with the frozen-weight limitation disclosed. Catalan sausage remains an explicit estimate. Cucumber uses an estimated 300 g each and combines with recipe grams.
- Unmodified default noodle and taco recipes receive 214.29 g chicken/mince and the taco receives 7.14 g seasoning. Taco has no additional cheese. Oil calories assume all applied oil as an estimate; the cooking text explains that some remains in the tray. Other recipes and genuinely customised recipes are retained.
- Product matching reuses case-insensitive names and aliases. Package rounding tolerates floating-point noise. Shopping converts known per-item units safely while retaining product pack and stock units. Snack cooking quantities match the fixed diet.
- Historical locked plans use their stored recipe and nutrition snapshots. History has View buttons. Recipes referenced by saved weeks cannot be deleted. Recipe editing registers products and returns to the current UI; apostrophes are escaped correctly.
- Backup imports validate records before replacing data and create a recovery copy first. Existing v5 backup format remains supported. Invalid JSON in saved storage stops startup rather than replacing it with defaults. Recipe import rejects non-finite quantities and missing cooking instructions.
- `mealflow-v6-1` precaches the full release, including `v6.js`. Cache-first asset loading avoids mixing releases during normal offline operation. Activation waits for existing tabs to close, and deletes only old MealFlow caches. No localStorage is cleared.

## Data protection

Existing `mealflow-v1`, `mealflow-v2`, and `mealflow-v5` keys retain their names. Weight readings, plans, saved products, verification flags, stock, ratings and favourites are not reset. The one-time `V.migrations.dietV6` marker prevents repeated default replacement. `mealflow-v6-before-migration` contains the pre-migration app state; `mealflow-v6-before-import` contains the state before the most recent explicit backup replacement. These are additional local recovery records, not a cloud backup.

Only unverified product nutrition matching shipped old values (or missing nutrition) is updated. Verified records and differing values remain unchanged, including pack sizes, prices and stock. New product saves carry `userEdited` to prevent future ambiguity. Exact historical user edits identical to an unverified shipped default cannot be distinguished in v5, which did not record edit provenance. Legacy shipped label defaults can migrate, but a matching verified saved product is protected. Custom recipes are deliberately preserved; they can therefore differ from the new default diet and should be checked during review. Old history lacking snapshots cannot have its past quantities reconstructed.

Export a backup on the installed app before any future deployment. Test a copy of it on localhost; do not clear the live app’s storage. Storage quota exhaustion and device/browser data deletion remain browser limitations. Migration takes a recovery copy before changes and does not intentionally discard existing data if that copy cannot be saved.

## Validation performed

- `node tests/v6.test.cjs`: **10 tests passed**.
- Same 10 tests passed with `TZ=Europe/London` and `TZ=America/New_York`; the default execution timezone was also tested.
- Includes fixed-food totals, whey, mango start/weekly quantity, exact weekly snack quantities, Monday/Thursday cooking, old/custom/verified product migrations, migration idempotence, preserved weights/stock/ratings, custom recipes, invalid storage and backups, historical snapshots, local Sunday/DST/year dates, tab click handlers and today's save key, shared navigation, package unit conversion, and simulated service-worker installation/cache cleanup/offline fallback.
- JavaScript syntax and `git diff --check` passed.
- `tests/browser_v6.py` provides real mobile Chromium navigation, edit, import/export and offline reload checks. **It was not run successfully**: the sandbox denied opening its localhost server; the additional-permission attempt was interrupted. Android installation and real-browser service-worker updates are still manual acceptance checks. Offline behavior is verified by simulation, not a completed browser installation test.

## Apply and test without deployment

The local checkout was reconstructed from the connected main-branch text files at source commit `26f2b5db993bed4a29f216e7c8e3aab554549f0f` because git clone was unavailable. Its local baseline commit is synthetic, and does not contain the binary icons. Use the supplied patch against a complete clone; do not push this checkout's synthetic history or replace the whole repository with it. The patch does not modify the original icons, manifest, or installation guide.

In a complete, clean clone of **MatthiasJKohl/Mealflow**:

```sh
git switch main
git switch -c fix/weekly-navigation-and-diet-v6
git apply --check /path/to/mealflow-v6.patch
git apply /path/to/mealflow-v6.patch
node tests/v6.test.cjs
TZ=Europe/London node tests/v6.test.cjs
python3 -m http.server 8000
```

Open `http://localhost:8000` in a separate browser profile. Import a copy of your backup through More. Check old weights, edited products, stock, ratings and favourites; confirm preserved product values where they intentionally override defaults. Check Next week in Plan, then Shop and Cook, and Monday/Thursday quantities. Check 21 bananas, 280 g cheese and 560 g mango in shopping. Navigate Weight backwards, leave and return, then edit an old reading. Save today's input and check its date. Export and re-import a test backup. Invalid backup files must leave the current state unchanged.

For automated Chromium checks where Python Playwright and `/usr/bin/chromium` are already available:

```sh
python3 tests/browser_v6.py
```

The optional `--fixture-icons` flag substitutes test-only image responses for this incomplete local checkout; it must not be used as evidence that original PWA icons were tested. No new runtime dependency is needed for MealFlow itself.

Wait for service-worker installation, close every tab for this localhost origin, reopen online once, then disable network and reload. Exercise Plan, Shop, Cook and Weight offline. Test the update from an older cached copy in a separate profile as well. After eventual deployment, installed Android acceptance should repeat these checks with an exported backup available; do not clear browser data to force an update.

Once review checks pass, commit/push **only the fix branch** and create a draft PR with the description below. This handoff does not authorize merging or deploying it.

## Draft PR text

Title: Fix weekly navigation and safely update MealFlow v6 diet defaults

MealFlow now shares an accessible selected week across Plan, Shop and Cook, and Weight opens to the current local Monday–Sunday week while preserving historical editing. Fixed-food totals include three bananas, one 40 g cheese serving, the corrected whey scoop and 80 g dried mango from 26 October 2026. The supplied nutrition and unchanged default recipes migrate once, preserving customised/verified products and existing user records.

The update also fixes cucumber and product pack units, floating-point package rounding, historical recipe snapshots, four-week weight comparisons, recipe editing, backup validation and full-release offline caching. No storage keys are renamed and no localStorage is cleared; recovery snapshots precede migration and backup replacement.

Validation: 10 automated tests pass in default, Europe/London and America/New_York timezones; syntax and whitespace checks pass. Service-worker behavior is simulated. Real mobile Chromium/Android offline installation and update acceptance remain outstanding because the execution sandbox blocked the browser test server. See V6-REVIEW.md for local acceptance steps, data protection details and remaining estimate limitations.

Keep this PR in draft. Do not merge or deploy.
