"use client";
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex px-10 py-2 rounded-xl items-center text-[20px] gap-2 cursor-pointer transition-colors 
                  bg-red-700 hover:bg-green-700 hover:text-white ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
