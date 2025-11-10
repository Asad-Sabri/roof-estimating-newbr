"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signupAPI } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import Cookies from "js-cookie";

export default function SignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Validation Schema Updated
  const validationSchema = Yup.object({
    first_name: Yup.string().required("First name is required"),
    middle_name: Yup.string(),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    mobile_number: Yup.string()
      .matches(/^\+?\d{10,15}$/, "Enter valid mobile number")
      .required("Mobile number is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    company: Yup.string().required("Company is required"),
    postal_code: Yup.string().required("Postal code is required"),
  });

const { mutate, isPending } = useMutation({
  mutationFn: signupAPI,
  onSuccess: (response, variables) => {
    // ✅ Backend message handle
    const message =
      response?.data?.message || response?.message || "Account created successfully";

    toast.success(message);

    // ✅ Save email for OTP screen
    Cookies.set("signupemail", variables.email, { expires: 1 });

    router.push("/otp");
  },
  onError: (error: any) => {
    console.error("❌ Signup error:", error);

    // ✅ Show backend message if email already registered or any other message
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      "Signup failed. Please try again.";

    toast.error(errorMessage);
  },
});


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c2340] via-[#15385f] to-[#2a5869] px-3 py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo-latest.png"
            alt="Superior Pro Roofing Logo"
            width={250}
            height={50}
            className="w-[220px] sm:w-[260px] h-auto drop-shadow-md"
            priority
          />
        </div>

        <h2 className="text-center text-2xl font-bold text-[#0c2340] mb-2">
          Create Your Account
        </h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          Register to manage your roof projects and reports easily.
        </p>

        <Formik
          initialValues={{
            first_name: "",
            middle_name: "",
            last_name: "",
            email: "",
            mobile_number: "",
            password: "",
            company: "",
            postal_code: "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            const payload = {
              account_type: "Contractor",
              first_name: values.first_name,
              middle_name: values.middle_name,
              last_name: values.last_name,
              email: values.email,
              password: values.password,
              role_id: 1,
              company: values.company,
              postal_code: values.postal_code,
              mobile_number: values.mobile_number,
            };

            console.log("📤 Sending signup payload:", payload);
            mutate(payload);
          }}
        >
          {() => (
            <Form className="space-y-4">
              {/* Name fields */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Field
                    name="first_name"
                    placeholder="First Name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#25606a]"
                  />
                  <ErrorMessage
                    name="first_name"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <div className="flex-1">
                  <Field
                    name="middle_name"
                    placeholder="Middle Name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#25606a]"
                  />
                  <ErrorMessage
                    name="middle_name"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <div className="flex-1">
                  <Field
                    name="last_name"
                    placeholder="Last Name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#25606a]"
                  />
                  <ErrorMessage
                    name="last_name"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#25606a]"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Mobile */}
              <div>
                <Field
                  name="mobile_number"
                  placeholder="Mobile Number (e.g. +923001234567)"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#25606a]"
                />
                <ErrorMessage
                  name="mobile_number"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#25606a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Company */}
              <div>
                <Field
                  name="company"
                  placeholder="Company Name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#25606a]"
                />
                <ErrorMessage
                  name="company"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Postal Code */}
              <div>
                <Field
                  name="postal_code"
                  placeholder="Postal Code"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#25606a]"
                />
                <ErrorMessage
                  name="postal_code"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className={`w-full py-3 rounded-md text-white text-sm font-semibold transition ${
                  isPending
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#25606a] to-[#2ea97d] hover:opacity-90"
                }`}
              >
                {isPending ? "Creating Account..." : "Create Account"}
              </button>

              <p className="text-center text-gray-700 text-sm mt-3">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:underline text-black"
                >
                  Login here
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
