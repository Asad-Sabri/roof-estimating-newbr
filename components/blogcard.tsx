"use client";

import Image from "next/image";
import React from "react";

interface BlogCardProps {
  image: string;
  title: string;
  description: string;
  link: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ image, title, description, link }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-40 w-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 flex flex-col justify-between h-[180px]">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{description}</p>
        <a
          href={link}
          className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          Read More »
        </a>
      </div>
    </div>
  );
};

export default BlogCard;
