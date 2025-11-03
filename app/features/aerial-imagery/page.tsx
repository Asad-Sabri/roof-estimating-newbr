"use client";

import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import BenefitsSection from "@/components/imageslider";
import Image from "next/image";
import React, { useRef, useState } from "react";

const Aerial = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<number>(50); // percentage 0 - 100
  const [playVideo, setPlayVideo] = useState(false);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const bounds = container.getBoundingClientRect();
    let x = clientX - bounds.left;

    // Convert to percentage
    const newPos = (x / bounds.width) * 100;
    setPosition(Math.max(0, Math.min(newPos, 100)));
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    handleMove(e);

    const move = (ev: any) => handleMove(ev);
    const stop = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", stop);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", stop);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
    document.addEventListener("touchmove", move);
    document.addEventListener("touchend", stop);
  };

  interface Testimonial {
  quote: string;
  name: string;
  title: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'Clearoof cut my measurement time in half and helped me land more jobs. The accuracy is unbeatable',
    name: 'Michael S.',
    title: 'Roofing Contractor',
  },
  {
    quote:
      'Using Clearoof, I could give my clients precise estimates, even in areas with heavy tree coverage. It’s a total game changer!',
    name: 'Lisa W.',
    title: 'Roofing Specialist',
  },
];
  return (
    <>
      <HeaderLayout />
      <section className="bg-gradient-to-b from-[#01414d] to-[#002032] py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
          {/* Left Content */}
          <div className="text-white max-w-xl text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
              <span className="text-[#00B4D8]">Clearoof™</span>
              <br />
              Precision Roofing,
              <br />
              Anytime, Anywhere
            </h2>
            <button className="mt-6 cursor-pointer bg-gradient-to-r from-[#6cc96f] to-[#2e9f74] text-white px-6 py-3 rounded-md font-semibold hover:opacity-90 transition">
              Subscribe Now
            </button>
          </div>

          {/* Right Image */}
          <div className="w-full max-w-xl relative">
            <Image
              src="/roofimg.png" // Replace with actual path from your public folder
              alt="Clearoof Precision Tool"
              width={600}
              height={500}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      </section>
      <section className="bg-[#f8fdf9] py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Why <span className="text-[#00B4D8]">Clearoof™</span> is Perfect for{" "}
            <br className="sm:hidden" /> Every Season
          </h2>
          <p className="text-slate-700 max-w-2xl mx-auto mb-10 text-base md:text-lg">
            Clearoof shines where traditional tools fall short. With its
            seasonal imagery, you can select views from Fall or Winter, making
            it easy to measure roofs, even in areas with heavy tree coverage
            during blooming seasons. Don’t let the season hold you back –
            Clearoof ensures clear, accurate views all year long.
          </p>

          {/* Image Comparison */}
          <div
            ref={containerRef}
            className="relative w-full max-w-md h-[350px] rounded-lg overflow-hidden shadow-lg mx-auto cursor-ew-resize select-none"
            onMouseDown={handleStart}
            onTouchStart={handleStart}
          >
            {/* After Image (static, always visible) */}
            <Image
              src="/rooftop.png"
              alt="After"
              fill
              className="object-cover"
              priority
            />

            {/* Before Image (on top, clipped) */}
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{ width: `${position}%` }}
            >
              <Image
                src="/rooftop2.png"
                alt="Before"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Labels */}
            <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded z-30">
              Before Clearoof
            </div>
            <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded z-30">
              After
            </div>

            {/* Vertical Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-cyan-500 z-40"
              style={{ left: `${position}%` }}
            >
              {/* Thumb Button */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-cyan-500 w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414L12.414 10l-3.707 3.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#f8fdf9] py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-snug">
              Why <span className="text-[#00B4D8]">Roofers™</span> Are Choosing{" "}
              <br className="hidden md:block" />
              <span className="text-[#00B4D8]">Clearoof™</span>
            </h2>
            <p className="mt-6 text-slate-700 text-base md:text-lg max-w-xl">
              Clearoof™ is your secret weapon for accurate, fast, and reliable
              roofing measurements. Using high-resolution aerial images taken by
              airplanes – not satellites – Clearoof provides superior clarity,
              even in challenging conditions like tree coverage or poor
              lighting. Available in over 90% of areas, Clearoof allows you to
              measure roofs in just 10 minutes and turn those measurements into
              accurate estimates that close deals faster.
            </p>
          </div>

          {/* Image */}
          <div className="flex-1">
            <div className="relative w-full h-[300px] md:h-[350px] lg:h-[400px] max-w-[600px] mx-auto">
              <Image
                src="/gifimg.gif" // Replace with your image path
                alt="Before and After"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#003b4a] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold leading-snug">
            Best of all, it Comes Included with your iRoofing Subscription at
            <br />
            no Extra Cost, with{" "}
            <span className="text-[#4AD7F9]">150 Credits</span> to Use Each
            Month.
          </h2>

          {/* Subtitle */}
          <p className="mt-4 text-base md:text-lg text-slate-200">
            No hidden fees – just pure efficiency.
          </p>

          {/* Image Comparison */}
          <div
            ref={containerRef}
            className="mt-10 relative w-full max-w-md h-[350px] rounded-lg overflow-hidden shadow-lg mx-auto cursor-ew-resize select-none"
            onMouseDown={handleStart}
            onTouchStart={handleStart}
          >
            {/* After Image (static, always visible) */}
            <Image
              src="/rooftop.png"
              alt="After"
              fill
              className="object-cover"
              priority
            />

            {/* Before Image (on top, clipped) */}
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{ width: `${position}%` }}
            >
              <Image
                src="/rooftop2.png"
                alt="Before"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Labels */}
            <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded z-30">
              Before Clearoof
            </div>
            <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded z-30">
              After
            </div>

            {/* Vertical Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-cyan-500 z-40"
              style={{ left: `${position}%` }}
            >
              {/* Thumb Button */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-cyan-500 w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414L12.414 10l-3.707 3.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
      <BenefitsSection />
      <section className="bg-[#f8fcf9] py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left Side: Steps */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center md:text-left">
              How <span className="text-cyan-600">Clearoof™</span> Works
            </h2>
            <p className="text-cyan-600 font-semibold mt-1 mb-6 text-center md:text-left">
              Simple and Powerful
            </p>

            <ul className="space-y-6">
              {[
                {
                  number: 1,
                  title: "Enter Address",
                  text: "Type in the property address you want to measure.",
                },
                {
                  number: 2,
                  title: "Check Image",
                  text: "If trees or blur affect the view, select Clearoof.",
                },
                {
                  number: 3,
                  title: "Select One Block",
                  text: "Choose a roof block with coverage and go back in time for a clearer image.",
                },
                {
                  number: 4,
                  title: "Apply to All Blocks",
                  text: "Use the same Clearoof date for the rest of the roof.",
                },
                {
                  number: 5,
                  title: "Start Measuring",
                  text: "Proceed with measurement using the clear, updated image.",
                },
              ].map((step) => (
                <li key={step.number} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 text-white flex items-center justify-center font-bold">
                    {step.number}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 text-sm md:text-base">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side: Video */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-lg aspect-video rounded-lg shadow-lg overflow-hidden">
              {!playVideo ? (
                <div
                  className="relative w-full h-full bg-black cursor-pointer group flex items-center justify-center"
                  onClick={() => setPlayVideo(true)}
                >
                  {/* Show play overlay or thumbnail here */}
                  <span className="text-white text-xl">▶ Play Video</span>
                </div>
              ) : (
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/VxslJ_0ROi4?autoplay=1"
                  title="Clearoof Video"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="w-full bg-gradient-to-r from-[#0b2342] to-[#0b3a55] py-16 px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center max-w-7xl mx-auto">
          {/* Left Side Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-snug">
              Dedicated Support for <br />
              <span className="text-[#2cc4f3]">a Smooth Start</span>
            </h2>

            <p className="text-lg text-white mt-4 font-medium">
              Get Help When You Need It <br />
              Dedicated Onboarding Support
            </p>

            <p className="text-gray-300 mt-6 leading-relaxed">
              Our dedicated customer service team is here to help you make the
              most of Clearoof from day one. Whether you’re a first-time user or
              upgrading your tools, we provide personalized onboarding to ensure
              you’re set up for success. You’ll be measuring roofs accurately
              and efficiently in no time.
            </p>

            <button className="mt-8 cursor-pointer bg-gradient-to-r from-[#4caf50] to-[#a3d977] text-white px-6 py-3 rounded-md font-semibold hover:opacity-90 transition">
              Get Started Now
            </button>
          </div>

          {/* Right Side Image */}
          <div className="flex justify-center md:justify-end">
            <Image
              src="/manonroof.png" // 👉 replace with your image path
              alt="Dedicated Support"
              width={500}
              height={350}
              className="rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </section>
      <section className="bg-gray-50 text-center py-16 px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Roofers Who Love <span className="text-[#00B4D8]">Clearoof™</span>
      </h2>
      <p className="text-gray-600 max-w-3xl mx-auto mb-12 text-sm md:text-base">
        See how roofers across the country have transformed their businesses with Clearoof. Whether it’s overcoming tree coverage, speeding up project timelines, or delivering accurate estimates, Clearoof has helped them win more clients and close more deals.
      </p>

      <div className="flex flex-col md:flex-row justify-center items-center gap-8">
        {testimonials.map((t, index) => (
          <div
            key={index}
            className="bg-[#04394d] text-white rounded-lg shadow-lg p-6 w-full max-w-xs h-[200px]"
          >
            <p className="text-lg mb-4">“{t.quote}”</p>
            <p className="font-semibold">{t.name}</p>
            <p className="text-sm">{t.title}</p>
          </div>
        ))}
      </div>
    </section>
     <section className="bg-gradient-to-b from-[#004b66] to-[#001e3c] text-white py-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-12">
        
        {/* Left Column */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Started Today with <span className="text-clearturquoise">150 Monthly Credits</span>
          </h2>
          <p className="text-sm md:text-base text-gray-200 mb-6">
            Don’t wait to take your roofing business to the next level with Clearoof™. With 150 monthly credits, 
            you can measure up to 25 roofs every month without any extra cost. Enjoy high-resolution aerial imagery, 
            eliminate guesswork, and close more deals faster with accurate, professional-grade measurements. 
            Clearoof is part of your iRoofing subscription, so there’s no need to pay extra – it’s all included to 
            help you grow your business.
          </p>
          <button className=" cursor-pointer bg-green-400 hover:bg-green-500 text-white font-semibold px-6 py-2 rounded shadow">
            See Pricing Plans
          </button>
        </div>

        {/* Right Column */}
        <div className="md:w-1/2 flex justify-center">
         <img src="/creditimg.png" alt="" />
        </div>
      </div>
    </section>
      <Footer />
    </>
  );
};

export default Aerial;
