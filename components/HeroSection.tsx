import React from "react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-[#f8fdfc] text-gray-900">
      <section className="bg-[#163152] text-white py-6 px-4 text-center">
        <p className="max-w-3xl mx-auto italic">
          “I would recommend this roofing app to any roofer that wants to make
          the bidding process easier for them and the homeowner.”
        </p>
        <p className="mt-3 font-semibold">Nathan Reiner</p>
        <p className="text-sm">Contractor</p>
      </section>

      {/* Heading Section */}
      <section className="text-center py-10 px-6">
        <h1 className="text-3xl sm:text-4xl font-bold leading-snug">
          Turn Every Meeting Into a Closed Deal <br /> with the Best Roofing
          App!
        </h1>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm font-semibold">
          {[
            "Digital Roof Sales",
            "Marketing Tools",
            "All Your Workflow",
            "Sales Presentations",
            "Calculators",
            "Proposal Documents",
            "Signed Contracts",
            "Project Management",
          ].map((item, idx) => (
            <button
              key={idx}
              className="px-4 py-2 cursor-pointer rounded-md border border-gray-300 hover:bg-gray-100"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Sales Presentation Card */}
      <section className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 border">
        <p className="text-sm text-sky-600 font-semibold mb-2">
          SALES PRESENTATIONS
        </p>
        <h2 className="text-xl font-bold mb-3">
          Close More Deals with a Digital Roofing Sales Pitch Book
        </h2>
        <p className="text-gray-600 mb-4">
          Impactful, Customized Roof Sales Presentations
        </p>
        <p className="text-gray-700 mb-6">
          Stand out from the rest with a sophisticated, engaging roof sales
          presentation that highlights your roofing company’s value proposition.
        </p>

        <div className="flex flex-wrap gap-4">
          <button className="bg-lime-500 cursor-pointer text-white px-6 py-2 rounded-md font-semibold hover:bg-lime-600">
            Subscribe Now
          </button>
          <button className="bg-cyan-400 cursor-pointer text-white px-6 py-2 rounded-md font-semibold hover:bg-cyan-500">
            Book a Demo
          </button>
        </div>
      </section>

      {/* Measurement Promo Section */}
      <section className="bg-[#0d2144] text-white text-center py-10 px-6 mt-10">
        <h2 className="text-xl font-bold mb-3">
          Need a measurement now? Let us handle it!
        </h2>
        <p className="mb-6">
          Get a professional report for just $10 — no subscription required.
          Roofing subscribers enjoy an exclusive discount.
        </p>
        <button className="bg-yellow-400 cursor-pointer text-black font-semibold px-6 py-3 rounded-md hover:bg-yellow-500">
          Order Now
        </button>
      </section>

      {/* Software Section */}
      <section className="max-w-5xl mx-auto py-12 px-6 text-center">
        <h2 className="text-2xl font-bold mb-6">
          Choosing Roofing Software Made Easy
        </h2>
        <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
          We’ve spent years building the best-in-class solution for roofers,
          backed by real-world testing and customer feedback. With our software,
          you can simplify your workflow, close more deals, and manage projects
          with ease.
        </p>
        <div className="flex justify-center">
          <Image
            src="/cover.png"
            alt="Roofing software dashboard"
            width={600}
            height={300}
            className="rounded-lg shadow-md"
          />
        </div>
      </section>

      {/* Trusted Section */}
      <section className="bg-gray-50 py-12 text-center">
        <h2 className="text-xl font-bold">Trusted by Leading Manufacturers</h2>
        {/* You can add logos here later */}
      </section>

      {/* Real Roofers Section */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <div className="grid md:grid-cols-4 gap-8 items-center">
          {/* Text Side */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Real Roofers, Real Results
            </h2>
            <p className="text-gray-600 mb-6">
              Watch real stories from satisfied customers and see the quality we
              deliver, powered by our advanced roof software.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-lime-500 cursor-pointer text-white px-6 py-2 rounded-md font-semibold hover:bg-lime-600">
                Subscribe Now
              </button>
              <button className="bg-cyan-400 cursor-pointer text-white px-[30px] py-2 rounded-md font-semibold hover:bg-cyan-500">
                Book a Demo
              </button>
            </div>
          </div>

          {/* Video/Images Side */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Image
              src="/avatar-1.jpg"
              alt="Roofer testimonial"
              width={200}
              height={200}
              className="rounded-md"
            />
            <Image
              src="/avatar-1.jpg"
              alt="Roofer testimonial"
              width={200}
              height={200}
              className="rounded-md"
            />
            <Image
              src="/avatar-1.jpg"
              alt="Roofer testimonial"
              width={200}
              height={200}
              className="rounded-md"
            />
            <Image
              src="/avatar-1.jpg"
              alt="Roofer testimonial"
              width={200}
              height={200}
              className="rounded-md"
            />
          </div>
        </div>
      </section>

      {/* Blue Highlights Section */}
      <section className="bg-[#0d2144] text-white py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center font-semibold">
          <div className="bg-[#0d2144] border border-white p-6 rounded-md">
            Close More Sales
          </div>
          <div className="bg-[#0d2144] border border-white p-6 rounded-md">
            Scale Your Business
          </div>
          <div className="bg-[#0d2144] border border-white p-6 rounded-md">
            Achieve Your Goals
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="text-center py-12 px-6">
        <p className="italic text-gray-600 max-w-3xl mx-auto mb-6">
          “A separate customer service department is not enough; providing
          exceptional service is the responsibility of our entire company.”
        </p>
        <p className="font-semibold">– Daniel M. CEO, iRoofing –</p>
      </section>
    </main>
  );
}
