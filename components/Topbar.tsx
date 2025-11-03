"use client";
import React, { useState } from "react";
import Button from "./CustomButton";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi"; // Hamburger icons
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

interface TopBarProps {
  hidden?: boolean;
}

const Topbar: React.FC<TopBarProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const isAuthenticatedUser = useSelector(
    (state: any) => state.auth.isAuthenticated
  );

  console.log("isAuthenticatedUser", isAuthenticatedUser);

  return (
    <div
      className={`${
        isAuthenticatedUser ? "hidden" : "block"
      } relative w-full bg-gradient-to-r from-[#5a5d2f] to-[#2d394b] text-white text-sm font-sans z-50`}
    >
      <div className="flex items-center justify-between px-5 md:pl-20 md:pr-35 py-4">
        {/* Left Contact Info */}
        <div className="flex gap-5 text-white text-[16px] md:text-[18px]">
          <p>+1(800)318-1697</p>
        </div>

        {/* Hamburger Icon - Mobile Only */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <HiX className="text-2xl" />
            ) : (
              <HiMenu className="text-2xl" />
            )}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          <Link
            className="flex hover:text-gray-300 items-center text-[20px] gap-2 cursor-pointer"
            href="/login"
          >
            Login
          </Link>
          <Button onClick={() => router.push("/signup")}>Start Now</Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gradient-to-r from-[#5a5d2f] to-[#2d394b] px-5 py-6 flex flex-col gap-6 items-center text-center shadow-lg">
          <Link
            className="hover:text-gray-300 text-[18px] cursor-pointer"
            href="/login"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
          <Button>Start Now</Button>
        </div>
      )}
    </div>
  );
};

export default Topbar;
