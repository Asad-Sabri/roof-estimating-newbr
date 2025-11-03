"use client";

import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const Signature = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [isOpen1, setIsOpen1] = useState(false);

  const toggleModal = () => setIsOpen1(!isOpen1);

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  const steps = [
    {
      number: 1,
      title: "Select Document",
      description: "Choose the document you want to sign.",
    },
    {
      number: 2,
      title: "Set the Date",
      description: "Select today’s date or choose a different one.",
    },
    {
      number: 3,
      title: "Add Signature",
      description: "Long-press the signature field to open the signing box.",
    },
    {
      number: 4,
      title: "Client Signs",
      description:
        "Sign your part, then have the client sign their section on the document.",
    },
  ];

  const featuress = [
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
              Take Control With iRoofing's Digital Roofing Contracts
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
      <section className="bg-[#f9fcf9] py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0c2d3c] mb-6">
            Simplify Your Workflow with One Smart{" "}
            <br className="hidden md:block" />
            Roofing Contracts Tool
          </h2>
          <p className="text-[#1c2b36] text-base md:text-lg leading-relaxed">
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
      <section className="bg-[#f9fcf9] py-16 px-4 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
          {/* Left Side: Image with play button */}
          <div
            className="w-full md:w-1/2 relative cursor-pointer"
            onClick={toggleModal}
          >
            <Image
              src="/roofingipad.png" // Place your image in /public
              alt="Contract Preview"
              width={800}
              height={600}
              className="rounded-xl shadow-xl"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/70 p-4 rounded-full hover:scale-105 transition-transform">
                <svg
                  className="w-8 h-8 text-black"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Side: Text Content */}
          <div className="w-full md:w-1/2 space-y-6 text-[#0c2d3c]">
            <div>
              <h3 className="font-bold">Upload and Go:</h3>
              <p>
                Turn any roof contract into a digital document that’s ready for
                action.
              </p>
            </div>
            <div>
              <h3 className="font-bold">Sign Anywhere, Anytime:</h3>
              <p>
                Get roofing contracts signed on the spot, directly from your
                device—no delays, no downtime.
              </p>
            </div>
            <div>
              <h3 className="font-bold">Share with Ease:</h3>
              <p>
                Instantly email, print, or share roofing contracts through
                popular platforms like Google Drive and Dropbox.
              </p>
            </div>
            <div>
              <h3 className="font-bold">Adjust on the Fly:</h3>
              <p>
                Modify roof contracts on-site to accommodate last-minute
                changes, ensuring agreements are always up-to-date.
              </p>
            </div>
            <div>
              <h3 className="font-bold">Stay Organized:</h3>
              <p>
                Manage all your roofing contracts from a single platform,
                accessible wherever your work takes you.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Overlay */}
        {isOpen1 && (
          <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-[99999] px-4">
            <div className="relative w-full max-w-3xl rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={toggleModal}
                className="absolute top-2 right-2 text-white text-2xl font-bold z-10"
              >
                &times;
              </button>
              <video controls autoPlay className="w-full h-auto rounded-lg">
                <source src="/video2.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </section>
      <section className="bg-gradient-to-b from-[#004e5e] to-[#002a3a] text-white py-16 px-4 md:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          {/* Left Column */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              Real Benefits for Roofers Like You
            </h2>
            <p className="text-sm md:text-base text-gray-200">
              Forget about the back-and-forth to the office. With iRoofing, you
              can handle all your contract needs directly from the job site.
            </p>
          </div>

          {/* Middle Column */}
          <div className="space-y-10">
            <div>
              <h3 className="text-base md:text-lg font-semibold border-b border-cyan-300 pb-2">
                Quick Setup
              </h3>
              <p className="text-sm md:text-base text-gray-200 mt-2">
                Upload your standard roofing contracts once and use them
                indefinitely.
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold border-b border-cyan-300 pb-2">
                Easy Edits
              </h3>
              <p className="text-sm md:text-base text-gray-200 mt-2">
                Update terms or adjust clauses right from your tablet or laptop,
                even while discussing details with a client.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-10">
            <div>
              <h3 className="text-base md:text-lg font-semibold border-b border-cyan-300 pb-2">
                Immediate Signatures
              </h3>
              <p className="text-sm md:text-base text-gray-200 mt-2">
                No more waiting for clients to “think it over.” Get a signature
                before you even leave the roof.
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold border-b border-cyan-300 pb-2">
                Secure and Accessible
              </h3>
              <p className="text-sm md:text-base text-gray-200 mt-2">
                All roofing contracts are stored securely and are easily
                retrievable for future reference or compliance needs.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-12 flex items-center justify-center">
          <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] cursor-pointer text-white  font-bold w-[217px] h-[44px] flex items-center justify-center rounded-md">
            Get Started
          </button>
        </div>
      </section>
      <section className="bg-[#f9fcf9] py-16 px-4 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Text Content */}
          <div className="w-full lg:w-1/2 space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0c2d3c]">
              Why Roofers Choose iRoofing
            </h2>

            <div>
              <h3 className="font-bold text-xl text-[#0c2d3c]">
                Zero Paperwork:
              </h3>
              <p className="text-gray-700">
                Say goodbye to lost documents and messy handwriting. Digital is
                cleaner, faster, and better.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xl text-[#0c2d3c]">
                More Time Roofing:
              </h3>
              <p className="text-gray-700">
                Less time managing paperwork means more time on the roof, doing
                what earns you money.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xl text-[#0c2d3c]">
                Enhanced Professionalism:
              </h3>
              <p className="text-gray-700">
                Impress clients with your efficiency and technological
                savviness, setting you apart from competitors.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xl text-[#0c2d3c]">
                Unlimited Access:
              </h3>
              <p className="text-gray-700">
                Your subscription includes three team members and unlimited
                use—no hidden fees.
              </p>
            </div>
          </div>

          {/* Right: Image */}
          <div className="w-full lg:w-1/2">
            <Image
              src="/signimg.png" // Move your image to /public directory and use the correct name
              alt="Roofing Digital Document"
              width={700}
              height={500}
              className="rounded-lg shadow-lg object-contain"
            />
          </div>
        </div>
      </section>
      <section className="bg-gradient-to-br from-[#00384E] to-[#022a3a] text-white rounded-xl overflow-hidden mx-4 md:mx-10 my-10">
        <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between py-16 px-6 md:px-12 gap-10">
          {/* Left Text Section */}
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-semibold leading-snug">
              Want to see <span className="text-cyan-400">more?</span>
            </h2>
            <p className="text-white/80">
              Watch our demo to see iRoofing Digital Contracts in action. Ready
              to streamline operations and increase profits? Sign up now and
              lead the way in roofing efficiency.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] cursor-pointer text-white  font-bold w-[217px] h-[44px] flex items-center justify-center rounded-md">
                Join Now
              </button>
              <button className="bg-cyan-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-cyan-600 transition">
                Schedule a Demo
              </button>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="md:w-1/2 flex justify-center">
            <Image
              src="/roofingipad.png" // Make sure image is in /public folder
              alt="iRoofing Contract Preview"
              width={600}
              height={400}
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </section>
      <section className="bg-[#f9fcf9] py-16 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center text-[#0c2d3c] mb-12">
            Quick Steps to Digitally Sign a Document
          </h2>

          <div className="flex flex-col md:flex-row items-start justify-between gap-10">
            {/* Steps List */}
            <div className="space-y-8 md:w-1/2">
              {steps.map((step) => (
                <div key={step.number} className="flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#002f49] text-white font-bold text-lg rounded-full border-2 border-[#b3e5e0]">
                    {step.number}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0c2d3c]">{step.title}</h4>
                    <p className="text-[#0c2d3c] text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* YouTube Video */}
            <div className="w-full md:w-1/2 aspect-video rounded-lg overflow-hidden shadow-xl">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/iqiYVzCE_lg"
                title="Digitally Sign a Document in 4 steps with iRoofing’s Digital Roofing Contracts"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gradient-to-b from-[#023647] to-[#002c3a] py-14 px-5 text-white">
        <h2 className="text-center text-2xl font-bold mb-12 max-w-4xl mx-auto">
          Achieve More Results with iRoofing’s Features
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-8">
          {featuress.map(({ label, icon }, i) => (
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

export default Signature;
