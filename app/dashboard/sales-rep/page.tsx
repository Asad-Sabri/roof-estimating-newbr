"use client";

import React, { useState } from "react";

export default function SalesRepDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  // Render content based on active menu
  const renderContent = () => {
    switch (activeMenu) {
      case "Dashboard":
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Sales Rep Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold">New Leads</h2>
                <p className="text-2xl font-bold">52</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold">Closed Deals</h2>
                <p className="text-2xl font-bold">18</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold">Monthly Target</h2>
                <p className="text-2xl font-bold">75%</p>
              </div>
            </div>
          </>
        );

      case "Leads":
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Leads</h1>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Leads</h2>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border-b">Lead Name</th>
                    <th className="p-2 border-b">Status</th>
                    <th className="p-2 border-b">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="p-2 border-b">John Doe</td>
                    <td className="p-2 border-b">Contacted</td>
                    <td className="p-2 border-b">$3,000</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-2 border-b">Jane Smith</td>
                    <td className="p-2 border-b">Qualified</td>
                    <td className="p-2 border-b">$7,500</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-2 border-b">Mike Johnson</td>
                    <td className="p-2 border-b">Proposal Sent</td>
                    <td className="p-2 border-b">$12,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        );

      case "Opportunities":
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Opportunities</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold">Hot Opportunities</h2>
                <ul className="mt-4 space-y-2">
                  <li className="p-2 rounded bg-purple-50">
                    Client A - $15,000
                  </li>
                  <li className="p-2 rounded bg-purple-50">
                    Client B - $8,500
                  </li>
                  <li className="p-2 rounded bg-purple-50">
                    Client C - $12,200
                  </li>
                </ul>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold">Pipeline Progress</h2>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-purple-600 h-4 rounded-full w-3/4"></div>
                </div>
                <p className="mt-2 text-sm">75% of target achieved</p>
              </div>
            </div>
          </>
        );

      case "Sales Reports":
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Sales Reports</h1>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold">Monthly Sales</h2>
              <ul className="mt-4 space-y-2">
                <li className="p-2 rounded bg-gray-50">January - $25,000</li>
                <li className="p-2 rounded bg-gray-50">February - $32,000</li>
                <li className="p-2 rounded bg-gray-50">March - $28,500</li>
              </ul>
            </div>
          </>
        );

      case "Performance":
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Performance</h1>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold">Quarterly Performance</h2>
              <div className="mt-4">
                <p>Q1: 80%</p>
                <p>Q2: 95%</p>
                <p>Q3: 70%</p>
              </div>
            </div>
          </>
        );

      case "Commissions":
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Commissions</h1>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold">This Month</h2>
              <p className="text-2xl font-bold">$4,200</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6 mt-6">
              <h2 className="text-lg font-semibold">Pending Payments</h2>
              <p className="text-2xl font-bold">$1,100</p>
            </div>
          </>
        );

      case "Settings":
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold">Profile</h2>
              <form className="mt-4 space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 border rounded"
                />
                <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                  Save
                </button>
              </form>
            </div>
          </>
        );

      default:
        return <h1 className="text-xl">Select a menu</h1>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-purple-600">
          Sales Rep
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            "Dashboard",
            "Leads",
            "Opportunities",
            "Sales Reports",
            "Performance",
            "Commissions",
            "Settings",
          ].map((menu) => (
            <button
              key={menu}
              onClick={() => setActiveMenu(menu)}
              className={`block w-full text-left p-2 rounded ${
                activeMenu === menu ? "bg-purple-600" : "hover:bg-purple-600"
              }`}
            >
              {menu}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
    </div>
  );
}
