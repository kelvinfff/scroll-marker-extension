(function () {
  'use strict';

  const STORAGE_KEY = 'scrollPositions';
  const MAX_ENTRIES = 500;
  const SAVE_THROTTLE_MS = 300;
  const RESTORE_POLL_INTERVAL_MS = 100;
  const RESTORE_MAX_MS = 3000;

  const url = window.location.href;

  function saveScrollY() {
    const y = window.scrollY;
    if (y === undefined || y === null) return;

    chrome.storage.local.get([STORAGE_KEY], function (result) {
      const data = result[STORAGE_KEY] || {};
      data[url] = y;

      const keys = Object.keys(data);
      if (keys.length > MAX_ENTRIES) {
        delete data[keys[0]];
      }

      chrome.storage.local.set({ [STORAGE_KEY]: data });
    });
  }

  let throttleTimer = null;
  function onScroll() {
    if (throttleTimer) return;
    throttleTimer = setTimeout(function () {
      saveScrollY();
      throttleTimer = null;
    }, SAVE_THROTTLE_MS);
  }

  function saveBeforeUnload() {
    if (throttleTimer) {
      clearTimeout(throttleTimer);
      throttleTimer = null;
    }
    saveScrollY();
  }

  function restoreScrollY() {
    if (window.location.hash && window.location.hash.length > 1) return;

    chrome.storage.local.get([STORAGE_KEY], function (result) {
      const data = result[STORAGE_KEY] || {};
      const savedY = data[url];
      if (!savedY || savedY <= 0) return;

      const startTime = Date.now();
      let lastKnownHeight = 0;

      function poll() {
        const elapsed = Date.now() - startTime;
        const currentHeight = document.documentElement.scrollHeight;
        const maxScroll = Math.max(0, currentHeight - window.innerHeight);

        if (currentHeight === lastKnownHeight && elapsed >= 500) {
          const target = Math.min(savedY, maxScroll);
          window.scrollTo({ top: target, behavior: 'smooth' });
          return;
        }

        if (elapsed >= RESTORE_MAX_MS) {
          const target = Math.min(savedY, maxScroll);
          window.scrollTo({ top: target, behavior: 'smooth' });
          return;
        }

        lastKnownHeight = currentHeight;
        setTimeout(poll, RESTORE_POLL_INTERVAL_MS);
      }

      poll();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('beforeunload', saveBeforeUnload);
  window.addEventListener('pagehide', saveBeforeUnload);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      saveBeforeUnload();
    }
  });

  if (document.readyState === 'complete') {
    restoreScrollY();
  } else {
    window.addEventListener('load', restoreScrollY);
  }
})();
