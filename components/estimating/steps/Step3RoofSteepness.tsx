"use client";

import { StepProps } from "../types";

export default function Step3RoofSteepness({ data, onInputChange }: StepProps) {
  const options = [
    {
      value: "Flat",
      label: "Flat",
      description: "Very easy to walk on",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="34"
          viewBox="0 0 40 34"
          fill="none"
          className="w-10 h-10"
        >
          <path
            d="M3.25244 25.1586V14.6086L16.559 22.3873V33.0638L3.25244 25.1586Z"
            fill="transparent"
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.98762 14.149C3.15242 14.0544 3.3552 14.0552 3.51923 14.1511L16.8258 21.9298C16.9885 22.0249 17.0885 22.1992 17.0885 22.3877V33.0641C17.0885 33.2548 16.9862 33.4308 16.8205 33.5251C16.6548 33.6194 16.4512 33.6175 16.2873 33.5201L2.98068 25.6149C2.8198 25.5193 2.72119 25.3461 2.72119 25.1589V14.609C2.72119 14.419 2.82282 14.2435 2.98762 14.149ZM3.78194 15.5334V24.8571L16.0278 32.1321V22.692L3.78194 15.5334Z"
            fill="#4B5563"
          ></path>
          <path
            d="M36.7885 21.2807L16.5586 33.0648V22.5651L36.7885 11.0676V21.2807Z"
            fill="transparent"
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M37.0544 10.6096C37.2176 10.7045 37.318 10.8791 37.318 11.068V21.281C37.318 21.4698 37.2177 21.6443 37.0546 21.7393L16.8247 33.5234C16.6606 33.619 16.458 33.6196 16.2934 33.525C16.1288 33.4304 16.0273 33.255 16.0273 33.0651V22.5655C16.0273 22.3747 16.1298 22.1986 16.2957 22.1043L36.5256 10.6069C36.6898 10.5136 36.8912 10.5146 37.0544 10.6096ZM17.0881 22.8741V32.1424L36.2573 20.9762V11.9795L17.0881 22.8741Z"
            fill="#4B5563"
          ></path>
          <path
            d="M16.6869 22.811L1.34424 13.9144L23.285 0.93457L38.6579 9.96152L16.6869 22.811Z"
            fill="#10B981"
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M23.0141 0.478681C23.1801 0.380468 23.3863 0.380132 23.5527 0.477805L38.9255 9.50475C39.0879 9.60008 39.1875 9.77432 39.1874 9.96257C39.1872 10.1508 39.0872 10.3249 38.9247 10.4199L16.9538 23.2694C16.789 23.3657 16.5851 23.3661 16.4199 23.2703L1.07731 14.3738C0.914416 14.2793 0.813815 14.1056 0.812993 13.9173C0.812171 13.729 0.911251 13.5544 1.07332 13.4585L23.0141 0.478681ZM23.2851 1.5508L2.39277 13.9104L16.6849 22.1978L37.608 9.96118L23.2851 1.5508Z"
            fill="#059669"
          ></path>
        </svg>
      ),
    },
    {
      value: "Low",
      label: "Low",
      description: "Easy to walk on",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="34"
          viewBox="0 0 40 34"
          fill="none"
          className="w-10 h-10"
        >
          <path
            d="M2.55469 25.2915V14.8957L4.93814 12.8672L16.2976 24.0238V33.4561L2.55469 25.2915Z"
            fill="transparent"
            stroke="#4B5563"
            strokeWidth="1.09554"
            strokeLinejoin="round"
          ></path>
          <path
            d="M16.3989 33.3041V23.9225L37.2921 15.0986V21.1333L16.3989 33.3041Z"
            fill="transparent"
            stroke="#4B5563"
            strokeWidth="1.09554"
            strokeLinejoin="round"
          ></path>
          <path
            d="M25.8823 0.543945L4.83691 12.8162L18.6305 26.1025L39.2701 13.7796L25.8823 0.543945Z"
            fill="#10B981"
            stroke="#059669"
            strokeWidth="1.09554"
            strokeLinejoin="round"
          ></path>
        </svg>
      ),
    },
    {
      value: "Moderate",
      label: "Moderate",
      description: "Fairly easy to walk on",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="38"
          height="38"
          viewBox="0 0 38 38"
          fill="none"
          className="w-10 h-10"
        >
          <path
            d="M2.11334 29.3199V18.9162L6.21939 12.8206L15.5811 27.3216L15.4235 37.2274L2.11334 29.3199Z"
            fill="transparent"
          ></path>
          <path
            d="M2.11353 18.9161V29.3198L15.4237 37.2273L15.5813 27.3215"
            stroke="#4B5563"
            strokeWidth="1.06105"
            strokeLinejoin="round"
          ></path>
          <path
            d="M35.7564 25.2922L15.521 37.0798V28.206L35.7564 19.4475V25.2922Z"
            fill="transparent"
            stroke="#4B5563"
            strokeWidth="1.06105"
            strokeLinejoin="round"
          ></path>
          <path
            d="M0.812622 20.9606L6.03004 12.7344"
            stroke="#059669"
            strokeWidth="1.06105"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M26.5199 0.772705L6.13708 12.6586L17.1983 31.0259L37.1881 19.091L26.5199 0.772705Z"
            fill="#10B981"
            stroke="#059669"
            strokeWidth="1.06105"
            strokeLinejoin="round"
          ></path>
        </svg>
      ),
    },
    {
      value: "Steep",
      label: "Steep",
      description: "Hard to walk on",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="38"
          height="48"
          viewBox="0 0 38 48"
          fill="none"
          className="w-10 h-12"
        >
          <path
            d="M2.64819 38.7374V28.8058L9.48782 13.3271L15.9326 36.02L15.7772 46.5373L2.64819 38.7374Z"
            fill="transparent"
            stroke="#4B5563"
            strokeWidth="1.04661"
            strokeLinejoin="round"
          ></path>
          <path
            d="M1.18213 32.016L9.48784 13.3271"
            stroke="#059669"
            strokeWidth="1.04661"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M15.8755 46.3919L35.8355 34.7647V28.9995"
            stroke="#4B5563"
            strokeWidth="1.04661"
            strokeLinejoin="round"
          ></path>
          <path
            d="M29.6955 1.46265L9.59009 13.1867L17.1004 40.2906L36.8182 28.5181L29.6955 1.46265Z"
            fill="#10B981"
            stroke="#059669"
            strokeWidth="1.04661"
            strokeLinejoin="round"
          ></path>
        </svg>
      ),
    },
    {
      value: "Very Steep",
      label: "Very Steep",
      description: "Very hard to walk on",
      icon: (
        <svg
          fill="#10B981"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 356.637 356.637"
          className="w-10 h-10"
        >
          <path d="M290.562,103.916c0.162-0.811,0.366-1.609,0.366-2.459V12.298C290.928,5.51,285.422,0,278.63,0h-43.042 c-6.792,0-12.298,5.51-12.298,12.298v21.84l-25.425-26.37c-5.002-4.999-11.715-7.461-18.896-7.064 c-6.566,0.405-12.809,3.245-17.585,8.034l-124.11,125.05c-4.225,4.251-4.201,11.13,0.054,15.348 c3.771,3.744,9.581,4.125,13.793,1.225v193.979c0,6.785,5.51,12.298,12.298,12.298h79.936h67.638h79.936 c6.791,0,12.298-5.513,12.298-12.298V148.337l0.618,0.646c2.138,2.2,4.979,3.32,7.818,3.32c2.715,0,5.429-1.015,7.53-3.044 c4.317-4.161,4.443-11.031,0.288-15.342L290.562,103.916z M247.886,24.596h18.446V71.77l-18.446-18.447V24.596z M155.652,332.041 v-79.936h43.042v79.936H155.652z M278.63,122.979v209.062h-55.34v-92.233c0-6.785-5.507-12.298-12.298-12.298h-67.638 c-6.789,0-12.298,5.513-12.298,12.298v92.233h-55.34V129.127c0-0.997-0.153-1.955-0.375-2.882L176.762,24.056 c0.976-0.979,2.306-1.612,3.54-1.685c1.446-0.111,2.011,0.541,2.077,0.606l96.27,99.866 C278.642,122.885,278.63,122.931,278.63,122.979z" />
          <path d="M135.668,156.797c0,24.583,19.996,44.58,44.579,44.58c24.584,0,44.58-19.996,44.58-44.58s-19.996-44.58-44.58-44.58 C155.664,112.218,135.668,132.214,135.668,156.797z M203.306,156.797c0,12.709-10.347,23.059-23.059,23.059 c-12.715,0-23.058-10.35-23.058-23.059c0-12.709,10.343-23.058,23.058-23.058C192.959,133.739,203.306,144.088,203.306,156.797z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-600">How steep is your roof?</p>
      <div className="grid grid-cols-1 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onInputChange("roofSteepness", option.value)}
            className={`p-4 border-2 rounded-lg transition-all flex items-center gap-4 ${
              data.roofSteepness === option.value
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
              {option.icon}
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">{option.label}</div>
              <div className="text-sm text-gray-600 mt-1">
                {option.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
