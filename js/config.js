/* ==========================================================
   SITE CONFIG – সহজে এডিট করার কনফিগারেশন ফাইল
   মধু ও হানি নাট এর বিবরণ, ছবি, দাম ও সেটিংস
   (এখানে দেওয়া দাম ও আইডি google-apps-script/Code.gs এর সাথে মিল রাখা হয়েছে)
   ========================================================== */
window.SITE_CONFIG = {

  // আপনার Google Apps Script Web App URL টি এখানে পেস্ট করুন (যা /exec দিয়ে শেষ হয়)
  apiEndpoint: "https://script.google.com/macros/s/AKfycbwzdtfBwkvP1lIlvFNcS8r_W0ciqkha6pd19IIeh3CuB_hStWAq_SvgTib36ATKD2av/exec",

  // লাইভ গুগল শিট ডেমো বাটন সেটিংস (কাস্টমার বা ক্লায়েন্টকে ডাটা সেভ হওয়ার লাইভ ডেমো দেখানোর জন্য)
  sheetDemo: {
    enabled: true,              // ডেমো বাটন চালু রাখতে true, বন্ধ করতে false
    url: "https://docs.google.com/spreadsheets/d/1CwGdVmheHb11es3sCuy_G1lASPXMiDYP1hmT8U7BziI/edit?gid=0#gid=0", // আপনার গুগল শিটের ব্রাউজার লিংক
    title: "📊 আপনার ডাটা কীভাবে সেভ হবে তা দেখে নিন",
    subtitle: "অর্ডার সাবমিট করার সাথে সাথে কাস্টমারের নাম, মোবাইল, ঠিকানা ও অর্ডার তথ্য কীভাবে প্রফেশনাল গুগল শিটে স্বয়ংক্রিয়ভাবে জমা হয় তা সরাসরি দেখুন।",
    btnText: "📋 আপনার ডাটা যেভাবে সেভ হবে তা লাইভ দেখে নিন ➔"
  },

  // ভিডিওর লিংক: ইউটিউব লিংক বা .mp4 ফাইলের লিংক (যেমন: "assets/videos/video.mp4")
  videoUrl: "assets/videos/hero-video.mp4",

  // টাকার কারেন্সি
  currency: "৳",

  // ভাসমান যোগাযোগ বাটন (হোয়াটসঅ্যাপ ও ফোন নম্বর দিতে পারেন, না চাইলে "" খালি রাখুন)
  contact: {
    whatsapp: "", // যেমন: "8801700000000"
    phone: ""     // যেমন: "01700000000"
  },

  // ওয়েবসাইটের টেক্সট ও কনটেন্ট
  copy: {
    topHeading: "[[খাঁটি]] মধু ও প্রিমিয়াম [[হানি নাট]] – সরাসরি [[আমাদের কাছ থেকে]] অর্ডার করুন",
    notice: "মধু বা হানি নাট অর্ডার করতে নিচের বাটনে ক্লিক করুন",
    benefitsTitle: "আমাদের খাঁটি মধু ও প্রিমিয়াম হানি নাটের বিশেষত্ব",
    benefits: [
      "সুন্দরবনের ১০০% খাঁটি ও প্রাকৃতিক চাকের মধু, কোনো প্রকার চিনি বা কেমিক্যাল মুক্ত",
      "হানি নাটে সেরা মানের কাঠবাদাম, কাজুবাদাম, পেস্তা, আখরোট, কিশমিশ ও খাঁটি মধু মিশ্রিত",
      "শারীরিক ক্লান্তি দূর করে প্রাকৃতিক এনার্জি ও রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করে",
      "শতভাগ স্বাস্থ্যসম্মত ও হাইজিনিক পরিবেশে প্যাকেজিংকৃত প্রিমিয়াম কোয়ালিটি"
    ],
    strip1: "👇 [[অর্ডার করতে]] নিচে দেখুন – [[সীমিত সময়ের অফার]]",
    reviewsTitle: "আমাদের কাস্টমারদের মতামত",
    docsTitle: "আমাদের ল্যাব টেস্ট রিপোর্ট ও ডকুমেন্টস",
    offerLine: "খাঁটি মধু ও হানি নাটে চলছে বিশেষ ছাড়!",
    offerOld: 2450,                 // পূর্বের মূল্য
    offerNew: 2200,                 // অফার মূল্য
    offerNote: "সারা দেশে হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা (পণ্য পেয়ে টাকা দিন)",
    strip2: "👇 [[এখনই অর্ডার]] করতে নিচের ফর্মটি পূরণ করুন",
    checkoutTitle: "অর্ডার করতে নিচের ফর্মটি পূরণ করুন",
    footMsg: "আমাদের খাঁটি পণ্য বেছে নেওয়ার জন্য ধন্যবাদ। সুস্থ থাকুন, ভালো থাকুন।",
    footCredit: "© খাঁটি মধু ও প্রিমিয়াম হানি নাট",
    privacyUrl: "#",
    termsUrl: "#"
  },

  // পণ্যের তালিকা (Code.gs এর PRODUCTS_CONFIG এর সাথে মিলিয়ে রাখা হয়েছে)
  products: [
    {
      id: "m500",
      name: "খাঁটি মধু – ৫০০ গ্রাম",
      price: 550,
      oldPrice: 650,
      badge: "",
      thumb: "assets/products/honey-500.jpg"
    },
    {
      id: "m1000",
      name: "খাঁটি মধু – ১ কেজি",
      price: 1050,
      oldPrice: 1200,
      badge: "জনপ্রিয়",
      thumb: "assets/products/honey-1000.jpg"
    },
    {
      id: "hn500",
      name: "প্রিমিয়াম হানি নাট – ৫০০ গ্রাম",
      price: 650,
      oldPrice: 750,
      badge: "",
      thumb: "assets/products/nut-500.jpg"
    },
    {
      id: "hn1000",
      name: "প্রিমিয়াম হানি নাট – ১ কেজি",
      price: 1250,
      oldPrice: 1400,
      badge: "সেরা পছন্দ",
      thumb: "assets/products/nut-1000.jpg"
    },
    {
      id: "combo",
      name: "মেগা কম্বো (১ কেজি মধু + ১ কেজি হানি নাট)",
      price: 2200,
      oldPrice: 2450,
      badge: "মেগা অফার",
      thumb: "assets/products/combo.jpg"
    }
  ],

  // পেজ লোড হওয়ার সময় ডিফল্টভাবে যে প্রোডাক্টটি সিলেক্ট থাকবে
  defaultProduct: "m1000",

  // ডিসকাউন্ট সেটিংস (ব্যবহারকারীর চাহিদা অনুযায়ী ডিসকাউন্ট বন্ধ রাখা হয়েছে)
  discount: {
    enabled: false,              // অফার ডিসকাউন্ট বন্ধ
    type: "FLAT",
    amount: 0,
    minOrderAmount: 0,
    multiItemBonusDiscount: 0
  },

  // ডেলিভারি চার্জ সেটিংস
  shipping: [
    { id: "dhaka",   label: "ঢাকার ভিতরে",  charge: 60 },
    { id: "outside", label: "ঢাকার বাইরে", charge: 120 }
  ],
  defaultShipping: "dhaka",
  freeShippingMinTotal: 0,      // কত টাকার বেশি কিনলে ফ্রি ডেলিভারি (না চাইলে ০ রাখুন)
  maxQty: 20,

  // ছবি ও মিডিয়া সেটিংস (assets ফোল্ডারে আপনার ছবি রেখে সহজে পরিবর্তন করতে পারেন)
  images: {
    base: "assets/",
    ext: ".jpg",
    products: {
      "product-honey-500": "assets/products/honey-500.jpg",
      "product-honey-1000": "assets/products/honey-1000.jpg",
      "product-nut-500": "assets/products/nut-500.jpg",
      "product-nut-1000": "assets/products/nut-1000.jpg",
      "product-combo": "assets/products/combo.jpg"
    },
    benefit: "assets/gallery/gallery-1.jpg",
    offerBg: "assets/gallery/gallery-2.jpg",
    gallery: [
      "assets/gallery/gallery-1.jpg",
      "assets/gallery/gallery-2.jpg",
      "assets/gallery/gallery-3.jpg",
      "assets/gallery/gallery-4.jpg",
      "assets/gallery/gallery-5.jpg",
      "assets/gallery/gallery-6.jpg"
    ],
    reviews: [
      "assets/reviews/review-1.svg",
      "assets/reviews/review-2.svg",
      "assets/reviews/review-3.svg",
      "assets/reviews/review-4.svg",
      "assets/reviews/review-5.svg",
      "assets/reviews/review-6.svg"
    ],
    documents: [
      "assets/documents/doc-1.svg",
      "assets/documents/doc-2.svg",
      "assets/documents/doc-3.svg"
    ]
  },

  placeholderLabels: {
    gallery: "পণ্য ছবি",
    reviews: "কাস্টমার রিভিউ",
    documents: "ল্যাব টেস্ট রিপোর্ট"
  }
};
