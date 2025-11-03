// pages/index.tsx

import CustomerPanelNavbar from "@/components/customerpabelnavbar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

interface InvoiceItem {
  item: number;
  reference: number;
  description: string;
  qty: number;
  cost: number;
}
const Home = () => {
  const items: InvoiceItem[] = [
    {
      item: 1,
      reference: 1,
      description: "QM CR PUR",
      qty: 1,
      cost: 49.0,
    },
  ];
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerPanelNavbar />
      {/* Main area: fills remaining height so inner columns can manage their own scrolling */}
      <div className="flex-1 my-10 px-4 sm:px-6 md:px-3">
        <div className="max-w-6xl mx-auto h-full">
          {/* Payment Information Section (Scrollable Left Side) */}
          <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Left side (Scrollable Billing info) */}
            {/* Make this column scrollable only */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-0 md:pr-6">
              <h2 className="text-xl font-semibold text-center md:text-left">
                Payment information
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address 1
                  </label>
                  <input
                    type="text"
                    className="mt-1 py-2 w-full border-gray-300 rounded-md outline-none px-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address 2
                  </label>
                  <input
                    type="text"
                    className="mt-1 py-2 w-full border-gray-300 rounded-md outline-none px-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    className="mt-1 py-2 w-full border-gray-300 rounded-md outline-none px-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <select className="mt-1 py-2 w-full border-gray-300 rounded-md outline-none px-2 border">
                    <option>Select State</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    className="mt-1 py-2 w-full border-gray-300 rounded-md outline-none px-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <select className="mt-1 py-2 w-full border-gray-300 rounded-md outline-none px-2 border">
                    <option>Select Country</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <h1 className=" text-2xl font-bold text-center md:text-left">
                  Order
                </h1>
                <table className="w-full border-collapse text-xs sm:text-sm md:text-base">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="px-2 sm:px-4 py-2 text-left font-semibold">
                        Item
                      </th>
                      <th className="px-2 sm:px-4 py-2 text-left font-semibold">
                        Reference
                      </th>
                      <th className="px-2 sm:px-4 py-2 text-left font-semibold">
                        Description
                      </th>
                      <th className="px-2 sm:px-4 py-2 text-left font-semibold">
                        Qty
                      </th>
                      <th className="px-2 sm:px-4 py-2 text-left font-semibold">
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row, index) => (
                      <tr key={index} className="border-b border-gray-300">
                        <td className="px-2 sm:px-4 py-2">{row.item}</td>
                        <td className="px-2 sm:px-4 py-2">{row.reference}</td>
                        <td className="px-2 sm:px-4 py-2">{row.description}</td>
                        <td className="px-2 sm:px-4 py-2">x{row.qty}</td>
                        <td className="px-2 sm:px-4 py-2">
                          ${row.cost.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right side (Fixed Payment Summary) */}
            {/* Make this column non-scrolling: remove internal overflow and max-height */}
            <div className="w-full md:w-[300px] flex-none md:sticky md:top-30 self-start">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-center md:text-left">
                  Payment summary
                </h2>
                <ul className="text-sm space-y-2">
                  <li className="flex justify-between">
                    <span>Sub-total</span>
                    <span>$49.00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Shipping</span>
                    <span>$0.00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Taxes</span>
                    <span>$0.00</span>
                  </li>
                  <li className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>$49.00</span>
                  </li>
                </ul>
                <button className="bg-red-600 text-white font-bold py-3 px-6 rounded-full w-full text-sm sm:text-base">
                  Place Your Order
                </button>
                <div className="flex items-center justify-center ">
                  <Link href={"/"}>
                    <button className=" text-xs flex items-center gap-1 cursor-pointer font-extrabold text-center">
                      <ArrowLeft className=" text-red-500 w-4" /> BACK TO
                      BUSINESS SERVICES
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Order Section */}
        </div>
      </div>

      {/* Footer */}
      <div className="h-auto sm:h-14 text-white bg-black/80 flex flex-col sm:flex-row items-center justify-between px-3 py-2 sm:py-0 text-xs gap-2 sm:gap-0">
        <div>
          <h1 className="text-[10px] sm:text-[11px] text-gray-200 text-center sm:text-left">
            @ Copyright 2025 Roof Estimate
          </h1>
        </div>
        <div className="flex items-center justify-center gap-3 sm:gap-5 text-center text-[11px] sm:text-xs">
          <h1 className="cursor-pointer hover:underline">Terms of Use</h1>
          <h1 className="cursor-pointer hover:underline">Privacy Policy</h1>
        </div>
      </div>
    </div>
  );
};

export default Home;
