## Install & Run (minimal)

Prereqs:
- Node.js + npm
- Rust toolchain (`rustup`) for Tauri desktop builds
- Firebase `.env` in repo root with your keys:
  - `REACT_APP_FIREBASE_API_KEY`, `REACT_APP_FIREBASE_AUTH_DOMAIN`, `REACT_APP_FIREBASE_PROJECT_ID`, `REACT_APP_FIREBASE_STORAGE_BUCKET`, `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`, `REACT_APP_FIREBASE_APP_ID`, `REACT_APP_FIREBASE_MEASUREMENT_ID`

Setup:
- `npm install`

Web dev:
- `npm start` (http://localhost:3000)

Desktop dev (Tauri):
- `npm run tauri:dev`

Build web:
- `npm run build`

Build desktop:
- `npm run tauri:build`

Mobile prep (Capacitor):
- `npm run build && npm run cap:sync`
- Then add/open platforms: `npm run cap:add:ios` or `npm run cap:add:android` (opens Xcode/Android Studio)


=================++
cp .env.example .env (or create .env manually with your REACT_APP_FIREBASE_* values)

npm install

npm run prepare:desktop-auth (generates public/desktop-auth.html from your env vars; automatically reruns before other builds, but it’s good to run once right after installing)

npm run build (CRA web build; this also regenerates the desktop auth page via the prebuild hook)

npm run tauri:build (desktop shell; pretauri:build regenerates the desktop auth page beforehand)

firebase deploy


======================
Windows OS EXE
Recommend building on Windows (or GitHub Actions) with:
Node+npm
Rust (rustup target add x86_64-pc-windows-msvc)
Visual Studio Build Tools (Desktop C++)
WebView2 runtime (users need it; installer can bootstrap it)
  npm install
  npm run prepare:desktop-auth
  CI=false npm run build
  CI=false npm run tauri:build

=====================
MaxOS DMG
  npm install
  npm run prepare:desktop-auth
  CI=false npm run build           # until lint warnings are fixed
  CI=false npm run tauri:build