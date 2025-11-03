"use client";

import React, { useState } from "react";

export default function CrewDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const renderContent = () => {
    switch (activeMenu) {
      case "Dashboard":
        return (
          <div>
            <h1 className="text-3xl font-bold mb-6">Crew Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold">Assigned Tasks</h2>
                <p className="text-2xl font-bold">14</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold">Completed Jobs</h2>
                <p className="text-2xl font-bold">39</p>
              </div>
            </div>
          </div>
        );
      case "Work Orders":
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4">Work Orders</h1>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-600">
                List of active work orders assigned to the crew.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="p-3 border rounded-lg hover:bg-gray-50">
                  Order #1023 – Roof Inspection – Pending
                </li>
                <li className="p-3 border rounded-lg hover:bg-gray-50">
                  Order #1045 – Tile Replacement – In Progress
                </li>
              </ul>
            </div>
          </div>
        );
      case "Schedules":
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4">Schedules</h1>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-600">
                Weekly schedule for your assigned jobs.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  Monday – Roof Inspection – 9:00 AM
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                  Wednesday – Tile Replacement – 11:00 AM
                </div>
              </div>
            </div>
          </div>
        );
      case "Tasks":
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4">Tasks</h1>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-600">
                Daily tasks assigned to crew members.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="p-3 border rounded-lg flex justify-between hover:bg-gray-50">
                  Fix broken shingles
                  <span className="text-green-600 font-medium">Done</span>
                </li>
                <li className="p-3 border rounded-lg flex justify-between hover:bg-gray-50">
                  Inspect ventilation
                  <span className="text-yellow-600 font-medium">
                    In Progress
                  </span>
                </li>
              </ul>
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
      <aside className="w-64 bg-red-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-red-600">
          Crew
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {["Dashboard", "Work Orders", "Schedules", "Tasks"].map((menu) => (
            <button
              key={menu}
              onClick={() => setActiveMenu(menu)}
              className={`block w-full text-left p-2 rounded ${
                activeMenu === menu ? "bg-red-600" : "hover:bg-red-600"
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
