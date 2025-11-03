import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import Image from "next/image";
import React from "react";

const Manufacture = () => {
  interface Feature {
    title: string;
    description: string;
  }

  const features: Feature[] = [
    {
      title: "Enhanced Visibility",
      description:
        "Gain exposure by showcasing your brand and products to a wide network of contractors through our featured listings and digital catalogs.",
    },
    {
      title: "AI Visualization",
      description:
        "Bring your products to life with our intelligent AI visualizer, helping customers better understand how your materials will look and perform.",
    },
    {
      title: "Seamless Integration",
      description:
        "Easily upload and sync product details—including images, specs, and documentation—directly into our ecosystem with minimal setup.",
    },
    {
      title: "Training Simplified",
      description:
        "Onboard your team quickly with intuitive tools and ready-to-use templates, cutting down the time needed for extensive training.",
    },
    {
      title: "Unlimited Access",
      description:
        "Empower your staff with unrestricted access to our full suite of tools and resources, so they’re equipped for success at every level.",
    },
    {
      title: "Data Insights",
      description:
        "Make smarter business decisions with access to real-time analytics, buyer behavior trends, and industry benchmarks.",
    },
  ];

  return (
    <>
      <HeaderLayout />
      <div className="bg-[#f8fcf4]">
        <div className="bg-[#05374c] md:h-screen">
          <div className=" relative">
            <img src="/grid.png" alt="" />
            <h1 className=" text-[30px] md:text-[50px] font-[800] leading-[59px] text-white absolute top-[10%] lg:top-[25%] left-[8%] lg:w-[50%]">
              {" "}
              <span className="text-[#2bc7e9]">Partner</span> With Us
            </h1>
            <p className=" text-xl md:text-[36px] text-white absolute top-[35%] lg:top-[44%] left-[8%] md:w-[40%] leading-none">
              Build Recognition and Trust in the Roofing Market
            </p>
            <div className="flex items-center justify-center absolute top-[70%] xl:top-[64%] left-[8%]">
              <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] text-white text-xl font-bold w-[217px] h-[44px] flex items-center justify-center rounded-md">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
        <section>
          <p className=" text-lg text-center w-[70%] mx-auto font-semibold my-20">
            Connect with thousands of roofing professionals nationwide, ensuring
            your brand is visible in key markets. Showcase your products
            directly to decision-makers who drive the industry forward.
          </p>
        </section>
        <section className="py-16 px-2 md:px-20">
          <div className="md:max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              <span className="text-cyan-500">Visibility</span> and Tools for{" "}
              <span className="text-cyan-500">Success</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {features.map((feature, index) => (
                <div key={index} className="border-t-4 border-cyan-400 pt-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-800 ">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-gradient-to-r from-[#071E3D] to-[#012840] text-white py-16 px-6 md:px-16 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Text Content */}
          <div className="flex-1 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Engage Homeowners & <br />
              Contractors <span className="text-cyan-400">Effectively</span>
            </h2>

            <div className="space-y-6 text-base">
              <div>
                <h3 className="font-bold text-2xl mb-2 text-white">
                  Connect Directly with Homeowners:
                </h3>
                <p className="">
                  Showcase your products within our intuitive homeowner
                  platform, giving you direct exposure to both property owners
                  and contractors in high-demand areas.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-2xl mb-2 text-white">
                  Access Real-Time Customer Leads:
                </h3>
                <p className="">
                  Receive fresh homeowner inquiries at no extra cost — enabling
                  quick communication with manufacturers and contractors to
                  maximize conversion.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-2xl mb-2 text-white">
                  Boost Visibility with Premium Placement:
                </h3>
                <p className="">
                  Take advantage of top-tier positioning through exclusive
                  promotions, industry sponsorships, and strategic event
                  marketing at expos like IRE.
                </p>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="flex-1 max-w-xl">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/manwork.png"
                alt="Roofing contractor at work"
                width={600}
                height={400}
                className="object-cover w-full h-auto"
              />
            </div>
          </div>
        </section>
        <section className="bg-gradient-to-r from-[#071E3D] to-[#024059] text-white py-12 px-6 md:px-16 rounded-lg w-[90%] mx-auto my-20">
          <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
            {/* Left Item */}
            <div className="flex-1 p-6">
              <h3 className="text-xl md:text-2xl font-bold mb-2 text-center">
                Product Adoption:
              </h3>
              <p className=" text-center">
                Leverage our tools to seamlessly introduce your offerings into
                new channels and collect insights on user behavior and product
                interest.
              </p>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-white h-24 mx-4" />

            {/* Right Item */}
            <div className="flex-1 p-6">
              <h3 className="text-xl md:text-2xl font-bold mb-2 text-center">
                Strategic Brand Partnerships:
              </h3>
              <p className=" text-center">
                Collaborate on targeted campaigns and events to expand your
                reach and build long-term brand recognition in competitive
                markets.
              </p>
            </div>
          </div>
        </section>
        <section className="relative w-full h-[450px] md:h-[400px] overflow-hidden">
          {/* Background Image */}
          <Image
            src="/roofclouds.png"
            alt="Roof with sky background"
            layout="fill"
            objectFit="cover"
            className="absolute top-0 left-0 opacity-90"
            priority
          />

          {/* Overlay Content */}
          <div className="relative z-10 w-[90%] mx-auto px-6 py-20 md:py-32  text-left text-black">
            <h2 className="text-2xl md:text-3xl font-bold">
              Homeowner and Contractor{" "}
              <span className="text-cyan-500">Engagement</span>
            </h2>
            <p className=" text-md md:text-lg text-gray-800 font-semibold md:w-[50%] mt-14">
              By partnering with us, you align with a technology-forward
              platform that offers unmatched exposure, innovative tools, and
              strategic insights. Let’s drive the roofing industry forward
              together.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Manufacture;
