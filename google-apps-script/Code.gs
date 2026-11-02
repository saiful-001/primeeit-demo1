/**
 * =========================================================================
 * 🌐 ASCHII SOLUTION • REAL-TIME CRM & TRACKER (Code.gs)
 *
 * ৪টি শিটের নিখুঁত ও আকর্ষণীয় ডিজাইন ফরম্যাট (Modern Header, KPI Dashboard, Section Banners):
 * 1. "Orders" (বা "Order Data")
 *    - KPI Cards: Total Orders, Total Revenue, Completed Orders
 *    - (Pixel Event & Live Sync এখান থেকে বাদ দিয়ে User Activity শিটে স্থানান্তর করা হয়েছে)
 * 2. "User Activity" (বা "Visitors")
 *    - KPI Cards: Total Visitors, Total Purchases, Live Real-time Sync
 *    - Header & Banners: Session ID, Last Updated, Time Spent, Selected Products, Order Completed?,
 *      Pixel Event, Customer Phone, FB Click ID, FB Browser ID, FB Cookie ID, Campaign, Ad Content,
 *      Device, Traffic Source, Landing Page URL
 * 3. "Pixel Data"
 *    - Meta / Facebook Pixel Events Log
 * 4. "Monthly Report"
 *    - Date-wise Automated Summary & Performance
 *
 * 🔄 One-Click Remote Design Sync:
 * ব্রাউজার বা এডমিন প্যানেল থেকে শুধুমাত্র ১ ক্লিকে পুরো গুগল শিটের ডিজাইন ফরম্যাট আপডেট হবে!
 * কোনো কোড কপি-পেস্ট করতে হবে না।
 * =========================================================================
 */

// শিট ট্যাবের নামসমূহ
var TAB_ORDERS = typeof TAB_ORDERS !== "undefined" ? TAB_ORDERS : "Orders";
var TAB_ACTIVITY = typeof TAB_ACTIVITY !== "undefined" ? TAB_ACTIVITY : "User Activity";
var TAB_PIXEL = typeof TAB_PIXEL !== "undefined" ? TAB_PIXEL : "Pixel Data";
var TAB_MONTHLY = typeof TAB_MONTHLY !== "undefined" ? TAB_MONTHLY : "Monthly Report";

// ১. Orders শিটের কলাম হেডার
var HEADERS_ORDER = [
  "Order ID",
  "Date & Time",
  "Customer Name",
  "Phone Number",
  "District / Area",
  "Full Address",
  "Ordered Products",
  "Total Items (Qty)",
  "Products Subtotal",
  "Delivery Method",
  "Delivery Charge",
  "Grand Total Bill",
  "Customer Note",
  "Order Status"
];

// ২. User Activity শিটের কলাম হেডার (আপনার পাঠানো রেফারেন্স ছবির সাথে হুবহু মিল)
var HEADERS_ACTIVITY = [
  "Session ID",
  "Last Updated",
  "Time Spent",
  "Selected Products",
  "Order Completed?",
  "Pixel Event",
  "Customer Phone",
  "FB Click ID (fbclid)",
  "FB Browser ID (_fbp)",
  "FB Cookie ID (_fbc)",
  "Campaign Name",
  "Ad Content",
  "Device",
  "Traffic Source",
  "Landing Page URL"
];

// ৩. Pixel Data শিটের কলাম হেডার
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

// ৪. Monthly Report শিটের কলাম হেডার
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
 * গুগল শিট মেনু
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("✨ ASCHII SOLUTION CRM")
      .addItem("🔄 Format & Sync All Sheet Designs", "formatAllSheetsDesign")
      .addItem("🛒 Format Orders Sheet", "formatOrdersSheetDesign")
      .addItem("👥 Format User Activity Sheet", "formatActivitySheetDesign")
      .addItem("📊 Refresh Monthly Report", "updateMonthlyReportTab")
      .addSeparator()
      .addSubMenu(ui.createMenu("📅 Date-wise Filters (অর্ডার ফিল্টার)")
        .addItem("📌 আজকের অর্ডার (Today's Orders)", "filterTodayOrders")
        .addItem("📌 গতকালের অর্ডার (Yesterday's Orders)", "filterYesterdayOrders")
        .addItem("📌 চলতি মাসের অর্ডার (This Month)", "filterThisMonthOrders")
        .addSeparator()
        .addItem("🔄 সব অর্ডার দেখুন (Clear Filter)", "clearOrderFilters"))
      .addToUi();
  } catch (e) {}
}

/**
 * GET রিকোয়েস্ট:
 * ১. টেস্ট কানেকশন
 * ২. রিমোট সিঙ্ক বাটন থেকে ১ ক্লিকে পুরো গুগল শিট ডিজাইন আপডেট (?action=sync_design বা ?action=format)
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || "ping";
    var targetUrl = e && e.parameter && e.parameter.sheetUrl;
    var ss = getSpreadsheet_(targetUrl);

    // ১-ক্লিক রিমোট শিট ডিজাইন সিঙ্ক (No code paste required!)
    if (action === "sync_design" || action === "format" || action === "init_tabs" || action === "redesign") {
      var res = formatAllSheetsDesign(ss);
      return jsonResponse_({
        success: true,
        message: "🎉 অভিনন্দন! আপনার গুগল শিটের সকল ডিজাইন ফরম্যাট সফলভাবে আপডেট ও সিঙ্ক হয়েছে!",
        details: res,
        timestamp: new Date().toISOString()
      });
    }

    if (action === "test" || action === "ping") {
      return jsonResponse_({
        success: true,
        message: "গুগল শিট API কানেকশন সক্রিয় ও কার্যকর আছে!",
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
      message: "ASCHII SOLUTION CRM API চালু আছে।",
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
 * POST রিকোয়েস্ট: অর্ডার ও ভিজিটর এক্টিভিটি গ্রহণ
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    var raw = (e && e.postData && e.postData.contents) || "{}";
    var data = JSON.parse(raw);

    var ss = getSpreadsheet_(data.sheetUrl);
    var now = new Date();
    var dateStr = Utilities.formatDate(now, "Asia/Dhaka", "dd-MMM-yyyy hh:mm a");
    var type = (data.type || data.action || "").toLowerCase();

    // ১. User Activity ট্র্যাকিং লগ
    if (type === "track" || type === "activity" || type === "user_activity") {
      return handleUserActivity_(ss, data, dateStr);
    }

    // ২. Pixel Event লগ
    if (type === "pixel" || type === "pixel_event") {
      return handlePixelData_(ss, data, dateStr);
    }

    // ৩. নতুন অর্ডার প্রসেসিং (Orders Tab)
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
 * User Activity সেভ ও আপডেট হ্যান্ডলার
 */
function handleUserActivity_(ss, data, dateStr) {
  var aSheet = getOrCreateSheet_(ss, TAB_ACTIVITY);
  if (aSheet.getLastRow() < 4) {
    formatActivitySheetDesign(aSheet);
  }

  var vId = clean_(data.sessionId || data.visitorId || "-", 60);
  var lastRow = aSheet.getLastRow();
  var updated = false;

  // সেশন থাকলে লাস্ট টাইম ও ইভেন্ট আপডেট করা
  if (lastRow >= 5) {
    var vRange = aSheet.getRange(5, 1, Math.min(lastRow - 4, 300), 1).getValues();
    for (var r = vRange.length - 1; r >= 0; r--) {
      if (vRange[r][0] === vId) {
        var targetRow = r + 5;
        aSheet.getRange(targetRow, 2).setValue(dateStr);
        aSheet.getRange(targetRow, 3).setValue(clean_(data.stayTime || data.timeSpent || "১ মিনিট", 60));
        if (data.selectedProducts) aSheet.getRange(targetRow, 4).setValue(clean_(data.selectedProducts, 250));
        if (data.ordered) aSheet.getRange(targetRow, 5).setValue(clean_(data.ordered, 60));
        if (data.pixelEvent) aSheet.getRange(targetRow, 6).setValue(clean_(data.pixelEvent, 60));
        if (data.phone) aSheet.getRange(targetRow, 7).setValue("'" + clean_(data.phone, 30));
        updated = true;
        break;
      }
    }
  }

  if (!updated) {
    aSheet.appendRow([
      vId,
      dateStr,
      clean_(data.stayTime || data.timeSpent || "১ মিনিট", 60),
      clean_(data.selectedProducts || "কোনো পণ্য সিলেক্ট করেনি", 250),
      clean_(data.ordered || "না (শুধু ভিজিট)", 60),
      clean_(data.pixelEvent || "PageView", 60),
      clean_(data.phone ? "'" + data.phone : "দেয়নি", 30),
      clean_(data.fbclid || "নাই", 160),
      clean_(data.fbp || "নাই", 100),
      clean_(data.fbc || "নাই", 120),
      clean_(data.campaign || "নাই", 120),
      clean_(data.adContent || "নাই", 120),
      clean_(data.device || "Desktop", 40),
      clean_(data.source || "Direct Visit", 120),
      clean_(data.pageUrl || "", 300)
    ]);
    formatActivityRow_(aSheet, aSheet.getLastRow());
  }

  return jsonResponse_({ success: true, type: "activity", message: "User Activity Recorded" });
}

/**
 * Pixel Data হ্যান্ডলার
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
    clean_(data.productOrValue || data.value || "-", 100),
    clean_(data.visitorId || data.sessionId || "-", 60),
    clean_(data.device || "Desktop", 40),
    clean_(data.browser || "-", 40),
    clean_(data.utmSource || data.source || "-", 80),
    clean_(data.utmCampaign || data.campaign || "-", 100),
    dateStr
  ]);
  formatBasicDataRow_(pSheet, pSheet.getLastRow(), HEADERS_PIXEL.length);

  return jsonResponse_({ success: true, type: "pixel", message: "Pixel Recorded" });
}

/**
 * New Order হ্যান্ডলার (Orders Tab)
 */
function handleNewOrder_(ss, data, dateStr) {
  var oSheet = getOrCreateSheet_(ss, TAB_ORDERS);
  if (oSheet.getLastRow() < 4) {
    formatOrdersSheetDesign(oSheet);
  }

  // ফোন নাম্বার ডুপ্লিকেট কুলডাউন চেক
  var phone = clean_(data.phone || "", 20);
  if (phone) {
    var cache = CacheService.getScriptCache();
    var lastId = cache.get("ord_lock_" + phone);
    if (lastId && !data.bypassDuplicateCheck) {
      return jsonResponse_({
        success: false,
        duplicate: true,
        orderId: lastId,
        error: "আপনি ইতোমধ্যে একটি অর্ডার সম্পন্ন করেছেন (অর্ডার আইডি: " + lastId + ")। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।"
      });
    }
  }

  var orderId = data.orderId || nextCustomOrderId_("HN");
  var custName = clean_(data.name || data.customerName || "Customer", 100);
  var district = clean_(data.district || "-", 80);
  var address = clean_(data.address || "-", 350);
  var itemsStr = clean_(data.itemsSummary || (Array.isArray(data.items) ? data.items.map(function(i){ return (i.name||i.id) + " x " + (i.qty||1); }).join("\n") : "General Order"), 300);
  var totalQty = Number(data.totalQty || (Array.isArray(data.items) ? data.items.reduce(function(acc,cur){ return acc + (cur.qty||1); }, 0) : 1));
  var subtotal = Number(data.subtotal || data.clientTotal || 0);
  var shippingMethod = clean_(data.shippingLabel || (data.shippingId === "outside" ? "ঢাকার বাইরে" : "ঢাকার ভিতরে"), 80);
  var shippingCharge = Number(data.shippingCharge !== undefined ? data.shippingCharge : (data.shippingId === "outside" ? 120 : 60));
  var grandTotal = Number(data.clientTotal || data.total || (subtotal + shippingCharge));
  var note = clean_(data.note || "কোনো নোট নেই", 250);
  var status = data.status || "New";

  oSheet.appendRow([
    orderId,
    dateStr,
    custName,
    "'" + phone,
    district,
    address,
    itemsStr,
    totalQty,
    subtotal,
    shippingMethod,
    shippingCharge,
    grandTotal,
    note,
    status
  ]);
  formatOrderDataRow_(oSheet, oSheet.getLastRow());

  if (phone) {
    try {
      CacheService.getScriptCache().put("ord_lock_" + phone, orderId, 300);
    } catch (ce) {}
  }

  // User Activity শিটে অর্ডার স্ট্যাটাস আপডেট করা
  try {
    var aSheet = ss.getSheetByName(TAB_ACTIVITY);
    if (aSheet && data.sessionId) {
      var lastR = aSheet.getLastRow();
      if (lastR >= 5) {
        var ids = aSheet.getRange(5, 1, lastR - 4, 1).getValues();
        for (var i = ids.length - 1; i >= 0; i--) {
          if (ids[i][0] === data.sessionId) {
            aSheet.getRange(i + 5, 5).setValue("হ্যাঁ (" + orderId + ")");
            aSheet.getRange(i + 5, 6).setValue("Purchase");
            aSheet.getRange(i + 5, 7).setValue("'" + phone);
            break;
          }
        }
      }
    }
  } catch (ae) {}

  // Monthly Report আপডেট
  try {
    updateMonthlyReportTab(ss);
  } catch (mErr) {}

  return jsonResponse_({
    success: true,
    orderId: orderId,
    total: grandTotal,
    message: "অর্ডারটি সফলভাবে গুগল শিটে সংরক্ষণ করা হয়েছে!"
  });
}

/**
 * =========================================================================
 * ৩টি প্রধান শিট ডিজাইন ফরম্যাট (Modern Header, KPI Dashboard, Side Banners)
 * =========================================================================
 */

/**
 * ১ ক্লিকে সকল শিটের ডিজাইন সাজানো
 */
function formatAllSheetsDesign(optSs) {
  var ss = optSs || getSpreadsheet_();
  formatOrdersSheetDesign(ss);
  formatActivitySheetDesign(ss);
  formatPixelSheetDesign(ss);
  formatMonthlySheetDesign(ss);
  updateMonthlyReportTab(ss);
  SpreadsheetApp.flush();
  return "সকল শিটের ডিজাইন ফরম্যাট সফলভাবে সিঙ্ক ও আপডেট হয়েছে!";
}

/**
 * ১. ORDERS SHEET DESIGN (Pixel Event & Live Sync বাদ দিয়ে ৩টি ক্লিন KPI কার্ড রাখা হয়েছে)
 */
function formatOrdersSheetDesign(optSheetOrSs) {
  var sheet = getSheetFromParam_(optSheetOrSs, TAB_ORDERS);
  var numCols = HEADERS_ORDER.length; // 14
  var existing = extractExistingRows_(sheet, numCols);

  try { var f = sheet.getFilter(); if (f) f.remove(); } catch(e) {}
  sheet.setFrozenRows(0);
  sheet.clear();

  // কলাম প্রস্থ
  var colWidths = [120, 150, 170, 130, 130, 240, 240, 85, 120, 130, 110, 140, 180, 120];
  for (var w = 0; w < colWidths.length; w++) {
    sheet.setColumnWidth(w + 1, colWidths[w]);
  }

  // রো ১: মডার্ন হোয়াইট ব্র্যান্ডিং ব্যানার (Height: 36px)
  sheet.setRowHeight(1, 36);
  var b1 = sheet.getRange(1, 1, 1, numCols);
  b1.merge()
    .setBackground("#FFFFFF")
    .setFontColor("#0F172A")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle")
    .setValue("  🌐 ASCHII SOLUTION • Orders & Customer CRM  •  Real-time Order Management");
  sheet.getRange("A1").setFontWeight("bold").setFontSize(11);

  // রো ২: ৩টি ক্লিন KPI কার্ড (A2:D2, E2:I2, J2:N2) - Pixel Event & Live Sync এখানে নেই!
  sheet.setRowHeight(2, 46);

  // কার্ড ১: Total Orders
  var k1 = sheet.getRange("A2:D2");
  k1.merge()
    .setBackground("#F8FAFC")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("A2").setFormula('="🛒 Total Orders" & CHAR(10) & IFERROR(COUNTA(A5:A), 0) & "  (Live)"')
    .setFontWeight("bold").setFontSize(10.5).setFontColor("#0F172A");

  // কার্ড ২: Total Revenue
  var k2 = sheet.getRange("E2:I2");
  k2.merge()
    .setBackground("#F0FDF4")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#BBF7D0", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("E2").setFormula('="💵 Total Revenue" & CHAR(10) & "৳ " & TEXT(IFERROR(SUM(L5:L), 0), "#,##0")')
    .setFontWeight("bold").setFontSize(10.5).setFontColor("#15803D");

  // কার্ড ৩: Completed Orders
  var k3 = sheet.getRange("J2:N2");
  k3.merge()
    .setBackground("#FEFCE8")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#FEF08A", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("J2").setFormula('="📊 Completed Orders" & CHAR(10) & IFERROR(COUNTIF(N5:N, "Delivered") + COUNTIF(N5:N, "Completed") + COUNTIF(N5:N, "Shipped"), 0) & "  (" & IFERROR(TEXT((COUNTIF(N5:N, "Delivered") + COUNTIF(N5:N, "Completed") + COUNTIF(N5:N, "Shipped")) / MAX(1, COUNTA(A5:A)), "0%"), "0%") & ")"')
    .setFontWeight("bold").setFontSize(10.5).setFontColor("#A16207");

  // রো ৩: ডিপ এমারেল্ড ব্যানার (A3:N3)
  sheet.setRowHeight(3, 30);
  var b3 = sheet.getRange(3, 1, 1, numCols);
  b3.merge()
    .setBackground("#0D4A47")
    .setFontColor("#FFFFFF")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(11)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setValue("Customer & Order Details (ASCHII SOLUTION CRM)");

  // রো ৪: কলাম হেডার (Row Height: 34px)
  sheet.setRowHeight(4, 34);
  sheet.getRange(4, 1, 1, numCols).setValues([HEADERS_ORDER])
    .setBackground("#F1F5F9")
    .setFontColor("#1E293B")
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

  return sheet;
}

/**
 * ২. USER ACTIVITY SHEET DESIGN (আপনার স্ক্রিনশট অনুযায়ী হুবহু তৈরি: Total Visitors, Purchases, Live Sync)
 */
function formatActivitySheetDesign(optSheetOrSs) {
  var sheet = getSheetFromParam_(optSheetOrSs, TAB_ACTIVITY);
  var numCols = HEADERS_ACTIVITY.length; // 15
  var existing = extractExistingRows_(sheet, numCols);

  try { var f = sheet.getFilter(); if (f) f.remove(); } catch(e) {}
  sheet.setFrozenRows(0);
  sheet.clear();

  // কলামের নিখুঁত প্রস্থ
  var widths = [150, 160, 130, 240, 150, 130, 140, 190, 170, 170, 150, 150, 100, 140, 240];
  for (var w = 0; w < widths.length; w++) {
    sheet.setColumnWidth(w + 1, widths[w]);
  }

  // রো ১ ও ২: ডার্ক নেভি ব্র্যান্ডিং + ৩টি KPI কার্ড (Total Visitors, Purchases, Live Sync)
  sheet.setRowHeight(1, 38);
  sheet.setRowHeight(2, 34);

  // ব্র্যান্ডিং কার্ড (A1:D2 - Dark Navy)
  var brand = sheet.getRange("A1:D2");
  brand.merge()
    .setBackground("#0F172A")
    .setFontColor("#FFFFFF")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setValue("🌐 ASCHII SOLUTION • Real-time Visitors Tracker\nLive Facebook Pixel & Visitor Traffic Dashboard");
  sheet.getRange("A1").setFontWeight("bold").setFontSize(11);

  // KPI ১: Total Visitors (E1:H2)
  var kpi1 = sheet.getRange("E1:H2");
  kpi1.merge()
    .setBackground("#EFF6FF")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#BFDBFE", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("E1").setFormula('="👥 Total Visitors" & CHAR(10) & IFERROR(COUNTA(A5:A), 0)')
    .setFontWeight("bold").setFontSize(11).setFontColor("#1D4ED8");

  // KPI ২: Purchases (I1:L2)
  var kpi2 = sheet.getRange("I1:L2");
  kpi2.merge()
    .setBackground("#F0FDF4")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#BBF7D0", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("I1").setFormula('="🎯 Purchases" & CHAR(10) & IFERROR(COUNTIF(F5:F, "Purchase") + COUNTIF(E5:E, "*হ্যাঁ*"), 0)')
    .setFontWeight("bold").setFontSize(11).setFontColor("#166534");

  // KPI ৩: Live Sync (M1:O2)
  var kpi3 = sheet.getRange("M1:O2");
  kpi3.merge()
    .setBackground("#FEFCE8")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#FEF08A", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("M1").setFormula('="📅 Live Sync" & CHAR(10) & TEXT(NOW(), "mmm dd, yyyy hh:mm AM/PM")')
    .setFontWeight("bold").setFontSize(10).setFontColor("#854D0E");

  // রো ৩: ডিপ ইন্ডিগো ব্যানার (A3:O3)
  sheet.setRowHeight(3, 30);
  var banner = sheet.getRange("A3:O3");
  banner.merge()
    .setBackground("#1E1B4B")
    .setFontColor("#FFFFFF")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(10.5)
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle")
    .setValue("  </> Live Visitor Sessions & Facebook Pixel Events Data (fbclid, _fbp, _fbc & UTM)");

  // রো ৪: পার্পল অ্যাকসেন্ট হেডার (Row Height: 34px)
  sheet.setRowHeight(4, 34);
  sheet.getRange(4, 1, 1, numCols).setValues([HEADERS_ACTIVITY])
    .setBackground("#EDE9FE")
    .setFontColor("#312E81")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, true, true, "#C7D2FE", SpreadsheetApp.BorderStyle.SOLID);

  if (existing.length > 0) {
    sheet.getRange(5, 1, existing.length, numCols).setValues(existing);
  }

  sheet.setFrozenRows(4);
  var lastR = Math.max(5, sheet.getLastRow());
  try { sheet.getRange(4, 1, lastR, numCols).createFilter(); } catch(e) {}

  for (var r = 5; r <= lastR; r++) {
    formatActivityRow_(sheet, r);
  }

  return sheet;
}

/**
 * ৩. PIXEL DATA SHEET DESIGN
 */
function formatPixelSheetDesign(optSheetOrSs) {
  var sheet = getSheetFromParam_(optSheetOrSs, TAB_PIXEL);
  var numCols = HEADERS_PIXEL.length;
  var existing = extractExistingRows_(sheet, numCols);

  try { var f = sheet.getFilter(); if (f) f.remove(); } catch(e) {}
  sheet.setFrozenRows(0);
  sheet.clear();

  var widths = [140, 140, 240, 150, 140, 100, 100, 130, 140, 150];
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
 * ৪. MONTHLY REPORT SHEET DESIGN
 */
function formatMonthlySheetDesign(optSheetOrSs) {
  var sheet = getSheetFromParam_(optSheetOrSs, TAB_MONTHLY);
  var numCols = HEADERS_MONTHLY.length;
  var existing = extractExistingRows_(sheet, numCols);

  try { var f = sheet.getFilter(); if (f) f.remove(); } catch(e) {}
  sheet.setFrozenRows(0);
  sheet.clear();

  var widths = [130, 120, 120, 120, 140, 130, 130];
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
    .setValue("📊 ASCHII CRM • Monthly Sales & Conversion Summary");

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
 * রো ফরম্যাটিং হেল্পারস
 */
function formatOrderDataRow_(sheet, rowIndex) {
  try {
    sheet.setRowHeight(rowIndex, 32);
    var range = sheet.getRange(rowIndex, 1, 1, HEADERS_ORDER.length);
    range.setFontFamily("Segoe UI").setFontSize(10).setVerticalAlignment("middle")
      .setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);

    range.setBackground(rowIndex % 2 === 0 ? "#FFFFFF" : "#F8FAFC");
    sheet.getRange(rowIndex, 1).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange(rowIndex, 2).setHorizontalAlignment("center");
    sheet.getRange(rowIndex, 4).setHorizontalAlignment("center").setNumberFormat("@");
    sheet.getRange(rowIndex, 8).setHorizontalAlignment("center");
    sheet.getRange(rowIndex, 9).setNumberFormat('"৳"#,##0');
    sheet.getRange(rowIndex, 11).setNumberFormat('"৳"#,##0');
    sheet.getRange(rowIndex, 12).setNumberFormat('"৳"#,##0').setFontWeight("bold");
    sheet.getRange(rowIndex, 14).setHorizontalAlignment("center").setFontWeight("bold");
  } catch (e) {}
}

function formatActivityRow_(sheet, rowIndex) {
  try {
    sheet.setRowHeight(rowIndex, 32);
    var range = sheet.getRange(rowIndex, 1, 1, HEADERS_ACTIVITY.length);
    range.setFontFamily("Segoe UI").setFontSize(10).setVerticalAlignment("middle")
      .setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);

    range.setBackground(rowIndex % 2 === 0 ? "#FFFFFF" : "#F8FAFC");
    sheet.getRange(rowIndex, 1).setHorizontalAlignment("center").setFontWeight("bold").setNumberFormat("@");
    sheet.getRange(rowIndex, 2).setHorizontalAlignment("center");
    sheet.getRange(rowIndex, 3).setHorizontalAlignment("center");
    sheet.getRange(rowIndex, 5).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange(rowIndex, 6).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange(rowIndex, 7).setHorizontalAlignment("center").setNumberFormat("@");
    sheet.getRange(rowIndex, 13).setHorizontalAlignment("center");
    sheet.getRange(rowIndex, 14).setHorizontalAlignment("center");
  } catch (e) {}
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
 * Monthly Report ডেটা হিসাব ও আপডেট
 */
function updateMonthlyReportTab(optSs) {
  var ss = optSs || getSpreadsheet_();
  var oSheet = ss.getSheetByName(TAB_ORDERS);
  var aSheet = ss.getSheetByName(TAB_ACTIVITY);
  var mSheet = getOrCreateSheet_(ss, TAB_MONTHLY);

  var orders = [];
  if (oSheet && oSheet.getLastRow() >= 5) {
    orders = oSheet.getRange(5, 1, oSheet.getLastRow() - 4, HEADERS_ORDER.length).getValues();
  }

  var visitorsCount = aSheet && aSheet.getLastRow() >= 5 ? aSheet.getLastRow() - 4 : 0;
  var map = {};

  for (var i = 0; i < orders.length; i++) {
    var row = orders[i];
    var rawDate = String(row[1] || "");
    var day = rawDate.split(" ")[0] || Utilities.formatDate(new Date(), "Asia/Dhaka", "dd-MMM-yyyy");
    if (!map[day]) {
      map[day] = { orders: 0, contacts: 0, revenue: 0, completed: 0, pending: 0 };
    }
    var total = Number(row[11] || 0);
    var status = String(row[13] || "New").toLowerCase();

    map[day].orders++;
    map[day].revenue += total;

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
      map[k].completed,
      map[k].pending
    ]);
  }

  if (rows.length > 0) {
    var currentLast = mSheet.getLastRow();
    if (currentLast >= 3) {
      mSheet.getRange(3, 1, currentLast - 2, HEADERS_MONTHLY.length).clearContent();
    }
    mSheet.getRange(3, 1, rows.length, HEADERS_MONTHLY.length).setValues(rows);
    for (var r = 3; r < 3 + rows.length; r++) {
      formatBasicDataRow_(mSheet, r, HEADERS_MONTHLY.length);
    }
  }
}

/**
 * ফিল্টার হেল্পার্স
 */
function filterTodayOrders() {
  applyOrderDateFilter_(Utilities.formatDate(new Date(), "Asia/Dhaka", "dd-MMM-yyyy"));
}

function filterYesterdayOrders() {
  var d = new Date(); d.setDate(d.getDate() - 1);
  applyOrderDateFilter_(Utilities.formatDate(d, "Asia/Dhaka", "dd-MMM-yyyy"));
}

function filterThisMonthOrders() {
  applyOrderDateFilter_(Utilities.formatDate(new Date(), "Asia/Dhaka", "MMM-yyyy"));
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
  filter.setColumnFilterCriteria(2, criteria); // Column 2 is Date & Time
}

/**
 * ইউটিলিটি ফাংশনস
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
  if (param && typeof param.getRange === "function") {
    return param;
  }
  var ss = param || getSpreadsheet_();
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
  var totalVisitors = aSheet && aSheet.getLastRow() >= 5 ? aSheet.getLastRow() - 4 : 0;
  return {
    totalOrders: totalOrders,
    totalVisitors: totalVisitors
  };
}
