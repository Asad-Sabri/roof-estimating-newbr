"use client";

import React, { useState } from "react";
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
} from "date-fns";
import Image from "next/image";

const timeSlots = ["6:00pm", "7:00pm", "9:00pm"];

const SchedulePicker: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });



  return (
    
    <div className="bg-[#072b45] my-20 py-10 w-full  max-w-5xl mx-auto rounded-2xl shadow-xl">
      <h1 className=" text-center text-white text-4xl font-bold my-10">
        Book Your Spot
      </h1>
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow p-6 space-y-6">
        {/* Title */}
        <h2 className="text-center text-lg font-semibold">
          Select a Date & Time
        </h2>

        {/* Month Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="text-gray-600 hover:text-black"
          >
            &lt;
          </button>
          <span className="font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="text-gray-600 hover:text-black"
          >
            &gt;
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 text-sm gap-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center font-medium text-gray-500">
              {d}
            </div>
          ))}
          {days.map((day) => (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center 
            {isSameDay(day, selectedDate ?? new Date(0)) ? "bg-blue-600 text-white" : ""}
              ${isToday(day) ? "border border-blue-600" : ""}
              ${
                !isSameMonth(day, currentMonth)
                  ? "text-gray-300"
                  : "hover:bg-blue-100"
              }`}
            >
              {format(day, "d")}
            </button>
          ))}
        </div>

        {/* Selected Date + Time Slots */}
        {selectedDate && (
          <div className="space-y-4">
            <p className="font-medium text-center">
              {format(selectedDate, "EEEE, MMMM d")}
            </p>
            <div className="flex flex-col space-y-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`w-full py-2 rounded-md border transition 
                  ${
                    selectedTime === slot
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            <button
              disabled={!selectedTime}
              className={`w-full py-2 cursor-pointer rounded-md font-semibold transition
              ${
                selectedTime
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Timezone */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">Time zone: </span>
          <select className="ml-2 border rounded px-2 py-1">
            <option>Pakistan, Maldives Time (4:45pm)</option>
            <option>GMT</option>
            <option>EST</option>
            <option>PST</option>
          </select>
        </div>
      </div>

    
    </div>
  );
};

export default SchedulePicker;
