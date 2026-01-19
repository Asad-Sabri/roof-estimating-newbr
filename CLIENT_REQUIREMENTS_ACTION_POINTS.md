# Client Requirements - Action Points
**Date:** January 17, 2026  
**Project:** Superior Pro Roof System - Phase 1 Finalization

---

## 📋 **SUMMARY OF CHANGES**

Yeh document client ke requirements ko organize karti hai. Har section me detailed tasks hain jo implement karne hain.

---

## ✅ **1. CUSTOMER → ADMIN ASSIGNMENT (Automatic)**

### Current Status:
- Customer assignment logic abhi manually ho rahi hai ya missing hai

### Tasks:
1. **QR Code / Link Tracking System**
   - ✅ Instant estimate link se aane wale customers ko track karna
   - ✅ QR code parameters capture karna (promoter_id, sales_rep_id, marketing_channel)
   - ✅ URL parameters me `?promoter=ID` ya `?sales_rep=ID` format implement karna

2. **Backend Assignment Logic**
   - ✅ Customer create hote hi automatically assign karne ka logic
   - ✅ Instant estimate form submit pe assignment trigger karna
   - ✅ Assignment source (QR code, link, direct entry) track karna

3. **CRM Integration**
   - ✅ New customer automatically CRM me appear ho with assigned admin/sales rep
   - ✅ Commission calculation ke liye proper tracking
   - ✅ Performance tracking per promoter/marketing channel

4. **Super Admin Reassignment**
   - ✅ Super Admin ko ability deni hai koi bhi customer reassign karne ki
   - ✅ Reassignment history maintain karna
   - ✅ UI me reassignment option add karna admin panel me

**Files to Modify:**
- `app/api/projects/` - Project creation API
- `app/admin-panel/customers/page.tsx` - Reassignment UI
- `components/estimating/` - QR code tracking in instant estimate

---

## ✅ **2. NEW CUSTOMER LOGIN / SIGNUP FLOW**

### Current Status:
- Signup page exists but flow needs modification
- Instant estimate se direct address entry nahi hoti
- Optional account creation missing hai

### Tasks:
1. **Instant Estimate Flow Modification**
   - ❌ Customer instant estimate link/QR se aaye to **DIRECTLY address entry screen** par jaye
   - ❌ Login/dashboard skip karna jab instant estimate link se aaye
   - ✅ URL parameter check karna (`?instant=true` or similar)

2. **Address-First Flow**
   - ✅ Address entry screen ko first step banana
   - ✅ Address ke baad estimate calculation
   - ✅ Preliminary estimate show karne ke baad optional account creation offer

3. **Optional Account Creation**
   - ✅ Estimate receive karne ke baad "Create Account" option dena
   - ✅ Required fields: First Name, Last Name, Email, Phone Number (verified by OTP), Address
   - ✅ Username/password creation step
   - ✅ Email verification step (existing OTP system use karna)

4. **Existing Customer Login Flow**
   - ✅ Main portal se login
   - ✅ "Forgot User ID" option (already exists - verify working)
   - ✅ "Forgot Password" option (already exists - verify working)
   - ✅ Secure email/text verification for both

**Files to Modify:**
- `app/instant-estimate/page.tsx` - Flow modification
- `components/estimating/InstantEstimateLanding.tsx` - Address entry first
- `app/signup/page.tsx` - Optional signup after estimate
- `app/forget-user-id/page.tsx` - Verify functionality
- `app/forget/page.tsx` - Verify functionality

---

## ✅ **3. ADMIN CREATION FLOW**

### Current Status:
- Admin dashboard exists
- Super Admin create admin functionality verify karni hai

### Tasks:
1. **Super Admin Dashboard**
   - ✅ Verify Super Admin can create Admins directly
   - ✅ Create Admin button/option in Super Admin dashboard
   - ✅ Admin creation form with proper fields

2. **Master Admin per Domain**
   - ✅ Each company domain ke liye ONE Master Admin
   - ✅ Master Admin can create sub-admins
   - ✅ Role assignment via ON/OFF toggles (existing functionality verify)

3. **Access Level Management**
   - ✅ ON/OFF toggles for specific permissions
   - ✅ Role-based access control (existing system verify)
   - ✅ Sub-admin creation with limited permissions

4. **Super Admin Visibility**
   - ✅ Super Admin ko sabhi domains ka full visibility
   - ✅ Cross-domain admin management capability

**Files to Modify/Verify:**
- `app/admin-panel/dashboard/page.tsx` - Create Admin option
- `app/admin-panel/assign-role/page.tsx` - Role assignment system
- `app/dashboard/admin/page.tsx` - Super Admin layout

---

## ✅ **4. PRICING MODULE**

### Current Status:
- Basic pricing exists in `app/admin-panel/estimating-pricing/page.tsx`
- Material and pitch-based pricing logic needs enhancement

### Tasks:
1. **Material Base Pricing**
   - ✅ Base price per square foot by material:
     - Asphalt
     - Metal
     - Tile
     - BUR
     - PVC
     - TPO
     - EPDM
     - Cedar (verify compatibility)
   - ✅ Admin-editable rate tables

2. **Pitch Modifiers**
   - ✅ Separate modifiers for pitch types:
     - Flat
     - Low
     - Medium
     - Steep
     - Very Steep
   - ✅ Material + Pitch combination pricing

3. **Material-Pitch Compatibility Logic**
   - ✅ Incompatible combinations restrict karna
   - ✅ Example: Cedar or shingle on flat roofs = NOT ALLOWED
   - ✅ UI me validation add karna (dropdown disable karna incompatible options)

4. **Repair/Maintenance Pricing**
   - ✅ Separate repair/maintenance pricing per material
   - ✅ Pitch-based repair pricing modifiers
   - ✅ Admin-editable repair rates

5. **Admin-Editable Rate Tables**
   - ✅ Per-company customization of pricing
   - ✅ Financing options pricing
   - ✅ Rate tables editing UI (enhance existing)

**Files to Modify:**
- `app/admin-panel/estimating-pricing/page.tsx` - Enhance pricing system
- `components/layout/pdf/calculateMaterials.ts` - Pricing calculation logic
- `components/layout/pdf/PDFTemplate.tsx` - Pricing display
- Backend API - Pricing storage and retrieval

---

## ✅ **5. SENDGRID INTEGRATION**

### Current Status:
- Email/SMS sending abhi basic format me hai (mailto:, sms: links)
- Proper SendGrid integration missing

### Tasks:
1. **SendGrid Setup**
   - ❌ SendGrid API credentials receive karna client se
   - ❌ Environment variables me credentials store karna
   - ❌ SendGrid SDK install karna (`@sendgrid/mail`)

2. **Email Sending**
   - ❌ Automated preliminary estimate email sending
   - ❌ Professional email template with estimate PDF
   - ❌ Email delivery confirmation tracking

3. **SMS Sending**
   - ❌ SendGrid SMS API ya Twilio integration
   - ❌ Simultaneous email + SMS sending
   - ❌ SMS delivery confirmation

4. **Notification System**
   - ❌ Admin notifications upon successful delivery
   - ❌ Delivery status tracking (sent, delivered, failed)
   - ❌ Analytics dashboard for delivery metrics

5. **Email Templates**
   - ❌ Professional estimate email template
   - ❌ Branded email design
   - ❌ PDF attachment functionality

**Files to Create/Modify:**
- `services/sendgrid.ts` - New SendGrid service
- `app/api/send-estimate/route.ts` - New API endpoint
- `components/estimating/steps/Step11ReviewEstimates.tsx` - Integration
- `.env` - API credentials storage

---

## ✅ **6. AI & POLYGON ACCURACY**

### Current Status:
- AI model development continue karni hai
- Polygon editing capability verify karni hai

### Tasks:
1. **AI Roof Detection**
   - ✅ Continue AI model development for automatic roof geometry
   - ✅ Google Solar API integration preparation
   - ✅ Roof detection accuracy improvement

2. **Flat Roof Calculations**
   - ✅ Parapet wall height inclusion in calculations
   - ✅ Top surface area calculation
   - ✅ Flat roof specific measurements

3. **Polygon Editing**
   - ✅ Editable polygon capability for refinement
   - ✅ Manual polygon adjustment UI
   - ✅ Polygon validation and verification

**Files to Modify:**
- `components/hooks/useMapboxFunctions.ts` - Polygon editing
- `app/api/google-solar/` - Google Solar API integration
- AI model files (if separate)

---

## ✅ **7. PROJECT TIMELINE**

### Task:
1. **Phase 1 Completion Schedule**
   - ❌ Definitive schedule create karna by Sunday
   - ❌ Internal milestones define karna:
     1. Final instant-estimate flow and report delivery
     2. AI model integration and testing
     3. Backend / SendGrid configuration
     4. Admin-panel final refinements and role setup
   - ❌ Timeline document create karna

---

## 📝 **IMPLEMENTATION PRIORITY**

### **High Priority (Must Complete First):**
1. ✅ Customer → Admin Assignment (Backend logic)
2. ✅ New Customer Login/Signup Flow (Address-first)
3. ✅ SendGrid Integration (Email/SMS delivery)
4. ✅ Pricing Module (Material + Pitch logic)

### **Medium Priority:**
5. ✅ Admin Creation Flow (Verify and enhance)
6. ✅ AI & Polygon Accuracy (Continue development)

### **Low Priority:**
7. ✅ Project Timeline (Documentation)

---

## 🔧 **TECHNICAL NOTES**

- **Backend API Changes:** Most features require backend API modifications
- **Database Schema:** Customer assignment tracking ke liye database changes needed
- **Environment Variables:** SendGrid credentials add karni hongi
- **Testing:** Har feature ke liye proper testing required
- **QR Code System:** QR code generation and tracking system needed

---

## ✅ **APPROVAL CHECKLIST**

- [ ] All points reviewed by team
- [ ] Priority order approved
- [ ] Timeline approved
- [ ] Backend team notified
- [ ] Client requirements fully understood
- [ ] Ready to start implementation

---

**Next Steps:**
1. Review aur approve karein
2. Backend team ko requirements share karein
3. Implementation start karein priority order me
