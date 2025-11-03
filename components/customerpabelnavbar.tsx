"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getProfileAPI } from "@/services/auth";

export default function CustomerPanelNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfileAPI,
    retry: false,
  });

  // 👇 yeh abhi dummy auth state hai
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <header className="h-[120px] bg-white shadow flex items-center justify-between px-4 md:px-6 sticky top-0 z-[99999]">
      {/* Left Side - Brand */}
      {/* <h1 className="font-semibold text-lg tracking-wide">Roof Estimate CRM</h1> */}

      <Image
        src="/logo-latest.png"
        alt="Roof Estimate CRM Logo"
        width={140}
        height={40}
        className="object-contain cursor-pointer hover:opacity-80"
      />

      {/* Desktop Section */}
      <Link href={"/customer-panel/dashboard"}>
        <div className="hidden md:flex flex-row-reverse items-center gap-3 cursor-pointer">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">
              {data?.first_name || "John"}
            </span>
            <span className="text-sm text-gray-600">
              {data?.last_name || "Doe"}
            </span>
          </div>
          {data?.profile_image ? (
            <Image
              src={data?.profile_image}
              alt="profile"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full border shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border shadow-sm bg-blue-500 flex items-center justify-center">
              <span className="text-white font-semibold">
                {data?.first_name?.charAt(0) || "A"}
                {data?.last_name?.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-16 right-4 bg-white shadow-md rounded-lg p-4 w-56 flex flex-col space-y-3 md:hidden">
          <Link href={"/customer-panel/dashboard"}>
            <div className="flex items-center space-x-3">
              <img
                src="https://i.pravatar.cc/40"
                alt="profile"
                className="w-10 h-10 rounded-full border shadow-sm"
              />
              <span className="text-sm text-gray-600">John Doe</span>
            </div>
          </Link>
        </div>
      )}
    </header>
  );
}
