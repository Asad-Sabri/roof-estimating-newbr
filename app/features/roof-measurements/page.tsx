"use client";

import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import "swiper/css";

import React from "react";
import { BiChevronRight } from "react-icons/bi";

export default function RoofMeasurements() {
  const [isOpen, setIsOpen] = useState(false);

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

  const [position, setPosition] = useState(50); // initial middle position
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    let newX = ((clientX - left) / width) * 100;
    if (newX < 0) newX = 0;
    if (newX > 100) newX = 100;
    setPosition(newX);
  };

  type Testimonial = {
    quote: string;
    name: string;
    location: string;
  };

  const testimonialss: Testimonial[] = [
    {
      quote:
        "I make tons of money estimating with iRoofing, and customer service is on point! They don't nickel and dime you like others and you get a sh** load of high quality images every month for FREE. Highly recommend!",
      name: "John Warren",
      location: "Colorado",
    },
    {
      quote:
        "I have spent untold hours trying to get roof measurements. The simplicity and accuracy I get from the iRoofing app is amazing.",
      name: "Bill Taylor",
      location: "North Carolina",
    },
    {
      quote:
        "Thanks to iRoofing, our project turnaround time has significantly improved. Accurate measurements in minutes!",
      name: "Lisa Graham",
      location: "Texas",
    },
    {
      quote:
        "Their blueprint feature is a game-changer. Perfect for new construction sites.",
      name: "Marcus Hill",
      location: "Nevada",
    },
    {
      quote:
        "The HD imagery and pitch detection save so much field work. I trust iRoofing every day.",
      name: "Angela Chen",
      location: "California",
    },
    {
      quote:
        "Impressive support and simple UI. Even my new hires pick it up quickly!",
      name: "David Foster",
      location: "Arizona",
    },
  ];

  const chunkTestimonials = (arr: Testimonial[], chunkSize: number) => {
    const chunks: Testimonial[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const groupedTestimonials = chunkTestimonials(testimonialss, 2);

  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = 4.36;
    const duration = 2000; // animation duration in ms
    const frameRate = 30; // how many updates per second
    const totalFrames = Math.round((duration / 1000) * frameRate);
    let currentFrame = 0;

    const counter = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const value = +(start + (end - start) * progress).toFixed(2);
      setMinutes(value);

      if (currentFrame === totalFrames) {
        clearInterval(counter);
      }
    }, 1000 / frameRate);
  }, []);

  type Feature = {
    title: string;
    short: string;
    full: string;
  };

  const features: Feature[] = [
    {
      title: "Satellite",
      short:
        "Utilize our satellite roof measuring tool for efficient and comprehensive roof analysis.",
      full: "Satellite tools allow for quick, large-scale inspections and help estimators reduce on-site visits while ensuring accurate measurements and estimates.",
    },
    {
      title: "Drone",
      short:
        "For detailed inspections where satellite views fall short, our drone roof measurement software provides the precision and clarity needed.",
      full: "Drone imagery provides close-up visuals and 3D models for roofing professionals working on complex or inaccessible rooftops.",
    },
    {
      title: "Blueprint",
      short:
        "Instantly calculate measurements by uploading and tracing blueprints, streamlining your project planning process.",
      full: "Blueprint tools are ideal for new construction projects where plans are available. You can overlay and measure directly in the app.",
    },
    {
      title: "Aerial",
      short:
        "Access Clearoof™ for high-resolution or historical aerial views, ensuring no detail is missed.",
      full: "Historical aerial imagery provides year-round perspectives and helps spot seasonal changes and structural evolutions over time.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const steps = [
    "Tap/click on the roof measurement tool & enter the property’s address for a satellite overview.",
    "Select the preferred image source Choose your ideal image source—satellite, drone, aerial, or blueprint.",
    "Outline the roof precisely and add any necessary details for a comprehensive measure.",
    "Use our automatic pitch detector to determine the roof slope.",
    "Produce your roof measurement report with a click, then review, export, or share with your team and clients.",
  ];

  const articles = [
    {
      title: "New Drone to Measure Roofs – DJI Mini SE",
      image: "/drone.png", // Replace with actual path
      link: "#",
    },
    {
      title: "6 Tips for Growing Sales with Unlimited DIY Roof Reports",
      image: "/pad2.png", // Replace with actual path
      link: "#",
    },
    {
      title: "How to Measure a Roof from Blueprints",
      image: "/blueprint.png", // Replace with actual path
      link: "#",
    },
  ];

  interface FAQItem {
    question: string;
    answer: string;
  }

  const faqItems: FAQItem[] = [
    {
      question:
        "Is there a limit to how many roof measurement reports I can create?",
      answer:
        "No, there is no limit to how many roof measurement reports you can create. You can generate as many reports as needed for your projects.",
    },
    {
      question: "Can I use iRoofing to measure from roof blueprints?",
      answer:
        "Yes, iRoofing allows you to upload and measure from blueprints, making it easier to get accurate dimensions without being onsite.",
    },
    {
      question: "Can I use iRoofing to measure roofs from drone imagery?",
      answer:
        "Absolutely! iRoofing supports roof measurements from drone images, providing precise details when satellite views are insufficient.",
    },
    {
      question:
        "How accurate are the roof measurements I create with iRoofing?",
      answer:
        "iRoofing uses advanced imaging and algorithms to provide highly accurate measurements, comparable to traditional on-site methods.",
    },
    {
      question: "How to order a roof measurement report",
      answer:
        "After completing your roof measurement, you can order a detailed report directly through the iRoofing platform, with options for export and sharing.",
    },
    {
      question: "How to measure a roof for shingles",
      answer:
        "Use iRoofing to outline the roof surface areas and pitch, which will help calculate the amount of shingles required accurately.",
    },
    {
      question: "How to measure a roof pitch?",
      answer:
        "Our automatic pitch detector uses imagery data to determine the roof’s slope, which you can review and adjust as needed in the software.",
    },
    {
      question: "How to measure roof slope",
      answer:
        "Roof slope is calculated by iRoofing using image data combined with pitch detection tools to provide precise slope measurements.",
    },
    {
      question: "How to measure roofing materials",
      answer:
        "Once roof dimensions are established, you can use iRoofing to estimate quantities of roofing materials required based on your selected product types.",
    },
    {
      question: "How to measure roof squares?",
      answer:
        "Roof squares are calculated by dividing the total roof area by 100 square feet, which iRoofing automatically computes in the report.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
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
      <div className="bg-[#f8fcf4]">
        <section className="w-full bg-[#01344e] text-white py-36 px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-10 ">
            <div>
              <h2 className="text-3xl lg:text-6xl font-bold leading-tight mb-4">
                Unlimited <br /> Roof Measurements
              </h2>
              <p className="text-2xl text-gray-200 mb-6">
                Use our satellite roof measuring software to measure any roof,
                anytime, from anywhere – and deliver accurate estimates
                instantly.
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
                  src="/video.mp4"
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
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
              <div className="relative w-full max-w-3xl">
                <button
                  className="absolute -top-10 right-0 text-white cursor-pointer text-3xl"
                  onClick={() => setIsOpen(false)}
                >
                  &times;
                </button>
                <video
                  className="w-full rounded-lg"
                  src="/video.mp4"
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
        <section className="bg-[#f9fbf7] px-6 md:px-12 lg:px-20">
          <h2 className="text-2xl text-center md:text-3xl lg:text-4xl font-bold text-[#0a1930] my-10">
            Roof Measuring Software Built for Contractors
          </h2>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 ">
            {/* Left Content */}

            <div>
              <ul className="space-y-4 text-[#1c2737] text-base md:text-lg">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✔</span>
                  Create accurate, professional roof measurement reports in
                  minutes
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✔</span>
                  Roof measurements app for tablets, phones and desktops
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✔</span>
                  Unlimited Aerial, Drone, Roof Blueprints &amp; Roof
                  Measurements from Satellite
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✔</span>
                  Clearoof™ - Free monthly HD Imagery for aerial roof
                  measurements
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✔</span>
                  Determine precise roof pitch measurement from a street view
                  photo
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✔</span>
                  Free Training &amp; Software Support
                </li>
              </ul>
            </div>

            {/* Right Content - Image */}
            <div
              className="relative cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              <div className="border-8 border-black rounded-lg outline outline-gray-300">
                <video
                  className="w-full "
                  src="/video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>

              <div className="mt-6 text-center">
                <button
                  className="underline hover:text-gray-900 cursor-pointer"
                  onClick={() => setIsOpen(true)}
                >
                  Watch Video
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-5xl mx-auto text-center bg-gradient-to-r from-[#0a1930] to-[#004b56] rounded-lg shadow-lg p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Short on time or too busy? Let us handle it!
            </h2>
            <p className="text-white text-base md:text-lg mb-6">
              Order a <span className="font-semibold">roof report</span> at a
              great price. iRoofing subscribers get an exclusive{" "}
              <span className="font-bold">20% discount!</span>
            </p>
            <button className="bg-[#f2ff2b] hover:bg-[#e2ef20] cursor-pointer text-black font-semibold py-3 px-8 rounded-md shadow-md transition">
              Order Now
            </button>
          </div>
        </section>
        <section className="px-6 md:px-12 lg:px-20 py-16">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#0a1930] mb-4">
                Too many trees blocking your view? Let Clearoof help.
              </h2>
              <p className="text-gray-700 mb-4">
                In the fast-paced world of roofing, every second counts.
                iRoofing’s roofing measurement software delivers rapid, accurate
                roof measurements, empowering you to make quicker decisions and
                speed up proposal turnarounds. Stay ahead of the competition and
                win more projects with our unmatched efficiency.
              </p>
              <p className="text-gray-700 mb-6">
                Our app is designed to scale with you, ensuring that as your
                roofing business grows, your capabilities do too, without the
                extra expenses.
              </p>

              {/* Before/After Slider */}
              <div
                ref={containerRef}
                className="relative w-full max-w-md h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg shadow-lg"
                onMouseMove={(e) => handleMove(e.clientX)}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  if (touch) handleMove(touch.clientX);
                }}
              >
                {/* After (Color image - always full behind) */}
                <Image
                  src="/rooftop.png"
                  alt="After Clearoof"
                  fill
                  className="object-cover"
                />

                {/* Before (Black & White) - only revealed according to slider */}
                <div
                  className="absolute top-0 left-0 h-full overflow-hidden"
                  style={{ width: `${position}%` }}
                >
                  <Image
                    src="/rooftop2.png"
                    alt="Before Clearoof"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Vertical Divider */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-md"
                  style={{
                    left: `${position}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {/* Drag Handle Circle */}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 rounded-full bg-white border shadow flex items-center justify-center">
                    <div className="w-2 h-4 bg-gray-600 rounded-sm" />
                  </div>
                </div>

                {/* Labels */}
                <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Before
                </span>
                <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  After
                </span>
              </div>
            </div>

            {/* Right Content - Calculator */}
            <div className="bg-[#f1faee] border border-gray-200 rounded-lg shadow-md p-6">
              <h3 className="text-lg md:text-xl font-semibold text-[#0a1930] mb-4">
                How much can you save on roof takeoffs with iRoofing?
              </h3>

              <label className="block mb-3 text-sm font-medium text-gray-600">
                How many roof takeoffs do you order per month?
              </label>
              <input
                type="number"
                placeholder="example: 50"
                className="w-full p-2 mb-4 border rounded-md focus:ring-2 focus:ring-blue-500"
              />

              <label className="block mb-3 text-sm font-medium text-gray-600">
                What is your cost per roof takeoff?
              </label>
              <input
                type="number"
                placeholder="example: 20"
                className="w-full p-2 mb-6 border rounded-md focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-lg font-semibold text-gray-700 mb-2">
                Annual Savings on Roof Takeoffs with iRoofing:
              </p>
              <p className="text-4xl font-bold text-[#00b4d8] mb-4">$0</p>

              <p className="text-gray-600 text-sm">
                And this doesn’t even include the extra money you’ll make by{" "}
                <span className="font-semibold">
                  closing more sales on the spot.
                </span>
              </p>

              <button className="mt-6 text-blue-600 font-medium hover:underline">
                How did we get to this number?
              </button>
            </div>
          </div>
        </section>
        <section className="bg-[#f5faf9] py-12 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto text-center">
            {/* Heading */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              The Best Roof Measuring App in the Market
            </h2>

            {/* Top Row */}
            <div className="grid md:grid-cols-3 gap-8 text-left mb-12">
              {/* Left Side Quote */}
              <div className="flex flex-col justify-center">
                <blockquote className="italic text-lg font-medium text-gray-800">
                  "This is the only roofing software that includes Free HD
                  Imagery Credits with your subscription."
                </blockquote>
                <p className="mt-3 text-sm text-gray-600">
                  Thomas Brown, Rhode Island
                </p>
              </div>

              {/* Custom Roof Measurement Reports */}
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2 border-b-2 border-sky-400 w-fit">
                  Custom Roof Measurement Reports
                </h3>
                <p className="text-gray-700 text-sm">
                  Create branded, professional, and accurate reports from
                  satellite roof measurements, aerial drone images, or roof
                  blueprints to help you win more jobs and deliver precise
                  estimates instantly.
                </p>
              </div>

              {/* Create on the Go */}
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2 border-b-2 border-sky-400 w-fit">
                  Create on the Go & Verify in Field
                </h3>
                <p className="text-gray-700 text-sm">
                  Take accuracy up a notch with Scale Verify—our exclusive tool
                  that lets you fine-tune roof measurements on-site, during your
                  client visit.
                </p>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid md:grid-cols-3 gap-8 text-left mb-12">
              {/* Clearroof */}
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2 border-b-2 border-sky-400 w-fit">
                  Clearoof™ HD Imagery for Aerial Roof Measurement
                </h3>
                <p className="text-gray-700 text-sm">
                  Trees in the way? Use HD imagery from multiple seasons to cut
                  through the canopy and get accurate aerial roof measurements.
                </p>
              </div>

              {/* Measure Any Roof */}
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2 border-b-2 border-sky-400 w-fit">
                  Measure Any Roof from Roof Blueprints
                </h3>
                <p className="text-gray-700 text-sm">
                  New construction project? Our roof measuring program works
                  seamlessly with roof blueprints, making roof measurements
                  quick and effortless.
                </p>
              </div>

              {/* Automatic Roof Pitch Detector */}
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2 border-b-2 border-sky-400 w-fit">
                  Automatic Roof Pitch Detector
                </h3>
                <p className="text-gray-700 text-sm">
                  Get instant roof pitch measurement detection from any photo
                  with our roof pitch measurement tool, fast, accurate, and
                  effortless.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-green-500 text-white font-medium px-6 py-3 rounded-md hover:bg-green-600 transition">
                Get Started
              </button>
              <button className="bg-[#0c1a36] text-white font-medium px-6 py-3 rounded-md hover:bg-[#14294d] transition">
                Book a Demo
              </button>
            </div>
          </div>
        </section>
        <section className="bg-[#f5fdfc] py-16 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
            {/* Left: iPad Image */}
            <div className="w-full md:w-1/2 flex justify-center">
              <Image
                src="/pad1.png" // Make sure ipad.png is in /public folder
                alt="App on iPad"
                width={300}
                height={300}
                className=""
              />
            </div>

            {/* Right: Swiper with testimonial pairs */}
            <div className="w-full md:w-1/2">
              <Swiper
                modules={[Autoplay]}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                }}
                loop={true}
                spaceBetween={20}
                slidesPerView={1}
                className="w-full"
              >
                {groupedTestimonials.map((group, i) => (
                  <SwiperSlide key={i}>
                    <div className="grid gap-6 md:grid-cols-2">
                      {group.map((t, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-[#e0f7f1] to-[#cde8e4] p-6 rounded-lg shadow-md h-[300px]"
                        >
                          <p className="italic mb-4 text-gray-800">
                            "{t.quote}"
                          </p>
                          <p className="font-semibold text-sm text-gray-900">
                            {t.name} <br />
                            <span className="text-teal-700">{t.location}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
        <section className="bg-gradient-to-br from-[#001e3c] to-[#014b53] text-white py-16 px-6 max-w-5xl mx-auto rounded-lg">
          <div className=" grid md:grid-cols-2 gap-10 items-center rounded-lg p-6">
            {/* Left Text */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Create unlimited roof measurements without fretting over costs.
              </h2>
              <p className="text-sm md:text-base text-slate-300 mb-6">
                Measure a roof quickly! With an average roof measuring time of
                just 4.36 minutes for a moderate-sized roof, Our commitment to
                excellence over the past 12 years has made us the go-to for
                millions of roof reports.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-green-300 hover:bg-green-400 text-white font-semibold py-2 px-6 rounded transition">
                  Get Started
                </button>
                <button className="bg-sky-400 hover:bg-sky-500 text-white font-semibold py-2 px-6 rounded transition">
                  Book a demo
                </button>
              </div>
            </div>

            {/* Right Stat */}
            <div className="text-center md:text-right">
              <h3 className="text-5xl font-bold mb-2">
                {minutes.toFixed(2)} <span className="text-3xl">Min</span>
              </h3>
              <p className="text-sm md:text-base text-slate-300">
                Avg time to create a roof report in <br className="md:hidden" />
                iRoofing
              </p>
            </div>
          </div>
        </section>
        <section className="bg-[#f8fdf9] py-16 px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-slate-800">
            Measure a Roof with Versatility
          </h2>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((item, index) => (
              <div
                key={index}
                className={`bg-[#f0faea] p-6 rounded shadow-md text-left relative transition-all duration-300 ${
                  openIndex === index ? "border-t-4 border-blue-300" : ""
                }`}
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-700 mb-4">{item.short}</p>

                <button
                  className="flex items-center text-gray-500 hover:text-blue-600 text-sm font-medium"
                  onClick={() => toggleAccordion(index)}
                >
                  Read More
                  <BiChevronRight
                    className={`w-4 h-4 ml-1 transition-transform ${
                      openIndex === index ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {/* Accordion Content */}
                <div
                  className={`mt-4 text-sm text-gray-600 overflow-hidden transition-all duration-300 ${
                    openIndex === index
                      ? "max-h-40 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p>{item.full}</p>
                </div>
              </div>
            ))}
          </div>
          <section className="bg-[#f8fdf9] py-16 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
              {/* Left: Image */}
              <div className="w-full md:w-1/2 flex justify-center">
                <Image
                  src="/mackbook.png" // <-- Replace with your actual image path
                  alt="iRoofing laptop app"
                  width={300}
                  height={300}
                  className="object-contain drop-shadow-xl"
                />
              </div>

              {/* Right: Text and Buttons */}
              <div className="w-full md:w-1/2 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
                  Effortless Process, Exceptional Results
                </h2>
                <p className="text-slate-700 text-base md:text-lg mb-6 leading-relaxed">
                  Our reputation is built on precision. iRoofing’s Roof
                  Measurements are the epitome of simplicity and efficiency,
                  featuring satellite and aerial roof imagery in different times
                  of the year, customizable roof report templates, and intuitive
                  drawing tools. Here’s how you can start revolutionizing your
                  roofing projects today
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-semibold py-2 px-6 rounded transition">
                    Subscribe Now
                  </button>
                  <button className="bg-[#01172e] hover:bg-[#022341] text-white font-semibold py-2 px-6 rounded transition">
                    Book a Demo
                  </button>
                </div>
              </div>
            </div>
          </section>
        </section>
        <section className="bg-[#f8fdf9] py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Steps Section */}
            <div>
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start mb-5">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-[#01414d] text-white font-semibold rounded-full mr-4">
                    {idx + 1}
                  </div>
                  <p className="text-slate-800 text-sm md:text-base leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
              <p className="italic text-slate-500 text-sm mt-4">
                Use this roof measurement report to instantly generate an
                estimate within iRoofing.
              </p>
            </div>

            {/* Thumbnail & Play Button */}
            <div
              className="relative w-full cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              <Image
                src="/video-thumb.jpg"
                alt="Video Thumbnail"
                width={540}
                height={360}
                className="rounded shadow-lg w-full h-auto object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
                  <svg
                    fill="white"
                    height="30"
                    viewBox="0 0 24 24"
                    width="30"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Video Modal */}
          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
              <div className="relative w-full max-w-3xl aspect-video">
                <iframe
                  src="/video.mp4" // For local video. For YouTube: use https://www.youtube.com/embed/VIDEO_ID
                  title="How to use iRoofing"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                ></iframe>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-2 right-2 bg-white text-black font-bold w-8 h-8 rounded-full shadow hover:bg-gray-200"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </section>
        <section className="bg-[#f8fdf9] py-16 px-6">
          <div className="max-w-7xl mx-auto bg-gradient-to-b from-[#042749] to-[#01414d] text-white rounded-md p-8 md:p-12 flex flex-col md:flex-row gap-10">
            {/* Left Side */}
            <div className="md:w-1/2">
              <p className="uppercase text-sm text-slate-300 mb-2">
                Case Study
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Laura Jennings:
                <br />
                Elevating Efficiency with iRoofing
              </h2>
              <h3 className="font-semibold text-white mb-2">
                In Laura’s Words:
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                “iRoofing’s roof measurement tool transformed our operations,
                enhancing accuracy and efficiency, leading to significant
                profitability and trust gains. It’s been a key factor in our
                growth.”
              </p>
            </div>

            {/* Right Side Cards */}
            <div className="md:w-1/2 grid gap-4">
              {/* Card 1 */}
              <div className="bg-white text-slate-800 rounded-md p-4 shadow-md">
                <h4 className="font-semibold mb-1">Before iRoofing:</h4>
                <p className="text-sm">
                  Laura’s Denver-based Jennings Roofing Solutions struggled with
                  the time and accuracy of manual roof measurements.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white text-slate-800 rounded-md p-4 shadow-md">
                <h4 className="font-semibold mb-1">
                  The iRoofing Transformation:
                </h4>
                <p className="text-sm">
                  Switching to iRoofing's precision roof measurement feature,
                  Laura’s team embraced roof measurements from satellite,
                  slashing estimation time and boosting project throughput.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white text-slate-800 rounded-md p-4 shadow-md">
                <h4 className="font-semibold mb-1">Impactful Results:</h4>
                <p className="text-sm mb-1">
                  <strong>Accuracy & Efficiency:</strong> Roof measurement
                  accuracy soared, cutting down material waste and assessment
                  time by 60%.
                </p>
                <p className="text-sm">
                  <strong>Customer Trust & Profitability:</strong> Improved
                  estimate transparency lifted client confidence, driving a 50%
                  profit increase within six months.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-gradient-to-b from-[#01586e] to-[#051f3d] text-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Heading */}
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                iRoofing Surpasses Industry Standard,
              </h2>
              <p className="text-cyan-300 font-medium text-lg">
                Offering Unmatched Pricing &amp; Value
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mb-16">
              <table className="min-w-full text-sm text-center text-white border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-slate-500">
                    <th className="p-3 font-semibold">Feature</th>
                    <th className="p-3 font-semibold">iRoofing</th>
                    <th className="p-3 font-semibold">Others</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-slate-700/50">
                    <td className="p-3 font-semibold">Pricing Model</td>
                    <td className="p-3">Flat-Rate</td>
                    <td className="p-3">Per-Report</td>
                  </tr>
                  <tr className="bg-slate-700/50">
                    <td className="p-3 font-semibold">Unlimited Reports</td>
                    <td className="p-3">Yes</td>
                    <td className="p-3">No</td>
                  </tr>
                  <tr className="bg-slate-700/50">
                    <td className="p-3 font-semibold">Image Sources</td>
                    <td className="p-3">
                      Satellite, Drone, Aerial, Blueprints
                    </td>
                    <td className="p-3">Aerial</td>
                  </tr>
                  <tr className="bg-slate-700/50">
                    <td className="p-3 font-semibold">Customized Reports</td>
                    <td className="p-3">Yes</td>
                    <td className="p-3">No</td>
                  </tr>
                  <tr className="bg-slate-700/50">
                    <td className="p-3 font-semibold">
                      Real-Time Measurements
                    </td>
                    <td className="p-3">Yes</td>
                    <td className="p-3">No</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CTA Section */}
            <div className="bg-white text-slate-900 rounded-md p-6 max-w-4xl mx-auto shadow-lg">
              <h3 className="text-lg md:text-xl font-bold mb-2">
                Choose Your Path to Success
              </h3>
              <p className="text-sm mb-4 text-slate-700">
                iRoofing’s Roof Measurement tool is a cornerstone of our
                subscriptions, offering unparalleled value with no hidden fees.
                Select the plan that aligns with your goals and step into a
                world of advanced roofing solutions.
              </p>

              <div className="flex flex-col md:flex-row gap-3">
                <button className="bg-cyan-400 hover:bg-cyan-500 text-white px-6 py-2 rounded-md w-full md:w-auto">
                  Monthly Subscription
                </button>
                <button className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-2 rounded-md w-full md:w-auto">
                  6 Month Subscription
                </button>
                <button className="bg-black hover:bg-gray-900 text-white px-6 py-2 rounded-md w-full md:w-auto">
                  Yearly Subscription
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 px-4 bg-white text-center">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-10">
              Explore The Power Of Unlimited Roof Measurements
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {articles.map((article, index) => (
                <div
                  key={index}
                  className="shadow-md rounded overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative w-full h-48">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 text-left">
                    <h3 className="text-md font-medium text-slate-800 mb-2">
                      {article.title}
                    </h3>
                    <a
                      href={article.link}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Read More »
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Roof Measurements - Frequently Asked Questions
          </h2>
          <p className="text-md text-slate-700 mb-6 font-semibold">
            Measurements in iRoofing FAQ’s
          </p>

          <div className="divide-y divide-slate-300 border-t border-b border-slate-300">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="py-4 cursor-pointer"
                onClick={() => toggleIndex(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900">
                    {item.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-slate-700 transform transition-transform duration-300 ${
                      activeIndex === index ? "rotate-180" : "rotate-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {activeIndex === index && (
                  <div className="mt-2 text-slate-700 text-sm">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
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
                className="flex flex-col items-center justify-center rounded-md border border-white/30 p-6 text-center bg-[#07203f] cursor-pointer hover:bg-white/10 transition"
              >
                <div className="mb-3 text-sky-300">{icon}</div>
                <p className="text-sm font-light">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
