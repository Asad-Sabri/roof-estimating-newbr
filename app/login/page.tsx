// pages/login.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setCookie, parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginAPI } from "@/services/auth";
import { setCredentials } from "@/redux/slices/authSlice";

import logo from "../../public/logo-latest.png";

type LoginTab = "admin" | "customer";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<LoginTab>("customer");
  
  // Check if user is already logged in (only if not coming from logout)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if coming from logout (check for logout flag in sessionStorage)
      const isFromLogout = sessionStorage.getItem("logout");
      if (isFromLogout) {
        sessionStorage.removeItem("logout");
        return; // Don't redirect if coming from logout
      }

      const { token } = parseCookies();
      const tokenFromStorage = localStorage.getItem("token");
      
      // Only redirect if token actually exists
      if (token || tokenFromStorage) {
        const loginRole = localStorage.getItem("loginRole");
        // User is already logged in, redirect to appropriate dashboard
        if (loginRole === "admin") {
          router.replace("/admin-panel/dashboard");
        } else {
          router.replace("/customer-panel/dashboard");
        }
      }
    }
  }, [router]);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: { email: string; password: string; role: string }) => {
      // Pass role to API
      return loginAPI({
        email: values.email,
        password: values.password,
        role: values.role, // This will be "admin" or "customer" based on activeTab
      });
    },
    onSuccess: (data: any) => {
      const { token, user } = data;
      
      // Save selected role in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("loginRole", activeTab);
        
        // Also, for quick testing, set a cookie without secure flag
        document.cookie = `token=${token}; path=/; max-age=${
          30 * 24 * 60 * 60
        }`;
      }
      
      // ✅ Save token in cookie
      setCookie(null, "token", token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        secure: true,
        sameSite: "strict",
      });

      // ✅ ALSO save in localStorage (client-side)
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }

      dispatch(setCredentials({ user, token }));
      toast.success(data?.message || "Login successful!");

      // Redirect based on role
      if (activeTab === "admin") {
        router.push("/admin-panel/dashboard");
      } else {
        // For customer: Set flag to auto-open estimate modal on dashboard
        if (typeof window !== "undefined") {
          // Clear any previous session flag
          sessionStorage.removeItem("hasCheckedEstimateModal");
          // Set flag to show modal on dashboard load
          sessionStorage.setItem("showEstimateModal", "true");
        }
        router.push("/customer-panel/dashboard");
      }
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Login failed");
    },
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-[#0c2340] via-[#16375f] to-[#245b68]">
      {/* Left Section */}
      <div className="flex-1 flex justify-center items-center px-4 sm:px-6 py-8 sm:py-10">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 sm:p-8 relative">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image
              src={logo}
              alt="Superior Pro Roofing Logo"
              width={200}
              height={50}
              className="w-[220px] sm:w-[260px] h-auto drop-shadow-md"
              priority
            />
          </div>

          <h2 className="text-center font-bold text-lg sm:text-xl text-[#0c2340] mb-6">
            Login to Your Account
          </h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab("customer")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "customer"
                  ? "bg-white text-[#25606a] shadow-sm"
                  : "text-gray-600 hover:text-[#25606a]"
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "admin"
                  ? "bg-white text-[#25606a] shadow-sm"
                  : "text-gray-600 hover:text-[#25606a]"
              }`}
            >
              Admin
            </button>
          </div>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={(values) => mutate({ ...values, role: activeTab })}
          >
            {() => (
              <Form className="space-y-4 mt-5">
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full border-b border-gray-400 focus:outline-none focus:border-[#25606a] py-2 text-sm sm:text-base text-black placeholder-secondary"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-xs sm:text-sm text-red-600"
                  />
                </div>

                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="w-full border-b border-gray-400 focus:outline-none focus:border-[#25606a] py-2 text-sm sm:text-base text-black placeholder-secondary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="cursor-pointer absolute right-2 top-2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-xs sm:text-sm text-red-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#25606a] to-[#2ea97d] cursor-pointer text-white py-2 rounded-lg text-sm sm:text-base font-semibold shadow-md hover:opacity-90 transition-all duration-300"
                >
                  {isPending ? "Logging in..." : "Sign In →"}
                </button>
              </Form>
            )}
          </Formik>

          {/* <p className="text-center font-medium text-xs sm:text-sm mt-4 text-black">
            Not a member?{" "}
            <Link
              href="/signup"
              className="text-[#25606a] font-bold hover:underline"
            >
              Sign Up Now
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}
