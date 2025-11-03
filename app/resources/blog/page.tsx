"use client"

import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import React from "react";
import { FaSearch } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import BlogCard from "@/components/blogcard";

const Blog = () => {


  const blogs = [
  {
    image: "/cover1.png",
    title: `"Do's" and "Don'ts" When Meeting With a Roof Adjuster – Real Insight for Roofers`,
    description: "Tips every roofer should know before meeting with a roof adjuster.",
    link: "#",
  },
  {
    image: "/cover2.jpg",
    title: "Door to Door Roofing Sales: 6 Pro Tips You Need to Know!",
    description: "Boost your sales game with these proven roofing tips.",
    link: "#",
  },
  {
    image: "/cover3.png",
    title: "The 10 Best Roof Ladders in 2025! Are You Using the Right One?",
    description: "A guide to choosing safe and reliable roof ladders.",
    link: "#",
  },
  {
    image: "/cover4.png",
    title: "The Best Roofing Shoes (Blog + Video)",
    description: "Updated list of best roofing shoes for 2025.",
    link: "#",
  },
  {
    image: "/cover5.png",
    title: "Day 2 at the International Roofing Expo",
    description: "Highlights and insights from Day 2 of the expo.",
    link: "#",
  },
  {
    image: "/cover1.png",
    title: "The Scoop of Day 1 at the International Roofing Expo",
    description: "Top takeaways from Day 1 of the roofing expo.",
    link: "#",
  },
  {
    image: "/cover3.png",
    title: "Join iRoofing at IRE 2025 in San Antonio: Booth #25097",
    description: "Come visit us at the expo in San Antonio this year.",
    link: "#",
  },
  {
    image: "/cover5.png",
    title: "How to Measure Your Roof With Your iPhone: A Quick & Easy Guide",
    description: "Step-by-step guide to measuring your roof using your phone.",
    link: "#",
  },
  {
    image: "/cover4.png",
    title: "Harnessing the Power of Roofing AI: iRoofing’s Advanced Roof Visualizer",
    description: "Explore how AI is transforming roof visualizations.",
    link: "#",
  },
];

const categories = [
  "Equipment, Hardware & Apparel",
  "iRoofing News",
  "Just for Fun",
  "Materials",
  "Roof Bytes",
  "Safety",
  "Sales Tips",
  "Tech Talk",
];
  return (
    <>
      <HeaderLayout />
      <div>
        <div className="bg-[#05374c] md:h-[50vh]">
          <div className=" relative">
            <img src="/grid.png" alt="" />
            <h1 className=" md:text-[30px] lg:text-[50px] font-[800] leading-[59px] text-white absolute top-[10%] md:top-[25%] left-[8%] w-[50%]">
              Roofing insights:
            </h1>
            <p className=" md:text-[36px] text-white absolute top-[35%] md:top-[35%] left-[8%] w-[40%]">
              Tips, Techniques & Videos
            </p>
          </div>
        </div>
      </div>
      <div>
        <div className="w-[80%] mx-auto px-4 py-4 bg-[#f9fdf7] flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          {/* Search bar */}
          <div className="w-full sm:w-auto relative">
            <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Language buttons */}
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full bg-[#003B4A] text-white font-semibold hover:bg-[#005061] transition">
              ES
            </button>
            <button className="w-10 h-10 rounded-full bg-[#003B4A] text-white font-semibold hover:bg-[#005061] transition">
              FR
            </button>
          </div>
        </div>
      </div>
      <section className="bg-[#f9fdf7] px-4 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Newest Article */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Newest Article</h2>
              <a href="#" className="text-sm text-blue-800 hover:underline">
                More Blogs
              </a>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Facts About The Best Roofing Nailers
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Looking for the Top Roofing Nail Guns in 2025? Here is the full
              breakdown and insights provided by roofing pros like yourself.
            </p>
            <a
              href="#"
              className="text-sm font-bold text-blue-700 hover:underline"
            >
              Read More »
            </a>
          </div>

          {/* Newest Videos */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Newest Videos</h2>
              <a href="#" className="text-sm text-blue-800 hover:underline">
                More Videos
              </a>
            </div>

            {/* Replace with real carousel/slider component */}
            <div className="bg-[#edfbe6] p-2 rounded-md">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={16}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                  640: { slidesPerView: 1.2 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 2.2 },
                }}
              >
                <SwiperSlide>
                  <img
                    src="/girl.png"
                    alt="Video 1"
                    className="w-full h-auto rounded-md"
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <img
                    src="/girl2.jpg"
                    alt="Video 2"
                    className="w-full h-auto rounded-md"
                  />
                </SwiperSlide>
                <SwiperSlide>
                  <img
                     src="/girl.png"
                    alt="Video 3"
                    className="w-full h-auto rounded-md"
                  />
                </SwiperSlide>
                {/* Add more <SwiperSlide> as needed */}
              </Swiper>
            </div>
          </div>

          {/* Recent Blogs */}
          <div>
            <h2 className="text-xl font-bold mb-3">Recent Blogs</h2>
            <ul className="space-y-2 text-sm text-blue-900">
              <li>
                <a href="#" className="hover:underline">
                  “Do’s” and “Don’ts” When Meeting With a Roof Adjuster – Real
                  Insight for Roofers
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Door to Door Roofing Sales: 6 Pro Tips You Need to Know!
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  The 10 Best Roof Ladders in 2025! Are You Using the Right One?
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  The Best Roofing Shoes (Blog + Video)
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Day 2 at the International Roofing Expo
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  The Scoop of Day 1 at the International Roofing Expo
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Join iRoofing at IRE 2025 in San Antonio: Booth #25097
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  How to Measure Your Roof with Your Phone: A Quick & Easy Guide
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section className="bg-[#f9fdf7] py-12">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#071F40] mb-6">
          Popular Articles
        </h2>
        <div className="flex flex-wrap justify-center gap-4 text-[#071F40] font-semibold">
          {categories.map((category, index) => (
            <span
              key={index}
              className="cursor-pointer hover:text-blue-600 transition"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </section>
      <section className="py-10 px-4 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl text-center my-10 font-bold text-gray-800 mb-6">
          Latest Roofing Insights
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog, index) => (
            <BlogCard key={index} {...blog} />
          ))}
        </div>
      </div>
    </section>
      <Footer />
    </>
  );
};

export default Blog;
