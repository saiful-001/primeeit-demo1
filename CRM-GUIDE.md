# ⚡ ASCHII SOLUTION • Universal Website Management & Google Sheets CRM

Welcome to the **Universal Website Management System** and **4-Tab Google Sheets CRM**.

---

## 🚀 Key Features

### 1. 📑 Google Sheets System (4 Dedicated Tabs)
Your Google Sheets backend automatically organizes data into four clean tabs:
1. **Order Data**
   - Order ID, Customer Name, Phone, Email, Address, Product / Service, Price, Quantity, Total Amount, Order Status, Date & Time.
2. **Pixel Data**
   - Event Name, Event ID, Page URL, Product / Value, Visitor ID, Device, Browser, UTM Source, UTM Campaign, Date & Time.
3. **User Activity**
   - Visitor ID, Page URL, Referrer, Device, Browser, Visit Count, Session Duration, Button Clicks, Date & Time.
4. **Monthly Report**
   - Date, Total Orders, Total Contacts, Total Visitors, Total Revenue, Completed Orders, Pending Orders.

Includes Google Sheets UI custom menu under **`✨ ASCHII SOLUTION CRM`** with built-in date-wise filters (Today, Yesterday, This Month) and one-click initialization!

---

### 2. 🌐 Universal Website Management (3 Website Models)
Switch and manage three types of websites effortlessly:
- 🛒 **Product Selling Website** (E-commerce / Honey Nut / Physical Goods with dynamic cart & delivery options)
- 🏢 **Agency Portfolio** (For Agencies, software teams, lead inquiries & strategy call bookings)
- 👤 **CV / Personal Portfolio** (For Consultants, engineers, designers with skill showcases & inquiry forms)

Relevant titles, forms, benefits, and sections automatically adapt to the selected model.

---

### 3. 🛠️ Easy Non-Technical Admin Panel (`admin.html`)
Open [`admin.html`](admin.html) directly in any browser:
- **No coding required**.
- Manage Website Name, Main Titles, Buttons, Colors, and Contact details.
- Add, Edit, and Delete Products and pricing.
- Toggle visibility (Show / Hide) for each section.
- Test Google Sheets Connection with 1 click.
- Live Preview button to preview changes in real time.

---

### 4. ⚡ Offline Protection, High Performance & Queue
- **Offline & Slow Connection Queue**: Failed orders are persisted locally and auto-retried when back online (`js/crm-queue.js`).
- **Zero Order Loss Guarantee**: LockService ensures concurrent orders are recorded safely.
- **Duplicate Prevention**: Built-in 5-minute cooldown stops duplicate submissions.
- **Cache Optimization**: Lightweight execution without heavy external dependencies.

---

## 📌 How to Connect Your Google Sheet

1. Open your Google Sheet and copy its URL.
2. In Google Sheets, go to **Extensions ➔ Apps Script**.
3. Copy and paste the code from [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
4. Click **Deploy ➔ New deployment**:
   - **Type**: Web app
   - **Execute as**: Me
   - **Who has access**: Anyone
   - Click **Deploy** and authorize permissions.
5. Copy the deployed Web App URL (`.../exec`).
6. Open [`admin.html`](admin.html) in your browser:
   - Paste the **Apps Script API URL** and **Google Sheet URL**.
   - Click **Test Connection** ➔ **Initialize 4 Tabs in Sheet**.
   - Click **Save Changes**.

---
*Developed with ❤️ by ASCHII SOLUTION.*

