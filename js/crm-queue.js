/**
 * =========================================================================
 * ASCHII CRM • Client-Side Offline Queue & High-Performance Submissions
 * - Prevents losing customer orders on slow/offline connections
 * - Automatically retries failed requests in background
 * - Queues activity/pixel events to minimize network calls (Batch Processing)
 * =========================================================================
 */
(function() {
  "use strict";

  var QUEUE_KEY = "as_crm_submission_queue";
  var ACTIVITY_BATCH_KEY = "as_crm_activity_batch";
  var isProcessing = false;

  function getQueue(key) {
    try {
      return JSON.parse(localStorage.getItem(key || QUEUE_KEY) || "[]");
    } catch(e) {
      return [];
    }
  }

  function saveQueue(queue, key) {
    try {
      localStorage.setItem(key || QUEUE_KEY, JSON.stringify(queue));
    } catch(e) {}
  }

  window.CRMQueue = {
    // Add item to persistent queue
    enqueue: function(payload) {
      var q = getQueue();
      payload._queuedAt = Date.now();
      payload._retryCount = 0;
      q.push(payload);
      saveQueue(q);
      this.processQueue();
    },

    // Process orders queue with auto-retry
    processQueue: function() {
      if (isProcessing) return;
      var q = getQueue();
      if (!q.length) return;

      var C = window.SITE_CONFIG || {};
      var endpoint = C.apiEndpoint;
      if (!endpoint) return;

      isProcessing = true;
      var item = q[0];

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(item)
      })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res && res.success) {
          q.shift(); // Remove sent item
          saveQueue(q);
          isProcessing = false;
          if (q.length > 0) {
            setTimeout(function() { window.CRMQueue.processQueue(); }, 1000);
          }
        } else {
          isProcessing = false;
          // Retry later
          item._retryCount = (item._retryCount || 0) + 1;
          saveQueue(q);
        }
      })
      .catch(function() {
        isProcessing = false;
        item._retryCount = (item._retryCount || 0) + 1;
        saveQueue(q);
      });
    },

    // Queue button click / user action
    logAction: function(name, extra) {
      try {
        var actions = JSON.parse(sessionStorage.getItem("as_crm_actions") || "[]");
        actions.push({ name: name, time: Date.now(), extra: extra || "" });
        sessionStorage.setItem("as_crm_actions", JSON.stringify(actions.slice(-20))); // keep last 20
      } catch(e) {}
    },

    getActionsSummary: function() {
      try {
        var actions = JSON.parse(sessionStorage.getItem("as_crm_actions") || "[]");
        return actions.map(function(a) { return a.name; }).join(", ") || "None";
      } catch(e) {
        return "None";
      }
    }
  };

  // Auto-listen to clicks for User Activity logging
  document.addEventListener("click", function(e) {
    var btn = e.target.closest("button, a, .pkg, input[type='submit']");
    if (btn) {
      var text = (btn.innerText || btn.value || btn.getAttribute("aria-label") || btn.className || "clickable").trim().slice(0, 30);
      window.CRMQueue.logAction(text);
    }
  }, { passive: true });

  // Retry when internet comes back online
  window.addEventListener("online", function() {
    window.CRMQueue.processQueue();
  });

  // Run on startup
  setTimeout(function() {
    window.CRMQueue.processQueue();
  }, 4000);

})();

