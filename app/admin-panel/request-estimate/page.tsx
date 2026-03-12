"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, MapPin } from "lucide-react";
import { useState } from "react";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { useRouter } from "next/navigation";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { createProjectAPI } from "@/services/auth";
import { getPinCoordinatesFromFeature } from "@/utils/buildingCentroid";
import { ROOF_TYPE_CATEGORIES, getCompatibleSystems } from "@/lib/roofTypeSystemMatrix";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";

const geocodingClient = mbxGeocoding({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
});

export default function AdminRequestEstimatePage() {
  useProtectedRoute();
  const router = useRouter();
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      mobile: "",
      address: "",
      roofTypeCategory: "" as string,
      roofType: "",
      propertyType: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("Required"),
      lastName: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      mobile: Yup.string().required("Required"),
      address: Yup.string().required("Required"),
      roofTypeCategory: Yup.string().required("Select roof type first"),
      roofType: Yup.string().required("Required"),
      propertyType: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const geoRes = await geocodingClient
          .forwardGeocode({ query: values.address, limit: 1 })
          .send();
        const feature = geoRes.body.features[0];
        if (!feature) throw new Error("Invalid address");
        const [lng, lat] = await getPinCoordinatesFromFeature(feature);

        await createProjectAPI({
          first_name: values.firstName,
          middle_name: values.middleName,
          last_name: values.lastName,
          email: values.email,
          mobile_number: values.mobile,
          address: { street: values.address },
          roof_type: values.roofType,
          property_type: values.propertyType,
          latitude: lat,
          longitude: lng,
        });

        setShowSuccess(true);
        formik.resetForm();
        setTimeout(() => {
          setShowSuccess(false);
          router.push("/admin-panel/project-details");
        }, 2000);
      } catch (err) {
        console.error(err);
        alert("Failed to create project. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  const goToMap = async () => {
    setMapLoading(true);
    await formik.validateForm();
    formik.setTouched({
      firstName: true,
      lastName: true,
      middleName: true,
      mobile: true,
      email: true,
      address: true,
      roofTypeCategory: true,
      roofType: true,
      propertyType: true,
    });
    if (!formik.isValid) {
      setMapLoading(false);
      return;
    }
    try {
      const geoRes = await geocodingClient
        .forwardGeocode({ query: formik.values.address, limit: 1 })
        .send();
      const feature = geoRes.body.features[0];
      if (!feature) {
        setMapLoading(false);
        return alert("Please enter a valid address");
      }
      const [lng, lat] = await getPinCoordinatesFromFeature(feature);

      await createProjectAPI({
        first_name: formik.values.firstName,
        middle_name: formik.values.middleName,
        last_name: formik.values.lastName,
        email: formik.values.email,
        mobile_number: formik.values.mobile,
        address: { street: formik.values.address },
        roof_type: formik.values.roofType,
        property_type: formik.values.propertyType,
        latitude: lat,
        longitude: lng,
      });

      const addr = { lat, lng, address: formik.values.address };
      localStorage.setItem("projectAddress", JSON.stringify(addr));
      localStorage.setItem("projectLocation", JSON.stringify({ lat, lng }));
      router.push("/property-map");
    } catch (err: unknown) {
      console.error(err);
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      alert(msg || "Failed to create project or fetch location. Please try again.");
    } finally {
      setMapLoading(false);
    }
  };

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    formik.setFieldValue("address", value);
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await geocodingClient.forwardGeocode({ query: value, limit: 6 }).send();
      const results = res.body.features.map((f: any) => f.place_name);
      setSuggestions(results);
      if (res.body.features[0]) {
        const [lng, lat] = res.body.features[0].center;
        setLatitude(lat);
        setLongitude(lng);
      }
    } catch {
      setSuggestions([]);
    }
  };

  const handlePickLocation = async () => {
    let lat = latitude;
    let lng = longitude;
    if (!lat || !lng) {
      try {
        const geoRes = await geocodingClient
          .forwardGeocode({ query: formik.values.address, limit: 1 })
          .send();
        const feature = geoRes.body.features[0];
        if (!feature) throw new Error("Invalid address");
        [lng, lat] = await getPinCoordinatesFromFeature(feature);
        setLatitude(lat);
        setLongitude(lng);
      } catch {
        alert("Error fetching coordinates. Try again!");
        return;
      }
    }
    try {
      await createProjectAPI({
        first_name: formik.values.firstName,
        middle_name: formik.values.middleName,
        last_name: formik.values.lastName,
        email: formik.values.email,
        mobile_number: formik.values.mobile,
        address: { street: formik.values.address },
        roof_type: formik.values.roofType,
        property_type: formik.values.propertyType,
        latitude: lat,
        longitude: lng,
      });

      const addr = { lat, lng, address: formik.values.address };
      localStorage.setItem("projectAddress", JSON.stringify(addr));
      localStorage.setItem("projectLocation", JSON.stringify({ lat, lng }));
      router.push("/property-map");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to create project. Please try again.");
    }
  };

  return (
    <AdminDashboardLayout>
      <main className="min-h-screen flex flex-col items-center bg-gray-50 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-5xl bg-white rounded-xl shadow-xl p-6 md:p-12 relative"
        >
          {showSuccess ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-16"
            >
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700 mb-2">Project Created Successfully</h2>
              <p className="text-gray-600">Your new project has been created successfully.</p>
            </motion.div>
          ) : (
            <>
              <div className="flex justify-between items-center pb-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center w-full">
                  Create New Project
                </h2>
              </div>

              <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="John"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#8b0e0f] outline-none"
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-red-500 text-sm">{formik.errors.firstName}</p>
                  )}
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formik.values.middleName}
                    onChange={formik.handleChange}
                    placeholder="A."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#8b0e0f] outline-none"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Doe"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#8b0e0f] outline-none"
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-red-500 text-sm">{formik.errors.lastName}</p>
                  )}
                </div>
                <div className="md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                  <input
                    type="text"
                    name="mobile"
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="+1 234 567 890"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#8b0e0f] outline-none"
                  />
                  {formik.touched.mobile && formik.errors.mobile && (
                    <p className="text-red-500 text-sm">{formik.errors.mobile}</p>
                  )}
                </div>
                <div className="md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="example@email.com"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#8b0e0f] outline-none"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-sm">{formik.errors.email}</p>
                  )}
                </div>
                <div className="md:col-span-12 relative">
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter address"
                      value={formik.values.address}
                      onChange={handleAddressChange}
                      className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#8b0e0f]"
                    />
                    <button
                      type="button"
                      onClick={handlePickLocation}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#8b0e0f]"
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
                    {suggestions.length > 0 && (
                      <ul className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-md w-full mt-1 max-h-48 overflow-y-auto">
                        {suggestions.map((s, i) => (
                          <li
                            key={i}
                            onClick={async () => {
                              formik.setFieldValue("address", s);
                              setSuggestions([]);
                              try {
                                const geoRes = await geocodingClient.forwardGeocode({ query: s, limit: 1 }).send();
                                const feature = geoRes.body.features[0];
                                if (feature) {
                                  const [lng, lat] = await getPinCoordinatesFromFeature(feature);
                                  localStorage.setItem("projectLocation", JSON.stringify({ address: s, lat, lng }));
                                }
                              } catch {
                                // ignore
                              }
                            }}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {formik.touched.address && formik.errors.address && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.address}</p>
                  )}
                </div>
                <div className="md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Roof Type (Category) *</label>
                  <select
                    name="roofTypeCategory"
                    value={formik.values.roofTypeCategory}
                    onChange={(e) => {
                      const cat = e.target.value;
                      formik.setFieldValue("roofTypeCategory", cat);
                      const compatible = getCompatibleSystems(cat as any);
                      const currentInCompatible = compatible.some((s) => s.value === formik.values.roofType);
                      if (!currentInCompatible) formik.setFieldValue("roofType", "");
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-[#8b0e0f] outline-none"
                  >
                    <option value="">Select Roof Type</option>
                    {ROOF_TYPE_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {formik.touched.roofTypeCategory && formik.errors.roofTypeCategory && (
                    <p className="text-red-500 text-sm">{formik.errors.roofTypeCategory}</p>
                  )}
                </div>
                <div className="md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Roof System *</label>
                  <select
                    name="roofType"
                    value={formik.values.roofType}
                    onChange={formik.handleChange}
                    disabled={!formik.values.roofTypeCategory}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-[#8b0e0f] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Roof System</option>
                    {getCompatibleSystems(formik.values.roofTypeCategory as any).map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  {formik.touched.roofType && formik.errors.roofType && (
                    <p className="text-red-500 text-sm">{formik.errors.roofType}</p>
                  )}
                </div>
                <div className="md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Property Type *</label>
                  <select
                    name="propertyType"
                    value={formik.values.propertyType}
                    onChange={formik.handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-[#8b0e0f] outline-none"
                  >
                    <option value="">Select Property Type</option>
                    <option value="single">Single Story</option>
                    <option value="double">Double Story</option>
                    <option value="commercial">Commercial</option>
                  </select>
                  {formik.touched.propertyType && formik.errors.propertyType && (
                    <p className="text-red-500 text-sm">{formik.errors.propertyType}</p>
                  )}
                </div>

                <div className="md:col-span-12 flex flex-wrap justify-between gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 rounded-md font-semibold shadow hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="animate-spin w-5 h-5" />}
                    Create & Save Project
                  </button>
                  <button
                    type="button"
                    onClick={goToMap}
                    disabled={mapLoading}
                    className="flex-1 text-white py-2 rounded-md font-semibold shadow hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#8b0e0f" }}
                  >
                    {mapLoading ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                    {mapLoading ? "Processing..." : "Go to Map Screen"}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </main>
    </AdminDashboardLayout>
  );
}
