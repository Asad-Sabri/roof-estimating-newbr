"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo-latest.png";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns";

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookDemoModal({ isOpen, onClose }: BookDemoModalProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    howDidYouHear: "",
  });

  // Generate time slots (example - can be customized)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setFormData({ ...formData, email });
      setStep(2);
    }
  };

  const handleDateTimeSubmit = () => {
    if (selectedDate && selectedTime) {
      setStep(3);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Booking data:", { ...formData, selectedDate, selectedTime });
    // Close modal or show success message
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl mx-4 max-h-[95vh] overflow-hidden flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Step 1: Email Entry */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center p-8 md:p-16 min-h-[600px] bg-white">
            {/* Logo */}
            <div className="mb-10">
              <Image
                src={logo}
                alt="Superior Pro Roofing Logo"
                width={200}
                height={60}
                className="object-contain"
              />
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
              Let&apos;s meet
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-center mb-8 max-w-md">
              Enter your email address and we&apos;ll connect you with the right person.
            </p>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="w-full max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Enter email address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                required
              />
              <button
                type="submit"
                disabled={!email || !email.includes("@")}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  email && email.includes("@")
                    ? "bg-gray-800 text-white hover:bg-gray-900"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Start booking
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Date and Time Selection */}
        {step === 2 && (
          <div className="flex flex-col md:flex-row h-[700px] bg-white">
            {/* Left Panel - Calendar (White Background) */}
            <div className="bg-white text-gray-900 flex flex-col p-6 md:w-1/2 border-r border-gray-200">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <Image
                  src={logo}
                  alt="Superior Pro Roofing Logo"
                  width={180}
                  height={50}
                  className="object-contain"
                />
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
                Find a time to meet with Superior Pro Roofing
              </h2>

              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-6 mt-6">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="text-gray-700 hover:text-gray-900 text-2xl"
                >
                  &lt;
                </button>
                <span className="text-2xl font-bold text-gray-900">
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="text-gray-700 hover:text-gray-900 text-2xl"
                >
                  &gt;
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="flex-1">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                    <div key={day} className="text-center font-bold text-sm py-2 text-gray-700">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day) => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isTodayDate = isToday(day);
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : isTodayDate
                            ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                            : isCurrentMonth
                            ? "text-gray-900 hover:bg-gray-100"
                            : "text-gray-400"
                        }`}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Panel - Time Slots (White Background) */}
            <div className="bg-white flex flex-col p-6 md:w-1/2 overflow-y-auto">
              {/* Meeting Duration */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Meeting duration</h3>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg inline-block font-medium">
                  15 mins
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">What time works best?</h3>
                {selectedDate ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Showing times for {format(selectedDate, "d MMMM yyyy")}
                    </p>
                    <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`w-full py-3 px-4 rounded-lg border text-center transition-all ${
                            selectedTime === slot
                              ? "border-blue-600 bg-blue-50 text-blue-600 font-semibold"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleDateTimeSubmit}
                      disabled={!selectedTime}
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        selectedTime
                          ? "bg-black text-white hover:bg-gray-800"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Next
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Please select a date to view available times</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Personal Details Form */}
        {step === 3 && (
          <div className="flex flex-col p-8 md:p-12 max-h-[700px] overflow-y-auto bg-white">
            <div className="w-full max-w-2xl mx-auto">
              {/* Heading */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Your information
              </h2>

              {/* Appointment Details */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-900 font-medium">
                    {selectedDate && selectedTime && (
                      <span>{format(selectedDate, "EEEE, d MMMM yyyy")} {selectedTime}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>We will give you a call on the number you provided</span>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="w-full">
                <div className="space-y-5">
                  {/* First Name and Surname Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Surname */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Surname *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your email address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* How did you hear about us */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How did you hear about us ?
                    </label>
                    <textarea
                      value={formData.howDidYouHear}
                      onChange={(e) => handleInputChange("howDidYouHear", e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                      required
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-all"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
