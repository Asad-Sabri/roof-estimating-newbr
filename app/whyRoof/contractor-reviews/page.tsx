import Footer from "@/components/Footer";
import HeaderLayout from "@/components/HeadersLayout";
import ManualSlider from "@/components/manualSlider";
import Image from "next/image";
import React from "react";

const ContractorReview = () => {
  const testimonials = [
    {
      id: 1,
      content: (
        <>
          Before iRoofing, I had to send clients to different houses just to see
          shingle colors. Now I can instantly display color options on their own
          home, saving both me and my customers a lot of time.
        </>
      ),
      author: <>Justin Shelton</>,
      authorName: <>Noland’s Roofing</>,
    },
    {
      id: 2,
      content: (
        <>
          Choosing iRoofing was an easy decision. It helps us cut down wasted
          hours, boost sales, and improve profits. Our sales team feels
          empowered and is closing more deals than ever.
        </>
      ),
      author: <>Steve Little</>,
      authorName: <>KPOST ROOFING & WATERPROOFING</>,
    },
    {
      id: 3,
      content: (
        <>
          We encourage our clients to adopt iRoofing because it saves time,
          improves efficiency, and supports growth. Especially with social
          distancing, this tool solves multiple challenges in one simple
          platform.
        </>
      ),
      author: <>Jim Johnson</>,
      authorName: <>CONTRACTOR COACH PRO</>,
    },
    {
      id: 4,
      content: (
        <>
          After getting hurt, I couldn’t climb roofs as before. With iRoofing I
          can still measure and manage jobs right from the app. It kept my crew
          moving forward when I couldn’t be on site myself.
        </>
      ),
      author: <>Jon Nelson ALL</>,
      authorName: <>TERRAIN ROOFING</>,
    },
  ];

  const moreTestimonials = [
    {
      id: 5,
      content: (
        <>
          With iRoofing, my team can give homeowners instant visuals. Instead of
          carrying around heavy catalogs, we just pull up the app and show them
          exactly how their roof will look.
        </>
      ),
      author: <>Mark Davis</>,
      authorName: <>Davis Roofing Solutions</>,
    },
    {
      id: 6,
      content: (
        <>
          Scheduling estimates used to take forever. Now, I can measure roofs
          remotely and send accurate quotes faster than my competitors. That
          speed gives us a real edge.
        </>
      ),
      author: <>Rachel Lee</>,
      authorName: <>Skyline Roofing</>,
    },
    {
      id: 7,
      content: (
        <>
          iRoofing has cut down our measuring mistakes by a huge margin. The app
          is precise and reliable, which makes our jobs smoother and our clients
          happier.
        </>
      ),
      author: <>Carlos Ramirez</>,
      authorName: <>Ramirez & Sons Roofing</>,
    },
    {
      id: 8,
      content: (
        <>
          I love how professional we look when presenting bids now. Clients are
          impressed with the digital mockups and it helps build trust right
          away.
        </>
      ),
      author: <>Sarah Thompson</>,
      authorName: <>Thompson Roofing Co.</>,
    },
    {
      id: 9,
      content: (
        <>
          Before, I needed extra staff just for measurements. With iRoofing, I
          save on labor costs while still getting the same — if not better —
          results.
        </>
      ),
      author: <>David Miller</>,
      authorName: <>Miller Contracting</>,
    },
    {
      id: 10,
      content: (
        <>
          I’ve used other tools, but nothing comes close to the simplicity and
          accuracy of iRoofing. It’s become a standard part of how we do
          business every single day.
        </>
      ),
      author: <>Emily Parker</>,
      authorName: <>Parker Roofing Systems</>,
    },
    {
      id: 11,
      content: (
        <>
          Training my sales team used to be a challenge. With iRoofing, they
          quickly picked it up and started closing more deals. It really boosted
          their confidence.
        </>
      ),
      author: <>Michael Chen</>,
      authorName: <>NextGen Roofing</>,
    },
    {
      id: 12,
      content: (
        <>
          Homeowners often change their minds about colors. The app makes it
          easy to show different options instantly, which helps us lock in
          decisions faster.
        </>
      ),
      author: <>Laura Bennett</>,
      authorName: <>Bennett Roof & Exterior</>,
    },
    {
      id: 13,
      content: (
        <>
          Even on rainy days when we can’t be on-site, iRoofing lets us keep the
          workflow moving. It keeps my crew productive no matter the conditions.
        </>
      ),
      author: <>Anthony Wright</>,
      authorName: <>Wright Roofing Group</>,
    },
    {
      id: 14,
      content: (
        <>
          The investment paid for itself in just a couple of projects. Between
          faster bids and higher close rates, iRoofing is a must-have in our
          toolkit.
        </>
      ),
      author: <>Olivia Martinez</>,
      authorName: <>Martinez Roofing Experts</>,
    },
  ];

  const extraTestimonials = [
    {
      id: 15,
      content: (
        <>
          With iRoofing, we reduced back-and-forth visits to the customer’s
          house. Everything can be shown in one meeting, saving us days in the
          sales cycle.
        </>
      ),
      author: <>Chris Walker</>,
      authorName: <>Walker Roofing Pros</>,
    },
    {
      id: 16,
      content: (
        <>
          Our presentations look modern and polished now. The app really
          elevates the way clients perceive our business compared to
          competitors.
        </>
      ),
      author: <>Jessica Moore</>,
      authorName: <>Moore Roofing & Construction</>,
    },
    {
      id: 17,
      content: (
        <>
          I was skeptical at first, but the accuracy of the measurements blew me
          away. It has improved our quoting process and reduced costly mistakes.
        </>
      ),
      author: <>Tom Harris</>,
      authorName: <>Harris Roofing Solutions</>,
    },
    {
      id: 18,
      content: (
        <>
          My crew uses iRoofing daily to prep jobs and communicate with clients.
          It’s now a core part of our workflow from start to finish.
        </>
      ),
      author: <>Amanda Green</>,
      authorName: <>Greenline Exteriors</>,
    },
    {
      id: 19,
      content: (
        <>
          The satellite measurements are a lifesaver. Even before stepping foot
          on site, I can have a solid plan and materials list ready.
        </>
      ),
      author: <>Brian Carter</>,
      authorName: <>Carter Roofing LLC</>,
    },
    {
      id: 20,
      content: (
        <>
          I’ve closed deals right on the spot thanks to iRoofing. Homeowners
          love seeing their roof designs instantly—it makes decisions much
          faster.
        </>
      ),
      author: <>Sophia Johnson</>,
      authorName: <>Johnson Roofing Services</>,
    },
    {
      id: 21,
      content: (
        <>
          No more carrying samples everywhere. The app lets us showcase dozens
          of products digitally and gives clients confidence in their choices.
        </>
      ),
      author: <>Daniel Brooks</>,
      authorName: <>Brooks Roofing Experts</>,
    },
    {
      id: 22,
      content: (
        <>
          The return on investment has been incredible. What we used to spend on
          extra site visits, we now save with just a few taps in the app.
        </>
      ),
      author: <>Karen White</>,
      authorName: <>White Roofing & Remodeling</>,
    },
  ];

  const moreExtraTestimonials = [
    {
      id: 23,
      content: (
        <>
          iRoofing has helped us stand out in a crowded market. When clients see
          the digital preview of their new roof, it gives us a huge advantage.
        </>
      ),
      author: <>Ethan Rogers</>,
      authorName: <>Rogers Roofing Co.</>,
    },
    {
      id: 24,
      content: (
        <>
          Instead of long phone calls and confusion, I send customers a clear,
          visual proposal right away. It makes communication simple and
          professional.
        </>
      ),
      author: <>Natalie Cooper</>,
      authorName: <>Cooper Exteriors</>,
    },
    {
      id: 25,
      content: (
        <>
          The learning curve was minimal. My staff adapted quickly, and now it’s
          part of our daily routine—saving time and increasing efficiency.
        </>
      ),
      author: <>Shawn Phillips</>,
      authorName: <>Phillips Roofing</>,
    },
    {
      id: 26,
      content: (
        <>
          iRoofing lets us prepare accurate estimates even before the first site
          visit. That kind of speed makes customers choose us over competitors.
        </>
      ),
      author: <>Olivia Scott</>,
      authorName: <>Scott Roofing Group</>,
    },
    {
      id: 27,
      content: (
        <>
          The ability to show multiple shingle options instantly has improved
          our close rate. Homeowners feel confident because they see the results
          firsthand.
        </>
      ),
      author: <>Benjamin King</>,
      authorName: <>King Roofing Services</>,
    },
    {
      id: 28,
      content: (
        <>
          We used to carry binders full of brochures. Now everything is in one
          app that we can update anytime. Customers love the digital experience.
        </>
      ),
      author: <>Grace Morgan</>,
      authorName: <>Morgan Roofing Experts</>,
    },
    {
      id: 29,
      content: (
        <>
          Even our older crew members found iRoofing easy to use. It’s
          intuitive, fast, and makes our work far more organized.
        </>
      ),
      author: <>Henry Adams</>,
      authorName: <>Adams Roofing & Siding</>,
    },
    {
      id: 30,
      content: (
        <>
          We no longer waste time driving back and forth just to measure roofs.
          iRoofing gives us reliable numbers in minutes, and clients appreciate
          the quick turnaround.
        </>
      ),
      author: <>Sophia Rivera</>,
      authorName: <>Rivera Roofing Solutions</>,
    },
  ];

  interface CardItem {
    id: number;
    image: string;
    title: string;
    subtitle: string;
    description: string;
  }

  const cards: CardItem[] = [
    {
      id: 1,
      image: "/man1.jpg",
      title: "BRAD G.",
      subtitle: "HOMETOWN RESTORATION",
      description:
        "It is extremely easy to use and allows us to quote roofs remotely while I continue to grow my company. This software is without a doubt the most bang for your buck when measuring roofs. It is the perfect balance for what anyone in the roofing industry needs when weighing cost vs user input. I highly recommend!",
    },
    {
      id: 2,
      image: "/man2.jpg",
      title: "BRAD G.",
      subtitle: "HOMETOWN RESTORATION",
      description:
        "It is extremely easy to use and allows us to quote roofs remotely while I continue to grow my company. This software is without a doubt the most bang for your buck when measuring roofs. It is the perfect balance for what anyone in the roofing industry needs when weighing cost vs user input. I highly recommend!",
    },
    {
      id: 3,
      image: "/man3.jpg",
      title: "BRAD G.",
      subtitle: "HOMETOWN RESTORATION",
      description:
        "It is extremely easy to use and allows us to quote roofs remotely while I continue to grow my company. This software is without a doubt the most bang for your buck when measuring roofs. It is the perfect balance for what anyone in the roofing industry needs when weighing cost vs user input. I highly recommend!",
    },
  ];

  return (
    <>
      <HeaderLayout />
      <div className="bg-[#f8fcf4]">
        <div className="bg-[#05374c] md:h-screen">
          <div className=" relative">
            <img src="/grid.png" alt="" />
            <h1 className=" md:text-[30px] lg:text-[50px] font-[800] leading-[59px] text-white absolute top-[10%] md:top-[25%] left-[8%] w-[50%]">
              {" "}
              <span className="text-[#2bc7e9]">Real Reviews</span> from
              Professional Roofers
            </h1>
            <p className=" md:text-[36px] text-white absolute top-[35%] md:top-[59%] left-[8%] w-[40%]">
              We raise the roof with our customer support.
            </p>
          </div>
        </div>
        <section className="bg-[#f8fcf4] md:h-[50vh] flex items-center justify-center">
          <p className="w-[80%] mx-auto text-[21px] font-semibold text-center text-gray-800 leading-[25px]">
            We’re not just about roofing software, we’re about people too. Our
            crew is the cream of the crop in customer care, and it shows. A
            solid 99.9% of our subscribers are giving us a thumbs-up for the
            top-tier support they’ve received. That’s what happens when you mix
            expertise with genuine care!
          </p>
        </section>
        <section className="bg-[#f8fcf4]">
          <div className=" md:px-6 py-10">
            <ManualSlider
              items={testimonials}
              containerClass="pb-4"
              itemClass=" w-[295px] h-[415px]"
            />
          </div>
        </section>
        <section className="bg-[#f8fcf4]">
          <div className=" md:px-6 py-10">
            <ManualSlider
              items={moreTestimonials}
              containerClass="pb-4"
              itemClass=" lg:h-[850px]"
            />
          </div>
        </section>
        <div className="flex items-center justify-center bg-[#f8fcf4]">
          <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] text-white text-xl font-bold w-[217px] h-[44px] flex items-center justify-center rounded-md">
            Start Now
          </button>
        </div>
        <div className="bg-[#f8fcf4]">
          <section className=" bg-gradient-to-r from-[#fff] via-[#e4f7e2] to-[#fff] xl:h-[80vh] p-20 mt-3">
            <div className="flex flex-col lg:flex-row items-center gap-15 h-full">
              <div>
                <h1 className=" text-4xl md:text-[60px] font-bold md:w-[80%] leading-none">
                  Don’t just take our word for it
                </h1>
              </div>
              <div className="border-l-2 border-l-[#2bc7e9] h-full"></div>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <h1 className=" text-[40px] font-bold">2500+</h1>
                  <p className=" text-3xl">
                    positive reviews from roofing professionals worldwide.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <h1 className=" text-[40px] font-bold">1500+</h1>
                  <p className=" text-3xl">
                    5-star reviews on industry-leading platforms.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <h1 className=" text-[40px] font-bold">1000+</h1>
                  <p className=" text-3xl">
                    testimonials praising ease of use and customer support
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
        {/* <section className=" bg-gradient-to-r from-[#fff] via-[#e4f7e2] to-[#fff] py-20 px-20">
          <div className="flex items-center justify-center">
            <img src="/group1.png" alt="" />
          </div>
          <div className="flex items-center justify-center my-10">
            <button className="bg-gradient-to-b from-[#92c86e] to-[#52a577] text-white text-xl font-bold w-[217px] h-[44px] flex items-center justify-center rounded-md">
              Start Now
            </button>
          </div>
        </section> */}
        <section className="bg-[#f4f9f6] py-16 px-4">
          <div className="max-w-7xl mx-auto grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="h-64 w-full relative">
                  <Image
                    src={card.image}
                    alt={card.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-xl"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  {/* Stars */}
                  <div className="text-yellow-400 text-xl mb-3 tracking-wide">
                    {"★★★★★"}
                  </div>

                  {/* Name & Company */}
                  <h3 className="text-sm font-bold text-gray-800 uppercase">
                    {card.title} {card.subtitle && `· ${card.subtitle}`}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-700 text-sm mt-4">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="bg-[#f8fcf4]">
          <div className=" md:px-6 py-10">
            <ManualSlider
              items={extraTestimonials}
              containerClass="pb-4"
              itemClass=" lg:h-[415px]"
            />
          </div>
        </section>
        <section className="bg-[#f8fcf4]">
          <div className=" md:px-6 py-10">
            <ManualSlider
              items={moreExtraTestimonials}
              containerClass="pb-4"
              itemClass=" lg:h-[415px]"
            />
          </div>
        </section>
        <section className="bg-[#f8fcf4]">
          <div className=" md:px-6 py-10">
            <ManualSlider
              items={moreTestimonials}
              containerClass="pb-4"
              itemClass=" lg:h-[850px]"
            />
          </div>
        </section>
        <section className="bg-[#f8fcf4]">
          <div className=" md:px-6 py-10">
            <ManualSlider
              items={testimonials}
              containerClass="pb-4"
              itemClass=" w-[295px] h-[415px]"
            />
          </div>
        </section>
        <section className="bg-[#f8fcf4]">
          <div className=" md:px-6 py-10">
            <ManualSlider
              items={extraTestimonials}
              containerClass="pb-4"
              itemClass=" lg:h-[415px]"
            />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default ContractorReview;
