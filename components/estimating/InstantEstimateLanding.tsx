"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BookDemoModal from "./BookDemoModal";

export default function InstantEstimateLanding() {
  const router = useRouter();
  const [isBookDemoOpen, setIsBookDemoOpen] = useState(false);

  const handleViewSample = () => {
    // Navigate to measurements page
    router.push("/measurements");
  };

  const handleBookDemo = () => {
    setIsBookDemoOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            {/* Elite Badge */}
            {/* <div className="flex justify-start mb-4">
              <div className="bg-yellow-400 rounded-full px-4 py-1.5 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-black"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-black font-semibold text-sm">Elite</span>
              </div>
            </div> */}

            {/* Image */}
            <div className="w-full h-96 bg-gray-100 rounded-lg mb-8 overflow-hidden">
              <Image
                src="https://watkinsconstructioninc.com/wp-content/uploads/2023/11/What-are-the-Different-Types-of-Roofing-Materials-jpg.webp"
                alt="Different Types of Roofing Materials"
                width={1200}
                height={600}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Qualify leads automatically with the Instant Estimator
            </h1>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button
                onClick={handleViewSample}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Instant estimate
              </button>
              <button
                onClick={handleBookDemo}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Book a demo
              </button>
            </div>

            {/* Footer Links */}
            <p className="text-center text-gray-600 text-sm">
              Check out all Elite features on{" "}
              <a
                href="/pricing"
                className="text-blue-600 underline hover:text-blue-700"
              >
                Plans & Pricing
              </a>{" "}
              or{" "}
              <a
                href="/features/roofing-estimator"
                className="text-blue-600 underline hover:text-blue-700"
              >
                learn more
              </a>{" "}
              about the Instant Estimator.
            </p>
          </div>
        </div>
      </div>

      {/* Book Demo Modal */}
      <BookDemoModal
        isOpen={isBookDemoOpen}
        onClose={() => setIsBookDemoOpen(false)}
      />
    </>
  );
}
