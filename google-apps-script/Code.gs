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
var SPREADSHEET_ID =
  "https://docs.google.com/spreadsheets/d/1CwGdVmheHb11es3sCuy_G1lASPXMiDYP1hmT8U7BziI/edit?gid=0#gid=0";

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
  m500: {
    name: "খাঁটি মধু – ৫০০ গ্রাম",
    price: 550, // বিক্রয় মূল্য (টাকায়)
    regularPrice: 650, // নিয়মিত/আগের মূল্য (ডিসপ্লে করার জন্য)
  },
  m1000: {
    name: "খাঁটি মধু – ১ কেজি",
    price: 1050,
    regularPrice: 1200,
  },

  // --- প্রিমিয়াম হানি নাট (Premium Honey Nut) ---
  hn500: {
    name: "প্রিমিয়াম হানি নাট – ৫০০ গ্রাম",
    price: 650,
    regularPrice: 750,
  },
  hn1000: {
    name: "প্রিমিয়াম হানি নাট – ১ কেজি",
    price: 1250,
    regularPrice: 1400,
  },

  // --- স্পেশাল কম্বো প্যাক (মধু + হানি নাট) ---
  combo: {
    name: "মেগা কম্বো (১ কেজি মধু + ১ কেজি হানি নাট)",
    price: 2200,
    regularPrice: 2450,
  },
};

/* =========================================================================
   ৩. ডেলিভারি চার্জ সেটিংস (SHIPPING / DELIVERY CHARGES)
   ========================================================================= */
var SHIPPING_CONFIG = {
  dhaka: {
    label: "ঢাকার ভিতরে",
    charge: 60, // ঢাকার ভিতরে ডেলিভারি চার্জ (টাকায়)
  },
  outside: {
    label: "ঢাকার বাইরে",
    charge: 120, // ঢাকার বাইরে ডেলিভারি চার্জ (টাকায়)
  },
};

// ফ্রি ডেলিভারি অফার: কত টাকার বেশি কিনলে ডেলিভারি চার্জ ফ্রি (০ টাকা) হবে?
// (ফ্রি ডেলিভারি অফার না রাখতে চাইলে ০ রাখুন)
var FREE_SHIPPING_MIN_TOTAL = 0;

// একজন কাস্টমার প্রতিটি পণ্য সর্বোচ্চ কত পিস অর্ডার করতে পারবে
var MAX_QTY_PER_ITEM = 20;

/* =========================================================================
   ৪. ফ্রড এলার্ট ও স্প্যাম প্রতিরোধ সেটিংস (FRAUD & SPAM PROTECTION)
   =========================================================================
   - কোনো অসৎ কাস্টমার বা বট যাতে একই মোবাইল নাম্বার দিয়ে বারবার অর্ডার পাঠিয়ে
     শিট জ্যাম বা স্প্যাম না করতে পারে, সেজন্য এই ফ্রড প্রটেকশন।
   - একবার অর্ডার সফল হওয়ার পর নির্দিষ্ট সময়ের মধ্যে আবার একই নাম্বার দিয়ে অর্ডার করলে
     সিস্টেম অর্ডার আটকে দিবে এবং তাকে ফ্রড এলার্ট মেসেজ দেখাবে।
*/
var FRAUD_PROTECTION = {
  enabled: true, // ফ্রড প্রটেকশন চালু রাখতে true, বন্ধ করতে false
  cooldownMinutes: 15, // কত মিনিট পর একই নাম্বার দিয়ে পুনরায় অর্ডার করা যাবে (ডিফল্ট: ১৫ মিনিট)
};

/* =========================================================================
   ৫. গুগল শিটের কলাম হেডার (SHEET TABLE HEADERS)
   =========================================================================
   - "Discount Amount" কলামটি বাদ দেওয়া হয়েছে।
   - "Products Subtotal" এর সাথে ডেলিভারি চার্জ যোগ হয়ে সরাসরি "Grand Total Bill" হবে।
*/
var HEADERS = [
  "Order ID", // অর্ডার নম্বর (যেমন: HN-261026-0001)
  "Date & Time", // অর্ডার করার তারিখ ও সময়
  "Customer Name", // কাস্টমারের নাম
  "Phone Number", // মোবাইল নাম্বার
  "District / Area", // জেলা / এলাকা
  "Full Address", // সম্পূর্ণ ঠিকানা
  "Ordered Products", // কি কি পণ্য অর্ডার করেছে এবং কত পিস (বিস্তারিত)
  "Total Items (Qty)", // সর্বমোট পণ্যের সংখ্যা
  "Products Subtotal", // পণ্যের মোট দাম (টাকায়)
  "Delivery Method", // ডেলিভারি এলাকা
  "Delivery Charge", // ডেলিভারি চার্জ (টাকায়)
  "Grand Total Bill", // সর্বমোট বিল = Products Subtotal + Delivery Charge
  "Customer Note", // কাস্টমারের বিশেষ নির্দেশনা
  "Order Status", // অর্ডারের অবস্থা (New / Processing / Delivered)
];

/* =========================================================================
   ৬. কোর ব্যাকএন্ড কোড (CORE BACKEND LOGIC)
   ========================================================================= */

// API টেস্ট করার ফাংশন (ব্রাউজারে /exec লিংক ওপেন করলে শিটের নাম ও লাইভ লিংক দেখতে পাবেন)
function doGet(e) {
  try {
    var sheet = getSheet_();
    var ss = sheet.getParent();

    // ব্রাউজার থেকে ?action=format বা ?format=1 দিলে পুরো শিট ডিজাইন অটো-ফরমেট হবে
    var isFormatRequest =
      e &&
      e.parameter &&
      (e.parameter.action === "format" || e.parameter.format === "1");
    if (isFormatRequest) {
      formatOrderSheetDesign(sheet);
    }

    return json_({
      success: true,
      message: "খাঁটি মধু ও হানি নাট অর্ডার API সফলভাবে চালু রয়েছে!",
      connectedSpreadsheetName: ss.getName(),
      connectedSpreadsheetUrl: ss.getUrl(),
      targetTabName: sheet.getName(),
      totalOrdersInSheet: Math.max(0, sheet.getLastRow() - 1),
      fraudProtection: FRAUD_PROTECTION.enabled
        ? "চালু আছে (" + FRAUD_PROTECTION.cooldownMinutes + " মিনিট কুলডাউন)"
        : "বন্ধ",
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

// ওয়েবসাইট থেকে অর্ডার সাবমিট গ্রহণ করার ফাংশন
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var rawData = (e && e.postData && e.postData.contents) || "{}";
    var data = JSON.parse(rawData);

    // ১. তথ্য যাচাইকরণ
    var validationError = validateOrder_(data);
    if (validationError) {
      return json_({ success: false, error: validationError });
    }

    var cleanPhone = normPhone_(data.phone);

    // ২. ফ্রড এলার্ট ও ডুপ্লিকেট স্প্যাম প্রটেকশন (Fraud Alert & Duplicate Guard)
    if (FRAUD_PROTECTION && FRAUD_PROTECTION.enabled) {
      var cache = CacheService.getScriptCache();
      var cacheKey = "honey_guard_" + cleanPhone;
      var existingOrderId = cache.get(cacheKey);

      if (existingOrderId) {
        return json_({
          success: false,
          fraudAlert: true,
          error:
            "⚠️ ফ্রড এলার্ট (Fraud Alert): এই মোবাইল নাম্বার (" +
            cleanPhone +
            ") দিয়ে কিছুক্ষণ আগেই একটি অর্ডার (" +
            existingOrderId +
            ") গ্রহণ করা হয়েছে। আপনার অর্ডারটি প্রক্রিয়াধীন রয়েছে, বারবার অর্ডার পাঠানোর প্রয়োজন নেই। প্রয়োজনে সরাসরি আমাদের নাম্বারে কল করুন।",
        });
      }
    }

    // ৩. অর্ডারকৃত পণ্যের হিসাব নিকাশ (মাল্টিপল প্রোডাক্ট সাপোর্ট)
    var parsedItems = parseOrderedItems_(data);
    if (!parsedItems || parsedItems.length === 0) {
      return json_({
        success: false,
        error: "অনুগ্রহ করে কমপক্ষে একটি পণ্য সিলেক্ট করুন।",
      });
    }

    // ৪. পণ্যের দাম ও মোট সাব-টোটাল হিসাব
    var subtotal = 0;
    var totalQty = 0;
    var itemsSummaryList = [];

    for (var i = 0; i < parsedItems.length; i++) {
      var item = parsedItems[i];
      var prod = PRODUCTS_CONFIG[item.id];
      var itemTotal = prod.price * item.qty;
      subtotal += itemTotal;
      totalQty += item.qty;
      itemsSummaryList.push(
        prod.name + " (" + item.qty + "টি - " + CURRENCY + itemTotal + ")",
      );
    }

    var itemsSummaryString = itemsSummaryList.join(",\n");

    // ৫. ডেলিভারি চার্জ হিসাব
    var shippingInfo =
      SHIPPING_CONFIG[data.shippingId] || SHIPPING_CONFIG["dhaka"];
    var shippingCharge = shippingInfo.charge;

    // ফ্রি ডেলিভারি শর্ত পরীক্ষা
    if (FREE_SHIPPING_MIN_TOTAL > 0 && subtotal >= FREE_SHIPPING_MIN_TOTAL) {
      shippingCharge = 0;
    }

    // ৬. সর্বমোট বিল গণনা: Products Subtotal এর সাথে Delivery Charge যোগফল
    var grandTotal = subtotal + shippingCharge;

    // ৭. গুগল শিটে অর্ডার সংরক্ষণ (Discount Amount ছাড়া সরাসরি Subtotal + Delivery = Grand Total)
    var sheet = getSheet_();
    var orderId = nextOrderId_(sheet);
    var orderDate = Utilities.formatDate(
      new Date(),
      "Asia/Dhaka",
      "dd-MMM-yyyy hh:mm a",
    );

    sheet.appendRow([
      orderId, // Order ID
      orderDate, // Date & Time
      clean_(data.name, 100), // Customer Name
      "'" + cleanPhone, // Phone Number
      clean_(data.district, 80), // District / Area
      clean_(data.address, 350), // Full Address
      itemsSummaryString, // Ordered Products
      totalQty, // Total Items (Qty)
      subtotal, // Products Subtotal
      shippingInfo.label, // Delivery Method
      shippingCharge, // Delivery Charge
      grandTotal, // Grand Total Bill (Products Subtotal + Delivery Charge)
      clean_(data.note || "কোনো নোট নেই", 300), // Customer Note
      "New", // Order Status
    ]);

    SpreadsheetApp.flush();

    // ৮. নতুন সারির ডিজাইন ও প্রফেশনাল ফরম্যাটিং স্বয়ংক্রিয়ভাবে প্রয়োগ করা
    formatSingleRow_(sheet, sheet.getLastRow());

    // ৯. সফল অর্ডারের পর এই ফোন নাম্বারকে নির্দিষ্ট সময়ের জন্য ফ্রড গার্ড ক্যাশে রাখা
    if (FRAUD_PROTECTION && FRAUD_PROTECTION.enabled) {
      try {
        var cooldownSec = Math.max(60, FRAUD_PROTECTION.cooldownMinutes * 60);
        cache.put("honey_guard_" + cleanPhone, orderId, cooldownSec);
      } catch (cacheErr) {}
    }

    // ৯. কাস্টমারের কাছে রেসপন্স পাঠানো
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
  if (!d.name || String(d.name).trim().length < 2)
    return "অনুগ্রহ করে আপনার সঠিক নাম লিখুন।";

  var cleanPhone = normPhone_(d.phone);
  if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
    return "১১ ডিজিটের সঠিক মোবাইল নাম্বার দিন (যেমন: 01712345678)।";
  }

  if (!d.district || String(d.district).trim().length < 2)
    return "আপনার জেলা বা এলাকার নাম দিন।";
  if (!d.address || String(d.address).trim().length < 6)
    return "সম্পূর্ণ বিস্তারিত ঠিকানা লিখুন।";
  if (!SHIPPING_CONFIG[d.shippingId])
    return "ডেলিভারি এলাকা নির্বাচন সঠিক নয়।";

  return null;
}

/**
 * ফোন নাম্বার নরমালাইজ করা
 */
function normPhone_(v) {
  var s = String(v || "").replace(/[\s\-()]/g, "");
  s = s.replace(/[০-৯]/g, function (d) {
    return "০১২৩৪৫৬৭৮৯".indexOf(d);
  });
  s = s.replace(/^\+?88/, "");
  return s;
}

/**
 * স্প্রেডশীট ফর্মুলা ইনজেকশন প্রতিরোধ
 */
function clean_(v, maxLen) {
  var s = String(v == null ? "" : v)
    .replace(/[\u0000-\u001f]+/g, " ")
    .trim();
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
      throw new Error(
        "SPREADSHEET_ID ভুল বা অনুমতি নেই। গুগল শিটের আইডি বা সঠিক লিংক দিন। (" +
          e.message +
          ")",
      );
    }
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss) {
    throw new Error(
      "কোনো গুগল শিট খুঁজে পাওয়া যায়নি। অনুগ্রহ করে Code.gs ফাইলের SPREADSHEET_ID-তে আপনার গুগল শিটের লিংকটি দিন।",
    );
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

  // হেডার সেট করা বা পুরানো হেডার থাকলে স্বয়ংক্রিয়ভাবে আপডেট ও প্রফেশনাল ডিজাইন প্রয়োগ করা
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    formatOrderSheetDesign(sheet);
  } else {
    try {
      var lastCol = Math.max(HEADERS.length, sheet.getLastColumn() || 1);
      var firstRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      var hasDiscountHeader = false;
      for (var c = 0; c < firstRow.length; c++) {
        if (String(firstRow[c]).toLowerCase().indexOf("discount") > -1) {
          hasDiscountHeader = true;
          break;
        }
      }
      if (hasDiscountHeader) {
        sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
        formatOrderSheetDesign(sheet);
      }
    } catch (e) {}
  }

  return sheet;
}

/**
 * =========================================================================
 * ৭. গুগল শিট প্রফেশনাল ডিজাইন ও ফরম্যাটিং (PROFESSIONAL SHEET CRM DESIGN)
 * =========================================================================
 * এই ফাংশনটি গুগল শিটকে একটি অত্যন্ত প্রিমিয়াম, পরিষ্কার ও আকর্ষণীয় CRM টেবিল লুকে রূপান্তর করে।
 * এটি Apps Script এডিটর থেকে সরাসরি রান করতে পারেন ("runFormatDesign" সিলেক্ট করে Run চাপুন)।
 */
function formatOrderSheetDesign(optSheet) {
  var sheet = optSheet || getSheet_();
  var numCols = HEADERS.length;
  var lastRow = Math.max(1, sheet.getLastRow());

  // ১. প্রতিটি কলামের নিখুঁত প্রস্থ (Column Widths) সেট করা যাতে লেখা কখনো কেটে না যায়
  // [Order ID, Date, Name, Phone, District, Address, Products, Qty, Subtotal, Delivery, Charge, Grand Total, Note, Status]
  var colWidths = [
    140, 170, 180, 140, 135, 260, 280, 110, 140, 135, 130, 155, 200, 135,
  ];
  for (var c = 0; c < colWidths.length; c++) {
    sheet.setColumnWidth(c + 1, colWidths[c]);
  }

  // ২. প্রথম সারি (Header Row) আকর্ষণীয় ডিজাইন
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 42);

  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange
    .setFontWeight("bold")
    .setFontSize(11)
    .setFontFamily("Segoe UI")
    .setBackground("#0F5132") // ডিপ রয়েল এমারেল্ড গ্রিন
    .setFontColor("#FFFFFF") // উজ্জ্বল সাদা টেক্সট
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(false);

  // ৩. ফিল্টার চালু করা (যদি আগে ফিল্টার চালু না থাকে)
  try {
    if (!sheet.getFilter() && lastRow >= 1) {
      sheet.getRange(1, 1, lastRow, numCols).createFilter();
    }
  } catch (fErr) {}

  // ৪. ডাটা সারিগুলো ডিজাইন (যদি টেবিলে কোনো পূর্ববর্তী অর্ডার থাকে)
  if (lastRow > 1) {
    var dataRange = sheet.getRange(2, 1, lastRow - 1, numCols);

    // ফন্ট, সাইজ ও ভার্টিক্যাল এলাইনমেন্ট
    dataRange
      .setFontFamily("Segoe UI")
      .setFontSize(10)
      .setVerticalAlignment("middle");

    // মার্জিত হালকা বর্ডার যোগ করা
    dataRange.setBorder(
      true,
      true,
      true,
      true,
      true,
      true,
      "#CBD5E1",
      SpreadsheetApp.BorderStyle.SOLID,
    );

    // প্রতিটি সারির উচ্চতা ও অল্টারনেটিং ব্যাকগ্রাউন্ড কালার (Zebra Striping)
    for (var r = 2; r <= lastRow; r++) {
      sheet.setRowHeight(r, 34);
      var rowRange = sheet.getRange(r, 1, 1, numCols);
      if (r % 2 === 0) {
        rowRange.setBackground("#FFFFFF");
      } else {
        rowRange.setBackground("#F8FAFC"); // সফট স্ল্যাব ব্যাকগ্রাউন্ড
      }
    }

    // কলাম ভিত্তিক এলাইনমেন্ট ও নাম্বার ফরম্যাট
    sheet
      .getRange(2, 1, lastRow - 1, 1)
      .setHorizontalAlignment("center")
      .setFontWeight("bold")
      .setFontColor("#1E293B"); // Order ID
    sheet.getRange(2, 2, lastRow - 1, 1).setHorizontalAlignment("center"); // Date & Time
    sheet
      .getRange(2, 3, lastRow - 1, 1)
      .setHorizontalAlignment("left")
      .setFontWeight("bold")
      .setFontColor("#0F172A"); // Customer Name
    sheet
      .getRange(2, 4, lastRow - 1, 1)
      .setHorizontalAlignment("center")
      .setNumberFormat("@"); // Phone (টেক্সট যাতে সামনের ০ না কাটে)
    sheet.getRange(2, 5, lastRow - 1, 1).setHorizontalAlignment("center"); // District / Area
    sheet
      .getRange(2, 6, lastRow - 1, 1)
      .setHorizontalAlignment("left")
      .setWrap(true); // Full Address
    sheet
      .getRange(2, 7, lastRow - 1, 1)
      .setHorizontalAlignment("left")
      .setWrap(true); // Ordered Products
    sheet
      .getRange(2, 8, lastRow - 1, 1)
      .setHorizontalAlignment("center")
      .setFontWeight("bold"); // Items Qty
    sheet
      .getRange(2, 9, lastRow - 1, 1)
      .setHorizontalAlignment("right")
      .setNumberFormat('"৳"#,##0'); // Products Subtotal
    sheet.getRange(2, 10, lastRow - 1, 1).setHorizontalAlignment("center"); // Delivery Method
    sheet
      .getRange(2, 11, lastRow - 1, 1)
      .setHorizontalAlignment("right")
      .setNumberFormat('"৳"#,##0'); // Delivery Charge

    // Grand Total Bill (হাইলাইটেড সফট মিন্ট ব্যাকগ্রাউন্ড ও বোল্ড গ্রিন টেক্সট)
    var grandTotalRange = sheet.getRange(2, 12, lastRow - 1, 1);
    grandTotalRange
      .setHorizontalAlignment("right")
      .setFontWeight("bold")
      .setFontColor("#0F5132")
      .setBackground("#E6F4EA")
      .setNumberFormat('"৳"#,##0');

    sheet
      .getRange(2, 13, lastRow - 1, 1)
      .setHorizontalAlignment("left")
      .setWrap(true); // Customer Note

    // Order Status কলাম
    var statusRange = sheet.getRange(2, 14, lastRow - 1, 1);
    statusRange.setHorizontalAlignment("center").setFontWeight("bold");

    // ড্রপডাউন ভ্যালিডেশন
    var validationRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["New", "Processing", "Delivered", "Cancelled"], true)
      .setAllowInvalid(false)
      .build();
    statusRange.setDataValidation(validationRule);
  }

  // ৫. স্ট্যাটাস ব্যাজের জন্য কন্ডিশনাল ফরম্যাটিং (কালার পিলস)
  setupStatusConditionalFormatting_(sheet);

  return "গুগল শিট প্রফেশনাল ডিজাইন সফলভাবে সম্পন্ন হয়েছে!";
}

/**
 * স্ট্যাটাস কালার রুলস (New = হলুদ, Processing = নীল, Delivered = সবুজ, Cancelled = লাল)
 */
function setupStatusConditionalFormatting_(sheet) {
  try {
    var statusColRange = sheet.getRange("N2:N1000");
    var rules = [];

    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("New")
        .setBackground("#FEF3C7")
        .setFontColor("#92400E")
        .setRanges([statusColRange])
        .build(),
    );

    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("Processing")
        .setBackground("#DBEAFE")
        .setFontColor("#1E40AF")
        .setRanges([statusColRange])
        .build(),
    );

    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("Delivered")
        .setBackground("#D1FAE5")
        .setFontColor("#065F46")
        .setRanges([statusColRange])
        .build(),
    );

    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("Cancelled")
        .setBackground("#FEE2E2")
        .setFontColor("#991B1B")
        .setRanges([statusColRange])
        .build(),
    );

    sheet.setConditionalFormatRules(rules);
  } catch (cErr) {}
}

/**
 * প্রতিটি নতুন অর্ডার জমা হওয়ার সাথে সাথে সেই নির্দিষ্ট সারিটি স্বয়ংক্রিয়ভাবে ডিজাইন করা
 */
function formatSingleRow_(sheet, rowIndex) {
  try {
    var numCols = HEADERS.length;
    sheet.setRowHeight(rowIndex, 34);

    var rowRange = sheet.getRange(rowIndex, 1, 1, numCols);
    rowRange
      .setFontFamily("Segoe UI")
      .setFontSize(10)
      .setVerticalAlignment("middle")
      .setBorder(
        true,
        true,
        true,
        true,
        true,
        true,
        "#CBD5E1",
        SpreadsheetApp.BorderStyle.SOLID,
      );

    // অল্টারনেটিং ব্যাকগ্রাউন্ড
    if (rowIndex % 2 === 0) {
      rowRange.setBackground("#FFFFFF");
    } else {
      rowRange.setBackground("#F8FAFC");
    }

    // কলাম ভিত্তিক ফরম্যাটিং
    sheet
      .getRange(rowIndex, 1)
      .setHorizontalAlignment("center")
      .setFontWeight("bold")
      .setFontColor("#1E293B");
    sheet.getRange(rowIndex, 2).setHorizontalAlignment("center");
    sheet
      .getRange(rowIndex, 3)
      .setHorizontalAlignment("left")
      .setFontWeight("bold")
      .setFontColor("#0F172A");
    sheet
      .getRange(rowIndex, 4)
      .setHorizontalAlignment("center")
      .setNumberFormat("@");
    sheet.getRange(rowIndex, 5).setHorizontalAlignment("center");
    sheet.getRange(rowIndex, 6).setHorizontalAlignment("left").setWrap(true);
    sheet.getRange(rowIndex, 7).setHorizontalAlignment("left").setWrap(true);
    sheet
      .getRange(rowIndex, 8)
      .setHorizontalAlignment("center")
      .setFontWeight("bold");
    sheet
      .getRange(rowIndex, 9)
      .setHorizontalAlignment("right")
      .setNumberFormat('"৳"#,##0');
    sheet.getRange(rowIndex, 10).setHorizontalAlignment("center");
    sheet
      .getRange(rowIndex, 11)
      .setHorizontalAlignment("right")
      .setNumberFormat('"৳"#,##0');

    // Grand Total Bill (হাইলাইটেড)
    sheet
      .getRange(rowIndex, 12)
      .setHorizontalAlignment("right")
      .setFontWeight("bold")
      .setFontColor("#0F5132")
      .setBackground("#E6F4EA")
      .setNumberFormat('"৳"#,##0');

    sheet.getRange(rowIndex, 13).setHorizontalAlignment("left").setWrap(true);

    // Status Dropdown
    var statusCell = sheet.getRange(rowIndex, 14);
    statusCell.setHorizontalAlignment("center").setFontWeight("bold");
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["New", "Processing", "Delivered", "Cancelled"], true)
      .setAllowInvalid(false)
      .build();
    statusCell.setDataValidation(rule);
  } catch (err) {}
}

/**
 * Apps Script এর এডিটর থেকে সরাসরি রান করার জন্য বাটন ফাংশন
 * (ড্রপডাউনে "runFormatDesign" সিলেক্ট করে Run বাটনে চাপলে পুরো শিট এক ক্লিকে ডিজাইন হয়ে যাবে)
 */
function runFormatDesign() {
  var msg = formatOrderSheetDesign();
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
 * JSON আউটপুট রিটার্ন
 */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
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
      }),
    },
  };

  var res = doPost(fakeEvent);
  Logger.log("টেস্ট রেসপন্স: " + res.getContent());
}
