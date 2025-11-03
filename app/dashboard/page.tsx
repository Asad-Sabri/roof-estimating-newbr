"use client";
import React, { useState } from "react";
import {
  LayoutDashboard,
  User,
  FileText,
  BarChart3,
  UserCheck,
  Users,
  //   ImageSearch,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";

// NOTE: Drop this file into your Next.js app (app/dashboard/page.tsx or a components folder).
// Make sure lucide-react is installed: `npm i lucide-react`
// Tailwind must be configured in your project.

type Role = "admin" | "estimator" | "sales" | "crew" | "customer";

const Sidebar: React.FC<{
  active: Role;
  onChange: (r: Role) => void;
}> = ({ active, onChange }) => {
  const item = (label: string, role: Role, Icon: any, subtitle?: string) => (
    <button
      onClick={() => onChange(role)}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left 
        ${
          active === role
            ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg"
            : "hover:bg-slate-50"
        }`}
    >
      <Icon className="w-5 h-5" />
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        {subtitle && <div className="text-xs opacity-80">{subtitle}</div>}
      </div>
    </button>
  );

  return (
    <aside className="w-72 bg-white border-r shadow-sm p-4 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="w-6 h-6 text-sky-500" />
        <div>
          <div className="font-bold text-lg">Roof CRM</div>
          <div className="text-xs text-gray-500">Estimator & CRM</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {item("Admin", "admin", BarChart3, "Templates, Reports")}
        {item("Estimator", "estimator", FileText, "Inspections & Proposals")}
        {item("Sales Rep", "sales", UserCheck, "Create Estimates")}
        {item("Crew", "crew", Users, "Site Progress")}
        {item("Customer", "customer", User, "View & Sign Proposals")}
      </nav>

      <div className="flex items-center gap-2">
        {/* <ImageSearch className="w-5 h-5 text-gray-500" /> */}
        <div className="text-xs text-gray-500">Map / Imagery Integration</div>
      </div>

      <div className="pt-2 border-t">
        <button className="w-full flex items-center gap-2 p-2 rounded hover:bg-slate-50">
          <Settings className="w-4 h-4" /> Settings
        </button>
        <button className="w-full mt-2 flex items-center gap-2 p-2 rounded hover:bg-slate-50">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
};

const Topbar: React.FC<{ role: Role }> = ({ role }) => {
  return (
    <header className="flex items-center justify-between gap-4 bg-white p-4 shadow-sm rounded">
      <div className="flex items-center gap-3">
        <Menu className="w-5 h-5 text-gray-600 md:hidden" />
        <div>
          <h2 className="text-lg font-semibold">
            {role.toUpperCase()} Dashboard
          </h2>
          <p className="text-sm text-gray-500">Overview & quick actions</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-sm text-gray-500">
            Org: <span className="font-medium">RoofCo</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
            JR
          </div>
        </div>
      </div>
    </header>
  );
};

// Reusable card
const Card: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="text-xs text-gray-400">View</div>
    </div>
    {children}
  </div>
);

// Small KPI
const KPI: React.FC<{
  label: string;
  value: string | number;
  note?: string;
}> = ({ label, value, note }) => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
    {note && <div className="text-xs text-gray-400">{note}</div>}
  </div>
);

// --- Dashboards for each role ---

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPI label="Users" value={1200} />
        <KPI label="Active Leads" value={320} />
        <KPI label="Payments (month)" value="$12,500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Leads Pipeline" className="lg:col-span-2">
          <ul className="divide-y">
            <li className="py-2 flex justify-between">
              <span>John Doe</span>
              <span className="text-sm text-gray-500">Pending</span>
            </li>
            <li className="py-2 flex justify-between">
              <span>Jane Smith</span>
              <span className="text-sm text-gray-500">Approved</span>
            </li>
            <li className="py-2 flex justify-between">
              <span>Sam Wilson</span>
              <span className="text-sm text-gray-500">Rejected</span>
            </li>
          </ul>
        </Card>

        <Card title="Recent Payments">
          <ul className="text-sm">
            <li className="py-1 flex justify-between">John - $500</li>
            <li className="py-1 flex justify-between">Jane - $1200</li>
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Reports">
          <div className="text-sm text-gray-500">
            Monthly revenue & conversions (chart placeholder)
          </div>
          <div className="h-40 mt-2 rounded border border-dashed flex items-center justify-center text-gray-400">
            Chart
          </div>
        </Card>

        <Card title="System Actions">
          <div className="flex flex-col gap-2">
            <button className="py-2 rounded bg-sky-500 text-white">
              Manage Templates
            </button>
            <button className="py-2 rounded border">Sync Imagery</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const EstimatorDashboard: React.FC = () => {
  const inspections = [
    { id: 1, customer: "John Doe", date: "2025-09-10", status: "Completed" },
    { id: 2, customer: "Jane Smith", date: "2025-09-12", status: "Pending" },
  ];

  const proposals = [
    { id: 1, title: "Roof Replacement", amount: "$8,500", status: "Sent" },
    { id: 2, title: "Shingle Repair", amount: "$2,000", status: "Draft" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Quick Actions">
          <div className="flex flex-col gap-2">
            <button className="py-2 rounded bg-indigo-600 text-white">
              New Inspection
            </button>
            <button className="py-2 rounded border">Create Proposal</button>
          </div>
        </Card>

        <KPI label="Open Inspections" value={inspections.length} />
        <KPI label="Proposals" value={proposals.length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Inspections">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Customer</th>
                <th className="text-left py-1">Date</th>
                <th className="text-left py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((i) => (
                <tr key={i.id} className="border-b">
                  <td className="py-1">{i.customer}</td>
                  <td className="py-1">{i.date}</td>
                  <td className="py-1">{i.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Proposals">
          <ul className="text-sm space-y-1">
            {proposals.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>
                  {p.title} - {p.amount}
                </span>
                <span className="text-gray-500">{p.status}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Map & Roof Measurement">
        <div className="h-48 rounded border border-dashed flex items-center justify-center text-gray-400">
          Map / QuickMeasure Area
        </div>
      </Card>
    </div>
  );
};

const SalesDashboard: React.FC = () => {
  const estimates = [
    { id: 1, name: "Roof Repair", amount: "$4,500", status: "Pending" },
    { id: 2, name: "Full Replacement", amount: "$12,000", status: "Approved" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPI label="My Estimates" value={estimates.length} />
        <KPI label="Signed" value={10} />
        <KPI label="Conversion" value="12%" />
      </div>

      <Card title="My Estimates">
        <ul className="divide-y">
          {estimates.map((e) => (
            <li key={e.id} className="py-2 flex justify-between">
              <div>
                <div className="font-medium">{e.name}</div>
                <div className="text-xs text-gray-500">{e.amount}</div>
              </div>
              <div className="text-sm text-gray-500">{e.status}</div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Quick Proposal Builder">
        <div className="text-sm text-gray-500">
          Shortcut to create a new branded proposal PDF and send to customer.
        </div>
        <div className="mt-3 flex gap-2">
          <button className="px-3 py-2 rounded bg-sky-500 text-white">
            Create
          </button>
          <button className="px-3 py-2 rounded border">Preview</button>
        </div>
      </Card>
    </div>
  );
};

const CrewDashboard: React.FC = () => {
  const jobs = [
    { id: 1, name: "Roof Repair - John Doe", progress: "Tear Off" },
    { id: 2, name: "New Installation - Jane Smith", progress: "Shingles" },
  ];

  return (
    <div className="space-y-6">
      <Card title="Assigned Jobs">
        <ul className="divide-y">
          {jobs.map((job) => (
            <li key={job.id} className="py-2 flex justify-between items-center">
              <div>
                <div className="font-medium">{job.name}</div>
                <div className="text-xs text-gray-500">
                  Progress: {job.progress}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="px-3 py-1 rounded bg-emerald-600 text-white text-xs">
                  Upload Photos
                </button>
                <button className="px-3 py-1 rounded border text-xs">
                  Mark Stage
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Daily Checklist">
        <ul className="text-sm list-disc pl-5">
          <li>Safety Briefing</li>
          <li>Tools & Equipment</li>
          <li>Site Photos</li>
        </ul>
      </Card>
    </div>
  );
};

const CustomerDashboard: React.FC = () => {
  const estimates = [
    { id: 1, name: "Roof Repair", amount: "$4,500", status: "Pending" },
    { id: 2, name: "Full Replacement", amount: "$12,000", status: "Approved" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="My Estimates">
          <ul className="divide-y">
            {estimates.map((e) => (
              <li key={e.id} className="py-2 flex justify-between">
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-gray-500">{e.amount}</div>
                </div>
                <div className="text-sm text-gray-500">{e.status}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Contracts & Payments">
          <div className="text-sm text-gray-500">
            Signed contracts, payment links & receipts.
          </div>
        </Card>
      </div>

      <Card title="Track Job Status">
        <div className="text-sm text-gray-500">
          Follow your job’s progress and view photo timeline.
        </div>
        <div className="h-36 mt-2 rounded border border-dashed flex items-center justify-center text-gray-400">
          Timeline / Photos
        </div>
      </Card>
    </div>
  );
};

// Main App-like wrapper to switch roles (useful for demo / wireframe)
export default function RoofCRMDemo() {
  const [role, setRole] = useState<Role>("estimator");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="flex gap-6">
          <Sidebar active={role} onChange={setRole} />

          <main className="flex-1">
            <Topbar role={role} />

            <div className="mt-6">
              {role === "admin" && <AdminDashboard />}
              {role === "estimator" && <EstimatorDashboard />}
              {role === "sales" && <SalesDashboard />}
              {role === "crew" && <CrewDashboard />}
              {role === "customer" && <CustomerDashboard />}
            </div>

            <footer className="mt-8 text-xs text-gray-400">
              Wireframe demo — Phase 1: Estimating Tool • Phase 2: CRM
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
