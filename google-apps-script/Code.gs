/**
 * =========================================================================
 * খাঁটি মধু ও প্রিমিয়াম হানি নাট – ব্যাকএন্ড (Code.gs)
 * ASCHII SOLUTION • Facebook Pixel & Order CRM
 * =========================================================================
 * 
 * 📌 করণীয় (৩টি সহজ ধাপ):
 * ১. নিচের SPREADSHEET_ID তে আপনার গুগল শিটের সম্পূর্ণ লিংকটি দিন।
 * ২. উপরে Save (💾) করে Deploy ➔ New deployment এ যান:
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Deploy বাটনে ক্লিক করে পারমিশন Allow দিন।
 * ৩. প্রাপ্ত Web app URL (/exec লিংক) কপি করে js/config.js এর apiEndpoint এ বসিয়ে দিন।
 * =========================================================================
 */

/* =========================================================================
   ১. গুগল শিট লিংক সেটিংস (GOOGLE SHEET SETTINGS)
   =========================================================================
   💡 সহজ সুবিধা:
   শিট লিংক পরিবর্তন করতে আলাদা "Config.gs" ফাইলে যান।
   যদি আলাদা Config.gs ফাইল না থাকে তবে নিচের ডিফল্ট ভ্যালু কাজ করবে।
   ========================================================================= */

if (typeof SPREADSHEET_ID === "undefined" || !SPREADSHEET_ID) {
  var SPREADSHEET_ID = "https://docs.google.com/spreadsheets/d/1Ehh9d1jxOlEC2Szg9bsU8S-fGPQ-qPRApas0ItsG120/edit?gid=0#gid=0";
}
if (typeof SHEET_NAME === "undefined" || !SHEET_NAME) {
  var SHEET_NAME = "Orders";
}
if (typeof CURRENCY === "undefined" || !CURRENCY) {
  var CURRENCY = "৳";
}
if (typeof TRACKING_SPREADSHEET_ID === "undefined") {
  var TRACKING_SPREADSHEET_ID = "";
}
if (typeof TRACKING_SHEET_NAME === "undefined" || !TRACKING_SHEET_NAME) {
  var TRACKING_SHEET_NAME = "Visitors";
}

/* =========================================================================
   ২. পণ্যের তালিকা ও মূল্য নির্ধারণ (PRODUCTS & PRICES)
   =========================================================================
   - এখানে মধু এবং হানি নাটের বিভিন্ন সাইজের মূল্য নির্ধারণ করুন।
   - ওয়েবসাইটের js/config.js ফাইলের সাথে এই আইডি (id) এবং দাম (price) মিল থাকতে হবে।
   - Server-side verification: কাস্টমার ওয়েবসাইট থেকে যাই পাঠাক, এখানে দেওয়া দামেই হিসাব হবে।
*/
var PRODUCTS_CONFIG = {
  // --- খাঁটি মধু (Pure Honey) ---
  m500: {
    id: "m500",
    name: "খাঁটি সুন্দরবন মধু (৫০০ গ্রাম)",
    category: "honey",
    weight: "500g",
    price: 650,
    regularPrice: 750,
  },
  m1000: {
    id: "m1000",
    name: "খাঁটি সুন্দরবন মধু (১ কেজি)",
    category: "honey",
    weight: "1kg",
    price: 1200,
    regularPrice: 1400,
  },
  m2000: {
    id: "m2000",
    name: "খাঁটি সুন্দরবন মধু (২ কেজি ফ্যামিলি প্যাক)",
    category: "honey",
    weight: "2kg",
    price: 2300,
    regularPrice: 2800,
  },

  // --- প্রিমিয়াম হানি নাট (Premium Honey Nut) ---
  hn500: {
    id: "hn500",
    name: "প্রিমিয়াম হানি নাট (৫০০ গ্রাম)",
    category: "honeynut",
    weight: "500g",
    price: 750,
    regularPrice: 850,
  },
  hn1000: {
    id: "hn1000",
    name: "প্রিমিয়াম হানি নাট (১ কেজি)",
    category: "honeynut",
    weight: "1kg",
    price: 1400,
    regularPrice: 1650,
  },
  hn2000: {
    id: "hn2000",
    name: "প্রিমিয়াম হানি নাট (২ কেজি মেগা প্যাক)",
    category: "honeynut",
    weight: "2kg",
    price: 2700,
    regularPrice: 3300,
  },
};

/* =========================================================================
   ৩. ডেলিভারি চার্জ ও শিপিং সেটিংস (SHIPPING & DELIVERY CHARGES)
   =========================================================================
*/
var SHIPPING_CONFIG = {
  dhaka: {
    id: "dhaka",
    label: "ঢাকার ভিতরে",
    charge: 70,
  },
  sub: {
    id: "sub",
    label: "ঢাকার আশেপাশে (সাভার, কেরানীগঞ্জ, গাজীপুর, নারায়ণগঞ্জ)",
    charge: 100,
  },
  outside: {
    id: "outside",
    label: "ঢাকার বাইরে (সারাদেশ)",
    charge: 130,
  },
};

// ফ্রি ডেলিভারি অফার: কত টাকার বেশি কিনলে ডেলিভারি চার্জ ফ্রি (০ টাকা) হবে?
var FREE_SHIPPING_MIN_TOTAL = 0;

// একজন কাস্টমার প্রতিটি পণ্য সর্বোচ্চ কত পিস অর্ডার করতে পারবে
var MAX_QTY_PER_ITEM = 20;

/* =========================================================================
   ৪. ফ্রড এলার্ট ও স্প্যাম প্রতিরোধ সেটিংস (FRAUD & SPAM PROTECTION)
   =========================================================================
*/
var FRAUD_PROTECTION = {
  enabled: true,
  cooldownMinutes: 15,
};

/* =========================================================================
   ৫. গুগল শিটের কলাম হেডার (SHEET TABLE HEADERS - ASCHII SOLUTION CRM)
   =========================================================================
   - বাম পাশ (Left Side): অর্ডার ও কাস্টমার সম্পর্কিত তথ্য (১৪টি কলাম)
   - ডান পাশ (Right Side): ফেসবুক পিক্সেল ও ট্র্যাকিং সম্পর্কিত তথ্য (১০টি কলাম)
   - মোট ২৪টি কলাম পাশাপাশি সাজানো থাকে।
*/
var ORDER_HEADERS = [
  "Order ID",           // ১. অর্ডার নম্বর (যেমন: HN-261026-0001)
  "Date & Time",        // ২. অর্ডার করার তারিখ ও সময়
  "Customer Name",      // ৩. কাস্টমারের নাম
  "Phone Number",       // ৪. মোবাইল নাম্বার
  "District / Area",    // ৫. জেলা / এলাকা
  "Full Address",       // ৬. সম্পূর্ণ ঠিকানা
  "Ordered Products",   // ৭. কি কি পণ্য অর্ডার করেছে এবং কত পিস
  "Total Items (Qty)",  // ৮. সর্বমোট পণ্যের সংখ্যা
  "Products Subtotal",  // ৯. পণ্যের মোট দাম
  "Delivery Method",    // ১০. ডেলিভারি এলাকা
  "Delivery Charge",    // ১১. ডেলিভারি চার্জ
  "Grand Total Bill",   // ১২. সর্বমোট বিল (Subtotal + Delivery Charge)
  "Customer Note",      // ১৩. কাস্টমারের বিশেষ নির্দেশনা
  "Order Status",       // ১৪. অর্ডারের অবস্থা (New / Processing / Delivered / Cancelled)
];

var PIXEL_HEADERS = [
  "FB Click ID (fbclid)", // ১৫. ফেসবুক অ্যাড ক্লিক আইডি
  "FB Browser ID (_fbp)", // ১৬. ফেসবুক পিক্সেল ব্রাউজার আইডি (_fbp)
  "FB Cookie ID (_fbc)",  // ১৭. ফেসবুক পিক্সেল ক্লিক কুকি আইডি (_fbc)
  "Pixel Event",          // ১৮. পিক্সেল ইভেন্ট (Purchase / AddToCart / InitiateCheckout)
  "Campaign Name",        // ১৯. ফেসবুক ক্যাম্পেইন নাম (utm_campaign)
  "Ad Content",           // ২০. বিজ্ঞাপন কনটেন্ট / অডিয়েন্স (utm_content)
  "Traffic Source",       // ২১. ভিজিটর সোর্স / UTM প্যারামিটার
  "Session ID",           // ২২. ভিজিটর সেশন আইডি
  "Time Spent",           // ২৩. পেজে অবস্থানের সময়
  "Landing Page URL"      // ২৪. ল্যান্ডিং পেজের সম্পূর্ণ লিংক
];

// সর্বমোট ২৪টি কলাম
var HEADERS = ORDER_HEADERS.concat(PIXEL_HEADERS);

// সেশন ও ভিজিটর বিহেভিয়ার ট্র্যাকিং টেবিল হেডার (Visitors Tab)
var TRACKING_HEADERS = [
  "Session ID",           // অনন্য সেশন আইডি
  "Last Updated",         // শেষ আপডেট সময়
  "Time Spent",           // পেইজে কতক্ষণ ছিল
  "Selected Products",    // চেকআউটে আনা বা সিলেক্ট করা পণ্য
  "Order Completed?",     // অর্ডার করেছে কি না (হ্যাঁ / না)
  "Pixel Event",          // সর্বশেষ ফেসবুক পিক্সেল ইভেন্ট
  "Customer Phone",       // মোবাইল নাম্বার
  "FB Click ID (fbclid)", // ফেসবুক অ্যাডস ক্লিক আইডি
  "FB Browser ID (_fbp)", // ফেসবুক পিক্সেল ব্রাউজার কুকি (_fbp)
  "FB Cookie ID (_fbc)",  // ফেসবুক পিক্সেল ক্লিক কুকি (_fbc)
  "Campaign Name",        // ক্যাম্পেইন নাম (utm_campaign)
  "Ad Content",           // বিজ্ঞাপন বা অডিয়েন্স ক্রিয়েটিভ (utm_content)
  "Device",               // ডিভাইস (Mobile / Desktop)
  "Traffic Source",       // ভিজিটর কোথা থেকে এসেছে (Facebook Ads / Google / Direct)
  "Landing Page URL"      // পেজের সম্পূর্ণ লিংক
];

/* =========================================================================
   ৬. কোর ব্যাকএন্ড কোড (CORE BACKEND LOGIC)
   ========================================================================= */

// গুগল শিট ওপেন করলে ওপরে সরাসরি "✨ ASCHII SOLUTION" মেনু যুক্ত হবে
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("✨ ASCHII SOLUTION")
      .addItem("🎨 Redesign Sheet (Modern Dashboard)", "redesignOrderSheetUI")
      .addItem("📊 Refresh KPI Cards & Formulas", "formatOrderSheetDesign")
      .addSeparator()
      .addItem("📱 Format Mobile View Tab", "formatMobileViewSheetDesign")
      .addItem("📑 Format Visitors Tracking Tab", "formatTrackingSheetDesign")
      .addToUi();
  } catch (e) {}
}

// ম্যানুয়াল রান করার ফাংশন
function redesignOrderSheetUI() {
  var msg = formatOrderSheetDesign();
  try {
    SpreadsheetApp.getUi().alert("সফলতা!", msg, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {}
  return msg;
}

// API টেস্ট করার ফাংশন
function doGet(e) {
  try {
    var sheet = getSheet_();
    var ss = sheet.getParent();

    // ব্রাউজার থেকে ?action=format বা ?format=1 বা ?action=redesign দিলে পুরো শিট ডিজাইন অটো-ফরমেট হবে
    var isFormatRequest =
      e &&
      e.parameter &&
      (e.parameter.action === "format" || e.parameter.format === "1" || e.parameter.action === "redesign");
    if (isFormatRequest) {
      formatOrderSheetDesign(sheet);
    }

    if (e && e.parameter && e.parameter.action === "format_tracking") {
      var trkSheet = getTrackingSheet_();
      formatTrackingSheetDesign(trkSheet);
    }

    return json_({
      success: true,
      message: "ASCHII SOLUTION • Honey Order & Facebook Pixel API চালু রয়েছে!",
      connectedSpreadsheetName: ss.getName(),
      connectedSpreadsheetUrl: ss.getUrl(),
      targetTabName: sheet.getName(),
      totalOrdersInSheet: Math.max(0, sheet.getLastRow() - 4),
      fraudProtection: FRAUD_PROTECTION.enabled
        ? "চালু আছে (" + FRAUD_PROTECTION.cooldownMinutes + " মিনিট কুলডাউন)"
        : "বন্ধ",
      visitorTracking: "সফলভাবে চালু আছে (" + (TRACKING_SHEET_NAME || "Visitors") + " ট্যাব)",
      oneClickFormatUrl: ss.getUrl(),
      time: new Date().toISOString(),
    });
  } catch (err) {
    return json_({
      success: false,
      error: "গুগল শিটের সাথে সংযোগে সমস্যা: " + err.message,
    });
  }
}

// ওয়েবসাইট থেকে অর্ডার সাবমিট ও ভিজিটর ট্র্যাকিং গ্রহণ করার ফাংশন
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var rawData = (e && e.postData && e.postData.contents) || "{}";
    var data = JSON.parse(rawData);

    // ★ সেশন ও ভিজিটর বিহেভিয়ার ট্র্যাকিং হ্যান্ডলার
    if (data.action === "track" || data.type === "track") {
      return handleTracking_(data);
    }

    // ১. তথ্য যাচাইকরণ
    var validationError = validateOrder_(data);
    if (validationError) {
      return json_({ success: false, error: validationError });
    }

    var cleanPhone = normPhone_(data.phone);

    // ২. ফ্রড এলার্ট ও ডুপ্লিকেট স্প্যাম প্রটেকশন
    if (FRAUD_PROTECTION && FRAUD_PROTECTION.enabled) {
      var cache = CacheService.getScriptCache();
      var cacheKey = "honey_guard_" + cleanPhone;
      var existingOrderId = cache.get(cacheKey);

      if (existingOrderId) {
        return json_({
          success: false,
          fraudAlert: true,
          error:
            "আপনি ইতিমধ্যে একটি অর্ডার সম্পন্ন করেছেন (অর্ডার নং: " +
            existingOrderId +
            ")। অনুগ্রহ করে " +
            FRAUD_PROTECTION.cooldownMinutes +
            " মিনিট পর পুনরায় চেষ্টা করুন অথবা সরাসরি আমাদের কাস্টমার কেয়ারে কল করুন।",
        });
      }
    }

    // ৩. পণ্য এবং পরিমাণ নির্ধারণ
    var orderedItems = parseOrderedItems_(data);
    if (orderedItems.length === 0) {
      return json_({
        success: false,
        error: "অনুগ্রহ করে কমপক্ষে একটি পণ্য সিলেক্ট করুন।",
      });
    }

    // ৪. পণ্যের মোট মূল্য (Subtotal) হিসাব
    var subtotal = 0;
    var totalQty = 0;
    var itemsSummaryParts = [];

    for (var i = 0; i < orderedItems.length; i++) {
      var itm = orderedItems[i];
      var conf = PRODUCTS_CONFIG[itm.id];
      var lineTotal = conf.price * itm.qty;
      subtotal += lineTotal;
      totalQty += itm.qty;
      itemsSummaryParts.push(
        conf.name + " (" + conf.weight + ") x " + itm.qty + " পিস = " + CURRENCY + lineTotal
      );
    }

    var itemsSummaryString = itemsSummaryParts.join("\n");

    // ৫. ডেলিভারি চার্জ নির্ধারণ
    var shippingKey = data.shippingId || "dhaka";
    var shippingInfo = SHIPPING_CONFIG[shippingKey] || SHIPPING_CONFIG["dhaka"];
    var shippingCharge = shippingInfo.charge;

    // ফ্রি ডেলিভারি অফার চেক
    if (FREE_SHIPPING_MIN_TOTAL > 0 && subtotal >= FREE_SHIPPING_MIN_TOTAL) {
      shippingCharge = 0;
    }

    // ৬. সর্বমোট বিল (Grand Total)
    var grandTotal = subtotal + shippingCharge;

    // ৭. গুগল শিটে অর্ডার সংরক্ষণ (ওয়েবসাইট থেকে নির্দিষ্ট sheetUrl পাঠানো হলে সেখানেই সংরক্ষণ হবে)
    var targetSheetUrl = data.sheetUrl || SPREADSHEET_ID;
    var sheet = getSheet_(targetSheetUrl);
    var orderId = nextOrderId_(sheet);
    var orderDate = Utilities.formatDate(
      new Date(),
      "Asia/Dhaka",
      "dd-MMM-yyyy hh:mm a"
    );

    sheet.appendRow([
      // --- বাম পাশ: অর্ডার তথ্য (Left Side: Order Information) ---
      orderId,                                    // ১. Order ID
      orderDate,                                  // ২. Date & Time
      clean_(data.name, 100),                     // ৩. Customer Name
      "'" + cleanPhone,                           // ৪. Phone Number
      clean_(data.district, 80),                  // ৫. District / Area
      clean_(data.address, 350),                  // ৬. Full Address
      itemsSummaryString,                         // ৭. Ordered Products
      totalQty,                                   // ৮. Total Items (Qty)
      subtotal,                                   // ৯. Products Subtotal
      shippingInfo.label,                         // ১০. Delivery Method
      shippingCharge,                             // ১১. Delivery Charge
      grandTotal,                                 // ১২. Grand Total Bill
      clean_(data.note || "কোনো নোট নেই", 300),   // ১৩. Customer Note
      "New",                                      // ১৪. Order Status

      // --- ডান পাশ: ফেসবুক পিক্সেল তথ্য (Right Side: Facebook Pixel Information) ---
      clean_(data.fbclid || "নাই", 160),          // ১৫. FB Click ID (fbclid)
      clean_(data.fbp || "নাই", 100),             // ১৬. FB Browser ID (_fbp)
      clean_(data.fbc || "নাই", 120),             // ১৭. FB Cookie ID (_fbc)
      clean_(data.pixelEvent || "Purchase", 50),  // ১৮. Pixel Event
      clean_(data.campaign || "নাই", 120),        // ১৯. Campaign Name
      clean_(data.adContent || "নাই", 120),       // ২০. Ad Content
      clean_(data.source || "Direct Visit", 120), // ২১. Traffic Source
      clean_(data.sessionId || "নাই", 100),       // ২২. Session ID
      clean_(data.timeSpent || "১ মিনিট", 60),    // ২৩. Time Spent
      clean_(data.pageUrl || "", 300)             // ২৪. Landing Page URL
    ]);

    SpreadsheetApp.flush();

    // ৮. নতুন সারির ডিজাইন ও প্রফেশনাল ফরম্যাটিং স্বয়ংক্রিয়ভাবে প্রয়োগ করা
    formatSingleRow_(sheet, sheet.getLastRow());

    // ৯. ফ্রড গার্ড ক্যাশে ফোন নাম্বার সংরক্ষণ
    if (FRAUD_PROTECTION && FRAUD_PROTECTION.enabled) {
      try {
        var cooldownSec = Math.max(60, FRAUD_PROTECTION.cooldownMinutes * 60);
        cache.put("honey_guard_" + cleanPhone, orderId, cooldownSec);
      } catch (cacheErr) {}
    }

    // ১০. কাস্টমারের কাছে রেসপন্স পাঠানো
    return json_({
      success: true,
      orderId: orderId,
      subtotal: subtotal,
      deliveryCharge: shippingCharge,
      total: grandTotal,
      itemsCount: totalQty,
      message: "আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!",
    });
  } catch (err) {
    return json_({
      success: false,
      error: "সার্ভারে সাময়িক সমস্যা হয়েছে: " + err.message,
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (x) {}
  }
}

/**
 * রিকোয়েস্ট থেকে অর্ডারকৃত পণ্যের তালিকা পার্স করা
 */
function parseOrderedItems_(d) {
  var items = [];

  if (Array.isArray(d.items) && d.items.length > 0) {
    for (var i = 0; i < d.items.length; i++) {
      var it = d.items[i];
      if (it && it.id && PRODUCTS_CONFIG[it.id]) {
        var q = parseInt(it.qty, 10);
        if (!isNaN(q) && q > 0) {
          items.push({ id: it.id, qty: Math.min(q, MAX_QTY_PER_ITEM) });
        }
      }
    }
  }

  if (items.length === 0 && d.packageId && PRODUCTS_CONFIG[d.packageId]) {
    var qty = parseInt(d.quantity, 10);
    if (!isNaN(qty) && qty > 0) {
      items.push({ id: d.packageId, qty: Math.min(qty, MAX_QTY_PER_ITEM) });
    }
  }

  return items;
}

/**
 * ইনপুট ভ্যালিডেশন
 */
function validateOrder_(d) {
  if (!d) return "কোনো তথ্য পাঠানো হয়নি।";

  var name = (d.name || "").toString().trim();
  if (name.length < 2) return "অনুগ্রহ করে আপনার সঠিক পূর্ণ নাম লিখুন।";
  if (name.length > 100) return "নাম অত্যধিক বড় (সর্বোচ্চ ১০০ অক্ষর)।";

  var rawPhone = (d.phone || "").toString().trim();
  var cleanPhone = normPhone_(rawPhone);
  if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
    return "অনুগ্রহ করে সঠিক ১১ ডিজিটের সচল বাংলাদেশি মোবাইল নাম্বার দিন (যেমন: 017XXXXXXXX)।";
  }

  var district = (d.district || "").toString().trim();
  if (district.length < 2) return "অনুগ্রহ করে আপনার জেলা / এলাকা উল্লেখ করুন।";

  var address = (d.address || "").toString().trim();
  if (address.length < 5)
    return "অনুগ্রহ করে আপনার বিস্তারিত পূর্ণ ঠিকানা লিখুন (যেমন: বাসা নং, রোড নং, এলাকা)।";

  return null;
}

/**
 * ফোন নাম্বার স্ট্যান্ডার্ড ১১ ডিজিট ফরম্যাটে রূপান্তর
 */
function normPhone_(raw) {
  if (!raw) return "";
  var s = raw.toString();

  var bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  for (var i = 0; i < 10; i++) {
    s = s.split(bnDigits[i]).join(String(i));
  }

  s = s.replace(/[^0-9]/g, "");

  if (s.indexOf("880") === 0) s = s.substring(2);
  else if (s.indexOf("+880") === 0) s = s.substring(3);

  if (s.length === 10 && s.indexOf("1") === 0) s = "0" + s;

  return s;
}

/**
 * গুগল শিট কানেকশন হ্যান্ডলার
 */
function getSheet_(customUrl) {
  var ss;
  var rawId = String(customUrl || SPREADSHEET_ID || "").trim();

  if (rawId.length > 0) {
    var urlMatch = rawId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    var cleanId = urlMatch ? urlMatch[1] : rawId;
    try {
      ss = SpreadsheetApp.openById(cleanId);
    } catch (e) {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss) {
    throw new Error(
      "কোনো গুগল শিট খুঁজে পাওয়া যায়নি। Code.gs ফাইলের SPREADSHEET_ID-তে আপনার গুগল শিটের সঠিক লিংকটি দিন।"
    );
  }

  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    var allSheets = ss.getSheets();
    if (allSheets.length > 0) {
      var firstSheet = allSheets[0];
      if (firstSheet.getLastRow() <= 1) {
        firstSheet.setName(SHEET_NAME);
        sheet = firstSheet;
      }
    }
  }

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // শিট ফাঁকা থাকলে বা পুরোনো হেডার ফরম্যাটে থাকলে স্বয়ংক্রিয়ভাবে ASCHII SOLUTION মডার্ন ডিজাইনে রূপান্তর
  if (sheet.getLastRow() === 0) {
    formatOrderSheetDesign(sheet);
  } else {
    try {
      var needsRedesign = false;
      var lastCol = sheet.getLastColumn();
      if (sheet.getLastRow() < 4) {
        needsRedesign = true;
      } else {
        var row4 = sheet.getRange(4, 1, 1, Math.min(lastCol, 3)).getValues()[0];
        if (String(row4[0]).indexOf("Order ID") === -1) {
          needsRedesign = true;
        }
      }
      if (needsRedesign) {
        formatOrderSheetDesign(sheet);
      }
    } catch (e) {}
  }

  return sheet;
}

/**
 * =========================================================================
 * ৭. ASCHII SOLUTION প্রফেশনাল ডিজাইন ও সাইড-বাই-সাইড CRM ফরম্যাটিং
 * =========================================================================
 * এই ফাংশনটি গুগল শিটকে সরাসরি নতুন রেফারেন্স ড্যাশবোর্ডের মতো আকর্ষণীয় রূপ দেয়:
 * - ওপরে ক্লিন ব্র্যান্ডিং এবং ৫টি লাইভ ডায়নামিক KPI পিল কার্ড (Orders, Revenue, Completed, Pixel, Sync)
 * - পাশাপাশি ২টি সুনির্দিষ্ট সেকশন:
 *   ১. Customer & Order Details (ডিপ টিল এমারেল্ড ব্যানার)
 *   ২. Pixel & Ads Data (ডিপ মিডনাইট নেভি ব্যানার)
 * - সফট স্লেট হেডার, অল্টারনেটিং কালার, কারেন্সি, এবং প্রফেশনাল কালার পিল স্ট্যাটাস ব্যাজ।
 * - মোবাইল অপ্টিমাইজড: কমপ্যাক্ট ফ্রোজেন রো, নিখুঁত কলাম প্রস্থ এবং স্বয়ংক্রিয় "📱 Mobile View" ট্যাব!
 * =========================================================================
 */
function formatOrderSheetDesign(optSheet) {
  var sheet = optSheet || getSheet_();
  var ss = sheet.getParent();
  var numCols = HEADERS.length; // সর্বমোট ২৪টি কলাম
  var lastRow = sheet.getLastRow();

  // ১. বিদ্যমান অর্ডার ডাটা সংরক্ষণ করা (যাতে কোনো পুরনো অর্ডার মুছে না যায়)
  var existingOrders = [];
  var isAlreadyRedesigned = false;

  if (lastRow >= 4) {
    try {
      var checkRow4 = sheet.getRange(4, 1, 1, Math.min(sheet.getLastColumn(), 5)).getValues()[0];
      if (String(checkRow4[0]).indexOf("Order ID") > -1) {
        isAlreadyRedesigned = true;
      }
    } catch (e) {}
  }

  if (!isAlreadyRedesigned && lastRow > 0) {
    var checkRow1 = sheet.getRange(1, 1, 1, Math.min(sheet.getLastColumn(), 5)).getValues()[0];
    var startRow = (String(checkRow1[0]).indexOf("Order ID") > -1) ? 2 : 1;
    if (lastRow >= startRow) {
      var rawData = sheet.getRange(startRow, 1, lastRow - startRow + 1, sheet.getLastColumn()).getValues();
      for (var r = 0; r < rawData.length; r++) {
        var rowVal = rawData[r];
        if (rowVal[0] || rowVal[2]) {
          var paddedRow = [];
          for (var c = 0; c < numCols; c++) {
            paddedRow.push(c < rowVal.length ? rowVal[c] : "-");
          }
          existingOrders.push(paddedRow);
        }
      }
    }
    sheet.clear();
  }

  // ২. প্রতিটি কলামের নিখুঁত প্রস্থ (মোবাইল ও পিসির জন্য অপ্টিমাইজড)
  var colWidths = [
    // --- বাম পাশ: অর্ডার তথ্য (১৪টি কলাম) ---
    120, // A: Order ID
    145, // B: Date & Time
    150, // C: Customer Name
    130, // D: Phone Number
    120, // E: District / Area
    200, // F: Full Address
    220, // G: Ordered Products
    85,  // H: Total Items (Qty)
    110, // I: Products Subtotal
    115, // J: Delivery Method
    105, // K: Delivery Charge
    125, // L: Grand Total Bill
    150, // M: Customer Note
    120, // N: Order Status
    // --- ডান পাশ: ফেসবুক পিক্সেল তথ্য (১০টি কলাম) ---
    160, // O: FB Click ID (fbclid)
    140, // P: FB Browser ID (_fbp)
    140, // Q: FB Cookie ID (_fbc)
    110, // R: Pixel Event
    140, // S: Campaign Name
    130, // T: Ad Content
    120, // U: Traffic Source
    120, // V: Session ID
    100, // W: Time Spent
    200  // X: Landing Page URL
  ];

  for (var w = 0; w < colWidths.length; w++) {
    sheet.setColumnWidth(w + 1, colWidths[w]);
  }

  // ৩. ফিল্টার ও ফ্রোজেন রো ফ্রেশভাবে সেট করা
  try {
    var existingFilter = sheet.getFilter();
    if (existingFilter) existingFilter.remove();
  } catch (fltErr) {}

  sheet.setFrozenRows(0);

  // ৪. রো ১: আধুনিক ক্লিন ব্র্যান্ডিং বার (Row Height: 36px)
  sheet.setRowHeight(1, 36);
  var brandRange = sheet.getRange("A1:X1");
  brandRange.merge()
    .setBackground("#FFFFFF")
    .setFontColor("#0F172A")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle");
  sheet.getRange("A1").setValue("  🌐 ASCHII SOLUTION - Facebook Pixel Tracker  •  Track Customer Orders & Pixel Events in One Place");
  sheet.getRange("A1").setFontWeight("bold").setFontSize(11);

  // ৫. রো ২: ৫টি আধুনিক পিল KPI ড্যাশবোর্ড কার্ড (Row Height: 46px)
  sheet.setRowHeight(2, 46);

  // কার্ড ১: Total Orders (A2:D2)
  var kpi1 = sheet.getRange("A2:D2");
  kpi1.merge()
    .setBackground("#F8FAFC")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("A2").setFormula('="🛒 Total Orders" & CHAR(10) & IFERROR(COUNTA(A5:A), 0) & "  (Live)"')
    .setFontWeight("bold")
    .setFontSize(10.5)
    .setFontColor("#0F172A");

  // কার্ড ২: Total Revenue (E2:I2)
  var kpi2 = sheet.getRange("E2:I2");
  kpi2.merge()
    .setBackground("#F0FDF4")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#BBF7D0", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("E2").setFormula('="💵 Total Revenue" & CHAR(10) & "৳ " & TEXT(IFERROR(SUM(L5:L), 0), "#,##0")')
    .setFontWeight("bold")
    .setFontSize(10.5)
    .setFontColor("#15803D");

  // কার্ড ৩: Completed Orders (J2:N2)
  var kpi3 = sheet.getRange("J2:N2");
  kpi3.merge()
    .setBackground("#FEFCE8")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#FEF08A", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("J2").setFormula('="📊 Completed Orders" & CHAR(10) & IFERROR(COUNTIF(N5:N, "Delivered") + COUNTIF(N5:N, "Completed") + COUNTIF(N5:N, "Shipped"), 0) & "  (" & IFERROR(TEXT((COUNTIF(N5:N, "Delivered") + COUNTIF(N5:N, "Completed") + COUNTIF(N5:N, "Shipped")) / MAX(1, COUNTA(A5:A)), "0%"), "0%") & ")"')
    .setFontWeight("bold")
    .setFontSize(10.5)
    .setFontColor("#A16207");

  // কার্ড ৪: Pixel Event (O2:S2)
  var kpi4 = sheet.getRange("O2:S2");
  kpi4.merge()
    .setBackground("#EFF6FF")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#BFDBFE", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("O2").setFormula('="🎯 Pixel Event" & CHAR(10) & "Purchases: " & IFERROR(COUNTIF(R5:R, "Purchase"), 0) & " | Active"')
    .setFontWeight("bold")
    .setFontSize(10.5)
    .setFontColor("#1D4ED8");

  // কার্ড ৫: Live Real-time Sync (T2:X2)
  var kpi5 = sheet.getRange("T2:X2");
  kpi5.merge()
    .setBackground("#F0FDF4")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#BBF7D0", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("T2").setFormula('="🟢 Live Real-time Sync" & CHAR(10) & TEXT(NOW(), "mmm dd, yyyy hh:mm AM/PM")')
    .setFontWeight("bold")
    .setFontSize(10)
    .setFontColor("#166534");

  // ৬. রো ৩: সেকশন ব্যানার (Row Height: 30px)
  sheet.setRowHeight(3, 30);

  // ৬.১: বাম পাশের সেকশন হেডার (A3:N3)
  var orderSection = sheet.getRange("A3:N3");
  orderSection.merge()
    .setBackground("#0D4A47") // ডিপ টিল এমারেল্ড
    .setFontColor("#FFFFFF")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(11)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.getRange("A3").setValue("Customer & Order Details");

  // ৬.২: ডান পাশের সেকশন হেডার (O3:X3)
  var pixelSection = sheet.getRange("O3:X3");
  pixelSection.merge()
    .setBackground("#0F172A") // ডিপ মিডনাইট নেভি
    .setFontColor("#FFFFFF")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(11)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.getRange("O3").setValue("Pixel & Ads Data");

  // ৭. রো ৪: কলাম হেডার (Row Height: 34px)
  sheet.setRowHeight(4, 34);

  var allHeadersRange = sheet.getRange(4, 1, 1, numCols);
  allHeadersRange.setValues([HEADERS])
    .setBackground("#F1F5F9") // সফট লাইট স্লেট
    .setFontColor("#1E293B")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);

  // ৮. সংরক্ষিত পূর্বের অর্ডারগুলো রো ৫ থেকে যোগ করা
  if (existingOrders.length > 0) {
    sheet.getRange(5, 1, existingOrders.length, numCols).setValues(existingOrders);
  }

  // ৯. ফ্রোজেন রো (মোবাইলে স্ক্রিন জ্যাম না করে মাত্র ৪টি রো ফ্রোজেন)
  sheet.setFrozenRows(4);

  var finalLastRow = Math.max(5, sheet.getLastRow());

  try {
    sheet.getRange(4, 1, finalLastRow, numCols).createFilter();
  } catch (fe) {}

  // ১০. সকল ডাটা রো ফরম্যাটিং করা (রো ৫ থেকে শেষ রো পর্যন্ত)
  if (finalLastRow >= 5) {
    for (var r = 5; r <= finalLastRow; r++) {
      formatSingleRow_(sheet, r);
    }
  }

  // ১১. স্ট্যাটাস ও পিক্সেল ব্যাজের জন্য কন্ডিশনাল ফরম্যাটিং রুলস
  setupStatusConditionalFormatting_(sheet);

  // ১২. মোবাইল ভিউ ট্যাব তৈরি বা আপডেট করা
  formatMobileViewSheetDesign(ss);

  return "ASCHII SOLUTION প্রফেশনাল ডিজাইন ও মোবাইল ভিউ সফলভাবে সম্পন্ন হয়েছে!";
}

/**
 * স্ট্যাটাস কালার ও পিক্সেল ইভেন্ট কন্ডিশনাল ব্যাজ রুলস
 */
function setupStatusConditionalFormatting_(sheet) {
  try {
    var statusColRange = sheet.getRange("N5:N1000");
    var pixelColRange = sheet.getRange("R5:R1000");
    var rules = [];

    // Order Status ব্যাজ
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("Delivered")
        .setBackground("#DCFCE7")
        .setFontColor("#15803D")
        .setRanges([statusColRange])
        .build()
    );
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("Completed")
        .setBackground("#DCFCE7")
        .setFontColor("#15803D")
        .setRanges([statusColRange])
        .build()
    );
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("Shipped")
        .setBackground("#DBEAFE")
        .setFontColor("#1D4ED8")
        .setRanges([statusColRange])
        .build()
    );
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("Processing")
        .setBackground("#E0E7FF")
        .setFontColor("#4338CA")
        .setRanges([statusColRange])
        .build()
    );
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("Pending")
        .setBackground("#FEF3C7")
        .setFontColor("#B45309")
        .setRanges([statusColRange])
        .build()
    );
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("New")
        .setBackground("#FEF3C7")
        .setFontColor("#B45309")
        .setRanges([statusColRange])
        .build()
    );
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("Cancelled")
        .setBackground("#FEE2E2")
        .setFontColor("#B91C1C")
        .setRanges([statusColRange])
        .build()
    );

    // Pixel Event ব্যাজ
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("Purchase")
        .setBackground("#DCFCE7")
        .setFontColor("#15803D")
        .setRanges([pixelColRange])
        .build()
    );
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("InitiateCheckout")
        .setBackground("#DBEAFE")
        .setFontColor("#1D4ED8")
        .setRanges([pixelColRange])
        .build()
    );
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("AddToCart")
        .setBackground("#FFEDD5")
        .setFontColor("#C2410C")
        .setRanges([pixelColRange])
        .build()
    );
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("PageView")
        .setBackground("#F3E8FF")
        .setFontColor("#7E22CE")
        .setRanges([pixelColRange])
        .build()
    );

    sheet.setConditionalFormatRules(rules);
  } catch (cErr) {}
}

/**
 * প্রতিটি অর্ডার রো (২৪টি কলাম) স্বয়ংক্রিয়ভাবে আকর্ষণীয় CRM লুকে রূপান্তর করা
 */
function formatSingleRow_(sheet, rowIndex) {
  try {
    var numCols = HEADERS.length; // 24
    sheet.setRowHeight(rowIndex, 32);

    var rowRange = sheet.getRange(rowIndex, 1, 1, numCols);
    rowRange
      .setFontFamily("Segoe UI")
      .setFontSize(9.5)
      .setVerticalAlignment("middle")
      .setBorder(
        true,
        true,
        true,
        true,
        true,
        true,
        "#E2E8F0",
        SpreadsheetApp.BorderStyle.SOLID
      );

    // অল্টারনেটিং ব্যাকগ্রাউন্ড (Zebra Striping)
    if (rowIndex % 2 === 0) {
      rowRange.setBackground("#FFFFFF");
    } else {
      rowRange.setBackground("#F8FAFC");
    }

    // কলাম ভিত্তিক এলাইনমেন্ট ও ফরম্যাটিং (বাম পাশ: অর্ডার তথ্য)
    sheet.getRange(rowIndex, 1).setHorizontalAlignment("center").setFontWeight("bold").setFontColor("#1E293B"); // Order ID
    sheet.getRange(rowIndex, 2).setHorizontalAlignment("center"); // Date & Time
    sheet.getRange(rowIndex, 3).setHorizontalAlignment("left").setFontWeight("bold").setFontColor("#0F172A"); // Customer Name
    sheet.getRange(rowIndex, 4).setHorizontalAlignment("center").setNumberFormat("@"); // Phone Number
    sheet.getRange(rowIndex, 5).setHorizontalAlignment("center"); // District / Area
    sheet.getRange(rowIndex, 6).setHorizontalAlignment("left").setWrap(true); // Full Address
    sheet.getRange(rowIndex, 7).setHorizontalAlignment("left").setWrap(true); // Ordered Products
    sheet.getRange(rowIndex, 8).setHorizontalAlignment("center").setFontWeight("bold"); // Items Qty
    
    // Products Subtotal (সফট লাইট গ্রিন ব্যাকগ্রাউন্ড)
    var subtotalCell = sheet.getRange(rowIndex, 9);
    subtotalCell.setHorizontalAlignment("right").setBackground("#F0FDF4").setNumberFormat('"৳"#,##0');
    
    sheet.getRange(rowIndex, 10).setHorizontalAlignment("center"); // Delivery Method
    sheet.getRange(rowIndex, 11).setHorizontalAlignment("right").setNumberFormat('"৳"#,##0'); // Delivery Charge

    // Grand Total Bill (হাইলাইটেড সফট মিন্ট ব্যাকগ্রাউন্ড ও বোল্ড গ্রিন টেক্সট)
    var grandTotalCell = sheet.getRange(rowIndex, 12);
    grandTotalCell
      .setHorizontalAlignment("right")
      .setFontWeight("bold")
      .setFontColor("#15803D")
      .setBackground("#DCFCE7")
      .setNumberFormat('"৳"#,##0');

    sheet.getRange(rowIndex, 13).setHorizontalAlignment("left").setWrap(true); // Customer Note

    // Order Status কলাম ও ড্রপডাউন
    var statusCell = sheet.getRange(rowIndex, 14);
    statusCell.setHorizontalAlignment("center").setFontWeight("bold");
    var validationRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Completed", "Shipped", "Delivered", "Processing", "Pending", "New", "Cancelled"], true)
      .setAllowInvalid(true)
      .build();
    statusCell.setDataValidation(validationRule);

    // কলাম ভিত্তিক এলাইনমেন্ট ও ফরম্যাটিং (ডান পাশ: ফেসবুক পিক্সেল তথ্য)
    sheet.getRange(rowIndex, 15).setHorizontalAlignment("left").setNumberFormat("@"); // fbclid
    sheet.getRange(rowIndex, 16).setHorizontalAlignment("center").setNumberFormat("@"); // _fbp
    sheet.getRange(rowIndex, 17).setHorizontalAlignment("center").setNumberFormat("@"); // _fbc
    sheet.getRange(rowIndex, 18).setHorizontalAlignment("center").setFontWeight("bold"); // Pixel Event
    sheet.getRange(rowIndex, 19).setHorizontalAlignment("left"); // Campaign Name
    sheet.getRange(rowIndex, 20).setHorizontalAlignment("left"); // Ad Content
    sheet.getRange(rowIndex, 21).setHorizontalAlignment("center"); // Traffic Source
    sheet.getRange(rowIndex, 22).setHorizontalAlignment("center").setNumberFormat("@"); // Session ID
    sheet.getRange(rowIndex, 23).setHorizontalAlignment("center"); // Time Spent
    sheet.getRange(rowIndex, 24).setHorizontalAlignment("left"); // Landing Page URL
  } catch (err) {}
}

/**
 * মোবাইল ফোনের জন্য বিশেষ ১-ক্লিক কুইক ভিউ ট্যাব (Mobile Optimized View)
 */
function formatMobileViewSheetDesign(ss) {
  try {
    var tabName = "📱 Mobile View";
    var mobSheet = ss.getSheetByName(tabName);
    if (!mobSheet) {
      mobSheet = ss.insertSheet(tabName);
    }

    var widths = [110, 135, 140, 130, 120, 115];
    for (var i = 0; i < widths.length; i++) {
      mobSheet.setColumnWidth(i + 1, widths[i]);
    }

    mobSheet.setFrozenRows(0);
    mobSheet.setRowHeight(1, 34);
    mobSheet.setRowHeight(2, 40);
    mobSheet.setRowHeight(3, 32);

    // রো ১: মোবাইল হেডার
    var mBrand = mobSheet.getRange("A1:F1");
    mBrand.merge()
      .setBackground("#0F172A")
      .setFontColor("#FFFFFF")
      .setFontFamily("Segoe UI")
      .setFontWeight("bold")
      .setFontSize(11)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");
    mobSheet.getRange("A1").setValue("📱 ASCHII SOLUTION • Mobile Quick Orders View");

    // রো ২: মোবাইল KPI
    var mKpi1 = mobSheet.getRange("A2:C2");
    mKpi1.merge()
      .setBackground("#EFF6FF")
      .setFontFamily("Segoe UI")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setBorder(true, true, true, true, false, false, "#BFDBFE", SpreadsheetApp.BorderStyle.SOLID);
    mobSheet.getRange("A2").setFormula('="🛒 Total Orders: " & IFERROR(COUNTA(Orders!A5:A), 0)')
      .setFontWeight("bold").setFontSize(10.5).setFontColor("#1E3A8A");

    var mKpi2 = mobSheet.getRange("D2:F2");
    mKpi2.merge()
      .setBackground("#F0FDF4")
      .setFontFamily("Segoe UI")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setBorder(true, true, true, true, false, false, "#BBF7D0", SpreadsheetApp.BorderStyle.SOLID);
    mobSheet.getRange("D2").setFormula('="💵 Revenue: ৳ " & TEXT(IFERROR(SUM(Orders!L5:L), 0), "#,##0")')
      .setFontWeight("bold").setFontSize(10.5).setFontColor("#15803D");

    // রো ৩: কলাম হেডার
    var mobHeaders = ["Order ID", "Date & Time", "Customer Name", "Phone Number", "Total Bill", "Order Status"];
    var mHeadRange = mobSheet.getRange("A3:F3");
    mHeadRange.setValues([mobHeaders])
      .setBackground("#F1F5F9")
      .setFontColor("#1E293B")
      .setFontFamily("Segoe UI")
      .setFontWeight("bold")
      .setFontSize(10)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);

    // রো ৪: ডাটা ডায়নামিকালি অর্ডার শিট থেকে লিঙ্ক করা
    mobSheet.getRange("A4").setFormula('=IFERROR(Orders!A5:A, "")');
    mobSheet.getRange("B4").setFormula('=IFERROR(Orders!B5:B, "")');
    mobSheet.getRange("C4").setFormula('=IFERROR(Orders!C5:C, "")');
    mobSheet.getRange("D4").setFormula('=IFERROR(Orders!D5:D, "")');
    mobSheet.getRange("E4").setFormula('=IFERROR(Orders!L5:L, "")');
    mobSheet.getRange("F4").setFormula('=IFERROR(Orders!N5:N, "")');

    mobSheet.setFrozenRows(3);
  } catch (mErr) {}
}

/**
 * =========================================================================
 * ৮. সেশন ও ভিজিটর বিহেভিয়ার ট্র্যাকিং (SESSION & BEHAVIOR TRACKING)
 * =========================================================================
 */
function handleTracking_(data) {
  try {
    var targetUrl = data.trackingSheetUrl || TRACKING_SPREADSHEET_ID || SPREADSHEET_ID;
    var sheet = getTrackingSheet_(targetUrl);
    var sessionId = clean_(data.sessionId || "Unknown", 80);
    var now = Utilities.formatDate(new Date(), "Asia/Dhaka", "dd-MMM-yyyy hh:mm a");

    var cache = CacheService.getScriptCache();
    var cachedRow = cache.get("trk_row_" + sessionId);
    var rowIndex = cachedRow ? parseInt(cachedRow, 10) : 0;

    var stayTime = clean_(data.stayTime || "০ সেকেন্ড", 60);
    var products = clean_(data.selectedProducts || "কোনো পণ্য সিলেক্ট করেনি", 300);
    var ordered = clean_(data.ordered || "না (শুধু ভিজিট)", 60);
    var pixelEvent = clean_(data.pixelEvent || "PageView", 50);
    var phone = clean_(data.phone ? normPhone_(data.phone) : "দেয়নি", 25);
    var fbclid = clean_(data.fbclid || "নাই", 160);
    var fbp = clean_(data.fbp || "নাই", 100);
    var fbc = clean_(data.fbc || "নাই", 120);
    var campaign = clean_(data.campaign || "নাই", 120);
    var adContent = clean_(data.adContent || "নাই", 120);
    var device = clean_(data.device || "Unknown", 30);
    var source = clean_(data.source || "Direct Visit", 120);
    var pageUrl = clean_(data.pageUrl || "", 300);

    // ১. ক্যাশে রো পাওয়া গেলে ওই রো-তেই আপডেট
    if (rowIndex > 4 && rowIndex <= sheet.getLastRow()) {
      var checkSess = sheet.getRange(rowIndex, 1).getValue();
      if (checkSess === sessionId) {
        sheet.getRange(rowIndex, 2).setValue(now);
        sheet.getRange(rowIndex, 3).setValue(stayTime);
        sheet.getRange(rowIndex, 4).setValue(products);
        sheet.getRange(rowIndex, 5).setValue(ordered);
        sheet.getRange(rowIndex, 6).setValue(pixelEvent);
        if (data.phone) sheet.getRange(rowIndex, 7).setValue(phone);
        if (data.fbclid && data.fbclid !== "নাই") sheet.getRange(rowIndex, 8).setValue(fbclid);
        if (data.fbp && data.fbp !== "নাই") sheet.getRange(rowIndex, 9).setValue(fbp);
        if (data.fbc && data.fbc !== "নাই") sheet.getRange(rowIndex, 10).setValue(fbc);
        return json_({ success: true, updated: true, row: rowIndex });
      }
    }

    // ২. শেষের ৩০টি সারিতে সেশন চেক
    var lastRow = sheet.getLastRow();
    var foundRow = 0;
    if (lastRow > 4) {
      var checkCount = Math.min(30, lastRow - 4);
      var startRow = lastRow - checkCount + 1;
      var ids = sheet.getRange(startRow, 1, checkCount, 1).getValues();
      for (var i = ids.length - 1; i >= 0; i--) {
        if (ids[i][0] === sessionId) {
          foundRow = startRow + i;
          break;
        }
      }
    }

    if (foundRow > 0) {
      sheet.getRange(foundRow, 2).setValue(now);
      sheet.getRange(foundRow, 3).setValue(stayTime);
      sheet.getRange(foundRow, 4).setValue(products);
      sheet.getRange(foundRow, 5).setValue(ordered);
      sheet.getRange(foundRow, 6).setValue(pixelEvent);
      if (data.phone) sheet.getRange(foundRow, 7).setValue(phone);
      if (data.fbclid && data.fbclid !== "নাই") sheet.getRange(foundRow, 8).setValue(fbclid);
      if (data.fbp && data.fbp !== "নাই") sheet.getRange(foundRow, 9).setValue(fbp);
      if (data.fbc && data.fbc !== "নাই") sheet.getRange(foundRow, 10).setValue(fbc);
      cache.put("trk_row_" + sessionId, String(foundRow), 21600);
      return json_({ success: true, updated: true, row: foundRow });
    }

    // ৩. নতুন ভিজিটর সেশন রো যোগ করা
    sheet.appendRow([
      sessionId,
      now,
      stayTime,
      products,
      ordered,
      pixelEvent,
      phone,
      fbclid,
      fbp,
      fbc,
      campaign,
      adContent,
      device,
      source,
      pageUrl
    ]);

    var newRow = sheet.getLastRow();
    formatSingleTrackingRow_(sheet, newRow);
    cache.put("trk_row_" + sessionId, String(newRow), 21600);

    return json_({ success: true, created: true, row: newRow });
  } catch (err) {
    return json_({ success: false, error: err.message });
  }
}

/**
 * ট্র্যাকিং শিট কানেক্ট করা (Visitors Tab)
 */
function getTrackingSheet_(customUrl) {
  var ss;
  var rawId = String(customUrl || TRACKING_SPREADSHEET_ID || SPREADSHEET_ID || "").trim();

  if (rawId.length > 0) {
    var urlMatch = rawId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    var cleanId = urlMatch ? urlMatch[1] : rawId;
    try {
      ss = SpreadsheetApp.openById(cleanId);
    } catch (e) {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss) {
    throw new Error("গুগল শিট খুঁজে পাওয়া যায়নি।");
  }

  var tabName = TRACKING_SHEET_NAME || "Visitors";
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }

  if (sheet.getLastRow() === 0) {
    formatTrackingSheetDesign(sheet);
  } else {
    try {
      var needsTrkRedesign = false;
      if (sheet.getLastRow() < 4) {
        needsTrkRedesign = true;
      } else {
        var row4 = sheet.getRange(4, 1, 1, Math.min(sheet.getLastColumn(), 3)).getValues()[0];
        if (String(row4[0]).indexOf("Session ID") === -1) {
          needsTrkRedesign = true;
        }
      }
      if (needsTrkRedesign) {
        formatTrackingSheetDesign(sheet);
      }
    } catch (hErr) {}
  }

  return sheet;
}

/**
 * ট্র্যাকিং শিটের প্রফেশনাল ডিজাইন (Visitors Tab)
 */
function formatTrackingSheetDesign(optSheet) {
  var sheet = optSheet || getTrackingSheet_();
  var numCols = TRACKING_HEADERS.length;
  var lastRow = sheet.getLastRow();

  var existingVisitors = [];
  var isAlreadyStyled = false;

  if (lastRow >= 4) {
    try {
      var row4 = sheet.getRange(4, 1, 1, Math.min(sheet.getLastColumn(), 3)).getValues()[0];
      if (String(row4[0]).indexOf("Session ID") > -1) {
        isAlreadyStyled = true;
      }
    } catch (e) {}
  }

  if (!isAlreadyStyled && lastRow > 0) {
    var checkRow1 = sheet.getRange(1, 1, 1, Math.min(sheet.getLastColumn(), 3)).getValues()[0];
    var startRow = (String(checkRow1[0]).indexOf("Session ID") > -1) ? 2 : 1;
    if (lastRow >= startRow) {
      var raw = sheet.getRange(startRow, 1, lastRow - startRow + 1, sheet.getLastColumn()).getValues();
      for (var r = 0; r < raw.length; r++) {
        var rowData = raw[r];
        if (rowData[0]) {
          var padded = [];
          for (var c = 0; c < numCols; c++) {
            padded.push(c < rowData.length ? rowData[c] : "-");
          }
          existingVisitors.push(padded);
        }
      }
    }
    sheet.clear();
  }

  // কলামের প্রস্থ
  var widths = [140, 165, 135, 240, 150, 130, 140, 210, 170, 180, 160, 160, 100, 150, 240];
  for (var i = 0; i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }

  try {
    var curFilter = sheet.getFilter();
    if (curFilter) curFilter.remove();
  } catch (fe) {}

  sheet.setFrozenRows(0);

  // রো ১ ও ২: শীর্ষ ব্যানার ও KPI
  sheet.setRowHeight(1, 40);
  sheet.setRowHeight(2, 34);

  var brand = sheet.getRange("A1:D2");
  brand.merge()
    .setBackground("#0F172A")
    .setFontColor("#FFFFFF")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(true);
  sheet.getRange("A1").setValue("🌐 ASCHII SOLUTION • Real-time Visitors Tracker\nLive Facebook Pixel & Visitor Traffic Dashboard");
  sheet.getRange("A1").setFontWeight("bold").setFontSize(11);

  var k1 = sheet.getRange("E1:G2");
  k1.merge()
    .setBackground("#EFF6FF")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#BFDBFE", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("E1").setFormula('="👥 Total Visitors" & CHAR(10) & IFERROR(COUNTA(A5:A), 0)')
    .setFontWeight("bold").setFontSize(13).setFontColor("#1E3A8A");

  var k2 = sheet.getRange("H1:J2");
  k2.merge()
    .setBackground("#F0FDF4")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#BBF7D0", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("H1").setFormula('="🎯 Purchases" & CHAR(10) & IFERROR(COUNTIF(E5:E, "*হ্যাঁ*") + COUNTIF(F5:F, "Purchase"), 0)')
    .setFontWeight("bold").setFontSize(13).setFontColor("#15803D");

  var k3 = sheet.getRange("K1:O2");
  k3.merge()
    .setBackground("#F5F3FF")
    .setFontFamily("Segoe UI")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#DDD6FE", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("K1").setFormula('="📅 Live Sync" & CHAR(10) & TEXT(NOW(), "mmm dd, yyyy hh:mm AM/PM")')
    .setFontWeight("bold").setFontSize(11).setFontColor("#6D28D9");

  // রো ৩: সেকশন ব্যানার
  sheet.setRowHeight(3, 34);
  var secBanner = sheet.getRange(3, 1, 1, numCols);
  secBanner.merge()
    .setBackground("#312E81")
    .setFontColor("#FFFFFF")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(11)
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle");
  sheet.getRange("A3").setValue("  </> Live Visitor Sessions & Facebook Pixel Events Data (fbclid, _fbp, _fbc & UTM)");

  // রো ৪: হেডার
  sheet.setRowHeight(4, 38);
  var headerRange = sheet.getRange(4, 1, 1, numCols);
  headerRange.setValues([TRACKING_HEADERS])
    .setBackground("#EDE9FE")
    .setFontColor("#312E81")
    .setFontFamily("Segoe UI")
    .setFontWeight("bold")
    .setFontSize(10.5)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, true, true, "#C7D2FE", SpreadsheetApp.BorderStyle.SOLID);

  if (existingVisitors.length > 0) {
    sheet.getRange(5, 1, existingVisitors.length, numCols).setValues(existingVisitors);
  }

  sheet.setFrozenRows(4);

  var finalLast = Math.max(5, sheet.getLastRow());
  try {
    sheet.getRange(4, 1, finalLast, numCols).createFilter();
  } catch (fe) {}

  if (finalLast >= 5) {
    for (var r = 5; r <= finalLast; r++) {
      formatSingleTrackingRow_(sheet, r);
    }
  }

  return "Visitors ট্র্যাকিং শিট ডিজাইন সফলভাবে সম্পন্ন হয়েছে!";
}

/**
 * প্রতিটি ভিজিটর ট্র্যাকিং রো ডিজাইন
 */
function formatSingleTrackingRow_(sheet, rowIndex) {
  try {
    var numCols = TRACKING_HEADERS.length;
    sheet.setRowHeight(rowIndex, 33);

    var rowRange = sheet.getRange(rowIndex, 1, 1, numCols);
    rowRange
      .setFontFamily("Segoe UI")
      .setFontSize(10)
      .setVerticalAlignment("middle")
      .setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);

    if (rowIndex % 2 === 0) rowRange.setBackground("#FFFFFF");
    else rowRange.setBackground("#F8FAFC");

    sheet.getRange(rowIndex, 1).setHorizontalAlignment("center").setFontWeight("bold").setFontColor("#1E293B").setNumberFormat("@");
    sheet.getRange(rowIndex, 2).setHorizontalAlignment("center");
    sheet.getRange(rowIndex, 3).setHorizontalAlignment("center");
    sheet.getRange(rowIndex, 4).setHorizontalAlignment("left").setWrap(true);
    sheet.getRange(rowIndex, 5).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange(rowIndex, 6).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange(rowIndex, 7).setHorizontalAlignment("center").setNumberFormat("@");
    sheet.getRange(rowIndex, 8).setHorizontalAlignment("left").setNumberFormat("@");
    sheet.getRange(rowIndex, 9).setHorizontalAlignment("center").setNumberFormat("@");
    sheet.getRange(rowIndex, 10).setHorizontalAlignment("center").setNumberFormat("@");
    sheet.getRange(rowIndex, 11).setHorizontalAlignment("left");
    sheet.getRange(rowIndex, 12).setHorizontalAlignment("left");
    sheet.getRange(rowIndex, 13).setHorizontalAlignment("center");
    sheet.getRange(rowIndex, 14).setHorizontalAlignment("center");
    sheet.getRange(rowIndex, 15).setHorizontalAlignment("left");
  } catch (err) {}
}

/**
 * সহায়ক ফাংশন: স্ক্রিপ্ট লগ
 */
function log_(msg) {
  Logger.log(msg);
}

/**
 * স্বয়ংক্রিয় অনন্য অর্ডার আইডি তৈরি (যেমন: HN-261026-0001)
 */
function nextOrderId_(sheet) {
  var tz = "Asia/Dhaka";
  var day = Utilities.formatDate(new Date(), tz, "yyMMdd");
  var props = PropertiesService.getScriptProperties();
  var key = "seq_" + day;
  var n = parseInt(props.getProperty(key) || "0", 10) + 1;
  props.setProperty(key, String(n));
  return "HN-" + day + "-" + ("000" + n).slice(-4);
}

/**
 * ইনপুট টেক্সট ক্লিন করা
 */
function clean_(val, maxLen) {
  if (val === null || val === undefined) return "";
  var s = val.toString().trim();
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  if (maxLen && s.length > maxLen) {
    s = s.substring(0, maxLen);
  }
  return s;
}

/**
 * JSON আউটপুট রিটার্ন
 */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/**
 * টেস্ট ফাংশন (Apps Script থেকে সরাসরি রান করতে পারেন)
 */
function testOrder() {
  var fakeEvent = {
    postData: {
      contents: JSON.stringify({
        name: "টেস্ট কাস্টমার",
        phone: "01700000000",
        district: "ঢাকা",
        address: "মিরপুর-১০, ঢাকা",
        note: "এটি একটি টেস্ট অর্ডার",
        shippingId: "dhaka",
        items: [
          { id: "m1000", qty: 1 },
          { id: "hn1000", qty: 1 },
        ],
        fbclid: "fbclid_test_123456789",
        fbp: "fb.1.1698480000.1234",
        fbc: "fb.1.1698480500.5678",
        pixelEvent: "Purchase",
        campaign: "Winter Honey Campaign",
        adContent: "Video Ad - 1",
        source: "Facebook Ads",
        sessionId: "V-TEST-001",
        timeSpent: "২ মিনিট ১৫ সেকেন্ড",
        pageUrl: "https://example.com"
      }),
    },
  };
  var res = doPost(fakeEvent);
  Logger.log(res.getContent());
}
