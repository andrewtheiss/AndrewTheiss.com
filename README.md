# LightCycle — Web, Desktop (Tauri), Mobile (Capacitor)

This project now ships with Firebase-backed auth, a usage tracking page, and wrappers for both Tauri (desktop) and Capacitor (mobile) while keeping the existing web build.

## Firebase environment

Create a `.env` file in the project root with:

```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_MEASUREMENT_ID=...

# Optional secondary project for write-only chocolate app
REACT_APP_SECONDARY_FIREBASE_API_KEY=
REACT_APP_SECONDARY_FIREBASE_AUTH_DOMAIN=
REACT_APP_SECONDARY_FIREBASE_PROJECT_ID=
REACT_APP_SECONDARY_FIREBASE_STORAGE_BUCKET=
REACT_APP_SECONDARY_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_SECONDARY_FIREBASE_APP_ID=
REACT_APP_SECONDARY_FIREBASE_MEASUREMENT_ID=
```

## Running the app

- Web dev: `npm start` (http://localhost:3000)
- Web build: `npm run build`
- Desktop (Tauri) dev: `npm run tauri:dev` (runs CRA dev server + Tauri shell)
- Desktop build: `npm run tauri:build` (produces native bundles in `src-tauri/target`)
- Mobile scaffold: `npm run cap:sync` (after running `npm run build`, then `npx cap add ios|android` once)

## Usage tracking UI

- Route: `/usage`
- Features: log a category/value/note, list recent entries for the signed-in user, edit notes, delete entries.

## Firebase layers

- `src/components/Firebase/firebaseClient.js`: central app init using `.env` (no hardcoded keys).
- `src/components/Firebase/firebase.js`: class wrapper used by the app and session HOCs.
- `src/components/Firebase/usageService.js`: Firestore CRUD for usage entries.

## Desktop + mobile wrappers

- Tauri config: `src-tauri/tauri.conf.json`, Rust entrypoint at `src-tauri/src/main.rs`.
- Capacitor config: `capacitor.config.ts` (web output from `build` is reused).

## Auth flow

- Sign in: email/password or Google SSO via `/signin`.
- Session context now exposes `{ auth, admin, user }` for navigation and pages.

## Helpful scripts

- `npm test` — CRA test runner.
- `npm run tauri:dev` — desktop dev shell with CRA.
- `npm run cap:add:ios` / `npm run cap:add:android` — add platforms after a build.
