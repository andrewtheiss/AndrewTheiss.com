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
