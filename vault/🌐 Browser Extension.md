# Browser Extension

## Overview

Chrome extension for one-click URL shortening from the toolbar. Uses Manifest V3.

## Files

- `extension/manifest.json` — Extension manifest
- `extension/popup.html` — Popup UI
- `extension/popup.js` — Popup logic
- `extension/icon16.png` / `icon48.png` / `icon128.png` — Icons

## How It Works

1. User clicks the clikurl extension icon in the toolbar
2. Extension reads the current tab's URL: `chrome.tabs.query({ active: true, currentWindow: true })`
3. Sends URL to the clikurl API: `POST https://clikurl.vercel.app/api/shorten`
4. Displays the shortened URL in the popup with a copy button

## Development

- The extension targets the production API (clikurl.vercel.app)
- For local testing, update the `API_URL` in `popup.js` to `http://localhost:3001`
- Load unpacked extension in Chrome via `chrome://extensions/`

## Publishing

- Not yet published to Chrome Web Store
- Requires: store listing, screenshots, privacy policy
- The extension is minimal (reads tab URL, sends to API, displays result)
- No permissions beyond `activeTab`
