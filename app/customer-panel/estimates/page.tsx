"use client";

import RoofEstimator from "@/app/roof-map/page";
import { useState } from "react";
import { FaHome, FaBuilding, FaCity, FaCheckCircle } from "react-icons/fa";

const RoofReportForm = () => {
  const [propertyType, setPropertyType] = useState<
    "single" | "multi" | "commercial" | ""
  >("");
  const [isGafTakeoff, setIsGafTakeoff] = useState(false);
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [reportEmails, setReportEmails] = useState("");
  const [mainEmail, setMainEmail] = useState("");
  const [receiverEmails, setReceiverEmails] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [fileName, setFileName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name); // sirf pehle file ka naam dikhayega
    }
  };

  const copyEmailToReceivers = () => {
    setReceiverEmails(mainEmail); // hamesha latest value copy karega
  };
  // Jab niche wala field click ho
  const handleReportEmailClick = () => {
    setReportEmails(primaryEmail); // hamesha latest value set karega
  };

  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const [structureOption, setStructureOption] = useState<
    "primary" | "all" | "exclude-primary"
  >("primary");
  const [additionalInfo, setAdditionalInfo] = useState(
    "Please include only the primary structure in my report."
  );

  // Messages per option
  const structureMessages: Record<typeof structureOption, string> = {
    primary: "Please include only the primary structure in my report.",
    all: "Please include all structures on the parcel in my report.",
    "exclude-primary":
      "Please include all structures except the primary one in my report.",
  };

  // Handle selection and update textarea accordingly
  const handleStructureSelect = (option: typeof structureOption) => {
    setStructureOption(option);
    setAdditionalInfo(structureMessages[option]);
  };

  return (
    <>
      <div className=" w-6xl mx-auto my-10">
        <div className="">
          <h1 className="text-2xl md:text-4xl font-bold text-center mb-8">
            Order a roof report
          </h1>

          {/* Property Type Selection */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">
              Select property type
            </label>
            <div className="flex flex-wrap gap-4">
              {/* Single Family */}
              <div className="relative">
                <button
                  onClick={() => setPropertyType("single")}
                  className={`flex items-center cursor-pointer gap-2 px-6 py-4 border-2 rounded-md w-50 justify-center relative
                ${
                  propertyType === "single"
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-gray-300 bg-white"
                }
                hover:border-red-400 transition`}
                >
                  <FaHome size={20} />
                  <span>Single family</span>
                </button>
                {propertyType === "single" && (
                  <FaCheckCircle
                    className="absolute cursor-pointer top-1 right-1 text-red-600"
                    size={18}
                  />
                )}
              </div>

              {/* Multi Family */}
              <div className="relative">
                <button
                  onClick={() => setPropertyType("multi")}
                  className={`flex items-center cursor-pointer gap-2 px-6 py-4 border-2 rounded-md w-50 justify-center relative
                ${
                  propertyType === "multi"
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-gray-300 bg-white"
                }
                hover:border-red-400 transition`}
                >
                  <FaBuilding size={20} />
                  <span>Multi-family</span>
                </button>
                {propertyType === "multi" && (
                  <FaCheckCircle
                    className="absolute cursor-pointer top-1 right-1 text-red-600"
                    size={18}
                  />
                )}
              </div>

              {/* Commercial */}
              <div className="relative">
                <button
                  onClick={() => setPropertyType("commercial")}
                  className={`flex items-center cursor-pointer gap-2 px-6 py-4 border-2 rounded-md w-50 justify-center relative
                ${
                  propertyType === "commercial"
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-gray-300 bg-white"
                }
                hover:border-red-400 transition`}
                >
                  <FaCity size={20} />
                  <span>Commercial</span>
                </button>
                {propertyType === "commercial" && (
                  <FaCheckCircle
                    className="absolute top-1 right-1 text-red-600"
                    size={18}
                  />
                )}
              </div>
            </div>
          </div>

          {/* GAF Takeoff */}
          <div>
            <label className="block text-md font-medium mb-2">
              Is this a Roof Estimate Takeoff request?{" "}
              <span className="text-sm text-gray-500">(Blueprint upload)</span>
            </label>
            <div className="flex items-center gap-6">
              {/* No */}
              <button
                onClick={() => setIsGafTakeoff(false)}
                className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border
              ${
                !isGafTakeoff ? "border-red-600" : "border-gray-300"
              } transition`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-2 
                ${
                  !isGafTakeoff
                    ? "bg-red-600 border-red-600"
                    : "border-gray-400"
                }`}
                />
                <span>No</span>
              </button>

              {/* Yes */}
              <button
                onClick={() => setIsGafTakeoff(true)}
                className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border
              ${
                isGafTakeoff ? "border-red-600" : "border-gray-300"
              } transition`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-2 
                ${
                  isGafTakeoff ? "bg-red-600 border-red-600" : "border-gray-400"
                }`}
                />
                <span>Yes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Conditional Rendering */}
        {/* {!isGafTakeoff && (
          <div className="my-10">
            <RoofEstimator />
          </div>
        )} */}
        {(propertyType === "single" ||
          propertyType === "multi" ||
          propertyType === "commercial") && (
          <>
            {!isGafTakeoff && (
              <div className="">
                <p className="text-sm text-gray-700 mb-4">
                  <strong>Please Select One or More Services.</strong>{" "}
                  <span className="text-gray-500">
                    | Discounts apply for Multiple Services ordered.
                  </span>
                </p>

                <div className="flex flex-wrap gap-6">
                  {/* Roof Measurement */}
                  <div
                    onClick={() => toggleService("roof")}
                    className={`cursor-pointer border rounded-md p-4 w-full sm:w-80 transition
            ${
              selectedServices.includes("roof")
                ? "border-red-600 bg-red-50"
                : "border-gray-300 hover:border-red-400"
            }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold mr-2 rounded">
                        REs
                      </span>
                      <div className="text-lg font-bold">
                        Roof<span className="font-normal">Estimates</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      Get the classic Roof Measurement Report.
                    </p>
                    <div className="font-semibold text-gray-800">
                      Roof Measurement
                    </div>
                  </div>

                  {/* Insurance Scope of Work */}
                  <div
                    onClick={() => toggleService("insurance")}
                    className={`cursor-pointer border rounded-md p-4 w-full sm:w-80 transition
            ${
              selectedServices.includes("insurance")
                ? "border-red-600 bg-red-50"
                : "border-gray-300 hover:border-red-400"
            }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold mr-2 rounded">
                        REs
                      </span>
                      <div className="text-lg font-bold">
                        Scope<span className="font-normal">Connect</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      Insurance Scope of work for roof replacement fully written
                      and delivered in a PDF and ESX or Symbility file format
                    </p>
                    <div className="font-semibold text-gray-800">
                      Insurance Scope of Work
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isGafTakeoff && (
              <div className="space-y-6">
                {/* Total Cost */}
                <div className=" my-10">
                  <span className="text-2xl font-bold">Total Cost: </span>
                  <span className="text-red-600 text-2xl font-bold">$0.00</span>
                </div>

                {/* Structure Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-800">
                    What structures would you like included in your reports?
                  </label>
                  <div className="flex flex-wrap gap-6">
                    {/* Primary Only */}
                    <button
                      onClick={() => handleStructureSelect("primary")}
                      className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border transition
              border-gray-300 hover:border-red-400"
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 
                ${
                  structureOption === "primary"
                    ? "bg-red-600 border-red-600"
                    : "border-gray-400"
                }`}
                      />
                      <span>Primary Structure Only</span>
                    </button>

                    {/* All Structures */}
                    <button
                      onClick={() => handleStructureSelect("all")}
                      className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border transition
              border-gray-300 hover:border-red-400"
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 
                ${
                  structureOption === "all"
                    ? "bg-red-600 border-red-600"
                    : "border-gray-400"
                }`}
                      />
                      <span>All Structures on Parcel</span>
                    </button>

                    {/* Exclude Primary */}
                    <button
                      onClick={() => handleStructureSelect("exclude-primary")}
                      className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border transition
              border-gray-300 hover:border-red-400"
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 
                ${
                  structureOption === "exclude-primary"
                    ? "bg-red-600 border-red-600"
                    : "border-gray-400"
                }`}
                      />
                      <span>All Structures Except Primary Structure</span>
                    </button>
                  </div>
                </div>

                {/* Textarea */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-800">
                    Provide any additional information
                  </label>
                  <textarea
                    rows={4}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            )}

            {!isGafTakeoff && (
              <div className="">
                {/* Primary Email */}
                <label className="block mb-2 font-medium">
                  Enter your primary email
                </label>
                <input
                  type="email"
                  value={primaryEmail}
                  onChange={(e) => setPrimaryEmail(e.target.value)}
                  placeholder="Enter primary email"
                  className="w-full border border-gray-300 outline-none rounded p-2 mb-6"
                />

                {/* Report Emails */}
                <label className="block mb-2 font-medium">
                  Email(s) to receive this report.
                </label>
                <small className="block mb-1 text-gray-500">
                  Separate email addresses with commas.
                </small>
                <textarea
                  value={reportEmails}
                  onChange={(e) => setReportEmails(e.target.value)}
                  onClick={handleReportEmailClick}
                  placeholder="Enter emails"
                  className="w-full border border-gray-300 outline-none rounded p-2 h-24"
                />
              </div>
            )}

            {isGafTakeoff && (
              <div className=" my-10 max-w-6xl mx-auto">
                {/* Upload Section */}
                <div>
                  <label className="block mb-2 font-medium text-red-600">
                    Upload Blueprint file(s). Please ensure the following is
                    included with your upload: An overhead of the roof diagram
                    with clear lengths and pitches. An elevation diagram
                    including front, left, right and back
                  </label>

                  {/* Upload area */}
                  <div className="border border-gray-300 rounded-lg p-6 mb-6 text-center">
                    {/* Hidden input */}
                    <input
                      type="file"
                      id="fileInput"
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleFileChange}
                    />

                    {/* Styled button */}
                    <label
                      htmlFor="fileInput"
                      className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer inline-block"
                    >
                      UPLOAD FILE
                    </label>

                    <p className="text-gray-500 mt-2">or Drop File</p>

                    {/* Input field showing file name */}
                    <input
                      type="text"
                      value={fileName}
                      readOnly
                      placeholder="No file chosen"
                      className="mt-4 w-1/5  border-none text-center rounded px-3 py-2 text-gray-700"
                    />
                  </div>

                  <p className="text-sm text-gray-500 mb-6">
                    PNG, JPG, PDF Files Only, 1 File Max, 100 MB
                  </p>
                </div>

                {/* Measurement Section */}
                <label className="block mb-2 font-medium">
                  What unit of measurement would you like in the roof report?
                </label>
                <div className="flex gap-4 mb-6">
                  <label>
                    <input type="radio" name="units" className="mr-2" />{" "}
                    Imperial Units (in, ft, yd)
                  </label>
                  <label>
                    <input type="radio" name="units" className="mr-2" /> Metric
                    Units (mm, cm, m)
                  </label>
                </div>

                {/* Order Nickname */}
                <label className="block mb-2 font-medium">
                  Provide an address or nickname for this order
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2 mb-6"
                  placeholder="Enter address or nickname"
                />

                {/* Additional Info */}
                <label className="block mb-2 font-medium">
                  Provide any additional information
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded p-2 mb-6"
                  placeholder="Please include only the primary structure in my report."
                />

                {/* Primary Email */}
                <label className="block mb-2 font-medium">
                  Enter your primary email
                </label>
                <input
                  type="email"
                  value={mainEmail}
                  onChange={(e) => setMainEmail(e.target.value)}
                  placeholder="Enter primary email"
                  className="w-full border border-gray-300 rounded p-2 mb-6"
                />

                {/* Report Emails */}
                <label className="block mb-2 font-medium">
                  Email(s) to receive this report.
                </label>
                <small className="block mb-1 text-gray-500">
                  Separate email addresses with commas.
                </small>
                <textarea
                  value={receiverEmails}
                  onChange={(e) => setReceiverEmails(e.target.value)}
                  onClick={copyEmailToReceivers}
                  placeholder="Enter emails"
                  className="w-full border border-gray-300 rounded p-2 h-24 mb-6"
                />

                {/* Agreement */}
                <div className="mb-6">
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <span className="text-sm">
                      By checking the box below and clicking the CHECKOUT button
                      below:
                      <br />• You accept and hereby electronically sign the{" "}
                      <a href="#" className="text-red-600">
                        GAF Roof Estimates and GAF Business Services Terms of
                        Use
                      </a>
                      .
                      <br />• You consent to the{" "}
                      <a href="#" className="text-red-600">
                        GAF Privacy Policy
                      </a>{" "}
                      and the{" "}
                      <a href="#" className="text-red-600">
                        GAF Energy Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                </div>

                {/* Checkout */}
                <div className="flex justify-between items-center">
                  <p className="font-bold text-lg">
                    Total Cost: <span className="text-red-600">$49.00</span>
                  </p>
                  <button className="bg-red-600 text-white px-6 cursor-pointer py-2 rounded">
                    CHECKOUT
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default RoofReportForm;
