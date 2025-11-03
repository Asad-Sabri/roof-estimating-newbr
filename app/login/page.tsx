// pages/login.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setCookie } from "nookies";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { loginAPI } from "@/services/auth";
import { setCredentials } from "@/redux/slices/authSlice";

import logo from "../../public/Superior Pro Roofing logo black.png";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      loginAPI(values),
    onSuccess: (data: any) => {
      const { token, user } = data;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
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

      // Redirect
      const roleName = data?.role?.name || "";
      if (roleName === "Admin") router.push("/customer-panel/dashboard/");
      else router.push("/customer-panel/dashboard");
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
              width={250}
              height={70}
              className="w-[220px] sm:w-[260px] h-auto drop-shadow-md"
              priority
            />
          </div>

          <h2 className="text-center font-bold text-lg sm:text-xl text-[#0c2340]">
            Login to Your Account
          </h2>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={(values) => mutate(values)}
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

          <p className="text-center font-medium text-xs sm:text-sm mt-4 text-black">
            Not a member?{" "}
            <Link
              href="/signup"
              className="text-[#25606a] font-bold hover:underline"
            >
              Sign Up Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
