# Backend Developer - Short Tasks

## 🎯 **Backend Me Ye Kaam Karne Hain:**

### **1. Customer Auto-Assignment**
- Customer/Project table me fields add: `assigned_admin_id`, `assigned_sales_rep_id`, `promoter_id`, `marketing_channel`, `assignment_source`
- Instant estimate project create karte waqt agar `promoter_id` ya `sales_rep_id` aaye to automatically assign kar do
- Super Admin reassignment API: `PATCH /api/customers/{id}/reassign`

### **2. Customer Signup**
- Optional account creation API: `POST /api/customers/create-account` (instant estimate ke baad)
- Forgot User ID API verify karo: `POST /api/forgot-user-id`
- Phone + Email OTP verification (existing system use karo)

### **3. Admin Creation**
- Super Admin se admin create: `POST /api/admins/create`
- Permissions ON/OFF toggles system
- Master Admin per company domain (ONE per domain)

### **4. Pricing System**
- New table `pricing_rules`: material, pitch, base_price, repair_price, is_compatible
- Material + Pitch combination pricing: `GET /api/pricing?material={}&pitch={}`
- Compatibility logic: Cedar/shingle on flat roof = NOT ALLOWED
- Repair/maintenance separate pricing
- Admin pricing update: `PATCH /api/pricing/{id}`

### **5. SendGrid Integration** ⭐
- SendGrid package install: `@sendgrid/mail`
- Environment variables: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
- Email + SMS simultaneously: `POST /api/send-estimate`
- Email me PDF attachment
- Delivery tracking: `GET /api/send-status/{id}`
- Admin notifications on successful delivery
- Analytics: `GET /api/analytics/delivery`

### **6. Project Creation**
- Existing endpoint enhance: `POST /api/roof-estimate-projects`
- New fields add: `promoter_id`, `sales_rep_id`, `marketing_channel`, `assignment_source`
- Auto-assignment logic apply karo
- Pricing calculate karke return karo

---

## 📋 **Priority Order:**
1. Customer Assignment (Database + Logic)
2. SendGrid Integration
3. Pricing System
4. Customer Signup
5. Admin Creation
6. Project Enhancement

---

**Backend API Base URL:** `http://88.99.241.139:5000/api/`  
**SendGrid Credentials:** Client se receive karne hain (pending)
