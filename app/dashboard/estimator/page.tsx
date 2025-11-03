"use client";

import React, { useState } from "react";

export default function EstimatorDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const renderContent = () => {
    switch (activeMenu) {
      case "Dashboard":
        return (
          <div>
            <h1 className="text-3xl font-bold mb-6">Estimator Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold">Pending Estimates</h2>
                <p className="text-2xl font-bold">23</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold">Completed Projects</h2>
                <p className="text-2xl font-bold">87</p>
              </div>
            </div>
          </div>
        );
      case "Projects":
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4">Projects</h1>
            <div className="bg-white shadow rounded-lg p-6">
              <ul className="space-y-3">
                <li className="p-3 border rounded-lg hover:bg-gray-50">
                  Project A – Roof Replacement –{" "}
                  <span className="text-yellow-600">Ongoing</span>
                </li>
                <li className="p-3 border rounded-lg hover:bg-gray-50">
                  Project B – Tile Repair –{" "}
                  <span className="text-green-600">Completed</span>
                </li>
                <li className="p-3 border rounded-lg hover:bg-gray-50">
                  Project C – New Installation –{" "}
                  <span className="text-red-600">Pending</span>
                </li>
              </ul>
            </div>
          </div>
        );
      case "Estimates":
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4">Estimates</h1>
            <div className="bg-white shadow rounded-lg p-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Estimate #</th>
                    <th className="p-2">Project</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-2">EST-1001</td>
                    <td className="p-2">Roof Replacement</td>
                    <td className="p-2">$8,500</td>
                    <td className="p-2 text-green-600">Approved</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-2">EST-1002</td>
                    <td className="p-2">Tile Repair</td>
                    <td className="p-2">$1,200</td>
                    <td className="p-2 text-yellow-600">Pending</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-2">EST-1003</td>
                    <td className="p-2">New Installation</td>
                    <td className="p-2">$15,400</td>
                    <td className="p-2 text-red-600">Rejected</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case "Reports":
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4">Reports</h1>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                Quick insights and summary of estimations and projects.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h2 className="font-semibold">Monthly Estimates</h2>
                  <p className="text-xl font-bold">45</p>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h2 className="font-semibold">Total Value</h2>
                  <p className="text-xl font-bold">$325,000</p>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h2 className="font-semibold">Approval Rate</h2>
                  <p className="text-xl font-bold">78%</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-green-600">
          Estimator
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {["Dashboard", "Projects", "Estimates", "Reports"].map((menu) => (
            <button
              key={menu}
              onClick={() => setActiveMenu(menu)}
              className={`block w-full text-left p-2 rounded ${
                activeMenu === menu ? "bg-green-600" : "hover:bg-green-600"
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
