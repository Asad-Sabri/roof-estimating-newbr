"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function BenefitsSection() {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const x = ((clientX - bounds.left) / bounds.width) * 100;
    setPosition(Math.min(100, Math.max(0, x)));
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const move = (event: MouseEvent | TouchEvent) => {
      if ("touches" in event) {
        handleMove(event.touches[0].clientX);
      } else {
        handleMove(event.clientX);
      }
    };
    const stop = () => {
      window.removeEventListener("mousemove", move as any);
      window.removeEventListener("touchmove", move as any);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
    };
    window.addEventListener("mousemove", move as any);
    window.addEventListener("touchmove", move as any);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
  };

  return (
    <section className="bg-[#f8fcf9] py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
       

        {/* Right Side: Benefits List */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Key Benefits – How{" "}
            <span className="text-cyan-600">Clearoof™</span> Gives You a
            Competitive Edge
          </h2>
          <p className="text-gray-600 mb-6">
            Faster, Smarter, More Accurate
          </p>

          <h3 className="text-lg font-semibold mb-4">Benefits:</h3>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-cyan-600">📏</span>
              <p>
                <strong>99% Measurement Accuracy:</strong> Clearoof delivers
                professional-grade accuracy, helping you avoid costly mistakes
                and impress clients.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-600">⏱️</span>
              <p>
                <strong>Save Time:</strong> Measure any roof in 10 minutes or
                less and focus on closing deals.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-600">🌳</span>
              <p>
                <strong>Tree Coverage? No Problem:</strong> Clearoof’s seasonal
                imagery lets you see through tree coverage when you need it
                most.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-600">💻</span>
              <p>
                <strong>Seamless Workflow:</strong> Works across web and mobile
                platforms, so you can measure anytime, anywhere.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-600">📊</span>
              <p>
                <strong>Professional Client Presentations:</strong> Create
                accurate estimates and proposals that wow clients.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-600">👁️</span>
              <p>
                <strong>Visuals:</strong> Use impactful icons and animations to
                emphasize speed, accuracy, and ease of use.
              </p>
            </li>
          </ul>
        </div>
         {/* Left Side: Before/After Slider inside Phone Mockup */}
        <div className="flex justify-center">
          <div
            ref={containerRef}
            className="relative w-[300px] md:w-[350px] aspect-[9/18]  overflow-hidden cursor-ew-resize select-none"
            onMouseDown={handleStart}
            onTouchStart={handleStart}
          >
            {/* After Image (always visible) */}
            <Image
              src="/mobileroof1.png"
              alt="After"
              fill
              className="object-cover"
              priority
            />

            {/* Before Image (clipped) */}
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{ width: `${position}%` }}
            >
              <Image
                src="/mobileroof.png"
                alt="Before"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Labels */}
            <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
              Before
            </div>
            <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
              After
            </div>

            {/* Slider Line */}
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
      </div>
    </section>
  );
}
