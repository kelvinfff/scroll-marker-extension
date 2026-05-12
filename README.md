# ScrollMarker
A minimalist Chrome extension that automatically remembers and restores your scroll position on every webpage. No configuration, no popup — just works.
## Features
- Saves scroll position per URL as you scroll
- Restores position automatically on return
- Handles dynamic/lazy-loaded content
- Works with SPAs and browser history navigation
- No permissions beyond storage — zero tracking
## Install
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select this folder
## How it works
A content script listens for scroll events (throttled) and saves the Y position to `chrome.storage.local`. On page load, it checks for a saved position and smoothly scrolls you back there, polling briefly for lazy-loaded content.
## License
MIT
