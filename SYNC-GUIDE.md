# 🚀 ASCHII SOLUTION • Universal Website Management & Google Sheets Sync Guide

## 📋 আপনার জন্য করা সকল আপডেটের বিবরণ:

### ১. নিখুঁত ডিজাইন ফরম্যাটে ৪টি শিট সাজানো
আপনার দেওয়া স্ক্রিনশট এবং রেফারেন্স অনুযায়ী গুগল শিটের ৪টি ট্যাব স্বয়ংক্রিয়ভাবে প্রফেশনাল ও আধুনিক ডিজাইনে তৈরি হবে:
1. **`Orders`** (অর্ডার শিট):
   - **৩টি ক্লিন KPI ড্যাশবোর্ড কার্ড:** `Total Orders`, `Total Revenue`, `Completed Orders`
   - **নোট:** আপনার নির্দেশ অনুযায়ী এই শিট থেকে `Pixel Event` এবং `Live Real-time Sync` বাদ দিয়ে `User Activity` শিটে স্থানান্তর করা হয়েছে।
   - **কলামসমূহ:** Order ID, Date & Time, Customer Name, Phone Number, District / Area, Full Address, Ordered Products, Total Items (Qty), Products Subtotal, Delivery Method, Delivery Charge, Grand Total Bill, Customer Note, Order Status.

2. **`User Activity`** (ভিজিটর ও পিক্সেল ট্র্যাকিং শিট):
   - **রেফারেন্স ছবির মতো হুবহু ডিজাইন:** ডার্ক নেভি হেডার ও সফট পার্পল অ্যাকসেন্ট রো।
   - **৩টি KPI কার্ড:** `Total Visitors`, `Purchases`, `Live Sync`
   - **কলামসমূহ:** Session ID, Last Updated, Time Spent, Selected Products, Order Completed?, Pixel Event, Customer Phone, FB Click ID (fbclid), FB Browser ID (_fbp), FB Cookie ID (_fbc), Campaign Name, Ad Content, Device, Traffic Source, Landing Page URL.

3. **`Pixel Data`**: মেটা ফেসবুক পিক্সেল ইভেন্টসমূহ লগ রাখার জন্য।
4. **`Monthly Report`**: তারিখ অনুযায়ী স্বয়ংক্রিয় সেলস ও কনভার্সন রিপোর্ট।

---

### ২. 🔄 ১-ক্লিক রিমোট শিট সিঙ্ক বাটন (No Code Pasting Required!)
- এখন থেকে গুগল শিটের ডিজাইন ফরম্যাট আপডেট করতে **বারবার কোড কপি বা পেস্ট করার কোনো প্রয়োজন নেই!**
- [**`admin.html`**](admin.html) এ একটি উজ্জ্বল **`🔄 Sync Sheet Design Now`** বাটন দেওয়া হয়েছে।
- এই বাটনে মাত্র ১ ক্লিক করলেই গুগল অ্যাপস স্ক্রিপ্ট স্বয়ংক্রিয়ভাবে আপনার গুগল শিটের সকল ডিজাইন ফরম্যাট ও KPI আপডেট করে দিবে!

---

### ৩. 🛠️ ইউনিভার্সাল এডমিন প্যানেল ([`admin.html`](admin.html))
একটি সহজ, হালকা ও আকর্ষণীয় এডমিন প্যানেল তৈরি করা হয়েছে যেখানে নন-টেকনিক্যাল ইউজার কোনো কোডিং ছাড়াই:
- **৩টি ওয়েবসাইট মডেল বেছে নিতে পারবেন:**
  - 🛒 **Product Selling Website** (মধু ও হানি নাট / ই-কমার্স)
  - 🏢 **Agency Portfolio** (মার্কেটিং ও সফটওয়্যার এজেন্সি)
  - 👤 **CV / Personal Portfolio** (ডেভেলপার ও ফ্রিল্যান্সার পোর্টফোলিও)
- **সকল কন্টেন্ট ও টেক্সট পরিবর্তন:** শিরোনাম, সাব-টাইটেল, নোটিশ, বাটন, বেনিফিটস, ফুটার ইত্যাদি।
- **প্রোডাক্ট ক্যাটালগ ম্যানেজমেন্ট:** নতুন প্রোডাক্ট যুক্ত, মূল্য নির্ধারণ, ডিসকাউন্ট ও ডিলিট।
- **সেকশন অন/অফ:** যেকোনো সেকশন অন বা অফ করার অপশন।
- **লাইভ প্রিভিউ বাটন:** এক ক্লিকে মূল ওয়েবসাইটে গিয়ে ফলাফল দেখা।

---

## 📌 কিভাবে গুগল শিট কানেক্ট করবেন:

1. গুগল ড্রাইভে আপনার একটি Google Sheet তৈরি করুন।
2. গুগল শিটের উপর মেনু থেকে **Extensions ➔ Apps Script** এ যান।
3. [`google-apps-script/Code.gs`](google-apps-script/Code.gs) ফাইলের সম্পূর্ণ কোড কপি করে সেখানে পেস্ট করুন।
4. উপরে **Deploy ➔ New deployment** এ ক্লিক করুন:
   - **Type**: Web app
   - **Execute as**: Me
   - **Who has access**: Anyone
   - **Deploy** বাটনে ক্লিক করে পারমিশন Allow দিন।
5. প্রাপ্ত Web app URL কপি করে নিন।
6. আপনার ব্রাউজারে [`admin.html`](admin.html) ওপেন করুন:
   - **Google Apps Script API URL** এবং **Google Sheets URL** বসিয়ে দিন।
   - **"🔄 Sync Sheet Design Now"** বাটনে ক্লিক করুন।
   - **"Save Changes"** এ ক্লিক করলেই সব কিছু স্বয়ংক্রিয়ভাবে কাজ শুরু করবে!

