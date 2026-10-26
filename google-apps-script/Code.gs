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
 * ১. একটি নতুন Google Sheet খুলুন।
 * ২. উপরের মেনু থেকে: Extensions ➔ Apps Script এ যান।
 * ৩. আগের সব কোড মুছে দিয়ে এই ফাইলের সম্পূর্ণ কোডটি পেস্ট করুন।
 * ৪. নিচে আপনার পণ্যের দাম ও ডিসকাউন্ট ঠিকমতো সেট করুন।
 * ৫. উপরের ডানপাশে "Deploy" ➔ "New deployment" বাটনে ক্লিক করুন।
 * ৬. গিয়ার আইকন (⚙️) থেকে "Web app" সিলেক্ট করুন।
 *    - Description: "Order API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (যাতে কাস্টমার ওয়েবসাইট থেকে অর্ডার করতে পারে)
 * ৭. "Deploy" বাটনে চাপুন এবং পারমিশন চাইলে "Authorize access" দিয়ে অনুমতি দিন।
 * ৮. শেষে একটি "Web app URL" পাবেন (যা /exec দিয়ে শেষ হয়)।
 *    সেই লিংকটি কপি করে আপনার ওয়েবসাইটের `js/config.js` ফাইলের `apiEndpoint` এ বসিয়ে দিন।
 * 
 * ⚠️ মনে রাখবেন:
 * যখনই এই কোডে দাম বা কোনো সেটিং পরিবর্তন করবেন, তখন আবার Deploy ➔ Manage deployments
 * ➔ Edit (পেন্সিল আইকন) ➔ Version: "New version" সিলেক্ট করে Deploy করতে হবে!
 * =========================================================================
 */


/* =========================================================================
   ১. গুগল শিট সেটিংস (GOOGLE SHEET SETTINGS)
   ========================================================================= */

// আপনি যদি গুগল শিটের ভিতর থেকেই Extensions ➔ Apps Script এ যান, তবে এটি ফাঁকা "" রাখলেই চলবে।
// আর যদি আলাদা স্ক্রিপ্ট তৈরি করেন, তবে শিটের URL থেকে আইডিটি এখানে দিন (যেমন: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms")
var SPREADSHEET_ID = "";

// যে শিট/ট্যাবে অর্ডার জমা হবে সেটির নাম (ডিফল্ট: "Orders")
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

  // ডিসকাউন্ট চালু রাখতে চান? (চালু রাখতে true, বন্ধ রাখতে false)
  enabled: true,

  // ডিসকাউন্টের ধরন:
  // "FLAT"    = নির্দিষ্ট টাকা ছাড় (যেমন: ৫০ টাকা বা ১০০ টাকা ছাড়)
  // "PERCENT" = শতকরা হারে ছাড় (যেমন: ১০% বা ১৫% ছাড়)
  type: "FLAT",

  // ছাড়ের পরিমাণ (FLAT হলে টাকার অংক, PERCENT হলে শতকরা হার)
  amount: 50,

  // সর্বনিম্ন কত টাকার পণ্য কিনলে এই ডিসকাউন্ট পাবে?
  // (যেকোনো পরিমাণ অর্ডারে ডিসকাউন্ট দিতে চাইলে ০ রাখুন)
  minOrderAmount: 1500,

  // একাধিক পণ্য কিনলে কি অতিরিক্ত বোনাস ছাড় দিতে চান?
  // (যেমন: ২ বা ততোধিক আইটেম নিলে আরও ৫০ টাকা ছাড়। না চাইলে ০ রাখুন)
  multiItemBonusDiscount: 50

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
   ⚠️ নিচের কোডে সাধারণত হাত দেওয়ার প্রয়োজন নেই।
   ========================================================================= */

// API চালু আছে কিনা টেস্ট করার জন্য (Browser-এ URL ওপেন করলে দেখাবে)
function doGet() {
  return json_({
    success: true,
    message: "খাঁটি মধু ও হানি নাট অর্ডার API সফলভাবে চালু রয়েছে!",
    time: new Date().toISOString()
  });
}

// ওয়েবসাইট থেকে অর্ডার সাবমিট গ্রহণ করার ফাংশন
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // একই সাথে একাধিক অর্ডার আসলে যাতে এলোমেলো না হয় সেজন্য ২০ সেকেন্ড লক অপেক্ষা
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
      error: "সার্ভারে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে সরাসরি আমাদের নম্বরে কল করুন।"
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
 * রিকোয়েস্ট থেকে অর্ডারকৃত পণ্যের তালিকা পার্স করা (মাল্টিপল এবং সিঙ্গেল দুটোই সাপোর্ট করবে)
 */
function parseOrderedItems_(d) {
  var items = [];

  // পদ্ধতি ১: মাল্টিপল প্রোডাক্ট অ্যারে (items: [ { id: "m1000", qty: 1 }, ... ])
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

  // পদ্ধতি ২: ব্যাকওয়ার্ড কম্প্যাটিবিলিটি (packageId ও quantity)
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
 * ফোন নাম্বার থেকে স্পেস ও কান্ট্রি কোড মুছে ১১ ডিজিট করা
 */
function normPhone_(v) {
  var s = String(v || "").replace(/[\s\-()]/g, "");
  // বাংলা সংখ্যাকে ইংরেজি সংখ্যায় রূপান্তর
  s = s.replace(/[০-৯]/g, function (d) { return "০১২৩৪৫৬৭৮৯".indexOf(d); });
  s = s.replace(/^\+?88/, "");
  return s;
}

/**
 * স্প্রেডশীট ফর্মুলা ইনজেকশন প্রতিরোধ ও অতিরিক্ত লেখা ছাঁটাই
 */
function clean_(v, maxLen) {
  var s = String(v == null ? "" : v).replace(/[\u0000-\u001f]+/g, " ").trim();
  if (maxLen && s.length > maxLen) s = s.substring(0, maxLen);
  // ফর্মুলা প্রতিরোধ
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

/**
 * গুগল শিট রিটার্ন করা (না থাকলে স্বয়ংক্রিয়ভাবে তৈরি ও সুন্দর ফরম্যাট করা)
 */
function getSheet_() {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  // প্রথমবার হেডার সেট করা
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    
    // হেডার স্টাইল (বোল্ড, ব্যাকগ্রাউন্ড কালার, টেক্সট কালার)
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
 * =========================================================================
 * 🧪 টেস্ট ফাংশন (TEST FUNCTION)
 * =========================================================================
 * শিট কাজ করছে কিনা টেস্ট করার জন্য:
 * ১. Apps Script এর উপরে রান মেনু থেকে "testOrder" সিলেক্ট করুন।
 * ২. "Run" বাটনে ক্লিক করুন।
 * ৩. আপনার গুগল শিটে একটি টেস্ট অর্ডার যুক্ত হবে!
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
