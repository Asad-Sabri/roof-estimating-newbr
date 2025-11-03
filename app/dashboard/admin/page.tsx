// "use client";

// import React, { useState, useMemo, JSX } from "react";

// type MenuKey = "dashboard" | "users" | "reports" | "settings";

// const mockUsers = [
//   {
//     id: 1,
//     name: "John Doe",
//     role: "Estimator",
//     email: "john@example.com",
//     status: "Active",
//   },
//   {
//     id: 2,
//     name: "Jane Smith",
//     role: "Sales Rep",
//     email: "jane@example.com",
//     status: "Pending",
//   },
//   {
//     id: 3,
//     name: "Sam Wilson",
//     role: "Crew",
//     email: "sam@example.com",
//     status: "Active",
//   },
// ];

// const monthlyReport = [
//   { month: "Jan", revenue: 4000 },
//   { month: "Feb", revenue: 3000 },
//   { month: "Mar", revenue: 5200 },
//   { month: "Apr", revenue: 2800 },
//   { month: "May", revenue: 6500 },
//   { month: "Jun", revenue: 4800 },
// ];

// export default function AdminDashboardPage(): JSX.Element {
//   const [active, setActive] = useState<MenuKey>("dashboard");
//   const [query, setQuery] = useState("");
//   const [users, setUsers] = useState(mockUsers);
//   const [wasteFactor, setWasteFactor] = useState<number>(18);
//   const [notificationsOn, setNotificationsOn] = useState(true);

//   const filteredUsers = useMemo(
//     () =>
//       users.filter(
//         (u) =>
//           u.name.toLowerCase().includes(query.toLowerCase()) ||
//           u.email.toLowerCase().includes(query.toLowerCase())
//       ),
//     [users, query]
//   );

//   // Small action examples (mock)
//   const deleteUser = (id: number) => {
//     setUsers((prev) => prev.filter((u) => u.id !== id));
//   };

//   const toggleStatus = (id: number) => {
//     setUsers((prev) =>
//       prev.map((u) =>
//         u.id === id
//           ? { ...u, status: u.status === "Active" ? "Pending" : "Active" }
//           : u
//       )
//     );
//   };

//   return (
//     <div className="flex h-screen bg-gray-50 text-sm">
//       {/* SIDEBAR */}
//       <aside className="w-72 bg-blue-800 text-white flex flex-col">
//         <div className="p-5 border-b border-blue-700">
//           <div className="text-2xl font-bold">Admin Panel</div>
//           <div className="text-xs text-blue-200 mt-1">
//             RoofCRM • Back Office
//           </div>
//         </div>

//         <nav className="p-4 space-y-2 flex-1">
//           <button
//             onClick={() => setActive("dashboard")}
//             className={`w-full text-left px-3 py-2 rounded-lg transition ${
//               active === "dashboard" ? "bg-white/10" : "hover:bg-white/5"
//             }`}
//             aria-current={active === "dashboard"}
//           >
//             Dashboard
//           </button>

//           <button
//             onClick={() => setActive("users")}
//             className={`w-full text-left px-3 py-2 rounded-lg transition ${
//               active === "users" ? "bg-white/10" : "hover:bg-white/5"
//             }`}
//           >
//             User Management
//           </button>

//           <button
//             onClick={() => setActive("reports")}
//             className={`w-full text-left px-3 py-2 rounded-lg transition ${
//               active === "reports" ? "bg-white/10" : "hover:bg-white/5"
//             }`}
//           >
//             Reports
//           </button>

//           <button
//             onClick={() => setActive("settings")}
//             className={`w-full text-left px-3 py-2 rounded-lg transition ${
//               active === "settings" ? "bg-white/10" : "hover:bg-white/5"
//             }`}
//           >
//             Settings
//           </button>
//         </nav>

//         <div className="p-4 border-t border-blue-700">
//           <div className="text-xs text-blue-200">Signed in as</div>
//           <div className="mt-2 font-medium">admin@roofco.com</div>
//         </div>
//       </aside>

//       {/* MAIN */}
//       <div className="flex-1 flex flex-col">
//         {/* Topbar */}
//         <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
//           <div>
//             <h2 className="text-lg font-semibold capitalize">
//               {active.replace("-", " ")}
//             </h2>
//             <div className="text-xs text-gray-500">
//               Admin Controls & overview
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="hidden sm:block text-xs text-gray-500">
//               Organization:{" "}
//               <span className="font-medium text-gray-700">RoofCo</span>
//             </div>
//             <button
//               onClick={() => alert("Mock: open notifications")}
//               className="px-3 py-1 rounded bg-slate-100 text-slate-800"
//             >
//               Notifications
//             </button>
//             <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white">
//               A
//             </div>
//           </div>
//         </header>

//         {/* Content area */}
//         <main className="flex-1 overflow-y-auto p-6">
//           {/* Animated container: fade/slide */}
//           <div className="relative">
//             {active === "dashboard" && (
//               <section key="dashboard" className="animate-fade-in">
//                 <DashboardView monthlyReport={monthlyReport} users={users} />
//               </section>
//             )}

//             {active === "users" && (
//               <section key="users" className="animate-fade-in">
//                 <UsersView
//                   query={query}
//                   setQuery={setQuery}
//                   users={filteredUsers}
//                   onDelete={deleteUser}
//                   onToggle={toggleStatus}
//                 />
//               </section>
//             )}

//             {active === "reports" && (
//               <section key="reports" className="animate-fade-in">
//                 <ReportsView monthlyReport={monthlyReport} />
//               </section>
//             )}

//             {active === "settings" && (
//               <section key="settings" className="animate-fade-in">
//                 <SettingsView
//                   wasteFactor={wasteFactor}
//                   setWasteFactor={setWasteFactor}
//                   notificationsOn={notificationsOn}
//                   setNotificationsOn={setNotificationsOn}
//                 />
//               </section>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Tailwind animation styles (optional if your config strips unknown classes) */}
//       <style jsx>{`
//         .animate-fade-in {
//           animation: fadeIn 220ms ease;
//         }
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(6px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// /* ---------- Subviews (all inside same file) ---------- */

// function DashboardView({
//   monthlyReport,
//   users,
// }: {
//   monthlyReport: { month: string; revenue: number }[];
//   users: typeof mockUsers;
// }) {
//   const totalRevenue = monthlyReport.reduce((s, r) => s + r.revenue, 0);
//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white rounded-lg shadow p-5">
//           <div className="text-xs text-gray-500">Total Users</div>
//           <div className="text-2xl font-bold mt-2">{users.length}</div>
//           <div className="text-xs text-gray-400 mt-1">All roles combined</div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-5">
//           <div className="text-xs text-gray-500">This Quarter Revenue</div>
//           <div className="text-2xl font-bold mt-2">
//             ${totalRevenue.toLocaleString()}
//           </div>
//           <div className="text-xs text-gray-400 mt-1">Monthly rolling</div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-5">
//           <div className="text-xs text-gray-500">Open Issues</div>
//           <div className="text-2xl font-bold mt-2">7</div>
//           <div className="text-xs text-gray-400 mt-1">
//             Tickets & validations
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 bg-white rounded-lg shadow p-5">
//           <div className="flex items-center justify-between">
//             <h3 className="font-semibold">Revenue Overview</h3>
//             <div className="text-xs text-gray-400">Monthly</div>
//           </div>

//           {/* Tiny bar chart using divs */}
//           <div className="mt-4 flex items-end gap-3 h-40">
//             {monthlyReport.map((m) => {
//               const height = Math.max(10, (m.revenue / 7000) * 100); // scale
//               return (
//                 <div
//                   key={m.month}
//                   className="flex-1 flex flex-col items-center"
//                 >
//                   <div
//                     className="w-full bg-gradient-to-t from-sky-500 to-indigo-500 rounded-t"
//                     style={{ height: `${height}%` }}
//                   />
//                   <div className="mt-2 text-xs text-gray-600">{m.month}</div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-5">
//           <h3 className="font-semibold">Recent Activity</h3>
//           <ul className="mt-3 space-y-2">
//             <li className="flex items-start gap-3">
//               <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
//               <div className="text-xs text-gray-600">
//                 Proposal #102 signed by John D.
//               </div>
//             </li>
//             <li className="flex items-start gap-3">
//               <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2" />
//               <div className="text-xs text-gray-600">
//                 Payment pending for Invoice #58
//               </div>
//             </li>
//             <li className="flex items-start gap-3">
//               <div className="w-2 h-2 rounded-full bg-slate-400 mt-2" />
//               <div className="text-xs text-gray-600">
//                 New lead created via estimating tool
//               </div>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

// function UsersView({
//   query,
//   setQuery,
//   users,
//   onDelete,
//   onToggle,
// }: {
//   query: string;
//   setQuery: (q: string) => void;
//   users: typeof mockUsers;
//   onDelete: (id: number) => void;
//   onToggle: (id: number) => void;
// }) {
//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between gap-4">
//         <div className="flex items-center gap-3">
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search users by name or email..."
//             className="px-3 py-2 border rounded-lg w-80 text-sm"
//           />
//           <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">
//             Invite User
//           </button>
//         </div>
//         <div className="text-xs text-gray-500">Total: {users.length}</div>
//       </div>

//       <div className="bg-white rounded-lg shadow overflow-x-auto">
//         <table className="w-full text-left">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-3 text-xs text-gray-500">Name</th>
//               <th className="px-4 py-3 text-xs text-gray-500">Email</th>
//               <th className="px-4 py-3 text-xs text-gray-500">Role</th>
//               <th className="px-4 py-3 text-xs text-gray-500">Status</th>
//               <th className="px-4 py-3 text-xs text-gray-500">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map((u) => (
//               <tr
//                 key={u.id}
//                 className="border-b last:border-0 hover:bg-gray-50"
//               >
//                 <td className="px-4 py-3">{u.name}</td>
//                 <td className="px-4 py-3">{u.email}</td>
//                 <td className="px-4 py-3">{u.role}</td>
//                 <td className="px-4 py-3">
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs ${
//                       u.status === "Active"
//                         ? "bg-green-100 text-green-700"
//                         : "bg-yellow-100 text-yellow-700"
//                     }`}
//                   >
//                     {u.status}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3">
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => onToggle(u.id)}
//                       className="px-2 py-1 border rounded text-xs"
//                     >
//                       Toggle
//                     </button>
//                     <button
//                       onClick={() => onDelete(u.id)}
//                       className="px-2 py-1 bg-red-600 text-white rounded text-xs"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//             {users.length === 0 && (
//               <tr>
//                 <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
//                   No users found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// function ReportsView({
//   monthlyReport,
// }: {
//   monthlyReport: { month: string; revenue: number }[];
// }) {
//   const total = monthlyReport.reduce((s, r) => s + r.revenue, 0);
//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="font-semibold">Financial Reports</h3>
//         <div className="text-xs text-gray-500">Summary for last 6 months</div>
//       </div>

//       <div className="bg-white rounded-lg shadow p-5">
//         <div className="flex items-center justify-between">
//           <div>
//             <div className="text-xs text-gray-500">Total Revenue (6 mo)</div>
//             <div className="text-2xl font-bold mt-1">
//               ${total.toLocaleString()}
//             </div>
//           </div>
//           <div className="w-80">
//             {/* simple sparkline using inline svg */}
//             <svg viewBox="0 0 120 40" className="w-full h-10">
//               {monthlyReport.map((m, i) => {
//                 const max = Math.max(...monthlyReport.map((x) => x.revenue));
//                 const x = (i / (monthlyReport.length - 1)) * 120;
//                 const y = 40 - (m.revenue / max) * 35;
//                 return (
//                   <circle key={m.month} cx={x} cy={y} r="2.2" fill="#0ea5e9" />
//                 );
//               })}
//               {/* Path quickly approximated for demo */}
//               <polyline
//                 fill="none"
//                 stroke="#7c3aed"
//                 strokeWidth={1.8}
//                 points={monthlyReport
//                   .map((m, i) => {
//                     const max = Math.max(
//                       ...monthlyReport.map((x) => x.revenue)
//                     );
//                     const x = (i / (monthlyReport.length - 1)) * 120;
//                     const y = 40 - (m.revenue / max) * 35;
//                     return `${x},${y}`;
//                   })
//                   .join(" ")}
//               />
//             </svg>
//           </div>
//         </div>

//         <div className="mt-4">
//           <table className="w-full text-left text-xs">
//             <thead className="text-gray-500">
//               <tr>
//                 <th className="px-3 py-2">Month</th>
//                 <th className="px-3 py-2">Revenue</th>
//               </tr>
//             </thead>
//             <tbody>
//               {monthlyReport.map((m) => (
//                 <tr key={m.month} className="border-b last:border-0">
//                   <td className="px-3 py-2">{m.month}</td>
//                   <td className="px-3 py-2">${m.revenue.toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// function SettingsView({
//   wasteFactor,
//   setWasteFactor,
//   notificationsOn,
//   setNotificationsOn,
// }: {
//   wasteFactor: number;
//   setWasteFactor: (n: number) => void;
//   notificationsOn: boolean;
//   setNotificationsOn: (b: boolean) => void;
// }) {
//   return (
//     <div className="space-y-4">
//       <div className="bg-white rounded-lg shadow p-5">
//         <h3 className="font-semibold">Company Settings</h3>
//         <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs text-gray-600">
//               Default Waste Factor (%)
//             </label>
//             <select
//               value={wasteFactor}
//               onChange={(e) => setWasteFactor(Number(e.target.value))}
//               className="mt-2 px-3 py-2 border rounded w-44"
//             >
//               {[0, 15, 18, 21, 24, 27].map((n) => (
//                 <option key={n} value={n}>
//                   {n}%
//                 </option>
//               ))}
//             </select>
//             <div className="text-xs text-gray-400 mt-2">
//               Applied to material calculations
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs text-gray-600">Notifications</label>
//             <div className="mt-2 flex items-center gap-3">
//               <button
//                 onClick={() => setNotificationsOn(true)}
//                 className={`px-3 py-1 rounded ${
//                   notificationsOn ? "bg-indigo-600 text-white" : "bg-gray-100"
//                 }`}
//               >
//                 On
//               </button>
//               <button
//                 onClick={() => setNotificationsOn(false)}
//                 className={`px-3 py-1 rounded ${
//                   !notificationsOn ? "bg-indigo-600 text-white" : "bg-gray-100"
//                 }`}
//               >
//                 Off
//               </button>
//             </div>
//             <div className="text-xs text-gray-400 mt-2">
//               Email/SMS notifications for system events
//             </div>
//           </div>
//         </div>

//         <div className="mt-4">
//           <button
//             onClick={() =>
//               alert(
//                 `Saved (mock): waste ${wasteFactor}% • notif ${notificationsOn}`
//               )
//             }
//             className="px-4 py-2 bg-emerald-600 text-white rounded"
//           >
//             Save Settings
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  FileText,
  CreditCard,
  Briefcase,
  ClipboardList,
  Users,
  Settings,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin-panel/dashboard", icon: LayoutDashboard },
  { name: "Proposals", href: "/admin-panel/proposals", icon: FileText },
  { name: "Payments", href: "/admin-panel/payments", icon: CreditCard },
  { name: "Job Progress", href: "/admin-panel/job-progress", icon: Briefcase },
  { name: "Estimates", href: "/admin-panel/estimates", icon: ClipboardList },
  { name: "Customers", href: "/admin-panel/customers", icon: Users },
  { name: "Assign Role", href: "/admin-panel/assign-role", icon: Settings },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Close sidebar when route changes (useful after clicking a link)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="lg:flex min-h-screen bg-gray-100 text-gray-900">
      {/* Overlay (shown on mobile when sidebar is open) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 inset-y-0 left-0 transform bg-white shadow-lg w-64 transition-transform duration-300 ease-in-out 
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        aria-label="Sidebar"
      >
        {/* Sidebar content container with scroll */}
        <div className="h-screen flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="h-16 flex items-center justify-center font-bold text-xl bg-gradient-to-r from-green-600 to-teal-600 text-white">
            Admin Panel
          </div>

          {/* Navigation items */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)} // close on mobile when a nav link is clicked
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200
              ${
                isActive
                  ? "bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-green-100"
              }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer (Logout button stays fixed at bottom of scroll area) */}
          <div className="p-4 border-t">
            <button
              className="flex items-center cursor-pointer gap-2 w-full px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 overflow-x-auto">
        {/* Navbar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open sidebar menu"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <h1 className="font-semibold text-lg tracking-wide truncate text-center lg:text-left">
            Roof Estimate CRM
          </h1>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-sm text-gray-600">
              Admin User
            </span>
            <img
              src="https://i.pravatar.cc/40?img=5"
              alt="profile"
              className="w-10 h-10 rounded-full border shadow-sm"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-y-auto lg:p-6 bg-gray-50 ">
          {children}
        </main>
      </div>
    </div>
  );
}
