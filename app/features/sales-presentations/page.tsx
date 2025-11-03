"use client";

import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";

const SalesPresentation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

  const features = [
    {
      title: "We’ve Got the Neighborhood Covered",
      description: "Demonstrate local expertise and presence.",
    },
    {
      title: "Tell Your Story",
      description:
        "Emphasize the importance of personal connection through a compelling narrative.",
    },
    {
      title: "Showcase Your Best Work",
      description:
        "Highlight the visual appeal and the quality of past projects.",
    },
    {
      title: "Hear Directly from Our Satisfied Customers",
      description: "Build trust through the power of social proof.",
    },
    {
      title: "Recognize Excellence",
      description:
        "Establish credibility through awards, certifications, and recognition.",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Choose Your Template",
      description:
        "Start by picking a sleek template from our collection. Whether you prefer modern minimalism or something that packs a visual punch, we’ve got you covered.",
    },
    {
      number: 2,
      title: "Customize It",
      description:
        "This is where the magic happens. Drag and drop your project photos, videos, and testimonials. Pin your jobs on the map, and don’t forget to shine a light on your credentials. Your story, your style.",
    },
    {
      number: 3,
      title: "Animate & Personalize",
      description:
        "Add that wow factor! With simple tools, animate your portfolio to bring it to life. Personalize it with examples of your amazing work and details about how you transformed projects from bad to good. They’ll see exactly why you’re the best choice.",
    },
    {
      number: 4,
      title: "Preview & Send",
      description:
        "Take a quick peek to make sure everything looks top-notch. Then zoom off to impress your prospect. Ready, set, close!",
    },
  ];

  type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "Can I use my own company name and logo?",
    answer:
      "Yes! You can fully customize your presentation with your company name, logo, colors, and branding elements.",
  },
  {
    question: "Can I add photos and videos to my presentation?",
    answer:
      "Absolutely. You can upload and embed high-quality images and videos to make your presentation more engaging.",
  },
  {
    question: "Can I add my insurance license and certifications?",
    answer:
      "Yes, you can easily include your license, certifications, and other credentials to build trust and credibility.",
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

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <>
      <HeaderLayout />
      <section className="w-full bg-[#01344e] text-white py-36 px-6 lg:px-20">
        <div className="grid lg:grid-cols-2 gap-10 ">
          <div>
            <h2 className="text-3xl lg:text-5xl font-bold leading-tight mb-4">
              Create Sales Presentations{" "}
              <span className=" text-[#2bc7e9]">
                with iRoofing’s Digital Portfolio
              </span>
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
      <section className="bg-[#f9fdf9] px-6 py-16 border-b border-blue-200">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] leading-snug w-full max-w-3xl text-center mx-auto">
            Ready to Shake up the Roofing{" "}
            <span className="text-[#22d3ee] font-bold">Game</span> with
            Something that{" "}
            <span className="text-[#22d3ee] font-bold">Truly Sets</span> you
            Apart?
          </h2>

          <p className="mt-6 text-gray-800 text-base md:text-lg leading-relaxed">
            With iRoofing’s Digital Portfolio tool, you’re just a few clicks
            away from crafting eye-catching, animated sales presentations that
            scream “professional” and “personalized” all at once. Dive into an
            easier way to connect, impress, and close deals faster. From
            detailed bios that tell your company’s story to engaging galleries
            of your past projects, maps showing your widespread impact,
            heartfelt video testimonials, and showcasing your well-earned
            credentials, it’s all about making your company pop and turning
            those prospects into projects.
          </p>
        </div>
      </section>
      <section className="bg-gradient-to-b from-[#0f172a] to-[#014451] text-white px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          {/* Header */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Dynamic Features for{" "}
            <span className="text-cyan-400">Winning Bids</span>
          </h2>
          <p className="text-lg font-semibold mb-12">
            Let&apos;s close those sales together, shall we?
          </p>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 text-left">
            {features.map((feature, idx) => (
              <div key={idx}>
                <h4 className="font-semibold border-b border-cyan-400 pb-2 mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-200">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Button */}
          <div className="mt-12 flex items-center justify-center">
            <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] cursor-pointer text-white  font-bold w-[217px] h-[44px] flex items-center justify-center rounded-md">
              Get Started
            </button>
          </div>
        </div>
      </section>
      <section className="bg-[#f9fdf9] text-[#1a1a1a] px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Nail It in <span className="text-cyan-500">No Time</span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Creating your custom company showcase with iRoofing is as easy as
            1-2-3, and here’s how you do it. No sweat, just success.
          </p>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 text-left">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center md:text-left md:items-start"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 text-white font-bold text-lg shadow mb-4">
                  {step.number}
                </div>
                <h4 className="font-semibold mb-2">{step.title}</h4>
                <p className="text-sm text-gray-700">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Final message */}
          <p className="text-base text-gray-700 max-w-3xl mx-auto mb-8">
            And just like that, you’re all set to dominate the roofing scene
            with a custom portfolio that not only look great but also get you
            the yes. <br />
            Ready to Give it a Whirl?
          </p>

          {/* Button */}
          <div className="mt-12 flex items-center justify-center">
            <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] cursor-pointer text-white  font-bold w-[217px] h-[44px] flex items-center justify-center rounded-md">
              Get Started
            </button>
          </div>
        </div>
      </section>
      <section className="bg-[#f6fcf8] py-16 px-4">
        <div className="max-w-6xl mx-auto rounded-lg bg-gradient-to-b from-[#041E42] to-[#004E4F] text-white p-8 md:p-12 flex flex-col lg:flex-row gap-8">
          {/* Left Content */}
          <div className="flex-1">
            <h3 className="text-sm uppercase text-gray-300 tracking-widest mb-3">
              Case Study
            </h3>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              <span className="text-cyan-400">Sky-High</span> Success
              <br />
              Jackson Roofing Co.
            </h2>

            <p className="text-sm md:text-base text-gray-100 mb-4 font-semibold">
              In Alex’s Words:
            </p>

            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              “iRoofing’s Digital Portfolio tool was a game-changer for us. Our
              business now packs a punch that’s impossible to ignore, setting us
              miles apart from the competition. It’s like we’re playing a whole
              new ball game!”
            </p>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-white text-gray-800 rounded-md shadow p-4">
              <h4 className="font-semibold mb-1">Before iRoofing:</h4>
              <p className="text-sm">
                The team faced challenges in standing out in a competitive
                market, impacting their ability to close deals efficiently and
                effectively. They needed innovative strategies to improve their
                market presence and sales processes.
              </p>
            </div>

            <div className="bg-white text-gray-800 rounded-md shadow p-4">
              <h4 className="font-semibold mb-1">The iRoofing Breakthrough:</h4>
              <p className="text-sm">
                With our Digital Portfolio tool, Jackson Roofing Co. transformed
                their sales approach. They started showcasing their
                personalized, animated portfolio that highlighted their work and
                expertise in a way no plain text document ever could.
              </p>
            </div>

            <div className="bg-white text-gray-800 rounded-md shadow p-4">
              <h4 className="font-semibold mb-1">Impactful Results:</h4>
              <p className="text-sm">
                A whopping 40% increase in sales closure rate within just the
                first two months.
              </p>
            </div>
          </div>
        </div>
      </section>
       <section className="px-4 py-12 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-center text-[#0F2A3F] mb-8">
          Frequently Asked Questions
        </h2>

        <div className="divide-y divide-gray-200 border border-gray-100 rounded-md">
          {faqs.map((faq, index) => (
            <div key={index}>
              <button
                onClick={() => toggle(index)}
                className="w-full text-left px-6 py-4 flex items-center justify-between font-semibold text-[#0F2A3F] hover:bg-gray-50 transition"
              >
                {faq.question}
                <ChevronDownIcon
                  className={`w-5 h-5 transform transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`px-6 pb-4 text-sm text-gray-700 transition-all duration-300 ease-in-out ${
                  openIndex === index ? "block" : "hidden"
                }`}
              >
                {faq.answer}
              </div>
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

export default SalesPresentation;
