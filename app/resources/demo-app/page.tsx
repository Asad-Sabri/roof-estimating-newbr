import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import InteractiveToolSection from "@/components/interactivevideosection";
import React from "react";

const page = () => {
  return (
    <>
      <HeaderLayout />
      <div className="bg-[#09213e] relative py-20 md:h-[60vh] overflow-hidden">
        {/* Background grid image */}
        <img
          src="/grid.png"
          alt="Grid Background"
          className="absolute top-0 left-0 w-1/2 md:w-1/4 h-auto object-cover opacity-20 pointer-events-none"
        />

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 h-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Take a Tour
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-white font-light max-w-xl">
            Tap on the buttons to see each feature
          </p>
        </div>
      </div>

      <InteractiveToolSection />
      <Footer />
    </>
  );
};

export default page;
