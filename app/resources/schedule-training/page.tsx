"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import SchedulePicker from "@/components/schedulepicker";
import Image from "next/image";
import HeaderLayout from "@/components/HeadersLayout";
import Footer from "@/components/Footer";

const testimonials = [
  {
    text: "if every business had customer service like this.. the whole world would be a much better place.",
    author: "Aaron S, South Carolina",
  },
  {
    text: "This kickoff session gave me the clarity I needed to move forward with confidence.",
    author: "Jessica M, California",
  },
  {
    text: "The best onboarding experience I’ve ever had with a company.",
    author: "David K, Texas",
  },
];

const benefits = [
  {
    title: "Quick Onboarding",
    description:
      "Learn everything you need to start using iRoofing efficiently in less than an hour.",
  },
  {
    title: "Flexibility",
    description:
      "Choose from multiple session formats and times to best suit your needs.",
  },
  {
    title: "Avoid Common Pitfalls",
    description:
      "Understand common user errors and how to avoid them, reducing frustration.",
  },
  {
    title: "Enhanced Productivity",
    description:
      "Utilize iRoofing to its fullest potential, saving time and increasing job accuracy.",
  },
  {
    title: "Personalized Support",
    description:
      "Get answers to your specific questions and guidance tailored to your business.",
  },
];

export default function TestimonialsSwiper() {
  // <-- Use the proper imported type and initialize with null
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <>
    <HeaderLayout/>
      <section className="relative bg-gradient-to-b from-cyan-900 to-cyan-950 text-white h-[70vh] pt-30 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold">
            Schedule Your <span className="text-cyan-400">Kick Off</span>{" "}
            Session Now
          </h2>

          <div className="mt-8 relative">
            {/* Prev button */}
            <button
              aria-label="Previous"
              onClick={() => swiperRef.current?.slidePrev()}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              ‹
            </button>

            {/* The Swiper itself — heading stays static outside the Swiper */}
            <Swiper
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              slidesPerView={1}
              loop
              className="max-w-3xl mx-auto px-6"
            >
              {testimonials.map((t, i) => (
                <SwiperSlide key={i}>
                  <blockquote className="italic text-lg md:text-xl text-center">
                    “{t.text}”
                    <footer className="mt-4 text-sm md:text-base not-italic font-medium">
                      {t.author}
                    </footer>
                  </blockquote>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Next button */}
            <button
              aria-label="Next"
              onClick={() => swiperRef.current?.slideNext()}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              ›
            </button>
          </div>
        </div>
      </section>
      <SchedulePicker />
      <section className="bg-[#f9fdf7] py-16 px-4">
        <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
          {/* Left Side - Text */}
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-[#071F40] mb-8">
              <span className="text-cyan-500">Why</span> Invest Time in
              Onboarding?
            </h2>

            <ul className="space-y-6 text-[#071F40]">
              {benefits.map((benefit, index) => (
                <li key={index}>
                  <p className="font-semibold">{benefit.title}:</p>
                  <p className="text-sm mt-1">{benefit.description}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side - Image */}
          <div className="flex-1 flex justify-center">
            <Image
              src="/laptop1.png" // put your image in public/images/
              alt="Onboarding Laptop"
              width={600}
              height={400}
              className="w-auto h-auto max-w-full object-contain"
              priority
            />
          </div>
        </div>
      </section>
      <section className="bg-[#f9fdf7] py-16 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12">
          {/* Left Image */}
          <div className="relative w-64 h-64 rounded-full bg-[#d8f3dc] overflow-hidden flex-shrink-0">
            <Image
              src="/manwithtab1.png" // Make sure to place this image in /public/images/
              alt="Roofer using tablet"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right Content */}
          <div className="text-center md:text-left max-w-md">
            <h2 className="text-2xl md:text-3xl font-bold text-[#071F40]">
              <span className="text-cyan-500">Step Into</span> the Future of
              Roofing
            </h2>
            <p className="mt-4 text-[#071F40] text-sm">
              Don’t let time constraints hold you back. Join the many satisfied
              iRoofing users who have streamlined their processes and boosted
              their productivity. Schedule your quick start today and take the
              first step toward mastering your digital roofing tools!
            </p>

            {/* CTA Button */}
            <div className="flex items-center justify-start mt-5">
              <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] text-white text-lg font-bold w-[217px] h-[44px] flex items-center justify-center rounded-md">
                Schedule Now
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-[#f9fdf7]">
        <div className="max-w-xl mx-auto">
          <div className="bg-gradient-to-b from-[#004E6D] to-[#002B4E] text-white rounded-lg shadow-lg p-8 text-center">
            {/* Heading */}
            <h2 className="text-2xl font-bold mb-4">
              Hear It from <span className="text-cyan-400">Our Pro</span>
            </h2>

            {/* Message */}
            <p className="text-sm md:text-base leading-relaxed">
              Hey, iRoofing is not just a tool; it’s your new best friend in the
              roofing game. Our quick start sessions? They’re like a turbo boost
              for your workflow. Jump in, and let’s get you slinging shingles
              like a pro in record time. You’re going to love how easy and
              efficient your days become!
            </p>

            {/* Signature */}
            <p className="mt-6 font-semibold text-sm">
              –Kyle, Onboarding Ace at iRoofing–
            </p>
          </div>
        </div>
      </section>
      <Footer/>
    </>
  );
}
