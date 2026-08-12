(function () {
  "use strict";

  // ============================================================
  // RESET PRODUCTION WARNINGS
  // ============================================================

  window.resetProductionWarnings = function () {
    window.postMessage(
      {
        source: "production-warning",
        action: "RESET_PRODUCTION_WARNINGS",
      },
      "*",
    );
  };

  // ============================================================
  // CHECK CURRENT STATUS
  // ============================================================

  window.productionWarningStatus = function () {
    window.postMessage(
      {
        source: "production-warning",
        action: "PRODUCTION_WARNING_STATUS",
      },
      "*",
    );
  };
})();
