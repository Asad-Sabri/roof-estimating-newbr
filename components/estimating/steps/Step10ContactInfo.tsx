"use client";

import { useState } from "react";
import { StepProps } from "../types";

export default function Step10ContactInfo({ data, onInputChange }: StepProps) {
  const [emailError, setEmailError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600">Where should we send your estimate?</p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={data.firstName || ""}
              onChange={(e) => {
                onInputChange("firstName", e.target.value);
              }}
              placeholder="John"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-black"
              onFocus={(e) => e.currentTarget.style.boxShadow = "0 0 0 2px #8b0e0f"}
              onBlur={(e) => e.currentTarget.style.boxShadow = ""}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={data.lastName || ""}
              onChange={(e) => {
                onInputChange("lastName", e.target.value);
              }}
              placeholder="Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-black"
              onFocus={(e) => e.currentTarget.style.boxShadow = "0 0 0 2px #8b0e0f"}
              onBlur={(e) => e.currentTarget.style.boxShadow = ""}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={data.email || ""}
            onChange={(e) => {
              const email = e.target.value;
              onInputChange("email", email);
              if (email && !validateEmail(email)) {
                setEmailError("Please enter a valid email address");
              } else {
                setEmailError("");
              }
            }}
            onBlur={(e) => {
              if (e.target.value && !validateEmail(e.target.value)) {
                setEmailError("Please enter a valid email address");
              } else {
                setEmailError("");
              }
            }}
            placeholder="john@example.com"
            className={`w-full px-4 py-3 border rounded-lg text-black focus:outline-none ${
              emailError ? "border-red-300" : "border-gray-300"
            }`}
            onFocus={(e) => e.currentTarget.style.boxShadow = "0 0 0 2px #8b0e0f"}
            onBlur={(e) => e.currentTarget.style.boxShadow = ""}
            required
          />
          {emailError && (
            <p className="text-xs text-red-600 mt-1">{emailError}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone *
          </label>
          <input
            type="tel"
            value={data.phone || ""}
            onChange={(e) => {
              const phone = e.target.value;
              onInputChange("phone", phone);
              if (phone && !validatePhone(phone)) {
                setPhoneError("Please enter a valid phone number");
              } else {
                setPhoneError("");
              }
            }}
            onBlur={(e) => {
              if (e.target.value && !validatePhone(e.target.value)) {
                setPhoneError("Please enter a valid phone number");
              } else {
                setPhoneError("");
              }
            }}
            placeholder="+1 (555) 123-4567"
            className={`w-full px-4 py-3 border rounded-lg text-black focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              phoneError ? "border-red-300" : "border-gray-300"
            }`}
            required
          />
          {phoneError && (
            <p className="text-xs text-red-600 mt-1">{phoneError}</p>
          )}
        </div>
        <div className="flex items-start">
          <input
            type="checkbox"
            id="textMessageOptIn"
            checked={data.textMessageOptIn || false}
            onChange={(e) => {
              onInputChange("textMessageOptIn", e.target.checked);
            }}
            className="mt-1 h-4 w-4 border-gray-300 rounded"
            style={{ accentColor: "#8b0e0f" }}
          />
          <label
            htmlFor="textMessageOptIn"
            className="ml-3 text-sm text-gray-700"
          >
            I agree to receive text messages
          </label>
        </div>
      </div>
    </div>
  );
}
