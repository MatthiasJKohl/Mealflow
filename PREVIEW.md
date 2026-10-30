# MealFlow mobile preview

## Status and remaining setup

The development branch contains a reusable, Netlify-ready preview configuration. **No preview hosting site has been provisioned and no live preview URL exists yet.** Production GitHub Pages settings, files and deployment are unchanged.

The current connection can write repository files, but cannot provision a Netlify account/site or manage GitHub Pages settings. GitHub Pages supplies only one Pages site per repository; pointing it at this branch would replace production. A subdirectory of the existing Pages origin would also share localStorage with production. The available Sites workflow uses a separate managed source repository, outside the instruction to work only in `MatthiasJKohl/Mealflow`, so it was not used.

The simplest safe completion is to connect a **new preview-only Netlify site** to this same repository. It gives the Android phone a separate HTTPS origin and leaves GitHub Pages untouched. No new repository, backend, database, app dependency or secret is required.

## One-time hosting setup

1. Sign into Netlify and choose **Add new project → Import an existing project → GitHub** (dashboard wording may vary). Grant access only to `MatthiasJKohl/Mealflow`.
2. Select that repository. Choose **`fix/weekly-navigation-and-diet-v6` as the deploy/production branch for this new Netlify project**. This dashboard label refers only to the new preview site, not MealFlow's real GitHub Pages production deployment. Do not select `main`.
3. Use build command `node scripts/build-preview.cjs` and publish directory `preview-dist`. The root `netlify.toml` supplies these values and Node 22. No base directory is needed. Netlify supplies `BRANCH` and `COMMIT_REF`.
4. Deploy this new Netlify project. Copy the actual assigned `https://<site-name>.netlify.app` URL from its dashboard; the name is not reserved by this configuration. Open it on Android. The page must show **MEALFLOW PREVIEW**, the selected branch and commit SHA. `/preview.json` identifies the built revision.
5. Keep the default `netlify.app` hostname. The generated bootstrap intentionally permits only HTTPS `*.netlify.app` hosts (plus localhost for local tests). It blocks the production `matthiasjkohl.github.io` hostname before loading app scripts, touching app storage or registering an app service worker. A future custom preview domain requires an explicit bootstrap allowlist update.
6. Under Netlify's branch/deploy settings, enable branch deploys or PR Deploy Previews for future development branches. Each branch/PR can have its own HTTPS hostname. Ensure those branches contain this preview configuration; copy/cherry-pick it when branching from a main that does not have it yet. Builds of `main` and `master` are explicitly rejected.

GitHub Pages does not read `netlify.toml`. No Pages workflow, deployment branch switch, custom-domain change or GitHub Pages API mutation is part of this setup. Netlify account/site creation remains the single manual account step; repository write permission alone does not provide a hosting account credential.

## Preview isolation

- Only a fixed allowlist of app files and existing original icons is copied into `preview-dist`. No `.git`, exported backups, tests or arbitrary repository files are published. Missing assets fail the build. An unexpected output file or symlink also stops the build.
- Source `index.html`, app scripts, production manifest and service worker are not edited by the builder. The generated manifest uses **MealFlow Preview / MF Preview** and a preview-specific app ID. Install it as a separate Android PWA.
- The preview uses a separate Netlify origin, so its localStorage, app installation and service-worker scope are separate from the production GitHub Pages origin. The existing app storage keys are retained on that separate origin to support backup compatibility. Separate URL paths on the same hostname would NOT isolate localStorage; do not host this under the production hostname.
- Generated service-worker caches are `mealflow-preview-<commit SHA>`; preview activation only cleans older preview caches. The bootstrap, metadata, core app scripts and original icons are precached. Headers require HTTP revalidation; service-worker caches continue to support offline use.
- Subsequent builds at the SAME preview hostname preserve that hostname's test data. Different branch or immutable-deploy hostnames have independent data and need separate imports. Prefer a stable branch hostname for ongoing tests.
- The hosted code can be public. A backup selected through More is parsed locally in the browser; the app does not upload it to Netlify. Never commit or drag a backup into the publish directory.

## Test on Android with an exported backup

1. In the **installed production MealFlow**, open More → Export full backup. Keep the downloaded JSON as your original safety copy. Do not uninstall production or clear its site data.
2. Open the actual Netlify HTTPS preview URL in Chrome. Verify the **MEALFLOW PREVIEW** banner and that the hostname differs from production. The first visit has its own empty/default test data; it does not automatically copy your production data.
3. In preview More → Import backup, select a COPY of the exported JSON and confirm replacement of **preview data only**. Check several historical weights, verified/edited products, stock, ratings and favourites. Confirm that protected custom products intentionally retain their own nutrition values.
4. Test This week/Next week across Plan, Shop and Cook. Check Monday's three-day and Thursday's four-day cooking quantities; 21 bananas, 280 g cheese and 560 g dried mango per eligible week. Open Weight, browse backwards, switch tabs and return; it should return to the actual current Monday–Sunday week. Edit an old reading and save today's reading separately.
5. Reopen the original production app and confirm its data has not changed. Preview changes are independent; they are not synced to production. Keep preview exports clearly labelled and do not import them into production accidentally.
6. Let the preview finish its first online load, then use Chrome → Add to Home screen / Install app. Its installed name should be **MF Preview**. After caching, close and reopen it in airplane mode. Confirm Plan, Shop, Cook and Weight load, and local edits persist.
7. For a new branch commit, wait for Netlify's successful deploy. Open the SAME stable preview URL online, close all preview tabs and the installed preview window to allow the waiting service worker to activate, then reopen. Verify the banner SHA and `/preview.json`. No data clearing or production reinstallation is required. An old SHA can remain visible until the previous worker releases its controlled windows.

## Build and verify locally

Use a complete clone of the same repository; the earlier reconstructed chat checkout lacks the original binary icons and is not a deployable source by itself.

```sh
git switch fix/weekly-navigation-and-diet-v6
node tests/v6.test.cjs
node tests/preview.test.cjs
node scripts/build-preview.cjs fix/weekly-navigation-and-diet-v6 "$(git rev-parse HEAD)"
```

For the simplest one-off alternative to Git integration, open Netlify's manual deployment/Drop page and upload **only `preview-dist`** from that complete clone. Netlify assigns a separate HTTPS URL. To reuse it, upload later preview builds to that same Netlify project. Do not upload the repository root or a backup. Never change the GitHub Pages deployment branch.

Validation performed here: 10 existing app checks and 3 new preview checks pass; preview tests cover isolated output, asset allowlisting, PWA identity, cache namespace/provenance, production-branch/output guards, missing assets, and blocking the production hostname before any app script is loaded. Test icons are explicit fixtures; original PWA icon files are unchanged in GitHub. Live HTTPS deployment, Android installation and real offline/update acceptance remain unverified until the hosting account step is completed.
