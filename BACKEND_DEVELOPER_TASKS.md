# Backend Developer Tasks

**Project:** Superior Pro Roof System  
**Client Requirements:** January 17, 2026

---

## 🎯 **BACKEND KA KAAM - CLEAR TASKS**

### ⚡ **1. CUSTOMER AUTO-ASSIGNMENT SYSTEM** (PRIORITY: HIGH)

#### **Database Changes:**
- Customer/Project table me yeh fields add karni hain:
  - `assigned_admin_id` (nullable - Foreign Key)
  - `assigned_sales_rep_id` (nullable - Foreign Key)
  - `assignment_source` (enum: 'qr_code', 'link', 'direct_entry', 'marketing_channel')
  - `promoter_id` (nullable)
  - `marketing_channel` (string)
  - `assigned_at` (timestamp)
  - `reassigned_by` (nullable - Super Admin ID)
  - `reassigned_at` (timestamp)

#### **API Endpoints:**

**1.1. Create Instant Estimate Project**
```
POST /api/roof-estimate-projects
```
**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "mobile_number": "+1234567890",
  "address": {...},
  "promoter_id": 123,           // NEW - from QR code/link
  "sales_rep_id": 456,          // NEW - from QR code/link
  "marketing_channel": "Facebook Ad",  // NEW
  "assignment_source": "qr_code"  // NEW
}
```
**Logic:**
- Agar `promoter_id` ya `sales_rep_id` aaya to automatically assign kar do
- CRM me entry automatically create ho
- Commission tracking ke liye source track karo

**1.2. Reassign Customer**
```
PATCH /api/customers/{customer_id}/reassign
```
**Request Body:**
```json
{
  "assigned_admin_id": 789,  // Optional
  "assigned_sales_rep_id": 101,  // Optional
  "reason": "Reassigned by Super Admin"
}
```
**Authorization:** Only Super Admin
**Logic:**
- Reassignment history maintain karo
- Old assignment ko history me save karo

**1.3. Get Customers by Assignment**
```
GET /api/customers?assigned_to={admin_id}&source={qr_code}
```

---

### ⚡ **2. CUSTOMER SIGNUP FLOW** (PRIORITY: HIGH)

#### **API Endpoints:**

**2.1. Create Account After Instant Estimate**
```
POST /api/customers/create-account
```
**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "mobile_number": "+1234567890",
  "address": "123 Main St",
  "password": "password123",
  "estimate_id": "xyz123"  // If created from instant estimate
}
```
**Logic:**
- Phone number verify via OTP (existing OTP system use karo)
- Email verify via OTP
- Address save karo
- Username automatically generate karo (email based)

**2.2. Forgot User ID**
```
POST /api/forgot-user-id
```
**Request Body:**
```json
{
  "email": "john@example.com"
}
```
**Logic:**
- Email verification send karo
- User ID email me bhejo
- Secure email/text verification (existing system)

**2.3. Forgot Password**
```
POST /api/forgot-password
```
**Already exists - verify working properly**

---

### ⚡ **3. ADMIN CREATION & MANAGEMENT** (PRIORITY: MEDIUM)

#### **API Endpoints:**

**3.1. Super Admin - Create Admin**
```
POST /api/admins/create
```
**Authorization:** Only Super Admin  
**Request Body:**
```json
{
  "first_name": "Admin",
  "last_name": "User",
  "email": "admin@company.com",
  "password": "password123",
  "role": "Master Admin",  // or "Sub Admin"
  "company_domain": "superiorproroofs.com",
  "permissions": {
    "can_create_sub_admin": true,
    "can_manage_customers": true,
    "can_view_reports": true,
    // ... ON/OFF toggles
  }
}
```
**Logic:**
- Master Admin per company domain (ONE per domain)
- Sub-admin with custom permissions
- Role-based access control

**3.2. Update Admin Permissions**
```
PATCH /api/admins/{admin_id}/permissions
```
**Request Body:**
```json
{
  "permissions": {
    "can_create_sub_admin": false,
    "can_manage_customers": true,
    // ... ON/OFF toggles
  }
}
```

**3.3. Get All Admins (Super Admin View)**
```
GET /api/admins?domain={company_domain}
```
**Authorization:** Only Super Admin  
**Response:** All admins across all domains

---

### ⚡ **4. PRICING SYSTEM** (PRIORITY: HIGH)

#### **Database Changes:**
**New Table: `pricing_rules`**
```sql
- id
- company_id (Foreign Key - for per-company pricing)
- material (enum: asphalt, metal, tile, bur, pvc, tpo, epdm, cedar)
- pitch_type (enum: flat, low, medium, steep, very_steep)
- base_price_per_sqft (decimal)
- is_compatible (boolean) - material + pitch compatibility
- repair_price_per_sqft (decimal)
- maintenance_price_per_sqft (decimal)
- created_at
- updated_at
```

#### **API Endpoints:**

**4.1. Get Pricing**
```
GET /api/pricing?material={material}&pitch={pitch}&company_id={id}
```
**Logic:**
- Material + Pitch combination pricing return karo
- Incompatible combinations ko filter karo
- Repair/maintenance pricing separate return karo

**4.2. Update Pricing (Admin)**
```
PATCH /api/pricing/{pricing_id}
```
**Request Body:**
```json
{
  "base_price_per_sqft": 4.50,
  "repair_price_per_sqft": 1.50,
  "is_compatible": true
}
```

**4.3. Set Material-Pitch Compatibility**
```
POST /api/pricing/compatibility
```
**Request Body:**
```json
{
  "material": "cedar",
  "pitch_type": "flat",
  "is_compatible": false  // Cedar on flat roof = NOT ALLOWED
}
```

**4.4. Calculate Estimate Price**
```
POST /api/estimate/calculate-price
```
**Request Body:**
```json
{
  "material": "asphalt",
  "pitch": "medium",
  "area_sqft": 2000,
  "repair_needed": true,
  "company_id": 123
}
```
**Response:**
```json
{
  "base_price": 9000,
  "repair_price": 3000,
  "total_price": 12000,
  "price_per_sqft": 6.00
}
```

---

### ⚡ **5. SENDGRID INTEGRATION** (PRIORITY: HIGH) ⭐

#### **Setup:**
- SendGrid account credentials receive karni hain client se
- Environment variables me store karo:
  - `SENDGRID_API_KEY`
  - `SENDGRID_FROM_EMAIL`
  - `SENDGRID_FROM_NAME`

#### **API Endpoints:**

**5.1. Send Estimate Email + SMS**
```
POST /api/send-estimate
```
**Request Body:**
```json
{
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "estimate_id": "xyz123",
  "estimate_data": {
    "total_price": 12000,
    "materials": [...],
    "pdf_url": "https://..."
  },
  "admin_notify": true  // Send notification to admin too
}
```
**Logic:**
- SendGrid se email send karo (PDF attachment ke saath)
- SendGrid SMS API ya Twilio se SMS send karo (simultaneously)
- Delivery status track karo
- Admin ko notification bhejo agar successful delivery ho

**5.2. Send Email Template**
```
POST /api/send-email
```
**Request Body:**
```json
{
  "to": "customer@example.com",
  "template_type": "estimate",
  "data": {...},
  "pdf_attachment": "base64_string_or_url"
}
```

**5.3. Get Delivery Status**
```
GET /api/send-status/{message_id}
```
**Response:**
```json
{
  "email_status": "delivered",
  "sms_status": "sent",
  "delivered_at": "2026-01-17T10:30:00Z",
  "opened_at": "2026-01-17T10:35:00Z"
}
```

**5.4. Delivery Analytics**
```
GET /api/analytics/delivery?start_date={}&end_date={}
```
**Response:**
```json
{
  "total_sent": 100,
  "delivered": 95,
  "failed": 5,
  "opened": 60,
  "clicked": 30
}
```

#### **SendGrid Service:**
- Install: `@sendgrid/mail` package
- Email templates create karo (HTML templates)
- SMS integration (SendGrid or Twilio)
- Error handling + retry logic

---

### ⚡ **6. PROJECT CREATION ENHANCEMENT** (PRIORITY: HIGH)

#### **Current Endpoint:**
```
POST /api/roof-estimate-projects
```

#### **Enhanced Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "mobile_number": "+1234567890",
  "address": {...},
  "roof_type": "asphalt",
  "property_type": "residential",
  "latitude": 40.7128,
  "longitude": -74.0060,
  
  // NEW FIELDS:
  "promoter_id": 123,           // For auto-assignment
  "sales_rep_id": 456,
  "marketing_channel": "QR Code",
  "assignment_source": "qr_code",
  "estimate_data": {
    "area_sqft": 2000,
    "material": "asphalt",
    "pitch": "medium",
    "preliminary_price": 12000
  }
}
```

**Logic:**
- Auto-assignment apply karo
- Pricing calculate karo (new pricing API use karo)
- CRM entry create karo
- Commission tracking initialize karo

---

## 📋 **SUMMARY - BACKEND TASKS:**

1. ✅ **Customer Assignment** - Database fields + Auto-assignment logic
2. ✅ **Signup Flow** - Optional account creation API
3. ✅ **Admin Management** - Super Admin create admin endpoints
4. ✅ **Pricing System** - New pricing tables + calculation logic
5. ✅ **SendGrid Integration** - Email + SMS sending + tracking
6. ✅ **Project Creation** - Enhanced with assignment fields

---

## 🔧 **TECHNICAL REQUIREMENTS:**

- **Database:** New tables and fields add karni hain
- **SendGrid:** Package install + API integration
- **Email Templates:** Professional HTML templates
- **SMS:** SendGrid SMS or Twilio integration
- **Analytics:** Delivery tracking and reporting
- **Security:** Proper authorization checks (Super Admin vs Admin vs Customer)

---

## ⚠️ **IMPORTANT NOTES:**

1. **Backend API Base URL:** `http://88.99.241.139:5000/api/` (existing)
2. **SendGrid Credentials:** Client se receive karne hain (pending)
3. **Database Schema:** All new fields/tables document karni hain
4. **Testing:** Har endpoint ke liye proper testing required
5. **Error Handling:** Proper error messages return karni hain

---

**Questions ho to pooch lena!** 🚀
