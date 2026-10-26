/* ==========================================================
   SITE CONFIG – সহজে এডিট করার কনফিগারেশন ফাইল
   মধু ও হানি নাট এর বিবরণ, ছবি, দাম ও সেটিংস
   (এখানে দেওয়া দাম ও আইডি google-apps-script/Code.gs এর সাথে মিল রাখা হয়েছে)
   ========================================================== */
window.SITE_CONFIG = {

  // আপনার Google Apps Script Web App URL টি এখানে পেস্ট করুন (যা /exec দিয়ে শেষ হয়)
  apiEndpoint: "https://script.google.com/macros/s/AKfycbxWxiGfRm12eAosXubvAvdK1uatcZSG49UuVNpWv9U8BnzpA8lnMkJ98PvenMiTlJQ8/exec",

  // ভিডিওর লিংক (ঐচ্ছিক): ইউটিউব লিংক বা .mp4 ফাইলের লিংক। ভিডিও না থাকলে "" খালি রাখুন।
  videoUrl: "",

  // টাকার কারেন্সি
  currency: "৳",

  // ভাসমান যোগাযোগ বাটন (হোয়াটসঅ্যাপ ও ফোন নম্বর দিতে পারেন, না চাইলে "" খালি রাখুন)
  contact: {
    whatsapp: "01908166382", // যেমন: "8801700000000"
    phone: "01908166382"     // যেমন: "01700000000"
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
    offerOld: "২৪৫০",               // পূর্বের মূল্য
    offerNew: "২২০০",               // অফার মূল্য
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
      thumb: "product-honey-500"
    },
    {
      id: "m1000",
      name: "খাঁটি মধু – ১ কেজি",
      price: 1050,
      oldPrice: 1200,
      badge: "জনপ্রিয়",
      thumb: "product-honey-1000"
    },
    {
      id: "hn500",
      name: "প্রিমিয়াম হানি নাট – ৫০০ গ্রাম",
      price: 650,
      oldPrice: 750,
      badge: "",
      thumb: "product-nut-500"
    },
    {
      id: "hn1000",
      name: "প্রিমিয়াম হানি নাট – ১ কেজি",
      price: 1250,
      oldPrice: 1400,
      badge: "সেরা পছন্দ",
      thumb: "product-nut-1000"
    },
    {
      id: "combo",
      name: "মেগা কম্বো (১ কেজি মধু + ১ কেজি হানি নাট)",
      price: 2200,
      oldPrice: 2450,
      badge: "মেগা অফার",
      thumb: "product-combo"
    }
  ],

  // পেজ লোড হওয়ার সময় ডিফল্টভাবে যে প্রোডাক্টটি সিলেক্ট থাকবে
  defaultProduct: "m1000",

  // ডিসকাউন্ট সেটিংস (Code.gs এর DISCOUNT_CONFIG এর সাথে মিল রাখা হয়েছে)
  discount: {
    enabled: true,
    type: "FLAT",               // "FLAT" (নির্দিষ্ট টাকা ছাড়) অথবা "PERCENT" (শতাংশ ছাড়)
    amount: 50,                 // ছাড়ের পরিমাণ (টাকা বা %)
    minOrderAmount: 1500,       // সর্বনিম্ন কত টাকার অর্ডারে প্রযোজ্য
    multiItemBonusDiscount: 50  // একাধিক পণ্য নিলে অতিরিক্ত বোনাস ছাড়
  },

  // ডেলিভারি চার্জ সেটিংস
  shipping: [
    { id: "dhaka",   label: "ঢাকার ভিতরে",  charge: 60 },
    { id: "outside", label: "ঢাকার বাইরে", charge: 120 }
  ],
  defaultShipping: "dhaka",
  freeShippingMinTotal: 0,      // কত টাকার বেশি কিনলে ফ্রি ডেলিভারি (না চাইলে ০ রাখুন)
  maxQty: 20,

  // ছবিসমূহ (Unsplash CDN থেকে খাঁটি মধু ও পুষ্টিকর হানি নাটের প্রিমিয়াম ছবি)
  images: {
    base: "assets/",
    ext: ".jpg",
    products: {
      "product-honey-500": "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=300&h=300&q=75",
      "product-honey-1000": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=300&h=300&q=75",
      "product-nut-500": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=300&h=300&q=75",
      "product-nut-1000": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=300&h=300&q=75",
      "product-combo": "https://images.unsplash.com/photo-1679941279735-b3b35e8bc476?auto=format&fit=crop&w=300&h=300&q=75"
    },
    benefit: "https://images.unsplash.com/photo-1613548058193-1cd24c1bebcf?auto=format&fit=crop&w=900&h=400&q=70",
    offerBg: "https://images.unsplash.com/photo-1642067958050-bfba120a57e2?auto=format&fit=crop&w=1000&h=500&q=60",
    gallery: [
      "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=600&h=450&q=70",
      "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&h=450&q=70",
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&h=450&q=70",
      "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&h=450&q=70",
      "https://images.unsplash.com/photo-1679941279735-b3b35e8bc476?auto=format&fit=crop&w=600&h=450&q=70",
      "https://images.unsplash.com/photo-1545246909-b4e087f05214?auto=format&fit=crop&w=600&h=450&q=70"
    ],
    reviews:   ["review-1", "review-2", "review-3", "review-4", "review-5", "review-6"],
    documents: ["doc-1", "doc-2", "doc-3"]
  },

  placeholderLabels: {
    gallery: "পণ্য ছবি",
    reviews: "কাস্টমার রিভিউ",
    documents: "ল্যাব টেস্ট রিপোর্ট"
  }
};
