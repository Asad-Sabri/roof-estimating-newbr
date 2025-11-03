"use client";

import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import React, { useState } from "react";
import { FaChevronRight } from "react-icons/fa";

const SuppyOrder = () => {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      number: "1",
      title: "Discover Your Suppliers",
      description:
        "Start by locating suppliers in your vicinity with our geo-intelligent system. Select from a curated list tailored to your specific location and preferences.",
    },
    {
      number: "2",
      title: "Select & Customize Your Order",
      description:
        "Browse through an extensive catalog of materials. Use our intuitive interface to choose products, specify quantities, and customize your order with precision.",
    },
    {
      number: "3",
      title: "Confirm & Track",
      description:
        "Finalize your delivery details and place your order. Stay updated with real-time tracking, ensuring you’re always in the loop from dispatch to delivery.",
    },
  ];

  const features = [
    {
      title: "UNPARALLELED SIMPLICITY",
      description:
        "Order with ease using our refined, user-friendly platform. Say goodbye to cumbersome processes and hello to convenience.",
    },
    {
      title: "ZERO COST, MAXIMUM VALUE",
      description:
        "Enjoy our platform without any per-use fees. Exclusive access for up to three team members, maximizing your operational flexibility and efficiency.",
    },
    {
      title: "PRECISION AND PEACE OF MIND",
      description:
        "Reduce the margin for error with high-definition manufacturer photos for verification, ensuring you receive exactly what you ordered, every time.",
    },
  ];

  const featuress = [
    {
      title: "Geo-Intelligent Supplier Discovery",
      description: "Automatically find suppliers near you.",
    },
    {
      title: "Dynamic Team Access",
      description:
        "Collaborate effortlessly with team-wide access, facilitating seamless project management.",
    },
    {
      title: "One-Tap Ordering",
      description:
        "Simplify your ordering process with our efficient one-tap system.",
    },
    {
      title: "Comprehensive Order Management",
      description:
        "Keep track of your orders with ease from placement to delivery.",
    },
  ];

  interface FaqItem {
    question: string;
    answer: string;
  }

  const faqData: FaqItem[] = [
    {
      question: "Can my distributor be added to iRoofing?",
      answer:
        "Yes, you can contact support to add your distributor to iRoofing’s network.",
    },
    {
      question: "Can I have my material orders shipped to the job site?",
      answer:
        "Yes, iRoofing allows shipping directly to job sites if supported by the distributor.",
    },
    {
      question: "Can I track orders I’ve placed with iRoofing?",
      answer:
        "Absolutely. You can track every step of the order process in real-time.",
    },
    {
      question: "How does payment work for material orders?",
      answer:
        "Payment is processed through your distributor. iRoofing does not handle payments directly.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

   const featuresss = [
    {
      label: "Digital Roof Measurements",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7 7h10v10H7z"
          />
        </svg>
      ),
    },
    {
      label: "Signatures & Documents",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
    },
    {
      label: "Automated Estimates",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2a4 4 0 018 0v2m-4-4v-6"
          />
        </svg>
      ),
    },
    {
      label: "Catalogs & Materials",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 20h9M12 4v16M3 4h9M3 20h9"
          />
        </svg>
      ),
    },
    {
      label: "Hi-Def Roof Visualizer",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3"
          />
        </svg>
      ),
    },
    {
      label: "Integrated Supply Orders",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7h18M3 12h18M3 17h18"
          />
        </svg>
      ),
    },
    {
      label: "Sales Presentations",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-6h6v6"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6"
          />
        </svg>
      ),
    },
    {
      label: "Project Management",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <rect
            width={16}
            height={12}
            x={4}
            y={6}
            rx={2}
            ry={2}
            strokeWidth={2}
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 10h16"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      <HeaderLayout />
      <section className="w-full bg-[#01344e] text-white py-36 px-6 lg:px-20">
        <div className="grid lg:grid-cols-2 gap-10 ">
          <div>
            <h2 className="text-3xl lg:text-5xl font-bold leading-tight mb-4">
              <span className=" text-cyan-500">Material Ordering</span> for the
              Digital Age
            </h2>
            <p className="text-2xl text-gray-200 mb-6">
              Close Your Roof Contract Faster, Work Smarter
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] cursor-pointer text-white text-xl font-bold w-[217px] h-[44px] flex items-center justify-center rounded-md">
                Subscribe Now
              </button>
              <button className="border border-white cursor-pointer text-white text-xl font-bold w-[217px] h-[44px] flex items-center justify-center rounded-md">
                Book a Demo
              </button>
            </div>
          </div>

          <div
            className="relative cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <div className="border-8 border-black rounded-lg outline outline-gray-300">
              <video
                className="w-full rounded-lg"
                src="/video2.mp4"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>

            <div className="mt-6 text-center">
              <button
                className="underline text-white hover:text-gray-300 cursor-pointer"
                onClick={() => setIsOpen(true)}
              >
                Watch Video
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999999] px-4">
            <div className="relative w-full max-w-3xl">
              <button
                className="absolute -top-10 right-0 text-white cursor-pointer text-3xl"
                onClick={() => setIsOpen(false)}
              >
                &times;
              </button>
              <video
                className="w-full rounded-lg"
                src="/video2.mp4"
                controls
                autoPlay
              />
            </div>
          </div>
        )}
      </section>
      <section className="bg-[#f9fcf9] py-16 px-4 md:px-8 lg:px-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0c2d3c] mb-6 leading-tight">
            Embracing the <span className="text-[#29c3ec]">Future</span>
            <br />
            with <span className="text-[#29c3ec]">Advanced</span> Technology
          </h2>

          {/* Description */}
          <p className="text-[#0c2d3c] text-base sm:text-lg leading-relaxed">
            At the heart of iRoofing is our cutting-edge platform, developed
            with the latest in digital technology to simplify the order process
            from start to finish. We’ve integrated geo-location features to
            automatically connect you with suppliers in your area, providing a
            tailored experience that cuts down on time and logistics planning.
            Our comprehensive database includes detailed, high-resolution
            manufacturer photos of every product, ensuring what you order is
            precisely what gets delivered—eliminating the all-too-common issue
            of receiving incorrect materials.
          </p>
        </div>
      </section>
      <section className="bg-[#f9fcf9] py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0c2d3c] mb-12">
            Streamlined in <span className="text-[#29c3ec]">3 Steps</span>
          </h2>

          {/* Steps */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-12 relative">
            {/* Connecting Line (for desktop) */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-[4px] bg-[#0c2d3c]  z-0 mx-[15%]" />

            {steps.map((step, index) => (
              <div
                key={index}
                className="relative z-10 flex flex-col items-center text-center md:w-1/3 px-4"
              >
                {/* Step Number */}
                <div className="w-16 h-16 flex items-center justify-center bg-[#0c2d3c] text-white text-xl font-bold rounded-full border-[6px] border-[#c9ece6] shadow-md mb-6">
                  {step.number}
                </div>

                {/* Step Title */}
                <h3 className="font-semibold text-[#0c2d3c] text-lg mb-2">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-[#0c2d3c] text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#f9fcf9] py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0c2d3c] mb-12">
            Elevate Your Ordering{" "}
            <span className="text-[#29c3ec]">Experience</span>
          </h2>

          {/* Feature Cards */}
          <div className="flex flex-col md:flex-row gap-6 bg-gradient-to-b from-[#06394c] to-[#002638] text-white rounded-lg overflow-hidden shadow-lg">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex-1 px-6 py-8 text-center border-white/30 ${
                  index !== features.length - 1 ? "md:border-r" : ""
                }`}
              >
                <h3 className="text-xl font-bold uppercase mb-4 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#012036] py-16 px-6 sm:px-10 md:px-16 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left Text */}
          <div className="text-2xl font-semibold leading-tight md:col-span-1">
            <p>
              Designed with <br />
              Your{" "}
              <span className="text-[#29c3ec]">
                Needs in <br /> Mind
              </span>
            </p>
          </div>

          {/* Right Feature Boxes */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {features.map(({ title, description }, idx) => (
              <div
                key={idx}
                className={`border-t-2 border-cyan-500 pt-6 ${
                  idx % 2 === 0 ? "" : ""
                }`}
              >
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm max-w-xs">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Centered Button */}
        <div className="mt-12 flex justify-center">
          <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] cursor-pointer text-white font-bold w-[190px] h-[44px] flex items-center justify-center rounded-md">
            Get Started
          </button>
        </div>
      </section>
      <section className="relative bg-[#f8faf6] py-16 px-6 sm:px-10 md:px-0 overflow-hidden ">
        <div className=" relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-end">
          {/* Text Content */}
          <div className="lg:ml-[100px]">
            <h2 className="text-2xl md:text-3xl font-bold text-[#02213a] mb-4 ">
              A <span className="text-[#29c3ec]">Partnership</span> for Success
            </h2>
            <p className="text-[#02213a] text-base md:text-lg mb-6 leading-relaxed">
              Choosing iRoofing means more than just accessing a powerful
              platform; it signifies a partnership aimed at boosting your
              operational efficiency. We’re committed to continuous improvement
              and innovation, ensuring our tools and services evolve to meet the
              changing needs of the roofing industry. With iRoofing, you gain
              not just a supplier but a partner who is as invested in the
              success of your projects as you are.
            </p>
            <button
              type="button"
              className="bg-gradient-to-b from-[#a6c96a] to-[#4c8e29] text-white font-semibold px-6 py-2 rounded-md hover:brightness-110 transition"
            >
              Get Started
            </button>
          </div>

          {/* Image - absolutely positioned on larger screens */}
          <div className="hidden md:block relative">
            <img
              src="/roofimgorder.png" // Add this image in /public folder
              alt="Partnership"
              className="absolute right-0 top-0 max-w-[550px] w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>
      <section className="bg-white py-16 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center text-[#02213a] mb-10">
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-gray-200">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="cursor-pointer py-4 px-2 hover:bg-gray-50 transition-all"
                onClick={() => toggle(index)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#02213a]">
                    {item.question}
                  </p>
                  <FaChevronRight
                    className={`text-[#02213a] transition-transform duration-300 ${
                      openIndex === index ? "rotate-90" : ""
                    }`}
                  />
                </div>
                {openIndex === index && (
                  <div className="mt-3 text-sm text-gray-700">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
       <section className="bg-gradient-to-b from-[#023647] to-[#002c3a] py-14 px-5 text-white">
        <h2 className="text-center text-2xl font-bold mb-12 max-w-4xl mx-auto">
          Achieve More Results with iRoofing’s Features
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-8">
          {featuresss.map(({ label, icon }, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-xl border border-white/90 p-6 text-center bg-[#07203f] cursor-pointer hover:bg-white/10 transition shadow-lg"
            >
              <div className="mb-3 text-sky-300">{icon}</div>
              <p className="text-sm font-light">{label}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default SuppyOrder;
