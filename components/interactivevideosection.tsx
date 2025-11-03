'use client';

import React, { useState } from 'react';

type Tool = 'measure' | 'simulator' | 'estimator';

const toolVideos: Record<Tool, string> = {
  measure: 'https://www.youtube.com/embed/VIDEO_ID_1',
  simulator: 'https://www.youtube.com/embed/VIDEO_ID_2',
  estimator: 'https://www.youtube.com/embed/VIDEO_ID_3',
};

const InteractiveToolSection: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (tool: Tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTool(null);
    setIsModalOpen(false);
  };

  return (
    <section className="bg-gradient-to-b from-[#001F3F] to-[#001F3F] py-16 px-4 text-white relative">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="rounded-xl shadow-xl overflow-hidden border-[12px] border-black bg-white p-8 text-center">
          {/* Logo Placeholder */}
          <div className="mb-6 text-left">
            <img src="/yourlogo.png" className=' w-20' alt="" />
          </div>

          {/* Circular Tool Buttons */}
          <div className="flex flex-col md:flex-row justify-center gap-8 mb-10">
            {[
              { label: 'Measure Your Roof', key: 'measure' as Tool },
              { label: 'Roof Simulator', key: 'simulator' as Tool },
              { label: 'Roof Estimator', key: 'estimator' as Tool },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => openModal(item.key)}
                className="w-36 h-36 cursor-pointer rounded-full bg-[#0c002e] flex items-center justify-center text-sm font-semibold hover:bg-[#1d1042] transition text-white"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Bottom Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-[#001f3f] text-xs font-medium">
            {[
              'Your Pitchbook',
              'Show Catalogs',
              'Sign A Contract',
              'Purchase Order',
              'Customer Database',
            ].map((label, idx) => (
              <button
                key={idx}
                className="bg-white border cursor-pointer px-2 py-3 rounded shadow hover:shadow-md"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isModalOpen && selectedTool && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-2xl w-full relative">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute cursor-pointer top-3 right-3 text-gray-600 hover:text-black text-2xl z-10"
            >
              &times;
            </button>

            {/* Embedded Video */}
            <div className="aspect-video w-full">
              <iframe
                src={toolVideos[selectedTool]}
                title="Tool Video"
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default InteractiveToolSection;
