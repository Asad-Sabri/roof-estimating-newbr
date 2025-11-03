import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import Image from "next/image";
import React from "react";

const Distributor = () => {
  type Feature = {
    title: string;
    description: string;
  };

  const features: Feature[] = [
    {
      title: "Real-Time Collaboration",
      description:
        "Keep your entire team connected with real-time updates, shared timelines, and live task tracking across all your construction projects.",
    },
    {
      title: "Centralized Documentation",
      description:
        "Access all your blueprints, permits, contracts, and communications in one secure place — available anytime, anywhere.",
    },
    {
      title: "Performance Analytics",
      description:
        "Gain insight into your team's productivity and project progress with detailed analytics, helping you stay on schedule and under budget.",
    },
  ];
  return (
    <>
      <HeaderLayout />
      <div className="bg-[#f8fcf4]">
        <div className="bg-[#05374c] md:h-screen">
          <div className=" relative">
            <img src="/grid.png" alt="" />
            <h1 className=" text-2xl sm:text-[50px] font-[800] leading-[59px] text-white absolute top-[10%] md:top-[25%] left-[8%] md:w-[50%]">
              {" "}
              <span className="text-[#2bc7e9]">Partner</span> With Us
            </h1>
            <p className=" text-2xl sm:text-[36px] text-white absolute top-[40%] md:top-[44%] left-[8%] md:w-[40%] leading-none">
              Expand Your Reach and Maximize Growth Potential
            </p>
            <div className="flex items-center justify-center absolute top-[75%] lg:top-[70%] xl:top-[64%] left-[8%]">
              <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] text-white text-xl font-bold w-[217px] h-[44px] flex items-center justify-center rounded-md">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
        <section className="bg-[#f9fdf8] py-20 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="text-cyan-500">Boost</span>{" "}
              <span className="text-slate-900">Your Brand Visibility</span>
            </h2>
            <p className="mt-6 text-slate-800 text-lg leading-relaxed">
              Connect with industry leaders and grow your presence in the
              construction sector. Our platform helps you reach new markets by
              promoting your services directly to professionals who matter most.
            </p>
          </div>
        </section>
        <section className="bg-[#f9fdf8] py-20 px-4 text-center">
          <div className="max-w-6xl mx-auto">
            {/* Heading */}
            <h2 className="text-2xl md:text-3xl font-bold mb-12">
              <span className="text-slate-900">Digital </span>
              <span className="text-cyan-500">Precision </span>
              <span className="text-slate-900">and </span>
              <span className="text-cyan-500">Efficiency</span>
            </h2>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className=" h-[300px] flex flex-col items-center justify-center bg-gradient-to-b from-cyan-900 to-cyan-800 text-white p-6 rounded-lg shadow-md transition duration-300 hover:shadow-xl"
                >
                  <h3 className="text-3xl font-semibold mb-4">
                    {feature.title}
                  </h3>
                  <p className=" text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <div className="bg-[#F9FFF8] py-16 px-6 md:px-20">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2">
            {/* LEFT CONTENT */}
            <div className="bg-[#00394F] text-white p-4 md:p-10 rounded-l-md shadow-md">
              <h2 className="text-3xl font-bold mb-6">
                Power Your IT Distribution Strategy
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-cyan-400">
                  Partner-Only Pricing
                </h3>
                <p className="text-sm mt-1">
                  Unlock exclusive discounts and tiered pricing models designed
                  specifically for our IT distribution partners. Increase
                  margins while offering competitive rates to your clients.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-cyan-400">
                  Tech Differentiation
                </h3>
                <p className="text-sm mt-1">
                  Gain access to cutting-edge platforms and tools that set you
                  apart in a crowded tech market. Deliver smarter solutions with
                  real-time inventory, automated quotes, and fast provisioning.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-cyan-400">
                  Joint Marketing Initiatives
                </h3>
                <p className="text-sm mt-1">
                  Collaborate on industry-specific campaigns, co-branded assets,
                  and webinars to drive demand generation. Let’s grow your reach
                  with targeted marketing built for the tech space.
                </p>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="bg-white p-4 md:p-10 rounded-r-md shadow-md">
              <h3 className="text-xl font-bold text-center mb-6">
                Contact us today to explore how our partnership can take your
                distribution business to the next level.
              </h3>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Company"
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Job Title"
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="First Name"
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Mobile"
                    className="input-field"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="input-field"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Type of industry"
                  className="input-field w-full"
                />
                <button
                  type="submit"
                  className="w-full cursor-pointer bg-[#1CCAFF] hover:bg-[#10bce5] text-white font-semibold py-2 rounded-md transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
        <section className="bg-[#f5fdf8] py-16 px-4">
          <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-10">
            {/* Text Content */}
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-semibold text-center md:text-left text-[#002f4b]">
                <span className="text-[#28c5df] font-bold">Specialized</span>{" "}
                Tools for Distributors
              </h2>

              <div className="mt-8 space-y-6 text-[#002f4b]">
                <div>
                  <h3 className="font-bold text-lg">Roof Measurements</h3>
                  <p className="text-sm md:text-base">
                    Specialized tools available for precise roof measurements,
                    ideal for lumber yards and similar distributors, ensuring
                    accurate product orders and minimizing waste.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg">
                    Targeted Product Exposure
                  </h3>
                  <p className="text-sm md:text-base">
                    Your products get the spotlight within our network, reaching
                    contractors who are ready to buy, based on real-time project
                    needs and specifications.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start my-10">
                <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] text-white text-xl font-bold w-[217px] h-[44px] flex items-center justify-center rounded-md">
                  Start Now
                </button>
              </div>
            </div>

            {/* Image Content */}
            <div className="flex-1">
              <Image
                src="/tablet.png"
                alt="Tablet showing roof measurement app"
                width={600}
                height={400}
                className="mx-auto"
              />
            </div>
          </div>
        </section>
        <section className="bg-[#f9fdf8] py-20 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="text-cyan-500">Boost </span>{" "}
              <span className="text-slate-900">Your Distribution Growth</span>
            </h2>
            <p className="mt-6 text-slate-800 text-lg leading-relaxed">
              Partnering with us means more than just increased sales — you gain
              access to advanced technology and data-driven insights that
              optimize your operations and strengthen your market presence. Our
              platform empowers distributors to expand their reach, improve
              efficiency, and drive higher profitability.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Distributor;
