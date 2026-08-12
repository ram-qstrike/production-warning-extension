"use strict";

const STORAGE_KEY = "productionWarningLastShown";

chrome.runtime.onMessage.addListener(function (message) {
  if (message.action !== "RESET_ALL_PRODUCTION_WARNINGS") {
    return;
  }

  const productionHosts = Array.isArray(message.productionHosts)
    ? message.productionHosts
    : [];

  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      if (!tab.id || !tab.url) {
        return;
      }

      let hostname;

      try {
        hostname = new URL(tab.url).hostname;
      } catch {
        return;
      }

      const isProduction = productionHosts.some(function (host) {
        return hostname === host || hostname.endsWith("." + host);
      });

      if (!isProduction) {
        return;
      }

      chrome.scripting
        .executeScript({
          target: {
            tabId: tab.id,
          },

          func: function (key) {
            localStorage.removeItem(key);
          },

          args: [STORAGE_KEY],
        })
        .catch(function () {});
    });
  });
});
