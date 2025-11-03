"use client"

import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import VideoCard from "@/components/videoCard";
import React from "react";

const Tutorials = () => {
  const features = [
    { icon: "/setting.png", label: "Toggle Settings", id: "toggle-settings" },
    { icon: "/measure.png", label: "Measurement", id: "measurement" },
    { icon: "/roof.png", label: "Roof Visualizer", id: "roof-visualizer" },
    { icon: "/calculator.png", label: "Estimator Tool", id: "estimator-tool" },
    {
      icon: "/notebook.png",
      label: "Customer DataBase",
      id: "customer-database",
    },
    { icon: "/signature.png", label: "Sign Contracts", id: "sign-contracts" },
    {
      icon: "/openbook.png",
      label: "Digital Catalogs",
      id: "digital-catalogs",
    },
    { icon: "/cart.png", label: "Order Materials", id: "order-materials" },
  ];

  return (
    <>
    <HeaderLayout/>
    <div className="bg-[#f8fcf4]">
      <div className="bg-[#05374c] md:h-[50vh] relative">
        <img src="/grid.png" alt="" className=" h-auto object-cover w-[25%]" />
        <div className=" absolute inset-0 flex items-center justify-center">
          <h1 className=" md:text-[30px] lg:text-[50px] font-[800] text-white">
            <span className="text-[#2bc7e9]">Watch Our </span> Tutorials
          </h1>
        </div>
      </div>

      <div className=" md:h-[50vh] my-20">
        <div className="flex flex-col items-center justify-center">
          <h1 className=" text-[26px]  font-[800] text-center">
            Master Roof Estimating with Our{" "}
            <span className="text-[#2bc7e9]"> Expert Guides</span>
          </h1>
          <p className=" text-xl md:w-[60%] text-center mt-14">
            Step into the world of accurate and efficient roof estimating with
            our easy-to-understand video tutorials. Whether you're just starting
            out or looking to sharpen your estimating skills, our detailed video
            library covers every aspect you need to confidently bid and plan
            your next roofing project.
          </p>
        </div>
      </div>
      <section className="bg-gradient-to-b from-[#031b2e] to-[#024258] text-white py-16 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">
              Why Learn <span className="text-[#2bc7e9]">Through Video</span>?
            </h2>

            <div className="space-y-6 text-base sm:text-lg">
              <div>
                <h3 className="text-[#2bc7e9] font-semibold">
                  Visual Estimating Tools:
                </h3>
                <p>
                  Videos simplify estimating tools by showing how to mark,
                  measure, and label roof sections step by step.
                </p>
              </div>

              <div>
                <h3 className="text-[#2bc7e9] font-semibold">
                  Real-Time Workflow Examples:
                </h3>
                <p>
                  See exactly how pros handle estimates in real jobs—then apply
                  what you’ve seen instantly.
                </p>
              </div>

              <div>
                <h3 className="text-[#2bc7e9] font-semibold">
                  Insights from Roofing Pros:
                </h3>
                <p>
                  Learn directly from experienced estimators and industry
                  leaders to avoid common mistakes and improve accuracy.
                </p>
              </div>

              <div>
                <h3 className="text-[#2bc7e9] font-semibold">
                  Learn at Your Speed:
                </h3>
                <p>
                  Rewatch key steps, pause to practice, or jump ahead—videos let
                  you train how and when it works best for you.
                </p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="flex justify-center lg:justify-end">
            <img
              src="/manwithtab.png" // Replace with actual image path, e.g. /assets/tablet-construction.png
              alt="Worker using tablet"
              className="w-full max-w-md rounded-md shadow-lg object-cover"
            />
          </div>
        </div>
      </section>
      <section className="bg-[#f9fdf8] my-30 px-4 md:px-10 ">
        {/* Heading */}
        <h2 className="text-center text-2xl md:text-3xl font-bold text-[#05263B] mb-10 w-[50%] mx-auto">
          Please Choose the{" "}
          <span className="text-[#2bc7e9]">Feature You'd Like</span> to Learn
          More About
        </h2>

        {/* Feature Icons Grid */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-7 w-full max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center text-center cursor-pointer"
              onClick={() =>
                document
                  .getElementById(feature.id)
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <img
                src={feature.icon}
                alt={feature.label}
                className="w-10 h-10 mb-2"
              />
              <p className="text-sm font-medium text-[#05263B]">
                {feature.label}
              </p>
            </div>
          ))}
        </div>

        <section id="toggle-settings" className=" mt-50">
          <div className="my-5">
            <h1 className=" text-5xl font-bold text-center text-gray-800">
              Setting
            </h1>
          </div>
          <div>
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://youtu.be/xGtEE0qLuXA?si=i0SmxAkMfx9wQN54"
            />
          </div>
        </section>
        <section id="measurement" className=" mt-20">
          <div className="my-5">
            <h1 className=" md:text-5xl font-bold text-center text-gray-800">
              ROOF MEASUREMENTS
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-5">
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://youtu.be/xGtEE0qLuXA?si=i0SmxAkMfx9wQN54"
            />
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://youtu.be/xGtEE0qLuXA?si=i0SmxAkMfx9wQN54"
            />
          </div>
        </section>
        <section id="roof-visualizer" className=" mt-20">
          <div className="my-5">
            <h1 className=" md:text-5xl font-bold text-center text-gray-800">
              ROOF VISUALIZER
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-5">
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://youtu.be/xGtEE0qLuXA?si=i0SmxAkMfx9wQN54"
            />
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://youtu.be/xGtEE0qLuXA?si=i0SmxAkMfx9wQN54"
            />
          </div>
        </section>
        <section id="estimator-tool" className=" mt-20">
          <div className="my-5">
            <h1 className=" md:text-5xl font-bold text-center text-gray-800">
              ESTIMATOR TOOL
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-5">
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://youtu.be/xGtEE0qLuXA?si=i0SmxAkMfx9wQN54"
            />
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://youtu.be/xGtEE0qLuXA?si=i0SmxAkMfx9wQN54"
            />
          </div>
        </section>
        <section id="customer-database" className=" mt-20">
          <div className="my-5">
            <h1 className=" md:text-5xl font-bold text-center text-gray-800">
              CUSTOMER DATABASE
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-5">
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://youtu.be/xGtEE0qLuXA?si=i0SmxAkMfx9wQN54"
            />
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://youtu.be/xGtEE0qLuXA?si=i0SmxAkMfx9wQN54"
            />
          </div>
        </section>
        <section id="sign-contracts" className=" mt-20">
          <div className="my-5">
            <h1 className=" md:text-5xl font-bold text-center text-gray-800">
              SIGN CONTRACTS
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-5">
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://youtu.be/xGtEE0qLuXA?si=i0SmxAkMfx9wQN54"
            />
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://youtu.be/xGtEE0qLuXA?si=i0SmxAkMfx9wQN54"
            />
          </div>
        </section>
        <section id="" className=" mt-20">
          <div className="my-5">
            <h1 className=" md:text-5xl font-bold text-center text-gray-800">
              DIGITAL CATALOGS
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-5">
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://youtu.be/xGtEE0qLuXA?si=i0SmxAkMfx9wQN54"
            />
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://youtu.be/xGtEE0qLuXA?si=i0SmxAkMfx9wQN54"
            />
          </div>
        </section>
        <section className=" mt-20">
          <div className="my-5">
            <h1 className=" md:text-5xl font-bold text-center text-gray-800">
              ORDER ROOFING MATERIALS
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-5">
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://www.youtube.com/embed/xGtEE0qLuXA"
            />
            <VideoCard
              thumbnail="/thumb.jpg"
              title="Settings Configuration"
              description={[
                "In this video, learn how to navigate all the settings in the iRoofing mobile app.",

                "Keep in mind, iRoofing allows you to generate roof reports and detailed estimates in minutes.",

                "You get unlimited access to create as many reports, estimates, and roof simulations as you wish. Never pay for 3rd-party roof reports again. Do it yourself easily, save money, and get your data instantly.",
              ]}
              videoUrl="https://youtu.be/xGtEE0qLuXA?si=i0SmxAkMfx9wQN54"
            />
          </div>
        </section>
      </section>
    </div>
    <Footer/>
    </>
  );
};

export default Tutorials;
