"use client";

import Image from "next/image";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Cookies from "js-cookie";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { resendOTPAPI, verifyOTPAPI } from "@/services/auth";
import { useState } from "react";

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
  const [email, setEmail] = useState(Cookies.get("signupemail") || "");
  const [showEmailInput, setShowEmailInput] = useState(!email);

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
    <div className="min-h-screen pt-[75px] flex items-center justify-center bg-[#0B2244]">
      <div className="bg-white rounded-md shadow-md p-10 w-[400px] text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/Black-Logo-main.png"
            alt="iRoofing Logo"
            width={320}
            height={40}
            className="-mt-10"
          />
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-[#0B2244] mb-2">Enter OTP</h2>
        <p className="text-gray-600 text-sm mb-6">
          We have sent a 6-digit code to your email.
          <br />
          Please enter it below to verify your account.
        </p>

        {/* Email input for existing users */}
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
              <Form className="mb-4">
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2244]"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mb-2"
                />
                <button
                  type="submit"
                  disabled={resendMutation.isPending || isSubmitting}
                  className={`w-full py-2 rounded-md text-white text-sm font-medium transition ${
                    resendMutation.isPending || isSubmitting
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-[#0B2244] hover:bg-[#132c57]"
                  }`}
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
            {({ isSubmitting }) => (
              <Form>
                <Field
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  maxLength={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2244] text-center tracking-widest text-black"
                />
                <ErrorMessage
                  name="otp"
                  component="div"
                  className="text-red-500 text-sm mb-4"
                />
                <button
                  type="submit"
                  disabled={verifyMutation.isPending || isSubmitting}
                  className={`w-full cursor-pointer py-2 mt-2 rounded-md text-white text-sm font-medium transition ${
                    verifyMutation.isPending || isSubmitting
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-[#0B2244] hover:bg-[#132c57]"
                  }`}
                >
                  {verifyMutation.isPending ? "Verifying..." : "Verify OTP"}
                </button>
              </Form>
            )}
          </Formik>
        )}

        {/* Resend OTP */}
        {!showEmailInput && (
          <p className="text-sm text-gray-600 mt-4">
            Didn’t receive the code?{" "}
            <button
              type="button"
              onClick={() => setShowEmailInput(true)}
              className="text-blue-600 cursor-pointer font-medium hover:underline"
            >
              Resend OTP
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
