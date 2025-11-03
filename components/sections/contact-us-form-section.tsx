"use client";

import { useFormik } from "formik";
import Link from "next/link";
import * as Yup from "yup";

const ContactUsFormSection = () => {
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      mobile: "",
      email: "",
      company: "",
      agree: false,
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      mobile: Yup.string()
        .matches(/^[0-9]+$/, "Must be only digits")
        .min(10, "Must be at least 10 digits")
        .required("Mobile number is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      company: Yup.string().required("Company is required"),
      agree: Yup.boolean().oneOf([true], "You must agree before submitting"),
    }),
    onSubmit: (values) => {
      console.log("Form Data:", values);
      alert("Form submitted!");
    },
  });

  return (
    <div
      style={{
        backgroundImage: 'url("/dragon-img.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="min-h-screen flex items-center justify-end bg-[#09213E] text-white px-6"
    >
      <div className="max-w-[550px] bg-transparent text-white p-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">
          Let’s get to work!
        </h2>
        <p className="mb-6 text-sm text-white">
          Contact our team today to learn how we can help you close more sales.
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <input
                type="text"
                placeholder="First Name"
                {...formik.getFieldProps("firstName")}
                className="w-full px-4 py-2 border-[1px] border-white rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <input
                type="text"
                placeholder="Last Name"
                {...formik.getFieldProps("lastName")}
                className="w-full px-4 py-2 border-[1px] border-white rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Mobile & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Mobile"
                {...formik.getFieldProps("mobile")}
                className="w-full px-4 py-2 border-[1px] border-white rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {formik.touched.mobile && formik.errors.mobile && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.mobile}
                </p>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                {...formik.getFieldProps("email")}
                className="w-full px-4 py-2 border-[1px] border-white rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Company */}
          <div>
            <input
              type="text"
              placeholder="Company"
              {...formik.getFieldProps("company")}
              className="w-full px-4 py-2 border-[1px] border-white rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {formik.touched.company && formik.errors.company && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.company}
              </p>
            )}
          </div>

          {/* Checkbox */}
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="agree"
              {...formik.getFieldProps("agree")}
              checked={formik.values.agree}
            />
            <label htmlFor="agree" className="text-xs text-white">
              By checking this box, I consent to receive SMS updates and
              notifications about roofing services from iRoofing at the phone
              number I have provided. Message frequency may vary, and standard
              message & data rates may apply. For help, text HELP to (561)
              337-1005. To stop receiving messages, reply STOP. Please review
              our{" "}
              <Link href="/privacy-policy" className="text-blue-300">
                Privacy Policy
              </Link>
              .
            </label>
          </div>
          {formik.touched.agree && formik.errors.agree && (
            <p className="text-red-500 text-sm">{formik.errors.agree}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full max-w-[180px] mt-2 bg-green-500 cursor-pointer text-white py-2 rounded-md hover:bg-green-600 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUsFormSection;
