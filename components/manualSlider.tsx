"use client";

import React, { useEffect, useRef, useState } from "react";

interface SliderItem {
  id: number;
  content: React.ReactNode;
  author: React.ReactNode;
  authorName: React.ReactNode;
}

interface ManualSliderProps {
  items: SliderItem[];
  containerClass?: string;
  itemClass?: string;
}

const ManualSlider: React.FC<ManualSliderProps> = ({
  items,
  containerClass = "",
  itemClass = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !cardRefs.current[currentIndex]) return;

    const randomDelay = Math.floor(Math.random() * 3000) + 2000;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % items.length;
      setCurrentIndex(nextIndex);

      const container = containerRef.current;
      const card = cardRefs.current[nextIndex];

      if (card && container) {
        const containerWidth = container.offsetWidth;
        const cardWidth = card.offsetWidth;
        const cardOffsetLeft = card.offsetLeft;

        const scrollPosition =
          cardOffsetLeft - (containerWidth - cardWidth) / 2;

        container.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });
      }
    }, randomDelay);

    return () => clearInterval(interval);
  }, [currentIndex, items.length]);

  return (
    <div
      ref={containerRef}
      className={`flex items-start justify-start gap-6 overflow-x-auto scroll-smooth no-scrollbar px-4 ${containerClass}`}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={(el) => {
            cardRefs.current[index] = el;
          }}
          className={`flex-shrink-0 w-[90%] sm:w-[300px] px-5 py-8 text-white bg-[#072b45] rounded-xl shadow-md ${itemClass}`}
        >
          <h1 className=" md:text-lg font-medium">{item.content}</h1>
          <div className="mt-10">
            <h1 className="text-white text-lg font-bold">{item.author}</h1>
            <p className="text-white">{item.authorName}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ManualSlider;
