"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { resendOTPAPI } from "@/services/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../../public/logo-latest.png";

const EmailSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function ForgotUserIDFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const sendUserIDMutation = useMutation({
    mutationFn: (data: any) => resendOTPAPI(data),
    onSuccess: (res) => {
      toast.success(res?.message || "User ID recovery email sent successfully! Please check your inbox.");
      // After email sent, redirect to login after a delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Failed to send recovery email. Please try again.");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B2244] px-4">
      <div className="bg-white rounded-md shadow-md p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src={logo}
            alt="Superior Pro Roofing Logo"
            width={200}
            height={50}
            className="w-[220px] sm:w-[260px] h-auto drop-shadow-md"
            priority
          />
        </div>
        <h2 className="text-xl font-bold text-center text-[#0B2244] mb-4">
          Forgot User ID
        </h2>

        {/* Step 1: Email */}
        {step === 1 && (
          <Formik
            initialValues={{ email: "" }}
            validationSchema={EmailSchema}
            onSubmit={(values) => {
              sendUserIDMutation.mutate({ email: values.email });
            }}
          >
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your email address
                </label>
                <Field
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <button
                type="submit"
                className="w-full cursor-pointer py-2 rounded-md text-white text-sm font-medium transition bg-[#0B2244] hover:bg-[#132c57]"
                disabled={sendUserIDMutation.isPending}
              >
                {sendUserIDMutation.isPending ? "Sending..." : "Recover User ID"}
              </button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-sm text-[#25606a] hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </Form>
          </Formik>
        )}
      </div>
    </div>
  );
}
