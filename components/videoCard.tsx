"use client";

import React, { useState } from "react";

type VideoCardProps = {
  thumbnail: string;
  title: string;
  description: string[];
  videoUrl: string;
};

const VideoCard: React.FC<VideoCardProps> = ({
  thumbnail,
  title,
  description,
  videoUrl,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Card */}
      <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow p-4">
        {/* Video Thumbnail */}
        <div
          className="relative cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <img
            src={thumbnail}
            alt="Tutorial Thumbnail"
            className="rounded-md w-full"
          />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#2bc7e9] p-4 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 24 24"
                stroke="white"
                className="w-8 h-8"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="mt-4">
          <h3 className="text-xl font-bold text-[#05263B] mb-2">{title}</h3>
          {description.map((paragraph, idx) => (
            <p key={idx} className="text-gray-700 mb-2">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-[90%] md:w-[70%] lg:w-[50%]">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-[-20px] right-[-20px] bg-white rounded-full p-1 shadow"
            >
              ❌
            </button>

            {/* Video */}
            <div className="aspect-w-32 aspect-h-18 w-full">
              <iframe
                src={videoUrl}
                title={title}
                allowFullScreen
                className="w-full h-full rounded-md"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoCard;
