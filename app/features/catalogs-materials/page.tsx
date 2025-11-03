"use client";
import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import Image from "next/image";
import React, { useState } from "react";
import { FaChevronRight } from "react-icons/fa";

const Catalog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);
  const features = [
    {
      title: "Vast Catalog Selection",
      description:
        "Explore an unparalleled range of roofing materials, from traditional shingles to cutting-edge composites, all at your fingertips.",
    },
    {
      title: "Always Up-to-Date",
      description:
        "Ensure your proposals are powered by the latest data with real-time catalog updates.",
    },
    {
      title: "High-Impact Visuals",
      description:
        "Present products in stunning detail with HD photos, brochures, and specs that bring materials to life for your clients.",
    },
    {
      title: "Localized for You",
      description:
        "Tailor catalogs to your region, ensuring you’re pitching materials that are readily available.",
    },
    {
      title: "Visualize with Confidence",
      description:
        "Use our Roof Visualizer to showcase your clients’ future roof, helping them decide faster.",
    },
    {
      title: "Unlimited Access",
      description:
        "Equip your team with limitless access to all the tools they need to succeed.",
    },
  ];

  type FAQ = {
    question: string;
    answer: string;
  };

  const faqs: FAQ[] = [
    {
      question: "What manufacturers are available in iRoofing?",
      answer:
        "iRoofing offers a wide range of manufacturers including GAF, TAMKO, CertainTeed, and many others across various roofing materials.",
    },
    {
      question: "Can I add a manufacturer?",
      answer:
        "Yes, you can request to add a manufacturer if it is not already listed. Our support team will review and assist you with the process.",
    },
    {
      question: "Can I hide catalogs for the products I don’t install?",
      answer:
        "Absolutely. iRoofing allows you to hide catalogs for products you don’t use, streamlining your workflow.",
    },
    {
      question: "Can I hide individual products that I don’t install?",
      answer:
        "Yes. Not only can you hide entire catalogs, but you can also hide specific products within them.",
    },
    {
      question: "Can I access catalogs when I’m offline?",
      answer:
        "Yes, once catalogs are downloaded, you can access them offline without any issues.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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
              Digital Roofing <span className=" text-[#2bc7e9]">Catalogs</span>
            </h2>
            <p className="text-2xl text-gray-200 mb-6">
              Showcase Your Expertise and Close More Sales, Faster
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
      <section className="bg-[#f8fcf9] py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#0F2A3F] mb-6">
            Personalized Pricing <span className="text-[#25C9F3]">Catalog</span>
          </h2>
          <p className="text-[#0F2A3F] text-base md:text-lg leading-relaxed">
            In an era where efficiency and precision are paramount, iRoofing
            stands as your digital ally. Imagine having the power to access,
            compare, and present the widest array of roofing materials without
            flipping a single paper page. iRoofing is not just a tool; it’s your
            digital bridge to seamless project execution and unparalleled client
            satisfaction.
          </p>
        </div>
      </section>
      <section className="bg-gradient-to-br from-[#003344] to-[#003344] pt-16 px-4 text-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-10 text-white">
              <span className="text-[#25C9F3]">Revolutionize</span> Your Roofing
              Sales
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index}>
                  <h4 className="text-[#25C9F3] font-semibold border-b border-[#25C9F3] mb-2 pb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-white/90">{feature.description}</p>
                </div>
              ))}
            </div>

            <button className="mt-10 bg-gradient-to-r from-[#9DCE74] to-[#80BC5F] text-white px-6 py-2 rounded shadow hover:opacity-90 transition-all">
              Get Started
            </button>
          </div>

          {/* Right Image */}
          <div className="flex-1 mt-20">
            <div className="w-full max-w-xs mx-auto ">
              <Image
                src="/catalogphone.png"
                width={"200"}
                height={"500"}
                alt="Phone mockup"
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#f8fcf9] py-16 px-6">
        <h1 className=" text-4xl font-bold text-center my-10">
          Streamlined in <span className=" text-cyan-500">5 Steps</span>{" "}
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
      <section className=" text-white py-16 px-4">
        <div className="max-w-6xl mx-auto rounded-lg p-8 lg:p-12 flex flex-col lg:flex-row gap-10 bg-gradient-to-br from-[#082134] to-[#02454C] shadow-lg">
          {/* Left Section */}
          <div className="flex-1">
            <h4 className="text-sm text-white/70 uppercase mb-2">Case Study</h4>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Marcus Reynolds <span className="text-[#25C9F3]">Scaling</span>{" "}
              New Heights with iRoofing
            </h2>
            <h5 className="text-white font-medium mb-4">Marcus’s Words:</h5>
            <p className="text-white/90 text-sm leading-relaxed max-w-lg">
              “iRoofing revolutionized our approach, enhancing our efficiency
              and setting us apart in a competitive market. It’s been pivotal
              for our growth.”
            </p>
          </div>

          {/* Right Cards Section */}
          <div className="flex-1 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white text-black rounded p-4 shadow">
                <h4 className="font-semibold mb-2">Before iRoofing:</h4>
                <p className="text-sm text-gray-700">
                  Marcus’s business, Reynolds Roofing in Austin, Texas, relied
                  on cumbersome paper roofing catalogs for client presentations,
                  limiting efficiency and engagement.
                </p>
              </div>

              <div className="bg-white text-black rounded p-4 shadow">
                <h4 className="font-semibold mb-2">
                  The iRoofing Transformation:
                </h4>
                <p className="text-sm text-gray-700">
                  After adopting iRoofing’s Digital Catalogs, Marcus’s team
                  quickly transformed how they accessed and presented roofing
                  materials, offering more personalized and informed client
                  interactions.
                </p>
              </div>
            </div>

            <div className="bg-white text-black rounded p-4 shadow">
              <h4 className="font-semibold mb-2">Impactful Results:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  <strong>Efficiency Boost:</strong> Preparation time for
                  meetings was cut in half.
                </li>
                <li>
                  <strong>Closure Rate Increase:</strong> Engaging presentations
                  led to a 30% boost in project closures.
                </li>
                <li>
                  <strong>Customer Satisfaction:</strong> Clients appreciated
                  the visual, detailed insights into their projects, leading to
                  more referrals.
                </li>
                <li>
                  <strong>Revenue Growth:</strong> Reynolds Roofing saw a 40%
                  increase in revenue within the first year of using iRoofing.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gradient-to-b from-[#071933] to-[#06485D] text-white py-20 px-4 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Left Side Text + Button */}
          <div className="max-w-md text-center md:text-left">
            <p className="text-lg md:text-xl font-medium mb-4">
              With iRoofing, the future is at your fingertips. Sign up today and
              start building your legacy, one digital catalog at a time.
            </p>
            <div className="mt-12 flex items-center">
              <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] cursor-pointer text-white  font-bold w-[192px] h-[44px] flex items-center justify-center rounded-md">
                Get Started
              </button>
            </div>
          </div>

          {/* Right Side Image */}
          <div className="w-full max-w-lg">
            <Image
              src="/catalogtab.png" // Make sure to move the image to public/catalog-preview.png
              alt="Catalog preview"
              width={800}
              height={600}
              className="rounded-lg shadow-xl"
              priority
            />
          </div>
        </div>
      </section>
      <section className="py-16 px-4 md:px-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold text-center text-[#0c2d3c] mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-300">
              <button
                onClick={() => toggleIndex(index)}
                className="w-full flex justify-between items-center py-4 text-left text-[#0c2d3c] font-semibold text-base hover:text-blue-700 transition"
              >
                {faq.question}
                <FaChevronRight
                  className={`transform transition-transform duration-300 ${
                    openIndex === index ? "rotate-90" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-max-height duration-300 ease-in-out ${
                  openIndex === index ? "max-h-40" : "max-h-0"
                }`}
              >
                <p className="text-[#333] text-sm pb-4 pr-6">{faq.answer}</p>
              </div>
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

export default Catalog;
