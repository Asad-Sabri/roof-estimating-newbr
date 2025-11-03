"use client";
import Image from "next/image";
import React, { useRef, useState } from "react";
import {
  ArrowUpTrayIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const Header = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [playVideo, setPlayVideo] = useState(false);

  const steps = [
    {
      title: "Submit Your Request:",
      description: "Enter the property address and payment details.",
      icon: ArrowUpTrayIcon,
    },
    {
      title: "Get Your Report:",
      description: "Receive a detailed, accurate roof report fast.",
      icon: DocumentTextIcon,
    },
    {
      title: "Use It to Succeed:",
      description: "Present to clients, estimate costs, or manage projects.",
      icon: PresentationChartBarIcon,
    },
  ];
  return (
    <>
      <section
        className="relative w-full min-h-screen overflow-hidden flex flex-col justify-center"
        ref={menuRef}
      >
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source
            src="https://s3.us-central-1.wasabisys.com/ezsign/Private/Drakerversion.mp4"
            type="video/mp4"
          />
        </video>

        {/* Hero Content */}
        <div className="relative z-20 px-6 md:px-20 text-white max-w-4xl mt-[120px]">
          <h1 className="text-[40px] md:text-[65px] font-bold leading-tight">
            Accurate Roof Measurement Reports{" "}
            <span className="text-[#2ac5e8]">By iRoofReports</span>
          </h1>
          <p className="text-[20px] md:text-[30px] mt-5">
            Measure, estimate & simulate roofs in minutes.
          </p>
          <div className="flex gap-6 mt-8 flex-wrap">
            <input
              type="text"
              className=" py-2 bg-white outline-none rounded-md max-w-sm w-full text-black px-2 placeholder:text-sm"
              placeholder="Enter the address you did like to measure"
            />
            <button className=" py-2 bg-gradient-to-r from-[#4fa277] to-[#9bcd6d] text-white rounded-md px-4 cursor-pointer text-sm">
              Find Property
            </button>
          </div>
        </div>
      </section>
      <section className="bg-[#f9fdf9] py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Heading */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            You Order. We Measure.{" "}
            <span className="text-clearturquoise text-[#2bc7e9]">
              You Win More Jobs.
            </span>
          </h2>

          {/* Image */}
          <div className="flex justify-center mb-8">
            <Image
              src="/Mockup-imac-1.png" // Replace with actual path
              alt="Roof Report on iMac"
              width={400}
              height={300}
              className=""
            />
          </div>

          {/* Button */}

          <button className=" py-2 bg-gradient-to-r from-[#4fa277] to-[#9bcd6d] text-white rounded-md px-4 cursor-pointer text-sm">
            Order Your First Report
          </button>
        </div>
      </section>
      <section className="bg-[#f9fdf9] py-16 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12">
          Why Choose <span className="text-clearturquoise">iRoofReports™</span>?
        </h2>

        <div className="flex flex-col md:flex-row justify-center items-center gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center max-w-xs"
            >
              <div className="bg-[#004b66] text-white rounded-full p-4 mb-4">
                <step.icon className="w-10 h-10" />
              </div>
              <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-[#f9fdf9] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Why Roofers Love{" "}
            <span className="text-clearturquoise text-[#2bc7e9]">
              iRoofReports™
            </span>
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Trusted by Roofers Across the Country
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-gradient-to-b from-[#0b2349] to-[#004b66] text-white p-6 md:p-10 rounded-lg shadow-md">
          <div className="mb-4 flex items-center gap-2 text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-5 h-5" />
            ))}
            <span className="text-sm text-gray-300 ml-2">4 weeks ago</span>
          </div>

          <blockquote className="italic text-lg leading-relaxed mb-6">
            “I was injured on the job and couldn’t run around the roof like my
            usual self so now I measure off this app and go check the job. It’s
            been amazing and actually was able to keep my guys going, which to
            me is most important.”
          </blockquote>

          <div className="flex items-center gap-4">
            {/* Placeholder avatar */}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#004b66] font-bold text-sm">JN</span>
            </div>
            <p className="text-sm font-semibold">
              – Jon Nelson, All Terrain Roofing
            </p>
          </div>
        </div>
        <div className=" my-16 flex flex-col items-center justify-center">
          <p className=" text-2xl text-center font-bold">
            iRoofing Subscribers Get{" "}
            <span className="text-clearturquoise text-[#2bc7e9]">20% OFF</span>{" "}
            Every Report!
          </p>
          <button className=" py-2 bg-gradient-to-r from-[#4fa277] to-[#9bcd6d] mt-5 text-white rounded-md px-4 cursor-pointer text-sm">
            Order Your First Report
          </button>
        </div>
      </section>
      <section className="bg-[#f9fdf9] py-16 px-4 flex justify-end w-full">
        <div className=" flex flex-col lg:flex-row  md:gap-50 items-center justify-end w-full">
          {/* Text Content */}
          <div className="text-left">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Explore Our <br /> Roof Reports
            </h2>
            <p className="text-gray-700 mb-4 max-w-md">
              See the quality for yourself. <br />
              Check out a real roof report and learn how it can help you close
              more deals with confidence.
            </p>
            <a
              href="#"
              className="text-clearturquoise underline font-medium hover:text-[#008cb8] transition"
            >
              See a sample report
            </a>
          </div>

          {/* Image Content */}
          <div className=" hidden md:flex justify-center items-center  bg-[#033a4e] h-[80vh] w-[400px] relative overflow-visible">
            <div className="relative w-[600px] h-[400px] -translate-x-1/2">
              <Image
                src="/iroofingimg.png"
                alt="Sample Roof Report"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className=" block md:hidden relative w-full max-w-[500px] h-[300px]">
            <Image
              src="/iroofingimg.png"
              alt="Sample Roof Report"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>
       <section className="bg-[#f8fcf9] py-16 px-6">
         <h2 className="text-2xl text-center md:text-3xl font-bold text-gray-900 my-10">
              Quick Steps to Order iRoofReports
            </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left Side: Steps */}
          <div>
           
           

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
       <section className="relative w-full overflow-hidden">
      {/* Top Section */}
      <div className="bg-[#f9fdf9] px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 items-center relative z-10">
          {/* Text */}
          <div className="z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              Access Your <br /> Reports Anytime:
            </h2>
            <p className="text-gray-600 max-w-md">
              Every report you order is saved in your portal for easy access and reference.
            </p>
          </div>

          {/* Image (positioned separately for control) */}
       
        </div>
      </div>

      {/* Bottom Section (dark) */}
      <div className="bg-[#001f3f] px-6 md:px-12 py-16 md:py-24 text-white relative">
           <div className="hidden md:block z-50">
            <Image
              src="/Mackbook.png" // Replace with your image name
              alt="Laptop showing dashboard"
              width={500}
              height={400}
              className="object-contain absolute -translate-y-1/2 inset-0 translate-x-[400px] lg:translate-x-[700px] z-40"
            />
          </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 items-center">
          {/* Left Text Content */}
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Partnering with <br /> iRoofing:
            </h2>
            <p className="mb-4 font-semibold">
              Win More Jobs with The Ultimate Roofing Software!
            </p>
            <p className="max-w-md leading-relaxed">
              Measure, estimate & simulate, manage clients and close deals on the spot.
            </p>
          </div>

          {/* Hide image on mobile as it overlaps already */}
          <div className="block md:hidden mt-8">
            <Image
              src="/Mackbook.png"
              alt="Laptop"
              width={500}
              height={400}
              className="object-contain mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
    <section className="bg-[#f9fdf9] py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 items-center gap-2">
        {/* Left Side: Image */}
        <div className="flex justify-center">
          <Image
            src="/mapimg.jpg" // replace with your image path
            alt="Roof Report Example"
            width={500}
            height={400}
            className="object-contain w-full max-w-md"
          />
        </div>

        {/* Right Side: Text */}
        <div className="flex flex-col justify-between h-full"> 
          <h2 className="text-2xl md:text-3xl font-bold text-[#031b4e] mb-4">
            Technology that makes a <br />
            <span className="text-[#26c6f9] text-4xl md:text-7xl font-extrabold leading-tight">
              Difference
            </span>
          </h2>
          <p className="text-[#031b4e] text-base md:text-2xl leading-none">
            Founded by a veteran, iRoofReports is dedicated to using technology to create opportunities.
            For individuals who have faced challenges or injuries, our tools open doors to success in the
            roofing industry, enabling them to achieve more than ever before.
          </p>
        </div>
      </div>
    </section>
    </>
  );
};

export default Header;
