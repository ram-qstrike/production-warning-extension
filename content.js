(function () {
  "use strict";

  // ============================================================
  // ADD PRODUCTION WEBSITES HERE
  // ============================================================

  const PRODUCTION_HOSTS = [
    "qx7.prolook.com",

    // Add more production websites here
    // "www.google.com",
  ];

  const STORAGE_KEY = "productionWarningLastShown";
  const WARNING_SECONDS = 5;

  const hostname = window.location.hostname;

  // Match domain + child subdomains
  const isProduction = PRODUCTION_HOSTS.some(function (host) {
    return hostname === host || hostname.endsWith("." + host);
  });

  if (!isProduction) {
    return;
  }

  // ============================================================
  // LOAD DEV COMMANDS
  // ============================================================

  const commandScript = document.createElement("script");

  commandScript.src = chrome.runtime.getURL("commands.js");

  commandScript.onload = function () {
    commandScript.remove();
  };

  (document.head || document.documentElement).appendChild(commandScript);

  // ============================================================
  // RECEIVE DEV COMMANDS
  // ============================================================

  window.addEventListener("message", function (event) {
    if (event.source !== window) {
      return;
    }

    if (!event.data) {
      return;
    }

    if (event.data.source !== "production-warning") {
      return;
    }

    // ----------------------------------------------------------
    // RESET PRODUCTION WARNINGS
    // ----------------------------------------------------------

    if (event.data.action === "RESET_PRODUCTION_WARNINGS") {
      console.log(
        "%c[Production Warning] Resetting production warnings...",
        "color:#b71c1c;font-weight:bold;",
      );

      chrome.runtime.sendMessage({
        action: "RESET_ALL_PRODUCTION_WARNINGS",
        productionHosts: PRODUCTION_HOSTS,
      });

      return;
    }

    // ----------------------------------------------------------
    // CHECK CURRENT STATUS
    // ----------------------------------------------------------

    if (event.data.action === "PRODUCTION_WARNING_STATUS") {
      showProductionStatus();
    }
  });

  // ============================================================
  // START
  // ============================================================

  const today = getToday();
  const saved = getSavedWarning();

  showConsole(today, saved);

  if (saved && saved.date === today) {
    showBadge();
  } else {
    saveWarning(today);
    showModal();
  }

  // ============================================================
  // DATE
  // ============================================================

  function getToday() {
    const now = new Date();

    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
  }

  // ============================================================
  // LOCAL STORAGE
  // ============================================================

  function getSavedWarning() {
    const value = localStorage.getItem(STORAGE_KEY);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function saveWarning(today) {
    const now = new Date();

    const warning = {
      date: today,
      localTime: now.toLocaleString(),
      timestamp: now.toISOString(),
      hostname: window.location.hostname,
      url: window.location.href,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(warning));
  }

  // ============================================================
  // PRODUCTION ENVIRONMENT CONSOLE
  // ============================================================

  function showConsole(today, saved) {
    console.group(
      "%c PRODUCTION ENVIRONMENT ",
      "background:#b71c1c;color:white;font-weight:bold;padding:5px 8px;",
    );

    console.log("Environment:", "PRODUCTION");
    console.log("Hostname:", hostname);
    console.log("Current URL:", window.location.href);
    console.log("Today:", today);
    console.log("Storage Key:", STORAGE_KEY);
    console.log("Storage Type:", "localStorage");

    console.log("");

    if (saved) {
      console.log("Existing Warning:", saved);
      console.log("Saved Date:", saved.date);
      console.log("Saved Time:", saved.localTime);
      console.log("Saved Timestamp:", saved.timestamp);
      console.log("Saved Host:", saved.hostname);
      console.log("Saved URL:", saved.url);

      console.log("");

      if (saved.date === today) {
        console.log(
          "%cStatus: WARNING ALREADY SHOWN TODAY",
          "color:#2e7d32;font-weight:bold;",
        );
      }
    } else {
      console.log(
        "%cStatus: NO EXISTING WARNING",
        "color:#b71c1c;font-weight:bold;",
      );
    }

    console.groupEnd();

    // ==========================================================
    // DEVELOPER COMMANDS
    // ==========================================================

    console.log("");

    console.group(
      "%c DEVELOPER COMMANDS ",
      "background:#333;color:#fff;font-weight:bold;padding:5px 8px;",
    );

    console.log(
      "%cReset the warning for the current domain:",
      "font-weight:bold;",
    );

    console.log('localStorage.removeItem("productionWarningLastShown");');

    console.log("");

    console.log("%cReset production warnings:", "font-weight:bold;");

    console.log("resetProductionWarnings();");

    console.log("");

    console.log(
      "%cCheck current production warning status:",
      "font-weight:bold;",
    );

    console.log("productionWarningStatus();");

    console.groupEnd();
  }

  // ============================================================
  // STATUS
  // ============================================================

  function showProductionStatus() {
    const saved = getSavedWarning();
    const today = getToday();

    console.group(
      "%c PRODUCTION WARNING STATUS ",
      "background:#333;color:white;font-weight:bold;padding:5px 8px;",
    );

    console.log("Environment:", "PRODUCTION");
    console.log("Hostname:", hostname);
    console.log("Current URL:", window.location.href);
    console.log("Today:", today);
    console.log("Storage Key:", STORAGE_KEY);
    console.log("Storage Type:", "localStorage");

    console.log("");

    if (!saved) {
      console.log(
        "%cStatus: NO WARNING RECORD",
        "color:#b71c1c;font-weight:bold;",
      );
    } else {
      console.log("Existing Warning:", saved);
      console.log("Saved Date:", saved.date);
      console.log("Saved Time:", saved.localTime);
      console.log("Saved Timestamp:", saved.timestamp);
      console.log("Saved Host:", saved.hostname);
      console.log("Saved URL:", saved.url);

      console.log("");

      if (saved.date === today) {
        console.log(
          "%cStatus: WARNING ALREADY SHOWN TODAY",
          "color:#2e7d32;font-weight:bold;",
        );
      } else {
        console.log(
          "%cStatus: WARNING WILL SHOW",
          "color:#b71c1c;font-weight:bold;",
        );
      }
    }

    console.groupEnd();
  }

  // ============================================================
  // MODAL
  // ============================================================

  function showModal() {
    if (document.getElementById("production-warning-overlay")) {
      return;
    }

    const overlay = document.createElement("div");

    overlay.id = "production-warning-overlay";

    overlay.innerHTML = `
      <div id="production-warning-modal">

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

      </div>
    `;

    document.body.appendChild(overlay);

    let seconds = WARNING_SECONDS;

    const countdown = document.getElementById("production-warning-countdown");

    const timer = setInterval(function () {
      seconds--;

      if (countdown) {
        countdown.textContent = seconds;
      }

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

  // ============================================================
  // BADGE
  // ============================================================

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

  // ============================================================
  // ESCAPE HTML
  // ============================================================

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
