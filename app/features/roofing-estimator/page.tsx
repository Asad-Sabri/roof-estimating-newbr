"use client";

import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import Image from "next/image";
import React, { ReactElement, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const RoofingEstimator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false); // ✅ Different name than isOpen
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

  interface Item {
    id: number;
    title: string;
    icon: ReactElement;
    summary: string;
    details: string;
  }

  const items: Item[] = [
    {
      id: 1,
      title: "Materials",
      icon: (
        <svg
          className="w-8 h-8 mx-auto mb-2 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4H7v4a2 2 0 01-2 2H3a2 2 0 01-2-2v-10z" />
        </svg>
      ),
      summary: "Products are displayed based upon availability in your area",
      details:
        "Our product list updates dynamically to show only what is available in your local market, ensuring accurate estimates and timely delivery.",
    },
    {
      id: 2,
      title: "Labor & Installation",
      icon: (
        <svg
          className="w-8 h-8 mx-auto mb-2 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M14.7 10.7l2.6-2.6M9 13l-4 4m0 0l3.2-3.2M9 13v6a2 2 0 002 2h6a2 2 0 002-2v-6m-6 0l6-6" />
        </svg>
      ),
      summary: "Labor costs can be calculated on a per-square basis",
      details:
        "Customize labor pricing by job type and square footage, helping you offer precise quotes that cover all installation costs.",
    },
    {
      id: 3,
      title: "Tear OFF & Removal",
      icon: (
        <svg
          className="w-8 h-8 mx-auto mb-2 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M3 16l9-7 9 7M3 10l9-7 9 7" />
        </svg>
      ),
      summary: "Spec tear-off cost based on the type of material removed",
      details:
        "Estimate tear-off costs precisely based on the type and amount of roofing material removed during replacement or repair.",
    },
    {
      id: 4,
      title: "Dumpsters & Site Cleanup",
      icon: (
        <svg
          className="w-8 h-8 mx-auto mb-2 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M3 7h18M16 7v10a2 2 0 01-2 2H10a2 2 0 01-2-2V7" />
        </svg>
      ),
      summary:
        "The total weight of excess and removed material is calculated based on the amount of material used",
      details:
        "Our software calculates dumpster needs and cleanup costs based on actual material usage and removal weight.",
    },
    {
      id: 5,
      title: "Additional Roof Estimate Services",
      icon: (
        <svg
          className="w-8 h-8 mx-auto mb-2 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
      summary:
        "Warranties & More – Include pricing for warranties and any additional service(s) provided by your company",
      details:
        "Add custom warranty services and other additional offerings, including pricing, terms, and coverage options.",
    },
    {
      id: 6,
      title: "Profit",
      icon: (
        <svg
          className="w-8 h-8 mx-auto mb-2 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
      summary:
        "Set your desired profit for the job by percentage or total sum. Include your overhead costs, tax for labor and materials, any special delivery costs, and more",
      details:
        "Adjust profit margins and include overhead and tax details for accurate and profitable job estimates.",
    },
    {
      id: 7,
      title: "Payment Structure",
      icon: (
        <svg
          className="w-8 h-8 mx-auto mb-2 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M6 12h12M6 16h12M6 8h12" />
        </svg>
      ),
      summary:
        "Since your iRoofing estimate is a binding document, you can include the payment structure for the job, which can be customized to reflect your agreement with the client",
      details:
        "Clearly outline payment schedules, deposits, and terms to avoid misunderstandings and ensure timely payments.",
    },
    {
      id: 8,
      title: "Terms & Conditions",
      icon: (
        <svg
          className="w-8 h-8 mx-auto mb-2 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M9 12h6M9 16h6M12 8v8" />
        </svg>
      ),
      summary:
        "Use your own terms and conditions (or copy/paste them from an existing template) to provide your clients with a clear expectation of the service(s) you will perform",
      details:
        "Upload or paste your custom terms and conditions to keep your agreements transparent and professional.",
    },
    {
      id: 9,
      title: "Print & Share",
      icon: (
        <svg
          className="w-8 h-8 mx-auto mb-2 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M12 5v14M17 9l-5 5-5-5" />
        </svg>
      ),
      summary:
        "You can print any estimate directly from your device or share it with your clients via email, Dropbox, Google Drive, or Microsoft OneDrive",
      details:
        "Easily print or digitally share your estimates to keep clients informed and speed up approvals.",
    },
  ];

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  interface ArticleCard {
  id: number;
  title: string;
  imageSrc: string;
  alt: string;
}

const articles: ArticleCard[] = [
  {
    id: 1,
    title: 'Easy, Accurate Roof Calculator App',
    imageSrc: '/roof-calculator.jpg',
    alt: 'Roof calculator app image',
  },
  {
    id: 2,
    title: 'Top 6 Reasons to Use Technology for Roof Estimates',
    imageSrc: '/tech-roofing.png',
    alt: 'Technology on tablet for roof estimates',
  },
  {
    id: 3,
    title: '5 Ways Drones Will Improve the Way You Do Roof Estimates',
    imageSrc: '/roofing-drone.png',
    alt: 'Drone for roof estimate',
  },
];

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Can I use the Estimator to generate multiple pricing options for clients?",
    answer: "Yes, the Estimator allows you to create various pricing options tailored to different client needs, such as material grades, warranty levels, or optional add-ons.",
  },
  {
    question: "How long does it take to generate a roof estimate?",
    answer: "Typically, it takes just a few minutes to generate a complete roof estimate once measurements and materials are selected.",
  },
  {
    question: "Is the Estimator included in my iRoofing membership?",
    answer: "Yes, the Estimator is included as part of your iRoofing membership at no additional cost.",
  },
  {
    question: "Can my preferred distributor be added to iRoofing?",
    answer: "Absolutely. You can request to add your preferred distributor, and our support team will assist in integrating them into your account.",
  },
];


  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
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
              The Best Roof Estimating Software For{" "}
              <span className=" text-[#2bc7e9]">Fast & Accurate Quotes</span>
            </h2>
            <p className="text-2xl text-gray-200 mb-6">
              Use our satellite roof measuring software to measure any roof,
              anytime, from anywhere – and deliver accurate estimates instantly.
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
                src="/video1.mp4"
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
                src="/video1.mp4"
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
                src="/tab1.png" // 👈 replace with your image
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
              Roof Estimate App Designed to Help{" "}
              <span className="text-[#26c6f9]">You Close</span>
            </h2>

            <ul className="space-y-2 text-[#031b4e] mb-4 list-none">
              <li>✔️ Turn any measurement into a professional roof quote</li>
              <li>✔️ Customize with your company's pricing</li>
              <li>✔️ Up-sell with good, better, and best options</li>
              <li>✔️ Create line-item or price per square roof estimates</li>
              <li>✔️ Send roofing material orders to distributor</li>
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
      <section className="bg-[#f9fdf9] py-16 px-6 md:px-12 text-center">
        <h2 className="text-[#031b4e] font-bold text-2xl md:text-3xl mb-2">
          The Best Roof Estimating Software
        </h2>
        <p className="text-[#26c6f9] font-semibold text-xl md:text-2xl mb-6">
          Tailored to You
        </p>

        <p className="max-w-3xl mx-auto text-[#031b4e] text-sm md:text-base mb-10 leading-relaxed">
          iRoofing’s instant estimating software is fast, accurate, and built
          for a quick roofing sales cycle by generating seamless roofing
          estimates online, roofing invoices, and work orders in just minutes.
          With your company’s pricing fully integrated, every estimate is
          accurate and ready to send.
        </p>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-b from-[#02213e] to-[#0d3c67] rounded-lg p-8 text-white shadow-lg">
          {/* Item 1 */}
          <div className="border-b md:border-b-0 md:border-r border-white/40 pb-6 md:pb-0 md:pr-6">
            <h3 className="font-bold text-lg lg:text-4xl mb-2">
              Price per SQ or Line Items
            </h3>
            <p className="text-xs md:text-lg">
              Choose the way you want to estimate: with price per SQ or line
              items
            </p>
          </div>

          {/* Item 2 */}
          <div className="border-b md:border-b-0 md:border-r border-white/40 pb-6 md:pb-0 md:px-6">
            <h3 className="font-bold text-lg lg:text-4xl mb-2">
              Work From Anywhere
            </h3>
            <p className="text-xs md:text-lg">
              Easily switch between metric and imperial units of measure
            </p>
          </div>

          {/* Item 3 */}
          <div className="pt-6 md:pt-0 md:pl-6">
            <h3 className="font-bold text-lg lg:text-4xl mb-2">
              Customized to Your Pricing
            </h3>
            <p className="text-xs md:text-lg">
              Upsell or keep it constant, it’s your choice
            </p>
          </div>
        </div>
      </section>
      <section className="bg-[#f9fdf9] py-12 px-4 max-w-7xl mx-auto text-center">
        <h3 className="text-[#031b4e] font-bold text-lg md:text-3xl mb-2">
          Need more control?
        </h3>
        <p className="text-[#031b4e] text-xs md:text-lg font-semibold mb-10 max-w-3xl mx-auto">
          Adjust the estimate settings to add as much detail and precision as
          your job requires.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
          {items.map(({ id, icon, title, summary, details }) => (
            <div
              key={id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
            >
              {icon}
              <h4 className="font-semibold text-sm md:text-lg mb-1">{title}</h4>
              <p className="text-xs md:text-sm mb-2">{summary}</p>

              <button
                onClick={() => toggleExpand(id)}
                className="text-blue-600 font-semibold cursor-pointer text-xs md:text-sm hover:underline"
                aria-expanded={expandedId === id}
                aria-controls={`expandable-${id}`}
              >
                {expandedId === id ? "Read Less" : "Read More"}
              </button>

              <div
                id={`expandable-${id}`}
                className={`mt-2 text-xs md:text-sm text-gray-700 overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
                  expandedId === id
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
                style={{ transitionProperty: "max-height, opacity" }}
              >
                {expandedId === id && <p>{details}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="relative bg-[#f9fdf9] py-16 px-6 md:px-20 flex flex-col md:flex-row items-center md:items-start">
        {/* Left Text */}
        <div className="md:w-1/3 w-full text-left mb-10 md:mb-0">
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 leading-snug">
            Tech Advantages <br /> That Set You Apart
          </h2>
        </div>

        {/* Divider */}
        <div className="hidden md:block border-l-2 border-cyan-400 h-40 mx-10"></div>

        {/* Right Numbers and Text */}
        <div className="md:w-2/3 w-full grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-x-12 text-navy-900">
          <div className="flex flex-col items-start">
            <span className="text-5xl font-light leading-none">9.67</span>
            <p className="mt-2 text-base max-w-xs">
              Detailed roofing estimates per hour can be estimated with
              unparalleled precision.
            </p>
          </div>

          <div className="flex flex-col items-start">
            <span className="text-5xl font-light leading-none">5.45</span>
            <p className="mt-2 text-base max-w-xs">
              Minutes or less is what it takes to setup your estimate
            </p>
          </div>
        </div>
      </section>
      <section className="bg-[#f8fcf9] py-16 px-6">
        <h1 className=" text-4xl font-bold text-center my-10">
          How the iRoofing <span className=" text-cyan-500">Estimate </span>{" "}
          Tool Works
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
      <section className="bg-gradient-to-br from-[#00253A] to-[#003348] text-white px-6 py-12 md:py-16 rounded-xl max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Left Side */}
          <div>
            <p className="uppercase text-sm tracking-wide text-gray-300">
              Case Study
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-6">
              Peak Roofing <span className="text-cyan-400">Solutions</span>
              <br />& iRoofing’s{" "}
              <span className="text-cyan-400">Estimate Tool</span> Background
            </h2>

            <p className="text-sm text-gray-300 mb-3">
              In Jason Smith’s Words:
            </p>
            <blockquote className="text-base md:text-lg font-medium text-cyan-100">
              “The iRoofing Estimate Tool has drastically improved our
              efficiency and quote precision, boosting our credibility and
              client acquisition..”
            </blockquote>
          </div>

          {/* Right Side Boxes */}
          <div className="flex flex-col gap-4">
            <div className=" flex lg:flex-row flex-col gap-5">
              <div className="bg-white text-[#00253A] p-5 rounded-md shadow-md">
                <h3 className="font-semibold mb-2">Before iRoofing:</h3>
                <p className="text-sm">
                  The company needed to streamline estimate preparation, improve
                  accuracy, and enhance client relations.
                </p>
              </div>

              <div className="bg-white text-[#00253A] p-5 rounded-md shadow-md">
                <h3 className="font-semibold mb-2">
                  The iRoofing Transformation:
                </h3>
                <p className="text-sm">
                  They implemented iRoofing’s Estimate Tool, integrating it with
                  their existing systems to automate estimates and enhance
                  accuracy through digital measurements and preset pricing
                  configurations.
                </p>
              </div>
            </div>

            <div className="bg-white text-[#00253A] p-5 rounded-md shadow-md">
              <h3 className="font-semibold mb-2">Impactful Results:</h3>
              <p className="text-sm">
                After Six Months the preparation time reduced by 70%, errors in
                estimates decreased by 85% and improved retention by 40% with
                faster and more transparent service.
                <br />
                <br />
                The iRoofing Estimate Tool transformed Peak Roofing Solutions by
                automating their estimating process and significantly enhancing
                both operational efficiency and customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>
       <section className="bg-gradient-to-br from-[#003348] to-[#004d61] text-white px-6 py-16 my-16">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Left Content */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold leading-snug">
            Seamless <span className="text-cyan-400">, Integration,</span><br />
            <span className="text-cyan-400">Customized</span> Control
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-semibold text-base">Integrated Measurement Solutions</h3>
              <p className="text-sm mt-1 text-gray-200">
                Direct data transfer from measurements to estimates, ensuring accuracy and saving time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base">Your Settings, Your Way</h3>
              <p className="text-sm mt-1 text-gray-200">
                Fully adjustable to match your specific operational needs.
              </p>
            </div>
          </div>
        </div>

        {/* Right Box */}
        <div className="border border-lime-300 p-6 rounded-md bg-[#004c63] text-white">
          <p className="text-5xl font-bold mb-4">24/7</p>
          <h3 className="text-xl font-semibold mb-4">Support, Training, and More</h3>

          <div className="space-y-4 text-sm text-gray-200">
            <div>
              <h4 className="font-semibold">Always Available</h4>
              <p>
                Our dedicated team is here to help you anytime, anywhere.
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Expert Training</h4>
              <p>
                Master iRoofing with our comprehensive training sessions and webinars.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
     <section className="px-4 py-12 md:py-20 bg-white text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-10">
          More about the accuracy of Instant Roof Estimates
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={article.imageSrc}
                  alt={article.alt}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-4 text-left">
                <h3 className="text-md font-semibold text-gray-800 hover:text-blue-700 cursor-pointer">
                  {article.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
     <div className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 text-gray-800">
        Roof Estimating App – FAQs
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200">
            <button
              onClick={() => toggleIndex(index)}
              className="w-full text-left text-base md:text-lg font-medium text-gray-800 py-3 focus:outline-none flex justify-between items-center"
            >
              {faq.question}
              <span className="ml-2 transition-transform duration-300">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-gray-600 pb-4 pr-2 pl-1">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
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

export default RoofingEstimator;
