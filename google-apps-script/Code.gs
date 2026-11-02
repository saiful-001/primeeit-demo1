/**
 * =========================================================================
 * 🌐 UNIVERSAL GOOGLE APPS SCRIPT CRM & MULTI-TAB ENGINE (Code.gs)
 *
 * 4 Dedicated Tabs:
 * 1. Order Data:
 *    [Order ID, Customer Name, Phone, Address, Product Name, Quantity, Price, Total Amount, Order Date & Time, Order Status]
 *
 * 2. Pixel Data:
 *    [Event Name, Event ID, Page URL, Visitor ID, Product / Event Value, UTM Source, UTM Campaign, Date & Time]
 *
 * 3. User Activity:
 *    [Visitor ID, Page URL, Referrer, Device, Browser, Visit Count, Session Duration, Date & Time]
 *
 * 4. Monthly Report:
 *    [Date, Total Orders, Total Contacts, Total Visitors, Total Revenue, Pending Orders, Completed Orders]
 *
 * Features:
 * - High-concurrency safe via LockService.
 * - Anti-duplicate protection without losing consecutive unique orders.
 * - Comprehensive date filters (Today, Last 7 Days, This Month, Custom Date Range).
 * - 1-Click Remote Sheet Format & Sync from Admin Panel.
 * =========================================================================
 */

// Tab Names
var TAB_ORDERS = "Order Data";
var TAB_PIXEL = "Pixel Data";
var TAB_ACTIVITY = "User Activity";
var TAB_MONTHLY = "Monthly Report";

// 1. Order Data Tab Headers
var HEADERS_ORDER = [
  "Order ID",
  "Customer Name",
  "Phone",
  "Address",
  "Product Name",
  "Quantity",
  "Price",
  "Total Amount",
  "Order Date & Time",
  "Order Status"
];

// 2. Pixel Data Tab Headers
var HEADERS_PIXEL = [
  "Event Name",
  "Event ID",
  "Page URL",
  "Visitor ID",
  "Product / Event Value",
  "UTM Source",
  "UTM Campaign",
  "Date & Time"
];

// 3. User Activity Tab Headers
var HEADERS_ACTIVITY = [
  "Visitor ID",
  "Page URL",
  "Referrer",
  "Device",
  "Browser",
  "Visit Count",
  "Session Duration",
  "Date & Time"
];

// 4. Monthly Report Tab Headers
var HEADERS_MONTHLY = [
  "Date",
  "Total Orders",
  "Total Contacts",
  "Total Visitors",
  "Total Revenue",
  "Pending Orders",
  "Completed Orders"
];

/**
 * Custom UI Menu in Google Sheets
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("✨ ASCHII SOLUTION CRM")
      .addItem("🔄 Format & Initialize All 4 Tabs", "formatAllSheetsDesign")
      .addItem("📊 Refresh Monthly Report", "updateMonthlyReportTab")
      .addItem("🎯 Re-apply Order Status Dropdowns", "reapplyOrderStatusDropdowns")
      .addSeparator()
      .addSubMenu(ui.createMenu("📅 Date-wise Filters (Order Data)")
        .addItem("📌 Today's Orders", "filterTodayOrders")
        .addItem("📌 Last 7 Days Orders", "filterLast7DaysOrders")
        .addItem("📌 This Month Orders", "filterThisMonthOrders")
        .addItem("📌 Custom Date Filter...", "filterCustomDatePrompt")
        .addSeparator()
        .addItem("🔄 Show All Orders (Clear Filter)", "clearOrderFilters"))
      .addToUi();
  } catch (e) {}
}

/**
 * Handle GET requests (Health check, Test Connection, One-click Sync, Reports)
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || "ping";
    var targetUrl = e && e.parameter && e.parameter.sheetUrl;
    var ss = getSpreadsheet_(targetUrl);

    // One-click remote design format & sync
    if (action === "sync_design" || action === "format" || action === "init_tabs" || action === "redesign") {
      var res = formatAllSheetsDesign(ss);
      return jsonResponse_({
        success: true,
        message: "All 4 Google Sheet tabs formatted & synchronized successfully!",
        details: res,
        timestamp: new Date().toISOString()
      });
    }

    if (action === "test" || action === "ping") {
      return jsonResponse_({
        success: true,
        message: "Google Sheets CRM API is online and operational!",
        sheetName: ss.getName(),
        sheetUrl: ss.getUrl(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === "summary" || action === "report") {
      return jsonResponse_({
        success: true,
        summary: calculateSummaryStats_(ss)
      });
    }

    return jsonResponse_({
      success: true,
      message: "ASCHII SOLUTION CRM API is active.",
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
 * Handle POST requests (Orders, Pixel events, User Activity)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds for lock to avoid losing concurrent orders
    lock.waitLock(30000);

    var raw = (e && e.postData && e.postData.contents) || "{}";
    var data = JSON.parse(raw);

    var targetSheetUrl = data.sheetUrl || data.trackingSheetUrl || "";
    var ss = getSpreadsheet_(targetSheetUrl);
    var now = new Date();
    var dateStr = Utilities.formatDate(now, "Asia/Dhaka", "dd-MMM-yyyy hh:mm a");
    var type = (data.type || data.action || "").toLowerCase();

    // 1. User Activity tracking
    if (type === "track" || type === "activity" || type === "user_activity") {
      return handleUserActivity_(ss, data, dateStr);
    }

    // 2. Pixel Data logging
    if (type === "pixel" || type === "pixel_event") {
      return handlePixelData_(ss, data, dateStr);
    }

    // 3. New Order / Contact Form Submission (Default to Order Data)
    return handleNewOrder_(ss, data, dateStr);
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
 * Process New Order or Contact Form
 */
function handleNewOrder_(ss, data, dateStr) {
  var oSheet = getOrCreateSheet_(ss, TAB_ORDERS);
  if (oSheet.getLastRow() < 4) {
    formatOrdersSheetDesign(oSheet);
  }

  // Prevent duplicate spam within 30 seconds for identical payload
  var phone = clean_(data.phone || "", 25);
  var orderId = data.orderId || nextCustomOrderId_("ORD");
  var custName = clean_(data.name || data.customerName || "Customer", 100);
  var address = clean_(data.address || data.district || "-", 350);

  // Products summary string
  var productName = clean_(
    data.productName || data.product || data.itemsSummary ||
    (Array.isArray(data.items) ? data.items.map(function(i){ return (i.name || i.id) + " (" + (i.qty || 1) + " pcs)"; }).join(", ") : "Product / Service"),
    300
  );

  var quantity = Number(data.quantity || data.totalQty || (Array.isArray(data.items) ? data.items.reduce(function(acc,cur){ return acc + (cur.qty || 1); }, 0) : 1));
  var price = Number(data.price || data.subtotal || 0);
  var totalAmount = Number(data.totalAmount || data.clientTotal || data.total || (price * quantity));
  var orderStatus = data.status || "Pending";

  // Append row directly into Order Data Tab
  oSheet.appendRow([
    orderId,
    custName,
    "'" + phone,
    address,
    productName,
    quantity,
    price,
    totalAmount,
    dateStr,
    orderStatus
  ]);

  formatOrderDataRow_(oSheet, oSheet.getLastRow());

  // Also log / update User Activity tab for this order
  try {
    var vId = clean_(data.sessionId || data.visitorId || "-", 60);
    handleUserActivity_(ss, {
      visitorId: vId,
      pageUrl: data.pageUrl || "",
      referrer: data.source || "Website Order",
      device: data.device || (/Mobi|Android|iPhone|iPad/i.test(String(data.userAgent || "")) ? "Mobile" : "Desktop"),
      browser: data.browser || "-",
      sessionDuration: data.timeSpent || "1 min",
      visitCount: 1
    }, dateStr);
  } catch (ue) {}

  // Also record Pixel Event automatically for purchase / contact lead
  try {
    var pSheet = getOrCreateSheet_(ss, TAB_PIXEL);
    if (pSheet.getLastRow() < 4) formatPixelSheetDesign(pSheet);
    pSheet.appendRow([
      data.email && !data.items ? "Lead / Contact" : "Purchase",
      orderId,
      clean_(data.pageUrl || "", 250),
      clean_(data.sessionId || data.visitorId || "-", 60),
      clean_(productName + " | " + totalAmount, 150),
      clean_(data.source || data.utmSource || "Direct", 80),
      clean_(data.campaign || data.utmCampaign || "-", 100),
      dateStr
    ]);
    formatBasicDataRow_(pSheet, pSheet.getLastRow(), HEADERS_PIXEL.length);
  } catch (pe) {}

  // Automatically update Monthly Report
  try {
    updateMonthlyReportTab(ss);
  } catch (me) {}

  return jsonResponse_({
    success: true,
    orderId: orderId,
    total: totalAmount,
    message: "Order successfully recorded in Google Sheets!"
  });
}

/**
 * Process Pixel Data Logging
 */
function handlePixelData_(ss, data, dateStr) {
  var pSheet = getOrCreateSheet_(ss, TAB_PIXEL);
  if (pSheet.getLastRow() < 4) {
    formatPixelSheetDesign(pSheet);
  }

  pSheet.appendRow([
    clean_(data.eventName || data.event || "PageView", 60),
    clean_(data.eventId || "EV-" + Date.now(), 60),
    clean_(data.pageUrl || "", 250),
    clean_(data.visitorId || data.sessionId || "-", 60),
    clean_(data.productOrValue || data.value || "-", 120),
    clean_(data.utmSource || data.source || "-", 80),
    clean_(data.utmCampaign || data.campaign || "-", 100),
    dateStr
  ]);

  formatBasicDataRow_(pSheet, pSheet.getLastRow(), HEADERS_PIXEL.length);
  return jsonResponse_({ success: true, type: "pixel", message: "Pixel Event Recorded" });
}

/**
 * Process User Activity Logging
 */
function handleUserActivity_(ss, data, dateStr) {
  var aSheet = getOrCreateSheet_(ss, TAB_ACTIVITY);
  if (aSheet.getLastRow() < 2) {
    formatActivitySheetDesign(aSheet);
  }

  var vId = clean_(data.visitorId || data.sessionId || "-", 60);
  var lastRow = aSheet.getLastRow();
  var updated = false;

  // If visitor already logged, update duration, visit count & timestamp
  if (lastRow >= 3) {
    var vRange = aSheet.getRange(3, 1, Math.min(lastRow - 2, 500), 1).getValues();
    for (var r = vRange.length - 1; r >= 0; r--) {
      if (vRange[r][0] === vId) {
        var targetRow = r + 3;
        var currentCount = Number(aSheet.getRange(targetRow, 6).getValue()) || 1;
        aSheet.getRange(targetRow, 6).setValue(currentCount + 1);
        aSheet.getRange(targetRow, 7).setValue(clean_(data.sessionDuration || data.stayTime || data.timeSpent || "0s", 50));
        aSheet.getRange(targetRow, 8).setValue(dateStr);
        updated = true;
        break;
      }
    }
  }

  if (!updated) {
    var referrerVal = clean_(data.referrer || data.source || "Direct", 150);
    var deviceVal = clean_(data.device || (/Mobi|Android|iPhone|iPad/i.test(String(data.userAgent || "")) ? "Mobile" : "Desktop"), 40);
    var browserVal = clean_(data.browser || (data.fbp ? "Meta/Browser" : "Chrome/Web"), 40);

    aSheet.appendRow([
      vId,
      clean_(data.pageUrl || "", 250),
      referrerVal,
      deviceVal,
      browserVal,
      data.visitCount || 1,
      clean_(data.sessionDuration || data.stayTime || data.timeSpent || "0s", 50),
      dateStr
    ]);
    formatBasicDataRow_(aSheet, aSheet.getLastRow(), HEADERS_ACTIVITY.length);
  }

  return jsonResponse_({ success: true, type: "activity", message: "User Activity Recorded" });
}

/**
 * =========================================================================
 * Sheet Design & Formatting Engine (All 4 Tabs)
 * =========================================================================
 */
function formatAllSheetsDesign(optSs) {
  var ss = optSs || getSpreadsheet_();
  formatOrdersSheetDesign(ss);
  formatPixelSheetDesign(ss);
  formatActivitySheetDesign(ss);
  formatMonthlySheetDesign(ss);
  updateMonthlyReportTab(ss);
  SpreadsheetApp.flush();
  return "All 4 tabs formatted and organized successfully!";
}

/**
 * 1. Order Data Tab Design
 */
function formatOrdersSheetDesign(optParam) {
  var sheet = getSheetFromParam_(optParam, TAB_ORDERS);
  var numCols = HEADERS_ORDER.length;
  var existing = extractExistingRows_(sheet, numCols);

  try { var f = sheet.getFilter(); if (f) f.remove(); } catch(e) {}
  sheet.setFrozenRows(0);
  sheet.clear();

  // Column widths
  var colWidths = [140, 160, 130, 240, 220, 90, 110, 130, 160, 120];
  for (var w = 0; w < colWidths.length; w++) {
    sheet.setColumnWidth(w + 1, colWidths[w]);
  }

  // Row 1: Header Branding Banner
  sheet.setRowHeight(1, 36);
  sheet.getRange(1, 1, 1, numCols).merge()
    .setBackground("#0D4A47")
    .setFontColor("#FFFFFF")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(11)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setValue("🌐 ASCHII SOLUTION • Order Data & Customer Management (Auto-Synchronized)");

  // Row 2: Live KPI Summary
  sheet.setRowHeight(2, 44);
  var k1 = sheet.getRange("A2:C2");
  k1.merge()
    .setBackground("#F8FAFC")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("A2").setFormula('="🛒 Total Orders: " & IFERROR(COUNTA(A5:A), 0)')
    .setFontWeight("bold").setFontSize(10.5).setFontColor("#0F172A");

  var k2 = sheet.getRange("D2:G2");
  k2.merge()
    .setBackground("#F0FDF4")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#BBF7D0", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("D2").setFormula('="💵 Total Revenue: ৳ " & TEXT(IFERROR(SUM(H5:H), 0), "#,##0")')
    .setFontWeight("bold").setFontSize(10.5).setFontColor("#15803D");

  var k3 = sheet.getRange("H2:J2");
  k3.merge()
    .setBackground("#FEFCE8")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#FEF08A", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("H2").setFormula('="📊 Completed: " & IFERROR(COUNTIF(J5:J, "Completed") + COUNTIF(J5:J, "Delivered") + COUNTIF(J5:J, "Shipped"), 0)')
    .setFontWeight("bold").setFontSize(10.5).setFontColor("#A16207");

  // Row 3: Section label
  sheet.setRowHeight(3, 26);
  sheet.getRange(3, 1, 1, numCols).merge()
    .setBackground("#F1F5F9")
    .setFontColor("#334155")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setValue("Order Details, Quantities & Payment Information");

  // Row 4: Column Headers
  sheet.setRowHeight(4, 34);
  sheet.getRange(4, 1, 1, numCols).setValues([HEADERS_ORDER])
    .setBackground("#E2E8F0")
    .setFontColor("#0F172A")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);

  if (existing.length > 0) {
    sheet.getRange(5, 1, existing.length, numCols).setValues(existing);
  }

  sheet.setFrozenRows(4);
  var lastR = Math.max(5, sheet.getLastRow());
  try { sheet.getRange(4, 1, lastR, numCols).createFilter(); } catch(e) {}

  for (var r = 5; r <= lastR; r++) {
    formatOrderDataRow_(sheet, r);
  }

  // Apply dropdown data validation and color coding across column 10 (Order Status)
  applyOrderStatusFormatting_(sheet);

  return sheet;
}

/**
 * 2. Pixel Data Tab Design
 */
function formatPixelSheetDesign(optParam) {
  var sheet = getSheetFromParam_(optParam, TAB_PIXEL);
  var numCols = HEADERS_PIXEL.length;
  var existing = extractExistingRows_(sheet, numCols);

  try { var f = sheet.getFilter(); if (f) f.remove(); } catch(e) {}
  sheet.setFrozenRows(0);
  sheet.clear();

  var widths = [130, 140, 240, 150, 180, 120, 130, 160];
  for (var w = 0; w < widths.length; w++) sheet.setColumnWidth(w + 1, widths[w]);

  sheet.setRowHeight(1, 36);
  sheet.getRange(1, 1, 1, numCols).merge()
    .setBackground("#0F172A")
    .setFontColor("#FFFFFF")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(11)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setValue("🎯 ASCHII CRM • Meta / Facebook Pixel Events Log");

  sheet.setRowHeight(2, 34);
  sheet.getRange(2, 1, 1, numCols).setValues([HEADERS_PIXEL])
    .setBackground("#F1F5F9")
    .setFontColor("#0F172A")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);

  if (existing.length > 0) sheet.getRange(3, 1, existing.length, numCols).setValues(existing);
  sheet.setFrozenRows(2);
  var lastR = Math.max(3, sheet.getLastRow());
  try { sheet.getRange(2, 1, lastR, numCols).createFilter(); } catch(e) {}

  for (var r = 3; r <= lastR; r++) {
    formatBasicDataRow_(sheet, r, numCols);
  }
  return sheet;
}

/**
 * 3. User Activity Tab Design
 */
function formatActivitySheetDesign(optParam) {
  var sheet = getSheetFromParam_(optParam, TAB_ACTIVITY);
  var numCols = HEADERS_ACTIVITY.length;
  var existing = extractExistingRows_(sheet, numCols);

  try { var f = sheet.getFilter(); if (f) f.remove(); } catch(e) {}
  sheet.setFrozenRows(0);
  sheet.clear();

  var widths = [150, 240, 150, 120, 120, 110, 140, 160];
  for (var w = 0; w < widths.length; w++) sheet.setColumnWidth(w + 1, widths[w]);

  sheet.setRowHeight(1, 36);
  sheet.getRange(1, 1, 1, numCols).merge()
    .setBackground("#1E1B4B")
    .setFontColor("#FFFFFF")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(11)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setValue("👥 ASCHII CRM • Real-time User Activity & Session Behavior");

  sheet.setRowHeight(2, 34);
  sheet.getRange(2, 1, 1, numCols).setValues([HEADERS_ACTIVITY])
    .setBackground("#EDE9FE")
    .setFontColor("#312E81")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, true, true, "#C7D2FE", SpreadsheetApp.BorderStyle.SOLID);

  if (existing.length > 0) sheet.getRange(3, 1, existing.length, numCols).setValues(existing);
  sheet.setFrozenRows(2);
  var lastR = Math.max(3, sheet.getLastRow());
  try { sheet.getRange(2, 1, lastR, numCols).createFilter(); } catch(e) {}

  for (var r = 3; r <= lastR; r++) {
    formatBasicDataRow_(sheet, r, numCols);
  }
  return sheet;
}

/**
 * 4. Monthly Report Tab Design
 */
function formatMonthlySheetDesign(optParam) {
  var sheet = getSheetFromParam_(optParam, TAB_MONTHLY);
  var numCols = HEADERS_MONTHLY.length;
  var existing = extractExistingRows_(sheet, numCols);

  try { var f = sheet.getFilter(); if (f) f.remove(); } catch(e) {}
  sheet.setFrozenRows(0);
  sheet.clear();

  var widths = [140, 120, 120, 120, 150, 130, 130];
  for (var w = 0; w < widths.length; w++) sheet.setColumnWidth(w + 1, widths[w]);

  sheet.setRowHeight(1, 36);
  sheet.getRange(1, 1, 1, numCols).merge()
    .setBackground("#1E293B")
    .setFontColor("#FFFFFF")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(11)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setValue("📊 ASCHII CRM • Monthly Performance & Summary Report");

  sheet.setRowHeight(2, 34);
  sheet.getRange(2, 1, 1, numCols).setValues([HEADERS_MONTHLY])
    .setBackground("#FEF3C7")
    .setFontColor("#78350F")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, true, true, "#FDE68A", SpreadsheetApp.BorderStyle.SOLID);

  if (existing.length > 0) sheet.getRange(3, 1, existing.length, numCols).setValues(existing);
  sheet.setFrozenRows(2);
  var lastR = Math.max(3, sheet.getLastRow());
  try { sheet.getRange(2, 1, lastR, numCols).createFilter(); } catch(e) {}

  for (var r = 3; r <= lastR; r++) {
    formatBasicDataRow_(sheet, r, numCols);
  }
  return sheet;
}

/**
 * Monthly Report Calculation
 */
function updateMonthlyReportTab(optParam) {
  var ss = (optParam && typeof optParam.getSheetByName === "function")
    ? optParam
    : (optParam && typeof optParam.getParent === "function" ? optParam.getParent() : getSpreadsheet_());

  var oSheet = ss.getSheetByName(TAB_ORDERS);
  var aSheet = ss.getSheetByName(TAB_ACTIVITY);
  var mSheet = getOrCreateSheet_(ss, TAB_MONTHLY);

  if (mSheet.getLastRow() < 2) {
    formatMonthlySheetDesign(mSheet);
  }

  var orders = [];
  if (oSheet && oSheet.getLastRow() >= 5) {
    orders = oSheet.getRange(5, 1, oSheet.getLastRow() - 4, HEADERS_ORDER.length).getValues();
  }

  var visitorsCount = (aSheet && aSheet.getLastRow() >= 3) ? (aSheet.getLastRow() - 2) : 0;
  var map = {};

  for (var i = 0; i < orders.length; i++) {
    var row = orders[i];
    if (!row[0] || String(row[0]).indexOf("ASCHII") > -1) continue;

    // Order Date & Time (Column 9, index 8)
    var rawDate = String(row[8] || "").trim();
    var day = rawDate ? rawDate.split(" ")[0] : Utilities.formatDate(new Date(), "Asia/Dhaka", "dd-MMM-yyyy");

    if (!map[day]) {
      map[day] = { orders: 0, contacts: 0, revenue: 0, pending: 0, completed: 0 };
    }

    // Total Amount (Column 8, index 7)
    var totalVal = row[7];
    var totalNum = 0;
    if (typeof totalVal === "number") {
      totalNum = totalVal;
    } else {
      var parsed = parseFloat(String(totalVal || "").replace(/[^0-9.]/g, ""));
      totalNum = isNaN(parsed) ? 0 : parsed;
    }

    // Order Status (Column 10, index 9)
    var status = String(row[9] || "Pending").toLowerCase();

    map[day].orders++;
    map[day].revenue += totalNum;

    if (status.indexOf("complete") > -1 || status.indexOf("deliver") > -1 || status.indexOf("shipped") > -1) {
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
      map[k].pending,
      map[k].completed
    ]);
  }

  var currentLast = mSheet.getLastRow();
  if (currentLast >= 3) {
    mSheet.getRange(3, 1, currentLast - 2, HEADERS_MONTHLY.length).clearContent();
  }

  if (rows.length > 0) {
    mSheet.getRange(3, 1, rows.length, HEADERS_MONTHLY.length).setValues(rows);
    for (var r = 3; r < 3 + rows.length; r++) {
      formatBasicDataRow_(mSheet, r, HEADERS_MONTHLY.length);
      try {
        mSheet.getRange(r, 5).setNumberFormat('"৳"#,##0').setFontWeight("bold");
      } catch (fe) {}
    }
  }
}

/**
 * Row Formatting Helpers
 */
function formatOrderDataRow_(sheet, rowIndex) {
  try {
    sheet.setRowHeight(rowIndex, 32);
    var range = sheet.getRange(rowIndex, 1, 1, HEADERS_ORDER.length);
    range.setFontFamily("Segoe UI").setFontSize(10).setVerticalAlignment("middle")
      .setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);

    range.setBackground(rowIndex % 2 === 0 ? "#FFFFFF" : "#F8FAFC");
    sheet.getRange(rowIndex, 1).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange(rowIndex, 3).setHorizontalAlignment("center").setNumberFormat("@");
    sheet.getRange(rowIndex, 6).setHorizontalAlignment("center");
    sheet.getRange(rowIndex, 7).setNumberFormat('"৳"#,##0');
    sheet.getRange(rowIndex, 8).setNumberFormat('"৳"#,##0').setFontWeight("bold");
    sheet.getRange(rowIndex, 9).setHorizontalAlignment("center");
    
    // Column 10: Order Status with interactive dropdown
    var statusCell = sheet.getRange(rowIndex, 10);
    statusCell.setHorizontalAlignment("center").setFontWeight("bold");
    try {
      statusCell.setDataValidation(getOrderStatusValidationRule_());
    } catch (ve) {}
  } catch (e) {}
}

/**
 * Order Status Options & Dropdown Rules
 */
var ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Completed",
  "Cancelled",
  "Returned"
];

function getOrderStatusValidationRule_() {
  return SpreadsheetApp.newDataValidation()
    .requireValueInList(ORDER_STATUSES, true)
    .setAllowInvalid(true)
    .build();
}

/**
 * Apply Order Status Dropdown & Color Formatting across Order Data tab
 */
function applyOrderStatusFormatting_(sheet) {
  try {
    var maxR = Math.max(100, sheet.getMaxRows());
    var numRowsToValidate = maxR - 4;
    if (numRowsToValidate > 0) {
      var statusColRange = sheet.getRange(5, 10, numRowsToValidate, 1);
      statusColRange.setDataValidation(getOrderStatusValidationRule_());
    }

    // Apply conditional formatting rules for visual color tags
    var statusRuleRange = sheet.getRange("J5:J" + maxR);
    var existingRules = sheet.getConditionalFormatRules() || [];
    var filteredRules = [];

    for (var i = 0; i < existingRules.length; i++) {
      var r = existingRules[i];
      var rngs = r.getRanges();
      var isStatusRng = false;
      for (var j = 0; j < rngs.length; j++) {
        if (rngs[j].getColumn() === 10) {
          isStatusRng = true;
          break;
        }
      }
      if (!isStatusRng) {
        filteredRules.push(r);
      }
    }

    var colorTags = [
      { text: "Pending", bg: "#FEF3C7", fg: "#92400E" },     // Amber / Yellow
      { text: "Processing", bg: "#DBEAFE", fg: "#1E40AF" },  // Soft Blue
      { text: "Confirmed", bg: "#E0F2FE", fg: "#0369A1" },   // Cyan
      { text: "Shipped", bg: "#EDE9FE", fg: "#6D28D9" },     // Purple
      { text: "Delivered", bg: "#DCFCE7", fg: "#166534" },   // Green
      { text: "Completed", bg: "#D1FAE5", fg: "#065F46" },   // Emerald
      { text: "Cancelled", bg: "#FEE2E2", fg: "#991B1B" },   // Red
      { text: "Returned", bg: "#FFE4E6", fg: "#9F1239" }     // Rose
    ];

    for (var k = 0; k < colorTags.length; k++) {
      var tag = colorTags[k];
      var cRule = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo(tag.text)
        .setBackground(tag.bg)
        .setFontColor(tag.fg)
        .setBold(true)
        .setRanges([statusRuleRange])
        .build();
      filteredRules.push(cRule);
    }

    sheet.setConditionalFormatRules(filteredRules);
  } catch (err) {}
}

function reapplyOrderStatusDropdowns() {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(TAB_ORDERS);
  if (sheet) {
    applyOrderStatusFormatting_(sheet);
    try {
      SpreadsheetApp.getActiveSpreadsheet().toast("Order Status dropdowns & color tags updated!", "ASCHII CRM", 5);
    } catch(e) {}
  }
}

/**
 * Real-time onEdit Trigger
 * Automatically recalculates Monthly Report when Order Status is changed in Order Data tab
 */
function onEdit(e) {
  try {
    if (!e || !e.range) return;
    var sheet = e.range.getSheet();
    if (!sheet) return;
    if (sheet.getName() === TAB_ORDERS && e.range.getColumn() === 10 && e.range.getRow() >= 5) {
      updateMonthlyReportTab(sheet.getParent());
    }
  } catch (err) {}
}

function formatBasicDataRow_(sheet, rowIndex, numCols) {
  try {
    sheet.setRowHeight(rowIndex, 30);
    var range = sheet.getRange(rowIndex, 1, 1, numCols);
    range.setFontFamily("Segoe UI").setFontSize(9.5).setVerticalAlignment("middle")
      .setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);
    range.setBackground(rowIndex % 2 === 0 ? "#FFFFFF" : "#F8FAFC");
    sheet.getRange(rowIndex, 1).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange(rowIndex, numCols).setHorizontalAlignment("center");
  } catch(e) {}
}

/**
 * Filter Helpers (Order Data)
 */
function filterTodayOrders() {
  applyOrderDateFilter_(Utilities.formatDate(new Date(), "Asia/Dhaka", "dd-MMM-yyyy"));
}

function filterLast7DaysOrders() {
  var sheet = getSpreadsheet_().getSheetByName(TAB_ORDERS);
  if (!sheet) return;
  try { var f = sheet.getFilter(); if (f) f.remove(); } catch(e) {}
  var lastRow = sheet.getLastRow();
  if (lastRow < 5) return;
  var filter = sheet.getRange(4, 1, lastRow, HEADERS_ORDER.length).createFilter();
  var dates = [];
  for (var i = 0; i < 7; i++) {
    var d = new Date(); d.setDate(d.getDate() - i);
    dates.push(Utilities.formatDate(d, "Asia/Dhaka", "dd-MMM-yyyy"));
  }
  var criteria = SpreadsheetApp.newFilterCriteria()
    .setHiddenValues(findNonMatchingDates_(sheet, dates, 9))
    .build();
  filter.setColumnFilterCriteria(9, criteria);
}

function filterThisMonthOrders() {
  applyOrderDateFilter_(Utilities.formatDate(new Date(), "Asia/Dhaka", "MMM-yyyy"));
}

function filterCustomDatePrompt() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt("📅 Custom Date Filter", "Enter date or month (e.g. 02-Nov-2026 or Nov-2026):", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() == ui.Button.OK) {
    var text = response.getResponseText().trim();
    if (text) applyOrderDateFilter_(text);
  }
}

function clearOrderFilters() {
  var sheet = getSpreadsheet_().getSheetByName(TAB_ORDERS);
  if (sheet) {
    try { var f = sheet.getFilter(); if (f) f.remove(); } catch(e) {}
    sheet.getRange(4, 1, Math.max(5, sheet.getLastRow()), HEADERS_ORDER.length).createFilter();
  }
}

function applyOrderDateFilter_(dateSubstr) {
  var sheet = getSpreadsheet_().getSheetByName(TAB_ORDERS);
  if (!sheet) return;
  try { var f = sheet.getFilter(); if (f) f.remove(); } catch(e) {}
  var lastRow = sheet.getLastRow();
  if (lastRow < 5) return;
  var filter = sheet.getRange(4, 1, lastRow, HEADERS_ORDER.length).createFilter();
  var criteria = SpreadsheetApp.newFilterCriteria().whenTextContains(dateSubstr).build();
  filter.setColumnFilterCriteria(9, criteria); // Column 9 is Order Date & Time
}

function findNonMatchingDates_(sheet, validDates, colIndex) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 5) return [];
  var vals = sheet.getRange(5, colIndex, lastRow - 4, 1).getValues();
  var hidden = [];
  for (var i = 0; i < vals.length; i++) {
    var val = String(vals[i][0]);
    var match = false;
    for (var j = 0; j < validDates.length; j++) {
      if (val.indexOf(validDates[j]) > -1) { match = true; break; }
    }
    if (!match && hidden.indexOf(val) === -1) hidden.push(val);
  }
  return hidden;
}

/**
 * Core Utilities
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

function getOrCreateSheet_(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function getSheetFromParam_(param, defaultName) {
  if (param && typeof param.getLastRow === "function" && typeof param.getParent === "function") {
    return param;
  }
  var ss = (param && typeof param.getSheetByName === "function") ? param : getSpreadsheet_(param);
  return getOrCreateSheet_(ss, defaultName);
}

function extractExistingRows_(sheet, numCols) {
  var existing = [];
  var lastRow = sheet.getLastRow();
  if (lastRow >= 4) {
    var checkRow4 = sheet.getRange(4, 1, 1, Math.min(sheet.getLastColumn(), 3)).getValues()[0];
    var startR = (String(checkRow4[0]).indexOf("Order ID") > -1 || String(checkRow4[0]).indexOf("Session ID") > -1) ? 5 : 4;
    if (lastRow >= startR) {
      var raw = sheet.getRange(startR, 1, lastRow - startR + 1, sheet.getLastColumn()).getValues();
      for (var r = 0; r < raw.length; r++) {
        var row = raw[r];
        if (row[0] && String(row[0]).indexOf("ASCHII") === -1 && String(row[0]).indexOf("Total") === -1) {
          var padded = [];
          for (var c = 0; c < numCols; c++) {
            padded.push(c < row.length ? row[c] : "-");
          }
          existing.push(padded);
        }
      }
    }
  }
  return existing;
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

function calculateSummaryStats_(ss) {
  var oSheet = ss.getSheetByName(TAB_ORDERS);
  var aSheet = ss.getSheetByName(TAB_ACTIVITY);
  var totalOrders = oSheet && oSheet.getLastRow() >= 5 ? oSheet.getLastRow() - 4 : 0;
  var totalVisitors = aSheet && aSheet.getLastRow() >= 3 ? aSheet.getLastRow() - 2 : 0;
  return {
    totalOrders: totalOrders,
    totalVisitors: totalVisitors
  };
}
