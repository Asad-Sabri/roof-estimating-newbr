"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/app/page"; // adjust if layout path differs
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Image,
  Play,
  Clock,
  PlusCircle,
  Download,
  X,
  Search,
  Filter,
  MessageSquare,
  Edit,
  Trash2,
} from "lucide-react";
import SubscriberLayout from "@/components/layout/SubscriberLayout";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";

/* -------------------- Types -------------------- */
type Update = {
  id: number;
  date: string;
  status: string;
  description: string;
  photos: string[];
  comments?: { id: number; text: string; date: string }[];
};

const STATUS_STEPS = [
  "Materials Delivered",
  "Work Started",
  "25% Complete",
  "50% Complete",
  "75% Complete",
  "Completed",
];

/* -------------------- Component -------------------- */
export default function AdminJobProgressPage() {
  useProtectedRoute(); // Protect this route
  const { id } = useParams();

  const [updates, setUpdates] = useState<Update[]>(() => {
    const initial: Update[] = [
      {
        id: 1,
        date: "2025-09-10",
        status: "Materials Delivered",
        description:
          "Roofing materials delivered on site and staged in driveway.",
        photos: ["/cycle.png", "/cycle.png"],
        comments: [
          { id: 1, text: "Delivery arrived on time.", date: "2025-09-10" },
        ],
      },
      {
        id: 2,
        date: "2025-09-12",
        status: "Work Started",
        description: "Crew began roof removal and preparation.",
        photos: ["/cycle.png"],
        comments: [],
      },
    ];
    try {
      const saved = localStorage.getItem("jobprogress_admin_" + id);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initial;
  });

  // useEffect(() => {
  //   try {
  //     localStorage.setItem("jobprogress_admin_" + id, JSON.stringify(updates));
  //   } catch {}
  // }, [updates, id]);

  /* -------------------- Lightbox -------------------- */
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const lightboxRef = useRef<HTMLDivElement | null>(null);

  function openLightbox(photos: string[], index = 0) {
    setLightboxImages(photos);
    setLightboxIndex(index);
    setLightboxOpen(true);
  }
  function closeLightbox() {
    setLightboxOpen(false);
    setTimeout(() => {
      setLightboxImages([]);
      setLightboxIndex(0);
    }, 200);
  }
  function prevLightbox() {
    setLightboxIndex(
      (s) => (s - 1 + lightboxImages.length) % lightboxImages.length
    );
  }
  function nextLightbox() {
    setLightboxIndex((s) => (s + 1) % lightboxImages.length);
  }
  function downloadImage(url: string, filename?: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename ?? "photo.jpg";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* -------------------- Add Update -------------------- */
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState<string>(STATUS_STEPS[0]);
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setFormFiles((prev) => [...prev, ...Array.from(files)]);
    e.currentTarget.value = "";
  }

  async function handleSubmitUpdate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!formDesc.trim()) {
      alert("Description required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const urls = formFiles.map((f) => URL.createObjectURL(f));
      const newUpdate: Update = {
        id: Date.now(),
        date: new Date().toISOString().split("T")[0],
        status: formStatus,
        description: formDesc.trim(),
        photos: urls,
        comments: [],
      };
      setUpdates((u) => [newUpdate, ...u]);
      setFormDesc("");
      setFormFiles([]);
      setFormStatus(STATUS_STEPS[0]);
    } finally {
      setIsSubmitting(false);
    }
  }

  /* -------------------- Admin Controls -------------------- */
  function deleteUpdate(id: number) {
    if (!confirm("Delete this update?")) return;
    setUpdates((prev) => prev.filter((u) => u.id !== id));
  }
  function deletePhoto(updateId: number, index: number) {
    setUpdates((prev) =>
      prev.map((u) =>
        u.id === updateId
          ? { ...u, photos: u.photos.filter((_, i) => i !== index) }
          : u
      )
    );
  }
  function deleteComment(updateId: number, commentId: number) {
    setUpdates((prev) =>
      prev.map((u) =>
        u.id === updateId
          ? { ...u, comments: u.comments?.filter((c) => c.id !== commentId) }
          : u
      )
    );
  }

  /* -------------------- Search & Filter -------------------- */
  const [filter, setFilter] = useState<"all" | "withPhotos" | "withComments">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let arr = updates.slice();
    if (filter === "withPhotos") arr = arr.filter((u) => u.photos.length > 0);
    if (filter === "withComments")
      arr = arr.filter((u) => (u.comments?.length ?? 0) > 0);
    if (statusFilter !== "all")
      arr = arr.filter((u) => u.status === statusFilter);
    if (query.trim())
      arr = arr.filter((u) =>
        (
          u.description +
          " " +
          u.status +
          " " +
          (u.comments?.map((c) => c.text).join(" ") || "")
        )
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    return arr;
  }, [updates, filter, statusFilter, query]);

  /* -------------------- Render -------------------- */
  return (
    <SubscriberLayout>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-900"
      >
        <header className="bg-gray-200 text-black py-5 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h1 className=" md:text-3xl font-bold flex items-center gap-2">
            <Play /> Job Progress
          </h1>
          <span>Project ID: {id}</span>
        </header>

        <section className="my-8 max-w-6xl mx-auto space-y-8">
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between gap-3 w-full">
            {/* Filters + Search */}
            <div className="flex flex-col sm:flex-row gap-2 flex-wrap w-full md:w-auto">
              {/* Search Box */}
              <div className="relative bg-white w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:border-green-400 outline-none text-sm sm:text-base"
                />
              </div>

              {/* Filter Select */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full sm:w-auto bg-white rounded-lg border border-gray-300 px-3 py-2 focus:border-green-400 outline-none text-sm sm:text-base"
              >
                <option value="all">All</option>
                <option value="withPhotos">With Photos</option>
                <option value="withComments">With Comments</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-white rounded-lg border border-gray-300 px-3 py-2 focus:border-green-400 outline-none text-sm sm:text-base"
              >
                <option value="all">All Statuses</option>
                {STATUS_STEPS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Updates Table */}
          <div className="overflow-x-auto bg-white">
            <table className="w-full border border-gray-300 text-sm min-w-[1000px]">
              <thead className=" text-white" style={{ backgroundColor: "#8b0e0f" }}>
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Photos</th>
                  <th className="p-3 text-left">Comments</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t border-gray-300">
                    <td className="p-3">{u.date}</td>
                    <td className="p-3 font-medium text-indigo-600">
                      {u.status}
                    </td>
                    <td className="p-3">{u.description}</td>
                    <td className="p-3">
                      {u.photos.length}{" "}
                      <button
                        onClick={() => openLightbox(u.photos)}
                        className="ml-2 cursor-pointer text-blue-600 underline"
                      >
                        View
                      </button>
                    </td>
                    <td className="p-3">
                      {(u.comments ?? []).length}
                      {u.comments?.map((c) => (
                        <div
                          key={c.id}
                          className="mt-1 flex justify-between text-xs bg-gray-50 p-1 rounded"
                        >
                          <span>{c.text}</span>
                          <button
                            onClick={() => deleteComment(u.id, c.id)}
                            className="text-red-500 ml-2 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => deleteUpdate(u.id)}
                        className="px-2 py-1 bg-red-600 cursor-pointer text-white rounded hover:bg-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Update */}
          <div className="bg-white shadow p-4 sm:p-6 lg:p-8 rounded-lg w-full">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" /> Add Update
            </h3>
            <form
              onSubmit={handleSubmitUpdate}
              className="space-y-3 sm:space-y-4"
            >
              {/* Status Select */}
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 focus:border-green-400 outline-none text-sm sm:text-base"
              >
                {STATUS_STEPS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Description */}
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Description..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 focus:border-green-400 outline-none text-sm sm:text-base"
                rows={3}
              />

              {/* File Upload */}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFiles}
                className="w-full border border-gray-300 p-2 sm:p-3 rounded-md focus:border-green-400 outline-none text-sm sm:text-base"
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-indigo-600 cursor-pointer text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-md hover:bg-indigo-700 text-sm sm:text-base transition"
              >
                {isSubmitting ? "Adding..." : "Add Update"}
              </button>
            </form>
          </div>
        </section>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
            >
              <div ref={lightboxRef} className="relative max-w-4xl w-full">
                <button
                  onClick={closeLightbox}
                  className="absolute top-2 cursor-pointer right-2 bg-white p-2 rounded-full"
                >
                  <X />
                </button>
                <motion.img
                  key={lightboxImages[lightboxIndex]}
                  src={lightboxImages[lightboxIndex]}
                  className="max-h-[80vh] mx-auto rounded"
                />
                <div className="absolute cursor-pointer left-4 top-1/2 -translate-y-1/2">
                  <button
                    onClick={prevLightbox}
                    className="bg-white cursor-pointer p-2 rounded-full"
                  >
                    ◀
                  </button>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <button
                    onClick={nextLightbox}
                    className="bg-white cursor-pointer p-2 rounded-full"
                  >
                    ▶
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </SubscriberLayout>
  );
}
