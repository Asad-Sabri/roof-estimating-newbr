import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import React from "react";
import {
  FaTools,
  FaChartLine,
  FaUserFriends,
  FaSyncAlt,
  FaForward,
} from "react-icons/fa";

const About = () => {
  interface Principle {
    icon: React.ReactNode;
    title: string;
    description: string;
  }

  const principles: Principle[] = [
    {
      icon: <FaTools className="text-cyan-500 text-2xl" />,
      title: "Smart Tools for Smart Roofers",
      description:
        "Our proprietary iRoof technology puts powerful, intuitive tools right into the hands of those who do the work, transforming everyday roofing tasks into models of efficiency and precision.",
    },
    {
      icon: <FaChartLine className="text-cyan-500 text-2xl" />,
      title: "Strategic Growth",
      description:
        "Our 2021 partnership with a major property tech firm has supercharged our capabilities, allowing us to enhance the power and reach of our solutions, ensuring every project is smoother and smarter.",
    },
    {
      icon: <FaUserFriends className="text-cyan-500 text-2xl" />,
      title: "Empowering the Workforce",
      description:
        "We educate and equip traditional roofing contractors with the latest in construction technology, automation, and virtual reality, keeping them ahead in a fast-evolving industry.",
    },
    {
      icon: <FaSyncAlt className="text-cyan-500 text-2xl" />,
      title: "Never-Ending Innovation",
      description:
        "Our in-house developers are relentless in their pursuit of perfection, constantly updating our offerings based on real-world feedback and emerging tech trends. They’re the heart of our innovation.",
    },
    {
      icon: <FaForward className="text-cyan-500 text-2xl" />,
      title: "Forward Momentum",
      description:
        "Innovation never stops at iRoofing. We’re continually developing and deploying new features that set industry standards. Stay tuned to our website and social media for all the latest updates and breakthroughs.",
    },
  ];

  return (
    <>
      <HeaderLayout />
      <div className="bg-[#f8fcf4]">
        <section>
          <div className="relative">
            <img
              src="/about1.png"
              alt=""
              className="bg-[#1e475a] h-[80vh] lg:h-fit"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h1 className="text-[50px] font-bold text-white">About Us</h1>
              <p className=" text-[30px] font-bold text-white lg:w-[30%] mx-auto text-center mt-5 leading-none">
                Technology isn’t just a tool,{" "}
                <span className="text-[#2bc7e9]">it’s our vision .</span>
              </p>
            </div>
          </div>
        </section>
        <section className="flex flex-col items-center justify-center md:w-[80%] text-center mx-auto my-20">
          <h1 className=" text-[35px] font-bold">
            <span className="text-[#2bc7e9]">Who</span> We Are
          </h1>
          <p className="mt-14 text-xl font-semibold text-gray-800">
            In 2012, a visionary architect, a seasoned building materials
            distributor, and a skilled IT expert came together with one goal in
            mind—reshape the construction industry. What began as a bold idea
            soon turned into a mission: to revolutionize roofing through
            innovative technology that simplifies challenges and promotes
            sustainability. From this vision, iRoofing was born, designed to
            redefine how projects are planned, managed, and completed. With
            powerful yet affordable tools, we empower professionals to work
            smarter, faster, and more efficiently—transforming roofing from
            start to finish.
          </p>
          <div className="flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl my-10 md:my-20 w-full md:w-[750px] h-auto md:h-[263px]">
            <div className="flex flex-col items-center justify-center gap-5 text-center p-6 md:px-10">
              <p className="text-base md:text-lg font-semibold text-shadow-gray-800">
                We started iRoofing because we wanted to offer something both
                affordable and user-friendly – something we’d actually use
                ourselves. So, we said goodbye to crazy fees, expensive
                contracts, and all that other nonsense. It’s just better this
                way.
              </p>
              <h1 className="text-lg md:text-xl font-bold">
                Daniel Meridor, CEO & Co Founder
              </h1>
            </div>
            <div className=" w-full">
              <img
                src="/aboutman.jpg"
                alt=""
                className=" w-full md:w-[232px] h-[200px] md:h-[263px] object-cover rounded-b-2xl md:rounded-b-none md:rounded-r-2xl"
              />
            </div>
          </div>
        </section>
        <div className=" relative h-[170vh] xl:h-[130vh] bg-[#05374c]">
          <img src="/grid.png" alt="" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className=" text-[35px] font-bold text-white">
              <span className="text-[#2bc7e9] ">Who</span> We Are
            </h1>
            <img src="/pcimage.png" alt="" />
            <p className=" text-lg text-white text-center md:w-[60%]">
              iRoofing is more than software—it’s a complete digital partner for
              roofing professionals. From precise measurements to polished
              proposals, we help contractors work smarter, close deals faster,
              and cut unnecessary costs. Since 2011, our mission has been to
              give every roofer the tools to impress clients on the first visit
              and win more business with confidence.
            </p>
          </div>
        </div>
        <section className=" my-20">
          <div className="bg-[#072c45] md:w-[90%] mx-auto rounded-lg flex flex-col md:flex-row items-center gap-14 p-10">
            <div className=" text-center">
              <h1 className=" text-white text-[30px] font-bold">
                Smart Strategies
              </h1>
              <p className=" text-white text-lg">
                Leverage high-resolution satellite views for precise takeoffs.
              </p>
            </div>
            <div className=" text-center">
              <h1 className=" text-white text-[30px] font-bold">
                Efficiency in Execution
              </h1>
              <p className=" text-white text-lg">
                Streamline processes, reduce waste, and save time.
              </p>
            </div>
            <div className=" text-center">
              <h1 className=" text-white text-[30px] font-bold">
                Customer-Centric Solutions
              </h1>
              <p className=" text-white text-lg">
                Enhance customer satisfaction with quicker, more reliable
                service.
              </p>
            </div>
          </div>
        </section>
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              Our Core <span className="text-cyan-500">Principles</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {principles.map((principle, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-cyan-100 p-4 rounded-full">
                    {principle.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {principle.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {principle.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-5 lg:flex-row items-center bg-[#03394d] p-5 md:p-20">
          <div className="md:w-[60%]">
            <h1 className=" text-[30px] font-bold text-white">
              {" "}
              Why <span className="text-[#2bc7e9]">Roof Estimates?</span>{" "}
            </h1>
            <p className=" text-lg text-white font-semibold mt-3">
              Because every great roofing project starts with clarity. A roof
              estimate isn’t just about numbers — it’s about trust,
              transparency, and preparation. Accurate estimates help homeowners
              and contractors align on expectations, budget wisely, and avoid
              costly surprises. It’s the first step toward a smooth,
              professional roofing experience.
            </p>
          </div>
          <div>
            <img src="/laptopimg.png" alt="" />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default About;
