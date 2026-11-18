(function () {
  "use strict";

  const HOSTS_KEY = "productionHosts";
  const WARNINGS_KEY = "productionWarningRecords";
  const WARNING_SECONDS = 5;

  const hostname = window.location.hostname.toLowerCase();

  // LOAD PRODUCTION WEBSITES

  chrome.storage.local.get([HOSTS_KEY, WARNINGS_KEY], function (result) {
    const hosts = result[HOSTS_KEY] || [];

    const isProduction = hosts.some(function (host) {
      return hostname === host || hostname.endsWith("." + host);
    });

    if (!isProduction) return;

    const warnings = result[WARNINGS_KEY] || {};
    const saved = warnings[hostname];
    const today = getToday();

    if (saved && saved.date === today) {
      showBadge();
    } else {
      saveWarning(warnings);
      showModal();
    }
  });

  // GET CURRENT DATE

  function getToday() {
    const now = new Date();

    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
  }

  // SAVE WARNING

  function saveWarning(warnings) {
    const now = new Date();

    warnings[hostname] = {
      date: getToday(),
      localTime: now.toLocaleString(),
      timestamp: now.toISOString(),
      hostname: hostname,
      url: window.location.href,
    };

    chrome.storage.local.set({
      [WARNINGS_KEY]: warnings,
    });
  }

  // SHOW WARNING DIALOG

  function showModal() {
    const overlay = document.createElement("div");

    overlay.id = "production-warning-overlay";

    const modal = document.createElement("div");

    modal.id = "production-warning-modal";

    modal.innerHTML = `
      <div class="production-warning-label">
        PRODUCTION ENVIRONMENT
      </div>

      <div class="production-warning-title">
        HOLD UP
      </div>

      <div class="production-warning-subtitle">
        YOU ARE ON PRODUCTION
      </div>

      <p class="production-warning-message">
        You are currently accessing the
        <strong>LIVE PRODUCTION</strong>
        environment.
      </p>

      <p class="production-warning-danger">
        Please make sure you intended to test here.
      </p>

      <div class="production-warning-host">
        ${escapeHtml(hostname)}
      </div>

      <div class="production-warning-countdown">
        Warning disappears in
        <span id="production-warning-countdown">
          ${WARNING_SECONDS}
        </span>
        seconds
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    let seconds = WARNING_SECONDS;

    const countdown = modal.querySelector("#production-warning-countdown");

    const timer = setInterval(function () {
      seconds--;

      countdown.textContent = seconds;

      if (seconds <= 0) {
        clearInterval(timer);

        overlay.classList.add("production-warning-hide");

        setTimeout(function () {
          overlay.remove();
          showBadge();
        }, 300);
      }
    }, 1000);
  }

  // SHOW PRODUCTION BADGE

  function showBadge() {
    if (document.getElementById("production-warning-badge")) {
      return;
    }

    const badge = document.createElement("div");

    badge.id = "production-warning-badge";

    badge.innerHTML = `
      <span class="production-badge-dot"></span>
      <strong>PRODUCTION</strong>
      <span>LIVE ENVIRONMENT</span>
    `;

    document.body.appendChild(badge);
  }

  // ESCAPE HTML

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
