/**
 * =========================================================================
 * 🌐 UNIVERSAL GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * Organizes incoming data into 4 Clean Tabs:
 * 1. "Order Data"
 * 2. "Pixel Data"
 * 3. "User Activity"
 * 4. "Monthly Report"
 *
 * Supports Universal Website Types:
 * - Agency Portfolio
 * - CV / Personal Portfolio
 * - Product Selling Website
 * =========================================================================
 */

// Global Sheet Tab Names (Customizable or via Config.gs)
var TAB_ORDERS = typeof TAB_ORDERS !== "undefined" ? TAB_ORDERS : "Order Data";
var TAB_PIXEL = typeof TAB_PIXEL !== "undefined" ? TAB_PIXEL : "Pixel Data";
var TAB_ACTIVITY = typeof TAB_ACTIVITY !== "undefined" ? TAB_ACTIVITY : "User Activity";
var TAB_MONTHLY = typeof TAB_MONTHLY !== "undefined" ? TAB_MONTHLY : "Monthly Report";

// Tab Headers as requested:
var HEADERS_ORDER = [
  "Order ID",
  "Customer Name",
  "Phone",
  "Email",
  "Address",
  "Product / Service",
  "Price",
  "Quantity",
  "Total Amount",
  "Order Status",
  "Date & Time"
];

var HEADERS_PIXEL = [
  "Event Name",
  "Event ID",
  "Page URL",
  "Product / Value",
  "Visitor ID",
  "Device",
  "Browser",
  "UTM Source",
  "UTM Campaign",
  "Date & Time"
];

var HEADERS_ACTIVITY = [
  "Visitor ID",
  "Page URL",
  "Referrer",
  "Device",
  "Browser",
  "Visit Count",
  "Session Duration",
  "Button Clicks",
  "Date & Time"
];

var HEADERS_MONTHLY = [
  "Date",
  "Total Orders",
  "Total Contacts",
  "Total Visitors",
  "Total Revenue",
  "Completed Orders",
  "Pending Orders"
];

/**
 * Menu bar on Google Sheets UI
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("✨ ASCHII SOLUTION CRM")
      .addItem("🎨 Initialize / Format 4 Tabs", "setupAllFourTabs")
      .addItem("📊 Refresh Monthly Summary Report", "updateMonthlyReportTab")
      .addSeparator()
      .addSubMenu(ui.createMenu("📅 Date-wise Filters")
        .addItem("📌 Today's Orders", "filterTodayOrders")
        .addItem("📌 Yesterday's Orders", "filterYesterdayOrders")
        .addItem("📌 This Month", "filterThisMonthOrders")
        .addItem("🔄 Clear Filter (Show All)", "clearOrderFilters"))
      .addToUi();
  } catch (e) {}
}

/**
 * Handle GET requests for Testing Connection, Ping, and Monthly Summaries
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || "ping";
    var ss = getSpreadsheet_(e && e.parameter && e.parameter.sheetUrl);

    if (action === "ping" || action === "test") {
      return jsonResponse_({
        success: true,
        message: "Google Sheets CRM Connection Successful!",
        sheetName: ss.getName(),
        sheetUrl: ss.getUrl(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === "init_tabs" || action === "format") {
      setupAllFourTabs(ss);
      return jsonResponse_({
        success: true,
        message: "All 4 Tabs (Order Data, Pixel Data, User Activity, Monthly Report) initialized successfully!"
      });
    }

    if (action === "summary" || action === "report") {
      var summary = calculateSummaryStats_(ss);
      return jsonResponse_({
        success: true,
        summary: summary
      });
    }

    return jsonResponse_({
      success: true,
      message: "API is active and operational.",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return jsonResponse_({
      success: false,
      error: "Error: " + err.message
    });
  }
}

/**
 * Handle POST submissions from website: Orders, Batch Events, Activity, Pixel
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 30s to handle high concurrent submissions without losing data
    lock.waitLock(30000);

    var raw = (e && e.postData && e.postData.contents) || "{}";
    var payload = JSON.parse(raw);

    // Support single item or batch submission queue
    if (payload.batch && Array.isArray(payload.items)) {
      var batchResults = [];
      for (var b = 0; b < payload.items.length; b++) {
        var subItem = payload.items[b];
        batchResults.push(processSinglePayload_(subItem));
      }
      return jsonResponse_({ success: true, batchCount: batchResults.length, results: batchResults });
    }

    var result = processSinglePayload_(payload);
    return jsonResponse_(result);
  } catch (err) {
    return jsonResponse_({
      success: false,
      error: "Submission Error: " + err.message
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (ignore) {}
  }
}

/**
 * Route individual payload to appropriate sheet tab
 */
function processSinglePayload_(data) {
  var ss = getSpreadsheet_(data.sheetUrl);
  var now = new Date();
  var dateStr = Utilities.formatDate(now, "Asia/Dhaka", "dd-MMM-yyyy hh:mm a");

  var type = (data.type || data.action || "").toLowerCase();

  // 1. Pixel Data Tab
  if (type === "pixel" || type === "pixel_event") {
    var pSheet = getOrCreateSheet_(ss, TAB_PIXEL, HEADERS_PIXEL, "#0F172A", "#38BDF8");
    pSheet.appendRow([
      clean_(data.eventName || data.event || "PageView", 60),
      clean_(data.eventId || "EV-" + Date.now(), 60),
      clean_(data.pageUrl || "", 250),
      clean_(data.productOrValue || data.value || "-", 100),
      clean_(data.visitorId || data.sessionId || "-", 60),
      clean_(data.device || "Desktop", 40),
      clean_(data.browser || "-", 40),
      clean_(data.utmSource || data.source || "-", 80),
      clean_(data.utmCampaign || data.campaign || "-", 100),
      dateStr
    ]);
    formatLastRow_(pSheet);
    return { success: true, type: "pixel", message: "Pixel logged" };
  }

  // 2. User Activity Tab
  if (type === "activity" || type === "user_activity" || type === "track") {
    var aSheet = getOrCreateSheet_(ss, TAB_ACTIVITY, HEADERS_ACTIVITY, "#1E1B4B", "#A5B4FC");
    
    // Check if visitor session exists to update visit count or append
    var vId = clean_(data.visitorId || data.sessionId || "-", 60);
    var updated = false;
    var lastRow = aSheet.getLastRow();
    if (lastRow > 4) {
      var vRange = aSheet.getRange(5, 1, Math.min(lastRow - 4, 300), 1).getValues();
      for (var r = vRange.length - 1; r >= 0; r--) {
        if (vRange[r][0] === vId) {
          var targetRow = r + 5;
          aSheet.getRange(targetRow, 6).setValue(data.visitCount || 1);
          aSheet.getRange(targetRow, 7).setValue(clean_(data.sessionDuration || data.timeSpent || "0s", 50));
          aSheet.getRange(targetRow, 8).setValue(clean_(data.buttonClicks || data.clicks || "0", 100));
          aSheet.getRange(targetRow, 9).setValue(dateStr);
          updated = true;
          break;
        }
      }
    }

    if (!updated) {
      aSheet.appendRow([
        vId,
        clean_(data.pageUrl || "", 250),
        clean_(data.referrer || "Direct", 150),
        clean_(data.device || "Desktop", 40),
        clean_(data.browser || "-", 40),
        data.visitCount || 1,
        clean_(data.sessionDuration || data.timeSpent || "0s", 50),
        clean_(data.buttonClicks || data.clicks || "0", 100),
        dateStr
      ]);
      formatLastRow_(aSheet);
    }
    return { success: true, type: "activity", message: "Activity logged" };
  }

  // 3. Order Data Tab (Default for Orders & Contact Inquiries)
  var oSheet = getOrCreateSheet_(ss, TAB_ORDERS, HEADERS_ORDER, "#064E3B", "#34D399");

  // Prevent duplicate submissions within cooldown
  var phone = clean_(data.phone || "", 20);
  if (phone) {
    var cache = CacheService.getScriptCache();
    var lastId = cache.get("sub_" + phone);
    if (lastId && !data.bypassDuplicateCheck) {
      return {
        success: false,
        duplicate: true,
        orderId: lastId,
        error: "Your submission was already received (ID: " + lastId + "). Please wait before submitting again."
      };
    }
  }

  var orderId = data.orderId || nextCustomOrderId_("ORD");
  var custName = clean_(data.name || data.customerName || "Customer", 100);
  var custEmail = clean_(data.email || "-", 100);
  var custAddress = clean_(data.address || data.district || "-", 250);
  var productOrService = clean_(data.product || data.service || data.itemsSummary || "General Inquiry", 200);
  var price = Number(data.price || data.subtotal || 0);
  var quantity = Number(data.quantity || data.totalQty || 1);
  var totalAmount = Number(data.totalAmount || data.total || (price * quantity));
  var orderStatus = data.status || "Pending";

  oSheet.appendRow([
    orderId,
    custName,
    "'" + phone,
    custEmail,
    custAddress,
    productOrService,
    price,
    quantity,
    totalAmount,
    orderStatus,
    dateStr
  ]);
  formatLastRow_(oSheet);

  if (phone) {
    try {
      CacheService.getScriptCache().put("sub_" + phone, orderId, 300); // 5 min duplicate protection
    } catch (e) {}
  }

  // Also auto-log Pixel Event for Purchase/Lead
  try {
    var pSheetAuto = getOrCreateSheet_(ss, TAB_PIXEL, HEADERS_PIXEL, "#0F172A", "#38BDF8");
    pSheetAuto.appendRow([
      data.email && !data.items ? "Lead / Contact" : "Purchase",
      orderId,
      clean_(data.pageUrl || "", 250),
      productOrService + " (" + totalAmount + ")",
      clean_(data.visitorId || data.sessionId || "-", 60),
      clean_(data.device || "Desktop", 40),
      clean_(data.browser || "-", 40),
      clean_(data.utmSource || data.source || "-", 80),
      clean_(data.utmCampaign || data.campaign || "-", 100),
      dateStr
    ]);
    formatLastRow_(pSheetAuto);
  } catch (pe) {}

  // Automatically update Monthly Report
  try {
    updateMonthlyReportTab(ss);
  } catch (me) {}

  return {
    success: true,
    orderId: orderId,
    total: totalAmount,
    message: "Data successfully recorded in Google Sheets!"
  };
}

/**
 * Setup and Format all 4 Tabs with Modern Professional Styling
 */
function setupAllFourTabs(optSs) {
  var ss = optSs || getSpreadsheet_();
  getOrCreateSheet_(ss, TAB_ORDERS, HEADERS_ORDER, "#064E3B", "#34D399");
  getOrCreateSheet_(ss, TAB_PIXEL, HEADERS_PIXEL, "#0F172A", "#38BDF8");
  getOrCreateSheet_(ss, TAB_ACTIVITY, HEADERS_ACTIVITY, "#1E1B4B", "#A5B4FC");
  getOrCreateSheet_(ss, TAB_MONTHLY, HEADERS_MONTHLY, "#1E293B", "#F59E0B");
  updateMonthlyReportTab(ss);
  SpreadsheetApp.flush();
  return "All 4 Tabs Formatted Successfully!";
}

/**
 * Creates or formats a Tab with Header & Styling
 */
function getOrCreateSheet_(ss, sheetName, headers, bannerBg, accentColor) {
  var sheet = ss.getSheetByName(sheetName);
  var numCols = headers.length;

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // Check if header already styled
  var needsFormat = false;
  if (sheet.getLastRow() < 4) {
    needsFormat = true;
  } else {
    var val = sheet.getRange(4, 1).getValue();
    if (val !== headers[0]) needsFormat = true;
  }

  if (needsFormat) {
    // Preserve existing rows if any
    var existing = [];
    var lastRow = sheet.getLastRow();
    if (lastRow > 0) {
      var raw = sheet.getRange(1, 1, lastRow, Math.max(numCols, sheet.getLastColumn())).getValues();
      for (var r = 0; r < raw.length; r++) {
        var row = raw[r];
        if (row[0] && String(row[0]).indexOf("ASCHII") === -1 && String(row[0]).indexOf(headers[0]) === -1) {
          existing.push(row.slice(0, numCols));
        }
      }
    }

    try { var f = sheet.getFilter(); if (f) f.remove(); } catch (e) {}
    sheet.setFrozenRows(0);
    sheet.clear();

    // 1. Top Branding Header (Row 1)
    sheet.setRowHeight(1, 36);
    sheet.getRange(1, 1, 1, numCols).merge()
      .setBackground(bannerBg)
      .setFontColor("#FFFFFF")
      .setFontFamily("Segoe UI")
      .setFontWeight("bold")
      .setFontSize(11)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setValue("🌐 ASCHII CRM • " + sheetName + "  (Auto-Synchronized)");

    // 2. Summary KPI row (Row 2 & 3)
    sheet.setRowHeight(2, 28);
    sheet.setRowHeight(3, 20);
    sheet.getRange(2, 1, 1, numCols).merge()
      .setBackground("#F8FAFC")
      .setFontColor("#334155")
      .setFontFamily("Segoe UI")
      .setFontWeight("bold")
      .setFontSize(10)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setValue("Real-time Tracking & Business Records  |  Updated: " + Utilities.formatDate(new Date(), "Asia/Dhaka", "dd-MMM-yyyy hh:mm a"));

    // 3. Table Column Headers (Row 4)
    sheet.setRowHeight(4, 34);
    var hRange = sheet.getRange(4, 1, 1, numCols);
    hRange.setValues([headers])
      .setBackground("#F1F5F9")
      .setFontColor("#0F172A")
      .setFontFamily("Segoe UI")
      .setFontWeight("bold")
      .setFontSize(10)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);

    // Set Column Widths
    for (var c = 1; c <= numCols; c++) {
      var w = 130;
      if (headers[c - 1].indexOf("Address") > -1 || headers[c - 1].indexOf("URL") > -1) w = 220;
      if (headers[c - 1].indexOf("Product") > -1 || headers[c - 1].indexOf("Service") > -1) w = 180;
      if (headers[c - 1].indexOf("ID") > -1) w = 140;
      if (headers[c - 1].indexOf("Clicks") > -1) w = 160;
      sheet.setColumnWidth(c, w);
    }

    if (existing.length > 0) {
      sheet.getRange(5, 1, existing.length, numCols).setValues(existing);
      for (var er = 5; er < 5 + existing.length; er++) {
        formatRowStyling_(sheet, er, numCols);
      }
    }

    sheet.setFrozenRows(4);
    try {
      sheet.getRange(4, 1, Math.max(5, sheet.getLastRow()), numCols).createFilter();
    } catch (fe) {}
  }

  return sheet;
}

/**
 * Format newly appended row with zebra striping and alignment
 */
function formatLastRow_(sheet) {
  var r = sheet.getLastRow();
  var numCols = sheet.getLastColumn();
  formatRowStyling_(sheet, r, numCols);
}

function formatRowStyling_(sheet, rowIndex, numCols) {
  try {
    sheet.setRowHeight(rowIndex, 30);
    var range = sheet.getRange(rowIndex, 1, 1, numCols);
    range.setFontFamily("Segoe UI")
      .setFontSize(9.5)
      .setVerticalAlignment("middle")
      .setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);

    range.setBackground(rowIndex % 2 === 0 ? "#FFFFFF" : "#F8FAFC");
    sheet.getRange(rowIndex, 1).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange(rowIndex, numCols).setHorizontalAlignment("center");
  } catch (e) {}
}

/**
 * Generate Monthly Report Tab aggregates
 */
function updateMonthlyReportTab(optSs) {
  var ss = optSs || getSpreadsheet_();
  var orderSheet = ss.getSheetByName(TAB_ORDERS);
  var activitySheet = ss.getSheetByName(TAB_ACTIVITY);
  var monthlySheet = getOrCreateSheet_(ss, TAB_MONTHLY, HEADERS_MONTHLY, "#1E293B", "#F59E0B");

  var orders = [];
  if (orderSheet && orderSheet.getLastRow() >= 5) {
    orders = orderSheet.getRange(5, 1, orderSheet.getLastRow() - 4, HEADERS_ORDER.length).getValues();
  }

  var visitorsCount = 0;
  if (activitySheet && activitySheet.getLastRow() >= 5) {
    visitorsCount = activitySheet.getLastRow() - 4;
  }

  // Aggregate by Date (dd-MMM-yyyy)
  var map = {};
  for (var i = 0; i < orders.length; i++) {
    var row = orders[i];
    var rawDate = String(row[10] || "");
    var day = rawDate.split(" ")[0] || Utilities.formatDate(new Date(), "Asia/Dhaka", "dd-MMM-yyyy");
    if (!map[day]) {
      map[day] = { orders: 0, contacts: 0, revenue: 0, completed: 0, pending: 0 };
    }
    var total = Number(row[8] || 0);
    var status = String(row[9] || "Pending").toLowerCase();
    var email = String(row[3] || "");

    if (email && email !== "-" && !total) {
      map[day].contacts++;
    } else {
      map[day].orders++;
      map[day].revenue += total;
    }

    if (status.indexOf("complete") > -1 || status.indexOf("deliver") > -1) {
      map[day].completed++;
    } else {
      map[day].pending++;
    }
  }

  var rows = [];
  var days = Object.keys(map).sort().reverse();
  for (var d = 0; d < days.length; d++) {
    var k = days[d];
    rows.push([
      k,
      map[k].orders,
      map[k].contacts,
      visitorsCount,
      map[k].revenue,
      map[k].completed,
      map[k].pending
    ]);
  }

  if (rows.length > 0) {
    // Clear old data rows in Monthly Report
    var currentLast = monthlySheet.getLastRow();
    if (currentLast >= 5) {
      monthlySheet.getRange(5, 1, currentLast - 4, HEADERS_MONTHLY.length).clearContent();
    }
    monthlySheet.getRange(5, 1, rows.length, HEADERS_MONTHLY.length).setValues(rows);
    for (var mr = 5; mr < 5 + rows.length; mr++) {
      formatRowStyling_(monthlySheet, mr, HEADERS_MONTHLY.length);
    }
  }
}

/**
 * Filter Orders on UI by Date
 */
function filterTodayOrders() {
  var today = Utilities.formatDate(new Date(), "Asia/Dhaka", "dd-MMM-yyyy");
  applyOrderDateFilter_(today);
}

function filterYesterdayOrders() {
  var d = new Date();
  d.setDate(d.getDate() - 1);
  var yest = Utilities.formatDate(d, "Asia/Dhaka", "dd-MMM-yyyy");
  applyOrderDateFilter_(yest);
}

function filterThisMonthOrders() {
  var m = Utilities.formatDate(new Date(), "Asia/Dhaka", "MMM-yyyy");
  applyOrderDateFilter_(m);
}

function clearOrderFilters() {
  var sheet = getSpreadsheet_().getSheetByName(TAB_ORDERS);
  if (sheet) {
    var f = sheet.getFilter();
    if (f) f.remove();
    var lastRow = Math.max(5, sheet.getLastRow());
    sheet.getRange(4, 1, lastRow, HEADERS_ORDER.length).createFilter();
  }
}

function applyOrderDateFilter_(dateSubstr) {
  var sheet = getSpreadsheet_().getSheetByName(TAB_ORDERS);
  if (!sheet) return;
  var f = sheet.getFilter();
  if (f) f.remove();
  var lastRow = sheet.getLastRow();
  if (lastRow < 5) return;
  var filter = sheet.getRange(4, 1, lastRow, HEADERS_ORDER.length).createFilter();
  var criteria = SpreadsheetApp.newFilterCriteria()
    .whenTextContains(dateSubstr)
    .build();
  filter.setColumnFilterCriteria(11, criteria); // Column 11 is Date & Time
}

/**
 * Calculate Summary stats for API
 */
function calculateSummaryStats_(ss) {
  var oSheet = ss.getSheetByName(TAB_ORDERS);
  var aSheet = ss.getSheetByName(TAB_ACTIVITY);
  var totalOrders = 0;
  var totalRevenue = 0;
  var completedOrders = 0;
  var pendingOrders = 0;

  if (oSheet && oSheet.getLastRow() >= 5) {
    var data = oSheet.getRange(5, 1, oSheet.getLastRow() - 4, HEADERS_ORDER.length).getValues();
    totalOrders = data.length;
    for (var i = 0; i < data.length; i++) {
      totalRevenue += Number(data[i][8] || 0);
      var st = String(data[i][9] || "").toLowerCase();
      if (st.indexOf("complete") > -1 || st.indexOf("deliver") > -1) completedOrders++;
      else pendingOrders++;
    }
  }

  var visitors = 0;
  if (aSheet && aSheet.getLastRow() >= 5) {
    visitors = aSheet.getLastRow() - 4;
  }

  return {
    totalOrders: totalOrders,
    totalRevenue: totalRevenue,
    completedOrders: completedOrders,
    pendingOrders: pendingOrders,
    totalVisitors: visitors
  };
}

/**
 * Helper to get active or linked Spreadsheet
 */
function getSpreadsheet_(optUrl) {
  var url = optUrl || (typeof SPREADSHEET_ID !== "undefined" ? SPREADSHEET_ID : "");
  if (url && url.length > 5) {
    var match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    var id = match ? match[1] : url;
    try {
      return SpreadsheetApp.openById(id);
    } catch (e) {}
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function nextCustomOrderId_(prefix) {
  var day = Utilities.formatDate(new Date(), "Asia/Dhaka", "yyMMdd");
  var props = PropertiesService.getScriptProperties();
  var key = "seq_" + day;
  var n = parseInt(props.getProperty(key) || "0", 10) + 1;
  props.setProperty(key, String(n));
  return prefix + "-" + day + "-" + ("000" + n).slice(-4);
}

function clean_(val, maxLen) {
  if (val === null || val === undefined) return "";
  var s = String(val).trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  return maxLen && s.length > maxLen ? s.substring(0, maxLen) : s;
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
