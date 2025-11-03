"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { forgotPasswordAPI, resendOTPAPI } from "@/services/auth";
import Image from "next/image";

// Validation Schemas
const EmailSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

const OTPSchema = Yup.object({
  otp: Yup.string().required("OTP is required"),
});

const PasswordSchema = Yup.object({
  new_password1: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New Password is required"),
  new_password2: Yup.string()
    .oneOf([Yup.ref("new_password1")], "Passwords must match")
    .required("Confirm Password is required"),
});

export default function ResetPasswordFlow() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    new_password1: "",
    new_password2: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const sendOTPMutation = useMutation({
    mutationFn: (data: any) => resendOTPAPI(data),
    onSuccess: (res) => {
      toast.success(res?.message || "OTP sent successfully");
      setStep(2);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Failed to send OTP");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: any) => forgotPasswordAPI(data),
    onSuccess: (res) => {
      toast.success(res?.message || "Password reset successfully");
      window.location.href = "/login";
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Something went wrong");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B2244] px-4">
      <div className="bg-white rounded-md shadow-md p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/Black-Logo-main.png"
            alt="iRoofing Logo"
            width={320}
            height={40}
          />
        </div>
        <h2 className="text-xl font-bold text-center text-[#0B2244] mb-4">
          Reset Password
        </h2>

        {/* Step 1: Email */}
        {step === 1 && (
          <Formik
            initialValues={{ email: formData.email }}
            validationSchema={EmailSchema}
            onSubmit={(values) => {
              setFormData((prev) => ({ ...prev, ...values }));
              sendOTPMutation.mutate({ email: values.email });
            }}
          >
            <Form className="space-y-4">
              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full cursor-pointer py-2 rounded-md text-white text-sm font-medium transition bg-[#0B2244] hover:bg-[#132c57]"
                disabled={sendOTPMutation.isPending}
              >
                {sendOTPMutation.isPending ? "Sending..." : "Send OTP"}
              </button>
            </Form>
          </Formik>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <Formik
            initialValues={{ otp: "" }}
            validationSchema={OTPSchema}
            onSubmit={(values) => {
              setFormData((prev) => ({ ...prev, otp: values.otp }));
              setStep(3);
            }}
          >
            <Form className="space-y-4">
              <div>
                <Field
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <ErrorMessage
                  name="otp"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full cursor-pointer py-2 rounded-md text-white text-sm font-medium transition bg-[#0B2244] hover:bg-[#132c57]"
              >
                Verify OTP
              </button>
            </Form>
          </Formik>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <Formik
            initialValues={{
              new_password1: "",
              new_password2: "",
            }}
            validationSchema={PasswordSchema}
            onSubmit={(values) => {
              const finalData = { ...formData, ...values };
              resetPasswordMutation.mutate(finalData);
            }}
          >
            <Form className="space-y-4">
              <div className="relative">
                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="new_password1"
                    placeholder="New Password"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute cursor-pointer inset-y-0 right-3 flex items-center text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <ErrorMessage
                  name="new_password1"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div className="relative">
                <div className="relative">
                  <Field
                    type={showConfirmPassword ? "text" : "password"}
                    name="new_password2"
                    placeholder="Confirm Password"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute cursor-pointer inset-y-0 right-3 flex items-center text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="new_password2"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer py-2 rounded-md text-white text-sm font-medium transition bg-[#0B2244] hover:bg-[#132c57]"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending
                  ? "Resetting..."
                  : "Reset Password"}
              </button>
            </Form>
          </Formik>
        )}
      </div>
    </div>
  );
}
