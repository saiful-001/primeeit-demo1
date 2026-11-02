/**
 * =========================================================================
 * ASCHII CRM • Universal Dynamic Config Loader
 * Loads saved admin customizations from localStorage into window.SITE_CONFIG
 * seamlessly before script.js renders the page!
 * =========================================================================
 */
(function() {
  "use strict";

  var STORAGE_KEY = "aschii_crm_site_config";
  var TYPE_KEY = "aschii_crm_website_type";

  // Preset Configurations for Universal Website Types
  window.PRESET_CONFIGS = {
    // 1. Product Selling Website (E-commerce / Honey Nut)
    product: {
      siteType: "product",
      siteName: "খাঁটি মধু ও প্রিমিয়াম হানি নাট",
      topHeading: "[[খাঁটি]] মধু ও প্রিমিয়াম [[হানি নাট]] – সরাসরি [[আমাদের কাছ থেকে]] অর্ডার করুন",
      notice: "মধু বা হানি নাট অর্ডার করতে নিচের বাটনে ক্লিক করুন",
      orderBtnText: "👍 এখনই অর্ডার করুন",
      benefitsTitle: "আমাদের খাঁটি মধু ও প্রিমিয়াম হানি নাটের বিশেষত্ব",
      benefits: [
        "সুন্দরবনের ১০০% খাঁটি ও প্রাকৃতিক চাকের মধু, কোনো প্রকার চিনি বা কেমিক্যাল মুক্ত",
        "হানি নাটে সেরা মানের কাঠবাদাম, কাজুবাদাম, পেস্তা, আখরোট, কিশমিশ ও খাঁটি মধু মিশ্রিত",
        "শারীরিক ক্লান্তি দূর করে প্রাকৃতিক এনার্জি ও রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করে",
        "শতভাগ স্বাস্থ্যসম্মত ও হাইজিনিক পরিবেশে প্যাকেজিংকৃত প্রিমিয়াম কোয়ালিটি"
      ],
      checkoutTitle: "অর্ডার করতে নিচের ফর্মটি পূরণ করুন",
      packagesTitle: "পছন্দের পণ্য বেছে নিন (এক বা একাধিক সিলেক্ট করতে পারেন)",
      billingTitle: "বিলিং ও ডেলিভারি তথ্য",
      cartTitle: "আপনার অর্ডার সামারি",
      submitBtnText: "অর্ডার কনফার্ম করুন",
      footMsg: "আমাদের খাঁটি পণ্য বেছে নেওয়ার জন্য ধন্যবাদ। সুস্থ থাকুন, ভালো থাকুন।",
      footCredit: "© খাঁটি মধু ও প্রিমিয়াম হানি নাট",
      sections: {
        top: true,
        video: true,
        notice: true,
        benefits: true,
        gallery: true,
        reviews: true,
        docs: true,
        offer: true,
        checkout: true,
        packages: true
      }
    },

    // 2. Agency Portfolio
    agency: {
      siteType: "agency",
      siteName: "Digital Growth Agency - ASCHII Solution",
      topHeading: "We Build [[High Converting]] Digital Products & [[Marketing Funnels]]",
      notice: "Limited Availability: We are onboarding 3 new clients this month",
      orderBtnText: "🚀 Book A Strategy Call",
      benefitsTitle: "Why Leading Brands Partner With Our Agency",
      benefits: [
        "Proven ROI-driven Paid Advertising (Meta, Google, TikTok Ads)",
        "Custom Ultra-Fast Landing Pages with High Conversion Rate",
        "Full Automated CRM, Pixel & Analytics Integration",
        "Dedicated Growth Manager & 24/7 Strategic Support"
      ],
      checkoutTitle: "Get Started – Request Your Project Proposal",
      packagesTitle: "Select the Service You Need",
      billingTitle: "Contact & Business Information",
      cartTitle: "Selected Service Package",
      submitBtnText: "Submit Project Request",
      footMsg: "Empowering businesses to scale through modern design & technology.",
      footCredit: "© ASCHII SOLUTION Agency. All rights reserved.",
      sections: {
        top: true,
        video: true,
        notice: true,
        benefits: true,
        gallery: true,
        reviews: true,
        docs: false,
        offer: true,
        checkout: true,
        packages: true
      }
    },

    // 3. CV / Personal Portfolio
    portfolio: {
      siteType: "portfolio",
      siteName: "John Doe - Senior Software Engineer & Consultant",
      topHeading: "Hi, I am [[John Doe]] – Senior [[Full-Stack Engineer]] & Consultant",
      notice: "Available for freelance projects, technical consulting & full-time roles",
      orderBtnText: "💼 Hire Me / Send Inquiry",
      benefitsTitle: "Core Competencies & Engineering Value",
      benefits: [
        "8+ Years Experience Building Scalable Cloud & Web Applications",
        "Expert in Node.js, React, Next.js, Cloud Architectures & APIs",
        "Clean Code, High Test Coverage & Fast Execution",
        "End-to-End Product Ownership from Concept to Production"
      ],
      checkoutTitle: "Let's Collaborate – Send Me a Message",
      packagesTitle: "Select Collaboration Type / Service",
      billingTitle: "Your Details",
      cartTitle: "Inquiry Summary",
      submitBtnText: "Send Inquiry",
      footMsg: "Let's build something exceptional together. Feel free to connect.",
      footCredit: "© John Doe Portfolio. All rights reserved.",
      sections: {
        top: true,
        video: false,
        notice: true,
        benefits: true,
        gallery: true,
        reviews: true,
        docs: true,
        offer: false,
        checkout: true,
        packages: true
      }
    }
  };

  try {
    var rawCustom = localStorage.getItem(STORAGE_KEY);
    if (rawCustom) {
      var custom = JSON.parse(rawCustom);
      window.SITE_CONFIG = window.SITE_CONFIG || {};

      // Merge Google Sheet and API settings
      if (custom.apiEndpoint) window.SITE_CONFIG.apiEndpoint = custom.apiEndpoint;
      if (custom.sheetUrl) {
        window.SITE_CONFIG.sheetUrl = custom.sheetUrl;
        if (window.SITE_CONFIG.sheetDemo) window.SITE_CONFIG.sheetDemo.url = custom.sheetUrl;
      }
      if (custom.currency) window.SITE_CONFIG.currency = custom.currency;

      // Merge copy / content
      if (custom.copy) {
        window.SITE_CONFIG.copy = Object.assign(window.SITE_CONFIG.copy || {}, custom.copy);
      }

      // Merge products if updated
      if (Array.isArray(custom.products) && custom.products.length > 0) {
        window.SITE_CONFIG.products = custom.products;
      }

      // Apply Section Toggles
      if (custom.sections) {
        window.addEventListener("DOMContentLoaded", function() {
          var s = custom.sections;
          var map = {
            top: ".s-top",
            video: ".s-video",
            notice: ".s-notice",
            benefits: ".s-benefits",
            gallery: ".s-gallery",
            reviews: ".s-reviews",
            docs: ".s-docs",
            offer: ".s-offer",
            checkout: ".s-checkout",
            packages: "#packagesTitle, #packages"
          };
          for (var k in map) {
            if (s[k] === false) {
              document.querySelectorAll(map[k]).forEach(function(el) {
                el.style.display = "none";
              });
            }
          }
        });
      }

      // Apply Custom Colors
      if (custom.colors) {
        window.addEventListener("DOMContentLoaded", function() {
          var root = document.documentElement;
          if (custom.colors.primary) root.style.setProperty("--primary", custom.colors.primary);
          if (custom.colors.accent) root.style.setProperty("--accent", custom.colors.accent);
          if (custom.colors.bg) document.body.style.backgroundColor = custom.colors.bg;
        });
      }
    }
  } catch (err) {
    console.warn("CRM Config loader notice:", err);
  }
})();

