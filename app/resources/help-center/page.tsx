import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import React from "react";

const HelpCenter = () => {
  interface HelpCard {
    title: string;
    description: string;
  }

  const helpItems: HelpCard[] = [
    {
      title: "Explore Subscription Options",
      description: "Check out plans, trial offers, and upgrade features.",
    },
    {
      title: "Provide Feedback",
      description: "Help us improve by sharing your thoughts.",
    },
    {
      title: "Join the Community",
      description: "Engage with other users to share and learn.",
    },
    {
      title: "Book a Free Demo",
      description: "New to our platform? Schedule a personal walkthrough.",
    },
    {
      title: "Set Up Your App",
      description: "Get a custom setup session tailored to your needs.",
    },
  ];

  const featireitems = [
    {
      title: "Digital Roof Measurements"
    },
    {
      title: "Signatures & Documents"
    },
    {
      title: "Automated Roof Estimates"
    },
    {
      title: "Catalogs & Materials"
    },
    {
      title: "Hi-Def Roof Visualizer"
    },
    {
      title: "Integrated Supply Orders"
    },
    {
      title: "Sales Presentations"
    },
    {
      title: "Project Management"
    },
  ]

  return (
    <>
    <HeaderLayout/>
    <div className="bg-[#f8fcf4]">
   <div className="bg-[#05374c] h-[85vh] relative overflow-hidden">
  {/* Text + Button Overlay */}
  <div className="relative z-10 ">
    {/* Right-aligned Image */}
    <div className="flex justify-end">
      <img
        src="/house.png"
        alt=""
        className=" h-[60vh] sm:h-[70vh] md:h-[80vh] object-contain"
      />
    </div>

    {/* Main Heading */}
    <h1 className="text-2xl sm:text-[50px] font-[800] leading-[59px] text-white absolute top-[10%] md:top-[10%] lg:top-[25%] left-[8%] max-w-[90%] sm:max-w-[60%]">
      The Help Center <br />
      Your <span className="text-[#2bc7e9]">One-Stop</span> Support Hub
    </h1>

    {/* Subheading */}
    <p className="text-2xl sm:text-[36px] text-white absolute top-[70%] md:top-[60%] left-[8%] leading-none max-w-[90%] sm:max-w-[60%]">
      Less time on paperwork,
      <br /> more time on roofs
    </p>

    {/* Button */}
    <div className="flex items-center justify-center absolute top-[90%] lg:top-[80%] xl:top-[84%] left-[8%]">
      <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] cursor-pointer text-white text-xl font-bold w-[217px] h-[44px] flex items-center justify-center rounded-md">
        Subscribe Now
      </button>
    </div>
  </div>
</div>


      <section className="my-20">
        <div className="flex items-center justify-center">
          <h1 className=" text-[35px] font-bold">
            How can we <span className="text-[#2bc7e9] ">help?</span>
          </h1>
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center px-4">
          {helpItems.map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 p-6 rounded-md text-left max-w-sm w-full"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 mt-2">{item.description}</p>
            </div>
          ))}
        </div>
         <div className="flex items-center justify-center my-10">
            <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] cursor-pointer text-white text-xl font-bold w-[217px] h-[44px] flex items-center justify-center rounded-md">
              Contact us
            </button>
          </div>
          <div className=" mt-20">
          <div className="flex items-center justify-center">
          <h1 className=" text-[35px] text-center font-bold">
            Roof Estimate's Features
          </h1>
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center px-4">
          {featireitems.map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 p-6 rounded-md text-center w-xs "
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
          </div>
      </section>
    </div>
    <Footer/>
    </>
  );
};

export default HelpCenter;
