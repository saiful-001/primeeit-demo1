/**
 * =========================================================================
 * খাঁটি মধু ও প্রিমিয়াম হানি নাট – অর্ডার ম্যানেজমেন্ট ব্যাকএন্ড
 * GOOGLE APPS SCRIPT ORDER BACKEND (WEB APP)
 * =========================================================================
 * 
 * 📌 সহজে ব্যবহারের নির্দেশিকা (Non-Technical Guide):
 * -------------------------------------------------------------------------
 * এই ফাইলটির ১ থেকে ৪ নম্বর সেকশন একজন সাধারণ মানুষও খুব সহজে এডিট করতে পারবেন।
 * কোডের কোনো জটিল অংশে হাত দেওয়ার প্রয়োজন নেই, শুধু নিচের সেটিংসগুলো আপনার প্রয়োজনমতো পরিবর্তন করুন।
 * 
 * 🚀 কীভাবে গুগল শিটের সাথে যুক্ত করবেন (Step-by-step Setup):
 * ১. আপনার Google Sheet ওপেন করুন।
 * ২. ব্রাউজারের অ্যাড্রেস বার থেকে শিটের সম্পূর্ণ লিংকটি কপি করুন (বা নিচের SPREADSHEET_ID তে দিন)।
 * ৩. গুগল শিটের মেনু থেকে: Extensions ➔ Apps Script এ যান।
 * ৪. আগের সব কোড মুছে দিয়ে এই ফাইলের সম্পূর্ণ কোডটি পেস্ট করুন।
 * ৫. নিচের ১ নম্বর সেকশনে SPREADSHEET_ID তে আপনার গুগল শিটের সম্পূর্ণ লিংক বা আইডি দিন।
 * ৬. উপরের ডানপাশে "Deploy" ➔ "New deployment" বাটনে ক্লিক করুন।
 * ৭. গিয়ার আইকন (⚙️) থেকে "Web app" সিলেক্ট করুন:
 *    - Description: "Honey Order API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (যাতে কাস্টমার ওয়েবসাইট থেকে অর্ডার করতে পারে)
 * ৮. "Deploy" বাটনে চাপুন এবং পারমিশন চাইলে "Authorize access" দিয়ে অনুমতি দিন।
 * ৯. শেষে একটি "Web app URL" পাবেন (যা /exec দিয়ে শেষ হয়)।
 *    সেই লিংকটি কপি করে আপনার ওয়েবসাইটের `js/config.js` ফাইলের `apiEndpoint` এ বসিয়ে দিন।
 * 
 * ⚠️ মনে রাখবেন:
 * যখনই এই কোডে কোনো পরিবর্তন করবেন, তখন আবার Deploy ➔ Manage deployments
 * ➔ Edit (পেন্সিল আইকন) ➔ Version: "New version" সিলেক্ট করে Deploy করতে হবে!
 * =========================================================================
 */


/* =========================================================================
   ১. গুগল শিট সেটিংস (GOOGLE SHEET SETTINGS)
   ========================================================================= */

// আপনার গুগল শিটের সম্পূর্ণ ব্রাউজার লিংক অথবা শুধু আইডিটি এখানে পেস্ট করুন:
// উদাহরণ: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
// (যদি আপনি গুগল শিটের ভেতর থেকেই Extensions ➔ Apps Script এ থাকেন তবে ফাঁকা "" রাখলেও চলবে, তবে নিশ্চিত হওয়ার জন্য শিটের লিংক দিয়ে রাখা সবচেয়ে নিরাপদ)
var SPREADSHEET_ID = "https://docs.google.com/spreadsheets/d/1Zj6Zr-Zm4ypDHxR8O4l2lyJ3P3U3kty1_VNgfsDP20A/edit?gid=0#gid=0";

// যে শিট/ট্যাবে অর্ডার জমা হবে সেটির নাম (ডিফল্ট: "Orders")
// আপনার শিটে যদি Sheet1 থাকে, স্ক্রিপ্ট স্বয়ংক্রিয়ভাবে সেটিকে Orders বানিয়ে দিবে যাতে আপনার সামনেই ডেটা জমা হয়!
var SHEET_NAME = "Orders";

// টাকার প্রতীক
var CURRENCY = "৳";


/* =========================================================================
   ২. পণ্যের তালিকা ও মূল্য নির্ধারণ (PRODUCTS & PRICES)
   =========================================================================
   - এখানে মধু এবং হানি নাটের বিভিন্ন সাইজের মূল্য নির্ধারণ করুন।
   - ওয়েবসাইটের js/config.js ফাইলের সাথে এই আইডি (id) এবং দাম (price) মিল থাকতে হবে।
   - Server-side verification: কাস্টমার ওয়েবসাইট থেকে যাই পাঠাক, এখানে দেওয়া দামেই হিসাব হবে।
*/
var PRODUCTS_CONFIG = {

  // --- খাঁটি মধু (Pure Honey) ---
  "m500": {
    name: "খাঁটি মধু – ৫০০ গ্রাম",
    price: 550,                // বিক্রয় মূল্য (টাকায়)
    regularPrice: 650          // নিয়মিত/আগের মূল্য (ডিসপ্লে করার জন্য)
  },
  "m1000": {
    name: "খাঁটি মধু – ১ কেজি",
    price: 1050,
    regularPrice: 1200
  },

  // --- প্রিমিয়াম হানি নাট (Premium Honey Nut) ---
  "hn500": {
    name: "প্রিমিয়াম হানি নাট – ৫০০ গ্রাম",
    price: 650,
    regularPrice: 750
  },
  "hn1000": {
    name: "প্রিমিয়াম হানি নাট – ১ কেজি",
    price: 1250,
    regularPrice: 1400
  },

  // --- স্পেশাল কম্বো প্যাক (মধু + হানি নাট) ---
  "combo": {
    name: "মেগা কম্বো (১ কেজি মধু + ১ কেজি হানি নাট)",
    price: 2200,
    regularPrice: 2450
  }

};


/* =========================================================================
   ৩. ডিসকাউন্ট ও অফার সেটিংস (DISCOUNT & OFFERS)
   ========================================================================= */
var DISCOUNT_CONFIG = {

  // ডিসকাউন্ট চালু রাখতে চান? (অফার ডিসকাউন্ট বন্ধ রাখতে false রাখা হয়েছে)
  enabled: false,

  // ডিসকাউন্টের ধরন:
  type: "FLAT",
  amount: 0,
  minOrderAmount: 0,
  multiItemBonusDiscount: 0

};


/* =========================================================================
   ৪. ডেলিভারি চার্জ সেটিংস (SHIPPING / DELIVERY CHARGES)
   ========================================================================= */
var SHIPPING_CONFIG = {
  "dhaka": {
    label: "ঢাকার ভিতরে",
    charge: 60                 // ঢাকার ভিতরে ডেলিভারি চার্জ (টাকায়)
  },
  "outside": {
    label: "ঢাকার বাইরে",
    charge: 120                // ঢাকার বাইরে ডেলিভারি চার্জ (টাকায়)
  }
};

// ফ্রি ডেলিভারি অফার: কত টাকার বেশি কিনলে ডেলিভারি চার্জ ফ্রি (০ টাকা) হবে?
// (ফ্রি ডেলিভারি অফার না রাখতে চাইলে ০ রাখুন)
var FREE_SHIPPING_MIN_TOTAL = 0;

// একজন কাস্টমার প্রতিটি পণ্য সর্বোচ্চ কত পিস অর্ডার করতে পারবে
var MAX_QTY_PER_ITEM = 20;


/* =========================================================================
   ৫. গুগল শিটের কলাম হেডার (SHEET TABLE HEADERS)
   ========================================================================= */
var HEADERS = [
  "Order ID",              // অর্ডার নম্বর (যেমন: HN-261026-0001)
  "Date & Time",           // অর্ডার করার তারিখ ও সময়
  "Customer Name",         // কাস্টমারের নাম
  "Phone Number",          // মোবাইল নাম্বার
  "District / Area",       // জেলা / এলাকা
  "Full Address",          // সম্পূর্ণ ঠিকানা
  "Ordered Products",      // কি কি পণ্য অর্ডার করেছে এবং কত পিস (বিস্তারিত)
  "Total Items (Qty)",     // সর্বমোট পণ্যের সংখ্যা
  "Products Subtotal",     // পণ্যের মোট দাম (টাকায়)
  "Discount Amount",       // ডিসকাউন্ট ছাড় (টাকায়)
  "Delivery Method",       // ডেলিভারি এলাকা
  "Delivery Charge",       // ডেলিভারি চার্জ (টাকায়)
  "Grand Total Bill",      // কাস্টমারের সর্বমোট বিল (টাকায়)
  "Customer Note",         // কাস্টমারের বিশেষ নির্দেশনা
  "Order Status"           // অর্ডারের অবস্থা (New / Processing / Delivered)
];


/* =========================================================================
   ৬. কোর ব্যাকএন্ড কোড (CORE BACKEND LOGIC)
   ========================================================================= */

// API টেস্ট করার ফাংশন (ব্রাউজারে /exec লিংক ওপেন করলে শিটের নাম ও লাইভ লিংক দেখতে পাবেন)
function doGet() {
  try {
    var sheet = getSheet_();
    var ss = sheet.getParent();
    return json_({
      success: true,
      message: "খাঁটি মধু ও হানি নাট অর্ডার API সফলভাবে চালু রয়েছে!",
      connectedSpreadsheetName: ss.getName(),
      connectedSpreadsheetUrl: ss.getUrl(),
      targetTabName: sheet.getName(),
      totalOrdersInSheet: Math.max(0, sheet.getLastRow() - 1),
      time: new Date().toISOString()
    });
  } catch (err) {
    return json_({
      success: false,
      error: "গুগল শিটের সাথে সংযোগে সমস্যা: " + err.message
    });
  }
}

// ওয়েবসাইট থেকে অর্ডার সাবমিট গ্রহণ করার ফাংশন
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var rawData = (e && e.postData && e.postData.contents) || "{}";
    var data = JSON.parse(rawData);

    // তথ্য যাচাইকরণ
    var validationError = validateOrder_(data);
    if (validationError) {
      return json_({ success: false, error: validationError });
    }

    // অর্ডারকৃত পণ্যের হিসাব নিকাশ (মাল্টিপল প্রোডাক্ট সাপোর্ট)
    var parsedItems = parseOrderedItems_(data);
    if (!parsedItems || parsedItems.length === 0) {
      return json_({ success: false, error: "অনুগ্রহ করে কমপক্ষে একটি পণ্য সিলেক্ট করুন।" });
    }

    // পণ্যের দাম ও মোট সাব-টোটাল হিসাব
    var subtotal = 0;
    var totalQty = 0;
    var itemsSummaryList = [];

    for (var i = 0; i < parsedItems.length; i++) {
      var item = parsedItems[i];
      var prod = PRODUCTS_CONFIG[item.id];
      var itemTotal = prod.price * item.qty;
      subtotal += itemTotal;
      totalQty += item.qty;
      itemsSummaryList.push(prod.name + " (" + item.qty + "টি - " + CURRENCY + itemTotal + ")");
    }

    var itemsSummaryString = itemsSummaryList.join(",\n");

    // ডিসকাউন্ট হিসাব
    var discount = calculateDiscount_(subtotal, parsedItems.length);

    // ডেলিভারি চার্জ হিসাব
    var shippingInfo = SHIPPING_CONFIG[data.shippingId] || SHIPPING_CONFIG["dhaka"];
    var shippingCharge = shippingInfo.charge;

    // ফ্রি ডেলিভারি শর্ত পরীক্ষা
    if (FREE_SHIPPING_MIN_TOTAL > 0 && subtotal >= FREE_SHIPPING_MIN_TOTAL) {
      shippingCharge = 0;
    }

    // সর্বমোট বিল
    var grandTotal = Math.max(0, subtotal - discount) + shippingCharge;

    // গুগল শিটে অর্ডার সংরক্ষণ
    var sheet = getSheet_();
    var orderId = nextOrderId_(sheet);
    var orderDate = Utilities.formatDate(new Date(), "Asia/Dhaka", "dd-MMM-yyyy hh:mm a");

    sheet.appendRow([
      orderId,                                          // Order ID
      orderDate,                                        // Date & Time
      clean_(data.name, 100),                           // Customer Name
      "'" + normPhone_(data.phone),                     // Phone Number
      clean_(data.district, 80),                        // District
      clean_(data.address, 350),                        // Address
      itemsSummaryString,                               // Ordered Products
      totalQty,                                         // Total Items
      subtotal,                                         // Subtotal
      discount,                                         // Discount
      shippingInfo.label,                               // Delivery Method
      shippingCharge,                                   // Delivery Charge
      grandTotal,                                       // Grand Total
      clean_(data.note || "কোনো নোট নেই", 300),         // Customer Note
      "New"                                             // Order Status
    ]);

    SpreadsheetApp.flush();

    // কাস্টমারের কাছে রেসপন্স পাঠানো
    return json_({
      success: true,
      orderId: orderId,
      subtotal: subtotal,
      discount: discount,
      deliveryCharge: shippingCharge,
      total: grandTotal,
      itemsCount: totalQty,
      message: "আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!"
    });

  } catch (err) {
    return json_({
      success: false,
      error: "সার্ভারে সাময়িক সমস্যা হয়েছে: " + err.message
    });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/**
 * ডিসকাউন্ট হিসাব করার ফাংশন
 */
function calculateDiscount_(subtotal, uniqueItemsCount) {
  if (!DISCOUNT_CONFIG || !DISCOUNT_CONFIG.enabled) return 0;
  
  var discount = 0;
  var minOrder = DISCOUNT_CONFIG.minOrderAmount || 0;

  if (subtotal >= minOrder) {
    if (DISCOUNT_CONFIG.type === "PERCENT") {
      discount = Math.round((subtotal * (DISCOUNT_CONFIG.amount || 0)) / 100);
    } else {
      discount = DISCOUNT_CONFIG.amount || 0;
    }

    // একাধিক পণ্য কিনলে অতিরিক্ত বোনাস ডিসকাউন্ট
    if (uniqueItemsCount > 1 && DISCOUNT_CONFIG.multiItemBonusDiscount > 0) {
      discount += DISCOUNT_CONFIG.multiItemBonusDiscount;
    }
  }

  // ডিসকাউন্ট যেন সাব-টোটালের চেয়ে বেশি না হয়ে যায়
  return Math.min(discount, subtotal);
}

/**
 * রিকোয়েস্ট থেকে অর্ডারকৃত পণ্যের তালিকা পার্স করা
 */
function parseOrderedItems_(d) {
  var items = [];

  // পদ্ধতি ১: মাল্টিপল প্রোডাক্ট অ্যারে
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

  // পদ্ধতি ২: ব্যাকওয়ার্ড কম্প্যাটিবিলিটি (packageId)
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
  if (!d || typeof d !== "object") return "অর্ডার রিকোয়েস্ট সঠিক নয়।";
  if (!d.name || String(d.name).trim().length < 2) return "অনুগ্রহ করে আপনার সঠিক নাম লিখুন।";
  
  var cleanPhone = normPhone_(d.phone);
  if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
    return "১১ ডিজিটের সঠিক মোবাইল নাম্বার দিন (যেমন: 01712345678)।";
  }

  if (!d.district || String(d.district).trim().length < 2) return "আপনার জেলা বা এলাকার নাম দিন।";
  if (!d.address || String(d.address).trim().length < 6) return "সম্পূর্ণ বিস্তারিত ঠিকানা লিখুন।";
  if (!SHIPPING_CONFIG[d.shippingId]) return "ডেলিভারি এলাকা নির্বাচন সঠিক নয়।";

  return null;
}

/**
 * ফোন নাম্বার নরমালাইজ করা
 */
function normPhone_(v) {
  var s = String(v || "").replace(/[\s\-()]/g, "");
  s = s.replace(/[০-৯]/g, function (d) { return "০১২৩৪৫৬৭৮৯".indexOf(d); });
  s = s.replace(/^\+?88/, "");
  return s;
}

/**
 * স্প্রেডশীট ফর্মুলা ইনজেকশন প্রতিরোধ
 */
function clean_(v, maxLen) {
  var s = String(v == null ? "" : v).replace(/[\u0000-\u001f]+/g, " ").trim();
  if (maxLen && s.length > maxLen) s = s.substring(0, maxLen);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

/**
 * গুগল শিট কানেক্ট করা (স্মার্ট ডিটেকশন ও অটো-ট্যাব ফরম্যাটিং)
 */
function getSheet_() {
  var ss;
  var rawId = String(SPREADSHEET_ID || "").trim();

  // যদি ব্যবহারকারী সম্পূর্ণ URL পেস্ট করে, তা থেকে স্বয়ংক্রিয়ভাবে আইডি আলাদা করা
  if (rawId.length > 0) {
    var urlMatch = rawId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    var cleanId = urlMatch ? urlMatch[1] : rawId;
    try {
      ss = SpreadsheetApp.openById(cleanId);
    } catch (e) {
      throw new Error("SPREADSHEET_ID ভুল বা অনুমতি নেই। গুগল শিটের আইডি বা সঠিক লিংক দিন। (" + e.message + ")");
    }
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss) {
    throw new Error("কোনো গুগল শিট খুঁজে পাওয়া যায়নি। অনুগ্রহ করে Code.gs ফাইলের SPREADSHEET_ID-তে আপনার গুগল শিটের লিংকটি দিন।");
  }

  // ১. নির্দিষ্ট নামের ট্যাব খোঁজা
  var sheet = ss.getSheetByName(SHEET_NAME);

  // ২. যদি সেই নামের ট্যাব না থাকে, তবে প্রথম ট্যাবটিকে চেক করবে
  if (!sheet) {
    var allSheets = ss.getSheets();
    if (allSheets.length > 0) {
      var firstSheet = allSheets[0];
      // যদি প্রথম ট্যাবটি ফাঁকা থাকে তবে সেটিকে রিনেম করে Orders করবে
      if (firstSheet.getLastRow() <= 1) {
        firstSheet.setName(SHEET_NAME);
        sheet = firstSheet;
      }
    }
  }

  // ৩. যদি তাও না পাওয়া যায় তবে নতুন ট্যাব তৈরি করবে
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // প্রথমবার হেডার সেট করা
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0F5132"); // গাঢ় সবুজ
    headerRange.setFontColor("#FFFFFF");  // সাদা লেখা
    headerRange.setHorizontalAlignment("center");
  }

  return sheet;
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
 * JSON আউটপুট রিটার্ন
 */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
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
          { id: "hn1000", qty: 1 }
        ]
      })
    }
  };

  var res = doPost(fakeEvent);
  Logger.log("টেস্ট রেসপন্স: " + res.getContent());
}
