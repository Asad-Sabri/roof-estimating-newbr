"use client";
import Image from "next/image";
import Link from "next/link";
import {
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";
import ContactUsFormSection from "./sections/contact-us-form-section";

export default function Footer() {
  return (
    <>
      <ContactUsFormSection />
      <footer className="bg-gradient-to-b from-[#0B2244] to-[#00313D] text-white pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* App Links */}
          <div className="space-y-4">
            <Image src={"/play-store.png"} width={185} height={85} alt="" />
            <Image src={"/app-store.png"} width={185} height={85} alt="" />
          </div>

          {/* iRoofing */}
          <div>
            <h3 className="font-semibold text-2xl mb-4">Roof Estimate</h3>
            <ul className="space-y-2 text-gray-300 text-xl">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/whyRoof/contractor-reviews"
                  className="hover:text-white"
                >
                  Customer Success
                </Link>
              </li>
              <li>
                <Link
                  href="/whyRoof/manufacturers/"
                  className="hover:text-white"
                >
                  Manufacturers
                </Link>
              </li>
              <li>
                <Link
                  href="/whyRoof/distributors/"
                  className="hover:text-white"
                >
                  Distributors
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/help-center/"
                  className="hover:text-white"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h3 className="font-semibold text-2xl mb-4">About Us</h3>
            <ul className="space-y-2 text-gray-300 text-xl">
              <li>
                <Link href="/whyRoof/about/" className="hover:text-white">
                  Company
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-2xl mb-4">Features</h3>
            <ul className="space-y-2 text-gray-300 text-xl">
              <li>
                <Link href="#" className="hover:text-white">
                  Measurements
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Visualizer
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Estimator
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Customer Database
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Digital Catalogs
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Digital Pitch Book
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Order Materials
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Visit iRoofing */}
        <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Visit Our Office</h3>
            <p className="text-gray-300 text-sm">
              500 Park Avenue
              <br />
              Suite 210,
              <br />
              New York, NY 10022
            </p>
            <p className="mt-4 text-sm text-gray-300">
              <span className="font-medium">Contact Phone:</span> +1 (212)
              555-7890
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-medium">Support Email:</span>{" "}
              support@example.com
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex space-x-4 items-start justify-start md:justify-end">
            <FaInstagram className="h-6 w-6 cursor-pointer hover:text-pink-500" />
            <FaFacebook className="h-6 w-6 cursor-pointer hover:text-blue-500" />
            <FaYoutube className="h-6 w-6 cursor-pointer hover:text-red-500" />
            <FaLinkedin className="h-6 w-6 cursor-pointer hover:text-blue-400" />
            <FaTwitter className="h-6 w-6 cursor-pointer hover:text-sky-400" />
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-600 mt-8 pt-4 text-center text-sm text-gray-400">
          Copyright © 2012–2025 iRoofing LLC. All rights reserved
        </div>
      </footer>{" "}
    </>
  );
}
