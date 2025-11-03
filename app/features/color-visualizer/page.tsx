"use client";
import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import Image from "next/image";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import { FaMinus, FaPlus } from "react-icons/fa";

const ColorVisualizer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);

  const testimonials = [
    {
      text: "I was able to do 17 estimates in 1 hour. Got the job and a raise. Thanks to Elizabeth for signing us. iRoofing paid for itself for 10 years today.",
      author: "John Walters",
      location: "Florida",
    },
    {
      text: "This software saved me countless hours. My team is more productive, and clients are impressed with our speed.",
      author: "Michael Smith",
      location: "Texas",
    },
    {
      text: "With iRoofing, accuracy is unmatched. No more costly mistakes and rework.",
      author: "Sarah Johnson",
      location: "California",
    },
  ];

  const features = [
    {
      title: "AI-Powered",
      description:
        "Roof color visualizer that simplifies decisions and boosts sales",
    },
    {
      title: "Roof Visualizer",
      description:
        "The most realistic in the industry with the largest database",
    },
    {
      title: "Easy to use",
      description: "Simply upload a photo and choose the materials",
    },
  ];

  const benefits = [
    {
      title: "Elevate Sales Engagement",
      description:
        "Transform pitches into engaging experiences, making abstract roofing options tangible and captivating for homeowners.",
    },
    {
      title: "Trust Through Accuracy",
      description:
        "Set realistic expectations with precise visualizations, building trust and confidence in decision-making.",
    },
    {
      title: "Efficiency in Ordering",
      description:
        "Access to an up-to-date database simplifies material selection, saving time and reducing errors.",
    },
    {
      title: "Gain a Competitive Edge",
      description:
        "Differentiate your services with a high-tech roof simulator, standing out in a competitive marketplace.",
    },
    {
      title: "Speed Up Decisions",
      description:
        "Facilitate quicker homeowner decisions by offering clear, visual comparisons, shortening the sales cycle.",
    },
  ];

  const testimonialss = [
    {
      quote:
        "Ever since we started using the iRoofing Visualizer, it's like we hit the fast-forward button on our sales...",
    },
    {
      quote:
        "…Being able to show homeowners exactly what they’re getting has cleared up so much uncertainty",
    },
    {
      quote:
        "Pulling up those visuals and seeing the homeowner's eyes light up? That's the moment I live for…",
    },
  ];

  type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "What technical requirements do we need to meet to use the visualizer?",
    answer:
      "The visualizer is cloud-based and works on most modern browsers and devices. No special hardware or software installation is required.",
  },
  {
    question: "Is training provided for my team to learn how to use the visualizer effectively?",
    answer:
      "Yes, we provide onboarding and training resources, including tutorials and live support, to ensure your team gets up to speed quickly.",
  },
  {
    question: "How accurate are the visualizations? Can we rely on them to make sales decisions?",
    answer:
      "The visualizations use AI to render high-quality, photorealistic representations based on actual roofing materials, making them reliable for decision-making.",
  },
  {
    question: "Can the visualizer handle different roofing materials and styles?",
    answer:
      "Absolutely! It supports a wide range of roofing materials, brands, and styles, allowing you to match client preferences accurately.",
  },
  {
    question: "What about the privacy of the homeowners' information and photos?",
    answer:
      "Privacy is a top priority. All data is securely stored and never shared without permission. We adhere to strict data protection policies.",
  },
  {
    question: "Is there a way to customize the simulator with our company branding?",
    answer:
      "Yes! You can add your logo, adjust the theme, and personalize the experience to align with your company's brand identity.",
  },
  {
    question: "How can the roof simulator speed up the decision-making process for homeowners?",
    answer:
      "By visually showing options and eliminating guesswork, it empowers homeowners to make quicker, more confident decisions.",
  },
];


  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

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
              Roof Visualizer Powered by AI
            </h2>
            <p className="text-2xl text-gray-200 mb-6">
              Choose any roofing material to show homeowners how their new roof
              will look, making their decision easy - and help you seal the deal
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
      <section className="w-full bg-[#f9fdf9] py-16 px-6 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
          {/* Left Side Image */}
          <div className="flex justify-center">
            <div className="">
              <Image
                src="/ipadiphone.png" // 👈 replace with your image
                alt="Roof Measurement"
                width={400}
                height={400}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Right Side Swiper */}
          <div className="text-center lg:text-left">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              // pagination={{ clickable: true }}
              loop={true}
              className="w-full"
            >
              {testimonials.map((item, idx) => (
                <SwiperSlide key={idx}>
                  <p className="text-lg text-gray-800 italic mb-6">
                    “{item.text}”
                  </p>
                  <p className="font-bold text-[#012a45]">{item.author}</p>
                  <p className="text-sm text-gray-600">{item.location}</p>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
      <section className="bg-[#f9fdf9] py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          {/* LEFT SIDE */}
          <div>
            <h2 className="text-xl font-bold text-[#031b4e] mb-4">
              Roof Color Visualizer Designed to Help you Close the Sale
            </h2>

            <ul className="space-y-2 text-[#031b4e] mb-4 list-none">
              <li>
                ✔️ Roof visualizer with Integrated AI technology to simulate on
                the spot
              </li>
              <li>
                ✔️ The ONLY roof visualizer that works with multiple
                manufacturers
              </li>
              <li>
                ✔️ Access to a huge selection of roofing materials and
                components
              </li>
              <li>
                ✔️ User-customizable to show only the products available by area
              </li>
              <li>
                ✔️ Technical specs, installation instructions, and approval docs
              </li>
              <li>
                ✔️ Try any material or any metal manufacturer, with our metal
                roof visualizer
              </li>
            </ul>

            {/* Read More Button */}
            <button
              onClick={() => setShowMore(!showMore)}
              className="text-[#26c6f9] font-semibold mb-4"
            >
              {showMore ? "▲ Read Less" : "▼ Read More"}
            </button>

            {/* Smooth Expandable Content */}
            <div
              className={`transition-all cursor-pointer duration-1000 ease-in-out overflow-hidden ${
                showMore ? "max-h-[1000px]" : "max-h-0"
              }`}
            >
              <h3 className="text-lg font-semibold text-[#031b4e] mt-4 mb-2">
                Residential & Commercial Roofing Estimating Software
              </h3>
              <p className="text-[#031b4e] text-sm mb-2">
                iRoofing is more than just a roofing app; it’s a powerful roof
                estimating software that lets you turn any roof measurement into
                a detailed professional roof estimate instantly.
              </p>
              <p className="text-[#031b4e] text-sm mb-2">
                With this software, there’s no need for clunky spreadsheets. It
                allows full customization, fast quoting, material ordering,
                invoicing — all in one place.
              </p>
              <p className="text-[#031b4e] text-sm">
                Best of all, every membership includes unlimited access for your
                team. Not sure yet? See our{" "}
                <a href="#" className="text-[#26c6f9] underline">
                  roofing software reviews
                </a>
                .
              </p>
            </div>
          </div>

          {/* RIGHT SIDE - Image with Modal Trigger */}
          <div className="relative w-full flex flex-col items-center">
            <button onClick={() => setVideoModalVisible(true)}>
              <Image
                src="/map.png" // change to your path
                alt="Watch Video"
                width={400}
                height={250}
                className="rounded-lg shadow-md cursor-pointer"
              />
            </button>
            <button
              onClick={() => setVideoModalVisible(true)}
              className="mt-2 cursor-pointer text-[#031b4e] font-semibold underline flex items-center"
            >
              🎥 Watch Video
            </button>
          </div>
        </div>

        {/* Modal */}
        {videoModalVisible && (
          <div className="fixed inset-0 bg-black/30  flex items-center justify-center z-[99999]">
            <div className="bg-white p-10 rounded-lg w-[90%] md:w-[700px] shadow-xl relative">
              <button
                className="absolute cursor-pointer top-2 right-2  text-2xl font-bold"
                onClick={() => setVideoModalVisible(false)}
              >
                &times;
              </button>
              <div className="relative pt-[56.25%]">
                <iframe
                  src="/video1.mp4"
                  title="Roof Estimate App Video"
                  className="absolute top-0 left-0 w-full h-full rounded"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </section>
      <section className="bg-[#f6fcf9] py-16 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          {/* Left: Image */}
          <div className="w-full md:w-1/2">
            <Image
              src="/mackled.png" // Place your image in the /public folder and name it roof-visualizer.png
              alt="Roof Visualizer on screen"
              width={300}
              height={300}
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Right: Text */}
          <div className="w-full ">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0b2545] mb-4">
              Discover the iRoofing Difference with Our Most Realistic Roof
              Visualizer
            </h2>
            <p className="text-base text-[#1e293b] leading-relaxed">
              Show All Products on Any Roof or Siding with your new secret
              weapon in roofing sales. This AI-driven platform is designed to
              make your presentations not just impressive, but unforgettable.
              With access to an ever-growing database of roofing materials,
              you’re ready to offer solutions that fit every homeowner’s vision
              perfectly.
              <br />
              <br />
              It’s not just about selling a roof; it’s about bringing
              homeowners’ dreams to life with precision and creativity. Let’s
              elevate your business together with technology that speaks your
              language.
            </p>
          </div>
        </div>
      </section>
      <section className="bg-[#f6fcf9] px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-lg bg-gradient-to-b from-[#001f4d] to-[#004c66] text-white flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white">
            {features.map((feature, index) => (
              <div key={index} className="flex-1 text-center px-6 py-8">
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-sm md:text-base leading-snug">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#f8fcf9] py-16 px-6">
        <h1 className=" text-4xl font-bold text-center my-10">
          Roof Color Simulator - A journey into Your project's future
        </h1>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left Side: Steps */}
          <div>
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
      <section className="bg-gradient-to-b from-[#002147] to-[#005d69] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-center gap-12">
          {/* Left: Monitor Image */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <Image
              src="/mackbookled.png" // Make sure to place the image in /public
              alt="Roof Visualizer on Monitor"
              width={500}
              height={400}
              className="w-full h-auto object-contain"
            />
            <span className="mt-4 font-semibold text-white">Watch Video</span>
          </div>

          {/* Right: Benefits List */}
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              A Competitive Advantage Like No Other
            </h2>
            <ul className="space-y-6">
              {benefits.map((item, index) => (
                <li key={index}>
                  <h3 className="text-lg font-semibold text-cyan-300">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white mt-1">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="bg-[#f6fcf9] py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0b2545] mb-6">
            Unlock the Power of Visualization
            <br /> Exclusively with iRoofing
          </h2>
          <p className="text-base text-[#1e293b] mb-12">
            At iRoofing, we’re proud to introduce an unparalleled feature that
            sets us apart: our exclusive Visualizer. This state-of-the-art tool
            isn’t just an add-on; it’s a game-changer in the way roofing
            projects are conceptualized and presented. With the iRoofing
            Visualizer, you’re not just choosing a service; you’re unlocking a
            realm of possibilities that no other platform offers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {testimonialss.map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-b from-[#002147] to-[#004c66] text-white rounded-md p-6 shadow-md text-center text-sm leading-relaxed"
              >
                <h1 className=" text-lg"> “{item.quote}”</h1>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-gradient-to-b from-[#002147] to-[#005d69] text-white px-10 rounded-2xl py-16 max-w-5xl mx-auto">
        <div className=" flex flex-col md:flex-row gap-10">
          {/* LEFT SIDE */}
          <div className="md:w-1/2 space-y-6">
            <div>
              <p className="uppercase text-sm font-medium text-gray-200">
                Case Study
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mt-2">
                Alex Turner:
                <br />A Visual Victory with iRoofing
              </h2>
            </div>

            <div>
              <p className="text-lg font-semibold">In Alex’s Words:</p>
              <blockquote className="mt-2 text-white text-base leading-relaxed">
                “The Roof Visualizer fundamentally transformed our client
                interactions and dramatically increased our conversion rates. It
                has become an essential asset in our sales toolkit.”
              </blockquote>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="md:w-1/2 flex flex-col gap-4">
            {/* Top Two Boxes */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="bg-white text-[#0b2545] p-4 rounded-md flex-1">
                <h4 className="font-semibold mb-1">Before iRoofing:</h4>
                <p className="text-sm">
                  Before iRoofing Alex’s company, Turner Innovative Roofing
                  Solutions in Miami, struggled with bringing clients’ visions
                  to life, affecting decision-making and engagement.
                </p>
              </div>
              <div className="bg-white text-[#0b2545] p-4 rounded-md flex-1">
                <h4 className="font-semibold mb-1">
                  The iRoofing Breakthrough:
                </h4>
                <p className="text-sm">
                  Using iRoofing’s Roof Visualizer, Alex’s team enabled clients
                  to see photorealistic simulations of roofing options on their
                  homes, streamlining the selection process.
                </p>
              </div>
            </div>

            {/* Bottom Box */}
            <div className="bg-white text-[#0b2545] p-6 rounded-md">
              <h4 className="font-semibold mb-2">Impactful Results:</h4>
              <ul className="text-sm space-y-3">
                <li>
                  <span className="font-bold">Client Engagement:</span> The
                  visualizer spiked client interaction, making consultations
                  more dynamic and conclusive.
                </li>
                <li>
                  <span className="font-bold">Decision Speed:</span> The clarity
                  provided by the visual simulations cut down decision time by
                  over 50%.
                </li>
                <li>
                  <span className="font-bold">Sales Increase:</span> The
                  enhanced visualization experience led to a 35% rise in sales
                  conversions within the first quarter.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
       <section className="bg-[#f7fcf9] px-6 py-16 text-[#0f172a]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">FAQ</h2>
        <p className="text-[#0ea5e9] font-semibold text-lg mb-2">
          How easy is it to integrate the roof visualizer into our existing sales process?
        </p>
        <p className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto mb-10">
          Integrating the visualizer is as seamless as it gets. Designed with user-friendliness in mind, it fits
          right into your current workflow, requiring minimal adjustments. Whether you're tech-savvy or not, getting up
          to speed is straightforward, ensuring you can start enhancing your sales presentations almost immediately.
        </p>

        <div className="text-left divide-y divide-gray-300">
          {faqs.map((faq, index) => (
            <div key={index}>
              <button
                className="w-full flex justify-between items-center py-4 font-medium text-black hover:text-[#0ea5e9] transition-colors"
                onClick={() => toggleIndex(index)}
              >
                {faq.question}
                <span className="ml-4 text-sm">
                  {activeIndex === index ? <FaMinus /> : <FaPlus />}
                </span>
              </button>
              <div
                className={`transition-max-height duration-500 ease-in-out overflow-hidden ${
                  activeIndex === index ? "max-h-60 mb-4" : "max-h-0"
                }`}
              >
                <p className="text-gray-700 text-sm md:text-base">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <button className="bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] text-white px-6 py-2 rounded shadow hover:opacity-90 transition">
            Get Started
          </button>
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

export default ColorVisualizer;
