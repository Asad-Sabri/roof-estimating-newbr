"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";

const plans = [
  {
    title: "Monthly",
    price: "$149/mo",
    button: "Select",
    savings: "",
    features: [
      "Unlimited Features Usage",
      "1-1 AI Assistance",
      "Smart AI – 25 Free HD Images (250 Credits)/Month",
    ],
  },
  {
    title: "6 Months",
    price: "$794/6 mo",
    button: "Select",
    savings: "Save $100",
    features: [
      "Unlimited Features Usage",
      "1-1 AI Assistance",
      "Smart AI – 25 Free HD Images (250 Credits)/Month",
    ],
  },
  {
    title: "12 Months",
    price: "$1,489/12 mo",
    button: "Select",
    savings: "Save $300",
    features: [
      "Unlimited Features Usage",
      "1-1 AI Assistance",
      "Smart AI – 25 Free HD Images (250 Credits)/Month",
    ],
  },
];

const benefits = [
  "Complete Sales Toolkit",
  "All-in-One Roof Visualizations",
  "AR (Augmented Reality) Tools",
  "Personalized Pricing Catalog",
  "Customized Proposal Generator",
  "Multi-Purpose Digital Contracts",
  "Direct Distributor Ordering",
  "Job Photo Archive",
  "Measurement Scheduling",
  "Customer Database",
  "Secure Cloud Storage",
  "Unlimited Support Access",
  "Quick Start Onboarding",
  "Online Customer Support",
  "Continuous Feature Updates",
];

const devices = [
  {
    title: "Desktop",
    features: [
      "Unlimited Projects",
      "Unlimited Roof Visualizations",
      "Unlimited Roof Measurements",
    ],
    bonus: "150 Monthly HD Credits",
  },
  {
    title: "Phone",
    features: [
      "Unlimited Projects",
      "Unlimited Roof Visualizations",
      "Unlimited Roof Measurements",
    ],
    bonus: "150 Monthly HD Credits",
  },
  {
    title: "Tablet",
    features: [
      "Unlimited Projects",
      "Unlimited Roof Visualizations",
      "Unlimited Roof Measurements",
      "Enhanced Presentations",
      "Unlimited Material Orders",
    ],
    bonus: "150 Monthly HD Credits",
  },
];

export default function PricingPage() {
  return (
    <div className="bg-[#0b1b2b] text-white min-h-screen w-full">
      <HeaderLayout />
      {/* Header */}
      <section className="text-center py-16 max-w-3xl mx-auto mt-20">
        <h1 className="text-3xl font-bold">The Smarter Way to Sell Roofs</h1>
        <p className="mt-4 text-lg text-gray-300">
          Get free HD images every month—plus more tools than any other roofing
          software.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-[#10233a] rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-700"
          >
            <h3 className="text-xl font-semibold">{plan.title}</h3>
            {plan.savings && (
              <p className="text-green-400 font-bold mt-2">{plan.savings}</p>
            )}
            <p className="text-3xl font-bold mt-4">{plan.price}</p>
            <button className="mt-6 cursor-pointer px-6 py-2 rounded-xl bg-green-400 text-black font-semibold hover:bg-green-300 transition">
              {plan.button}
            </button>
            <ul className="mt-6 text-left space-y-2 text-gray-300">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check size={18} className="text-green-400 mt-1" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </section>

      {/* Testimonial */}
      <section className="max-w-2xl mx-auto text-center mt-16 px-4">
        <p className="italic text-gray-300">
          {`"I would recommend this product to any roofer that wants to make the
          bidding process easier for you and the homeowner."`}
        </p>
        <div className="mt-4 font-semibold">Michael Pittman</div>
        <div className="text-sm text-gray-400">California</div>
      </section>

      {/* Handle It Section */}
      <section className="bg-[#0d2a4d] max-w-4xl mx-auto rounded-xl p-8 mt-16 text-center">
        <h2 className="text-xl font-bold">
          Short on time or too busy? Let us handle it!
        </h2>
        <p className="mt-3 text-gray-300">
          Get a perimeter report for just <span className="font-bold">$10</span>{" "}
          – no subscription required!
          <br />
          iRoofing subscribers enjoy an exclusive discount
        </p>
        <button className="mt-6 cursor-pointer px-6 py-3 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition">
          Order Now
        </button>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto text-center mt-16 px-6">
        <h2 className="text-2xl font-bold">
          <span className="text-blue-400">No hidden fees</span>, just clear,
          straightforward pricing.
        </h2>
        <p className="mt-4 text-gray-300">
          Say goodbye to juggling subscriptions and surprise fees. iRoofing
          brings you everything you need.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-10 text-left">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="bg-[#10233a] rounded-xl p-4 border border-gray-700"
            >
              <Check size={18} className="text-green-400 inline mr-2" />
              {benefit}
            </div>
          ))}
        </div>
      </section>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl font-bold leading-snug">
            Revolutionizing Roofing with <br />
            <span className="text-blue-400">
              Clearoof™ HD Imagery Technology
            </span>
          </h1>
        </div>
        <div className="flex justify-center">
          <Image
            src="/before-after-img.gif" // replace with your actual image path
            alt="Before and After"
            width={500}
            height={300}
            className="rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-[#0d2a4d] py-12 px-6 text-center md:text-left md:flex md:items-center md:justify-between max-w-6xl mx-auto rounded-xl">
        <p className="text-gray-300 italic max-w-3xl mx-auto md:mx-0">
          {`"We’ve got your back. No set up fees. All we ask is for a single
          guided session to walk you through everything. Easy, right?"`}
        </p>
        <div className="mt-6 md:mt-0 text-center md:text-right">
          <p className="font-semibold">Chris H.</p>
          <p className="text-sm text-gray-400">
            National Customer Success Manager
          </p>
        </div>
      </section>

      {/* Optimized Software Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 bg-white rounded-[0px_0px_16px_16px] mb-10">
        <h2 className="text-2xl font-bold text-center text-black">
          <span className="text-blue-400">Optimized Software</span> for Every
          Device
        </h2>
        <p className="mt-4 text-black text-center max-w-3xl mx-auto mb-10">
          Our software is tailored to maximize functionality across various
          devices. Discover how each feature is optimized for the ideal user
          experience on the specific hardware you use.
        </p>
        <div className="w-full flex justify-center">
          <Image
            src="/optimized-software-banner.png"
            alt="Before and After"
            width={500}
            height={300}
            className="w-full max-w-[1120px]"
          />
        </div>
      </section>
      <Footer />
    </div>
  );
}
