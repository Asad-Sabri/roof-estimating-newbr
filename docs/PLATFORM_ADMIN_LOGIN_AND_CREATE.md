# Platform Admin – Login & Create

## 1. Login as Platform Admin

1. Open **Login** page: `/login`
2. Enter **email** and **password** of an account that has role **platform_admin** (backend).
3. After login, frontend will:
   - Set `loginRole = "platform-admin"` and `access_type = "platform"`
   - Redirect to **Super Admin dashboard**: `/super-admin/dashboard`
4. Platform Admin uses the **platform-level layout** (same app area as Super Admin but with a **reduced sidebar** and "Platform Admin" label). They see: Dashboard, Subscribers, Customers, Reports only (no Admins, no Settings). Backend restricts what they can do (e.g. no billing, no delete admin, only subscriber create/configure/suspend).

**Note:** If you don’t have a platform_admin account yet, create one as Super Admin (see below).

---

## 2. Create a Platform Admin (as Super Admin)

Only **Super Admin** can create Platform Admins.

1. Login as **Super Admin** (`/login` with super_admin credentials).
2. Go to **Admins** in the sidebar: **Super Admin → Admins** (or `/super-admin/admins`).
3. Click **Create New Admin**.
4. Fill the form:
   - First name, Last name, Email, Mobile, **Password**
   - In **Role** dropdown choose: **"Platform Admin"**
5. Click **Create** (or Save).

Backend will create the user with `role = platform_admin`. That user can then login and will see the Platform Admin layout (reduced menu); backend will enforce Platform Admin permissions (subscriber CRUD only, no billing, etc.).

---

## 3. How layouts differ (client requirement)

| Role | After login | Layout | Sidebar (summary) |
|------|-------------|--------|-------------------|
| **Super Admin** | `/super-admin/dashboard` | Super Admin layout | Dashboard, **Admins**, Customers, Subscribers, All Estimate Projects, Reports, **Settings** |
| **Platform Admin** | `/super-admin/dashboard` | Same shell, **reduced menu** | Dashboard, Subscribers, Customers, Reports (no Admins, no Settings) |
| **Subscriber Admin** (admin/manager/staff) | `/admin-panel/dashboard` | **Subscriber (company) layout** | Request Estimates, Preliminary Estimates, Project Details, Measurement Reports, Subscribers, Customers, Proposals, Payments, Job Progress, Estimating Pricing, Assign Role |

So: **Platform Admin** and **Subscriber Admin** have **different** interfaces. Platform Admin = platform-level, subscriber CRUD only. Subscriber Admin = one company’s data (estimates, projects, payments, etc.).

---

## 4. Role dropdown options (Create Admin form)

| Option | Value sent to backend | Who uses it |
|--------|------------------------|-------------|
| Subscriber Admin (admin, manager, staff) | `role: "admin"` | Subscriber company admins – see only their company data |
| Platform Admin | `role: "platform_admin"` | Platform-level – create/configure/suspend subscribers, no billing |

---

## 5. If backend uses a different API

- If creating admins is done via **POST /api/admins** (and not signup), the frontend may need to call `createAdminAPI({ ...form, role: form.role })` instead of `signupAPI`. Backend docs (e.g. `PHASE1_API_ENDPOINTS.md`) will specify the exact endpoint and body for creating a platform_admin user.
