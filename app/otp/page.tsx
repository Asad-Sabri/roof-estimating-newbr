"use client";

import Image from "next/image";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Cookies from "js-cookie";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { resendOTPAPI, verifyOTPAPI } from "@/services/auth";
import { useState } from "react";

import logo from "../../public/logo-latest.png";

const OtpSchema = Yup.object().shape({
  otp: Yup.string()
    .required("OTP is required")
    .length(6, "OTP must be exactly 6 digits"),
});

const EmailSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function OTPVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams?.get("email") || "";
  const [email, setEmail] = useState(Cookies.get("signupemail") || emailFromUrl || "");
  const [showEmailInput, setShowEmailInput] = useState(!(Cookies.get("signupemail") || emailFromUrl));

  const verifyMutation = useMutation({
    mutationFn: (data: { email: string; otp: string }) => verifyOTPAPI(data),
    onSuccess: (data) => {
      toast.success(data?.message || "OTP verified successfully!");
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Invalid OTP");
    },
  });

  const resendMutation = useMutation({
    mutationFn: (data: { email: string }) => resendOTPAPI(data),
    onSuccess: (data) => {
      toast.success(data?.message || "OTP resent successfully!");
      setShowEmailInput(false);
      Cookies.set("signupemail", email, { expires: 1 });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to resend OTP");
    },
  });

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Image Section (same as login) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0c2340] via-[#16375f] to-[#245b68]">
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="relative z-10 w-full flex flex-col justify-center items-center p-12 text-white">
          <div className="mb-8">
            <Image
              src={logo}
              alt="Superior Pro Roofing Logo"
              width={280}
              height={70}
              className="w-auto h-auto drop-shadow-lg"
              priority
            />
          </div>
          <div className="w-full max-w-md mb-8 rounded-lg overflow-hidden shadow-2xl">
            <Image
              src="https://watkinsconstructioninc.com/wp-content/uploads/2023/11/What-are-the-Different-Types-of-Roofing-Materials-jpg.webp"
              alt="Roofing Services"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
              unoptimized
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Superior Pro Roofing Systems</h1>
            <p className="text-lg opacity-90">
              Professional roofing solutions for your home and business
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - OTP Form (same layout as login form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image
              src={logo}
              alt="Superior Pro Roofing Logo"
              width={200}
              height={50}
              className="w-auto h-auto"
              priority
            />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Verify your account
          </h2>
          <p className="text-gray-600 text-center mb-8">
            We&apos;ve sent a 6-digit code to your email. Enter it below to verify your account.
          </p>

          {/* Email input when needed (e.g. resend OTP) */}
          {showEmailInput && (
            <Formik
              initialValues={{ email }}
              validationSchema={EmailSchema}
              onSubmit={(values) => {
                setEmail(values.email);
                resendMutation.mutate({ email: values.email });
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6 mb-6">
                  <div>
                    <Field
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-[#8b0e0f]"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-sm text-red-600 mt-1"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resendMutation.isPending || isSubmitting}
                    className="w-full px-6 py-3 text-white rounded-lg font-semibold shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#8b0e0f" }}
                  >
                    {resendMutation.isPending ? "Sending OTP..." : "Send OTP"}
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {/* OTP Form */}
          {!showEmailInput && (
            <Formik
              initialValues={{ otp: "" }}
              validationSchema={OtpSchema}
              onSubmit={(values) => {
                if (!email) {
                  toast.error("Email not found. Please enter your email.");
                  setShowEmailInput(true);
                  return;
                }
                verifyMutation.mutate({ email, otp: values.otp });
              }}
            >
              {() => (
                <Form className="space-y-6">
                  <div>
                    <Field
                      type="text"
                      name="otp"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-[#8b0e0f] text-center tracking-[0.4em] text-lg font-semibold"
                    />
                    <ErrorMessage
                      name="otp"
                      component="div"
                      className="text-sm text-red-600 mt-1"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={verifyMutation.isPending}
                    className="w-full px-6 py-3 text-white rounded-lg font-semibold shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#8b0e0f" }}
                  >
                    {verifyMutation.isPending ? "Verifying..." : "Verify OTP"}
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {!showEmailInput && (
            <p className="text-center text-sm text-gray-600 mt-6">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={() => setShowEmailInput(true)}
                className="text-[#8b0e0f] font-semibold hover:underline cursor-pointer"
              >
                Resend OTP
              </button>
            </p>
          )}

          <p className="text-center text-sm text-gray-600 mt-6">
            <Link href="/login" className="text-[#8b0e0f] font-semibold hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
