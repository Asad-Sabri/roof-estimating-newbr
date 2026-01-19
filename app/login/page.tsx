// pages/login.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setCookie, parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff, MapPin, X } from "lucide-react";
import { loginAPI } from "@/services/auth";
import { setCredentials } from "@/redux/slices/authSlice";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

import logo from "../../public/logo-latest.png";

type LoginTab = "customer" | "admin" | "super-admin";

const geocodingClient = mbxGeocoding({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
});

// Address Modal Component for Customer
function AddressModal({ 
  isOpen, 
  onClose, 
  onContinue 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onContinue: (data: { address: string; firstName: string; lastName: string; email: string }) => void;
}) {
  const [step, setStep] = useState<"address" | "form">("address");
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await geocodingClient
        .forwardGeocode({ query: value, limit: 6 })
        .send();

      const results = res.body.features.map((f: any) => f.place_name);
      setSuggestions(results);
    } catch (err) {
      console.error("Mapbox Geocoding error:", err);
    }
  };

  const handleSelectAddress = (selectedAddress: string) => {
    setAddress(selectedAddress);
    setSuggestions([]);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      setStep("form");
    } else {
      toast.error("Please enter an address");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);
    // Save data and continue
    setTimeout(() => {
      setLoading(false);
      onContinue({
        address,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });
    }, 500);
  };

  const handleClose = () => {
    setStep("address");
    setAddress("");
    setFormData({ firstName: "", lastName: "", email: "" });
    setSuggestions([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={24} />
        </button>

        {/* Logo */}
        <div className=" px-6 py-6 flex justify-center">
          <Image
            src={logo}
            alt="Superior Pro Roofing Logo"
            width={220}
            height={55}
            className="w-auto h-auto"
            priority
          />
        </div>

        <div className="p-6">
          {/* Address Step */}
          {step === "address" && (
            <>
              <div className="mb-6">
                {/* <div className="flex items-center justify-center mb-3">
                  <div className="bg-[#8b0e0f] bg-opacity-10 rounded-full p-3">
                    <MapPin className="text-[#8b0e0f]" size={32} />
                  </div>
                </div> */}
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  Enter Your Address
                </h2>
                <p className="text-sm text-gray-600 text-center">
                  Please provide your address to get started
                </p>
              </div>

              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={handleAddressChange}
                    placeholder="Enter your address"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-[#8b0e0f]"
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectAddress(suggestion)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!address.trim()}
                    className="flex-1 px-4 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ backgroundColor: "#8b0e0f" }}
                  >
                    Continue →
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Form Step */}
          {step === "form" && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  Complete Your Information
                </h2>
                <p className="text-sm text-gray-600 text-center">
                  Please provide your details to continue
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter your first name"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-[#8b0e0f]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter your last name"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-[#8b0e0f]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-[#8b0e0f]"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("address")}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()}
                    className="flex-1 px-4 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ backgroundColor: "#8b0e0f" }}
                  >
                    {loading ? "Processing..." : "Continue to Dashboard →"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<LoginTab>("customer");
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isFromLogout = sessionStorage.getItem("logout");
      if (isFromLogout) {
        sessionStorage.removeItem("logout");
        return;
      }

      const { token } = parseCookies();
      const tokenFromStorage = localStorage.getItem("token");

      if (token || tokenFromStorage) {
        const loginRole = localStorage.getItem("loginRole");
        if (loginRole === "admin" || loginRole === "super-admin") {
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
      return loginAPI({
        email: values.email,
        password: values.password,
        role: values.role,
      });
    },
    onSuccess: (data: any, variables) => {
      const { token, user } = data;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("loginRole", variables.role);

        document.cookie = `token=${token}; path=/; max-age=${
          30 * 24 * 60 * 60
        }`;
      }

      setCookie(null, "token", token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        secure: true,
        sameSite: "strict",
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }

      dispatch(setCredentials({ user, token }));
      toast.success(data?.message || "Login successful!");

      // Redirect based on role
      if (variables.role === "admin" || variables.role === "super-admin") {
        router.push("/admin-panel/dashboard");
      } else {
        router.push("/customer-panel/dashboard");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Login failed");
    },
  });


  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0c2340] via-[#16375f] to-[#245b68]">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 w-full flex flex-col justify-center items-center p-12 text-white">
          {/* Logo */}
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

          {/* Roofing Image */}
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

          {/* Tagline */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Superior Pro Roofing Systems</h1>
            <p className="text-lg opacity-90">
              Professional roofing solutions for your home and business
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
            Welcome Back
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Sign in to your account to continue
          </p>

          {/* Role Tabs */}
          <div className="flex gap-3 mb-8 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab("customer")}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "customer"
                  ? "bg-white text-[#8b0e0f] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "admin"
                  ? "bg-white text-[#8b0e0f] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("super-admin")}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "super-admin"
                  ? "bg-white text-[#8b0e0f] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Super Admin
            </button>
          </div>

          {/* Customer Flow - Login Form for Existing Customers */}
          {activeTab === "customer" && (
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={(values) =>
                mutate({
                  ...values,
                  role: "customer",
                })
              }
            >
              {() => (
                <Form className="space-y-6">
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

                  <div className="relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-12 text-black focus:outline-none focus:border-[#8b0e0f]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-sm text-red-600 mt-1"
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <Link
                      href="/forget"
                      className="text-[#8b0e0f] hover:underline"
                    >
                      Forgot Password?
                    </Link>
                    <Link
                      href="/forget-user-id"
                      className="text-[#8b0e0f] hover:underline"
                    >
                      Forgot User ID?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full px-6 py-3 text-white my-2 rounded-lg font-semibold shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#8b0e0f" }}
                  >
                    {isPending ? "Logging in..." : "Sign In →"}
                  </button>

                  {/* New Customer? Get Free Estimate Button */}
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-gray-500 mb-3">Or</h4>
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="w-full px-6 py-3 border-2 border-[#8b0e0f] my-2 text-[#8b0e0f] rounded-lg font-semibold hover:bg-[#8b0e0f] hover:text-white transition-all"
                    >
                      If you are not registered
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {/* Admin & Super Admin Flow - Login Form */}
          {(activeTab === "admin" || activeTab === "super-admin") && (
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={(values) =>
                mutate({
                  ...values,
                  role: activeTab === "super-admin" ? "admin" : "admin", // Adjust based on backend
                })
              }
            >
              {() => (
                <Form className="space-y-6">
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

                  <div className="relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-12 text-black focus:outline-none focus:border-[#8b0e0f]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-sm text-red-600 mt-1"
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <Link
                      href="/forget"
                      className="text-[#8b0e0f] hover:underline"
                    >
                      Forgot Password?
                    </Link>
                    <Link
                      href="/forget-user-id"
                      className="text-[#8b0e0f] hover:underline"
                    >
                      Forgot User ID?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full px-6 py-3 text-white rounded-lg font-semibold shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#8b0e0f" }}
                  >
                    {isPending ? "Logging in..." : "Sign In →"}
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {/* Sign Up Link - Only show for Admin/Super Admin */}
          {(activeTab === "admin" || activeTab === "super-admin") && (
            <p className="text-center text-sm text-gray-600 mt-6">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[#8b0e0f] font-semibold hover:underline"
              >
                Sign Up Now
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Address Modal for Customer */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onContinue={(data) => {
          // Save all data to localStorage
          localStorage.setItem("customerAddress", data.address);
          localStorage.setItem("customerFirstName", data.firstName);
          localStorage.setItem("customerLastName", data.lastName);
          localStorage.setItem("customerEmail", data.email);
          // Mark as instant estimate visitor
          localStorage.setItem("isInstantEstimateVisitor", "true");
          setShowAddressModal(false);
          // Redirect to customer dashboard (API check baad me add karengay)
          router.push("/customer-panel/dashboard");
        }}
      />
    </div>
  );
}
