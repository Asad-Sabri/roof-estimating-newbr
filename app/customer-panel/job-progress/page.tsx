"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/app/page"; // adjust if layout path differs
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useProtectedRoute } from "@/services/hooks/useProtectedRoutes";
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
} from "lucide-react";
import CustomerDashboardLayout from "@/app/dashboard/customer/page";

/* -------------------- Types -------------------- */
type Update = {
  id: number;
  date: string; // ISO or readable
  status: string;
  description: string;
  photos: string[]; // urls (local object URLs or remote paths)
  comments?: { id: number; text: string; date: string }[];
};

/* -------------------- Constants -------------------- */
const STATUS_STEPS = [
  "Materials Delivered",
  "Work Started",
  "25% Complete",
  "50% Complete",
  "75% Complete",
  "Completed",
];

/* -------------------- Component -------------------- */
export default function JobProgressPage() {
  useProtectedRoute(); // Protect this route
  const { id } = useParams();

  // initial sample updates
  const [updates, setUpdates] = useState<Update[]>(() => {
    const initial: Update[] = [
      {
        id: 1,
        date: "2025-09-10",
        status: "Materials Delivered",
        description:
          "Roofing materials delivered on site and staged in driveway.",
        photos: ["/damageroof.jpg", "/damageroof.jpg"],
        comments: [
          { id: 1, text: "Delivery arrived on time.", date: "2025-09-10" },
        ],
      },
      {
        id: 2,
        date: "2025-09-12",
        status: "Work Started",
        description: "Crew began roof removal and preparation.",
        photos: ["/damageroof.jpg"],
        comments: [],
      },
      {
        id: 3,
        date: "2025-09-14",
        status: "50% Complete",
        description: "Half of the roof has been installed with new shingles.",
        photos: ["/damageroof.jpg"],
        comments: [{ id: 2, text: "Looks great so far!", date: "2025-09-14" }],
      },
    ];
    // optional localStorage restore (keeps new updates after reload)
    try {
      const saved = localStorage.getItem("" + id);
      if (saved) {
        const parsed = JSON.parse(saved) as Update[];
        return parsed.concat(
          initial.filter((i) => !parsed.find((p) => p.id === i.id))
        );
      }
    } catch {}
    return initial;
  });

  // saving to localStorage automatically (toggle boolean to enable/disable)
  useEffect(() => {
    try {
      // localStorage.setItem("jobprogress_demo_" + id, JSON.stringify(updates));
    } catch {}
  }, [updates, id]);

  // modal (lightbox) state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const lightboxRef = useRef<HTMLDivElement | null>(null);

  // Add update form state
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState<string>(STATUS_STEPS[0]);
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & search
  const [filter, setFilter] = useState<"all" | "withPhotos" | "withComments">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  // computed progress percent from latest update status
  const progressPercent = useMemo(() => {
    if (!updates.length) return 0;
    // find latest status index (based on STATUS_STEPS order)
    let latestIndex = 0;
    for (const u of updates) {
      const idx = STATUS_STEPS.indexOf(u.status);
      if (idx >= 0) latestIndex = Math.max(latestIndex, idx);
    }
    return Math.round((latestIndex / (STATUS_STEPS.length - 1)) * 100);
  }, [updates]);

  /* -------------------- Handlers -------------------- */

  // open lightbox with given photos and index
  function openLightbox(photos: string[], index = 0) {
    setLightboxImages(photos);
    setLightboxIndex(index);
    setLightboxOpen(true);
    // trap focus in modal handled by keyboard listener below
  }

  function closeLightbox() {
    setLightboxOpen(false);
    setTimeout(() => {
      setLightboxImages([]);
      setLightboxIndex(0);
    }, 200);
  }

  // navigate prev/next in lightbox
  function prevLightbox() {
    setLightboxIndex(
      (s) => (s - 1 + lightboxImages.length) % lightboxImages.length
    );
  }
  function nextLightbox() {
    setLightboxIndex((s) => (s + 1) % lightboxImages.length);
  }

  // download image
  function downloadImage(url: string, filename?: string) {
    // if url is object URL or remote, create anchor
    const a = document.createElement("a");
    a.href = url;
    a.download = filename ?? "photo.jpg";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // handle file selection (store File objects)
  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setFormFiles((prev) => [...prev, ...Array.from(files)]);
    // reset input value to allow same file selection again
    e.currentTarget.value = "";
  }

  // submit new update (create object URLs for photos)
  async function handleSubmitUpdate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!formDesc.trim()) {
      alert("Please provide a short description for the update.");
      return;
    }
    setIsSubmitting(true);
    try {
      // create object URLs for files + optionally upload to server
      const urls = formFiles.map((f) => URL.createObjectURL(f));
      const newUpdate: Update = {
        id: Date.now(),
        date: new Date().toISOString().split("T")[0],
        status: formStatus,
        description: formDesc.trim(),
        photos: urls,
        comments: [],
      };
      // insert at top
      setUpdates((u) => [newUpdate, ...u]);
      // clear form
      setFormDesc("");
      setFormFiles([]);
      setFormStatus(STATUS_STEPS[0]);
    } catch (err) {
      console.error(err);
      alert("Failed to add update.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // add comment to update
  function addComment(updateId: number, text: string) {
    if (!text.trim()) return;
    setUpdates((prev) =>
      prev.map((u) =>
        u.id === updateId
          ? {
              ...u,
              comments: [
                ...(u.comments ?? []),
                {
                  id: Date.now(),
                  text: text.trim(),
                  date: new Date().toISOString().split("T")[0],
                },
              ],
            }
          : u
      )
    );
  }

  // cleanup created object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      updates.forEach((u) =>
        u.photos.forEach((p) => {
          try {
            if (p.startsWith("blob:")) URL.revokeObjectURL(p);
          } catch {}
        })
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keyboard handling for lightbox (Esc to close, arrows to nav)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!lightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, lightboxImages.length]);

  /* -------------------- Filtering -------------------- */
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
    <CustomerDashboardLayout>
      <motion.main
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-900"
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-5 px-4 sm:px-6 md:px-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
          {/* Left Section (Title + Project ID) */}
          <div className="text-center md:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center justify-center md:justify-start gap-2 sm:gap-3">
              <Play className="text-white w-5 h-5 sm:w-6 sm:h-6" /> Job Progress
            </h1>
            <div className="text-xs sm:text-sm text-green-100 mt-1">
              Project ID: <span className="font-medium">{id}</span>
            </div>
          </div>

          {/* Right Section (Progress Info + Bar) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center md:justify-end gap-3 sm:gap-6 w-full md:w-auto">
            {/* Progress Text */}
            <div className="text-center sm:text-right">
              <div className="text-xs sm:text-sm text-green-100">Progress</div>
              <div className="font-semibold text-lg sm:text-xl">
                {progressPercent}%
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-40 md:w-56 bg-white/10 rounded-full h-3 overflow-hidden mx-auto sm:mx-0">
              <div
                className="h-3 bg-gradient-to-r from-blue-400 to-green-400 transition-all"
                style={{ width: `${progressPercent}%` }}
                aria-hidden
              />
            </div>
          </div>
        </header>

        <section className=" my-10 space-y-8">
          {/* Controls: Search / Filter / Add Update CTA */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  aria-label="Search updates"
                  placeholder="Search updates, descriptions, comments..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full md:w-[420px] pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:border focus:border-green-400 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="rounded-lg border border-gray-300 focus:border focus:border-green-400 outline-none px-3 py-2"
                >
                  <option value="all">All updates</option>
                  <option value="withPhotos">With photos</option>
                  <option value="withComments">With comments</option>
                </select>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 focus:border focus:border-green-400 outline-none px-3 py-2"
                >
                  <option value="all">All statuses</option>
                  {STATUS_STEPS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // scroll to add-update form
                  const el = document.getElementById("add-update-form");
                  if (el)
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
              >
                <PlusCircle /> Add Update
              </button>
            </div>
          </div>

          {/* Timeline + list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: timeline summary */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl p-4 shadow"
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock /> Timeline
              </h3>
              <ol className="space-y-3">
                {STATUS_STEPS.map((s, idx) => {
                  // check if any update with this status exists
                  const done = updates.some((u) => u.status === s);
                  const stepPercent = Math.round(
                    (idx / (STATUS_STEPS.length - 1)) * 100
                  );
                  return (
                    <li key={s} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          done
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-medium">{s}</div>
                        <div className="text-xs text-gray-500">
                          {done ? `${stepPercent}% reached` : "Not yet"}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </motion.div>

            {/* Middle column: updates list */}
            <div className="lg:col-span-2 space-y-6">
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white p-6 rounded-2xl shadow text-center text-gray-600"
                >
                  No updates found. Add a new update or clear filters.
                </motion.div>
              ) : (
                filtered.map((u) => (
                  <motion.article
                    key={u.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="bg-white rounded-2xl p-6 shadow"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="w-full sm:w-auto">
                        <div className="text-sm text-gray-500">{u.date}</div>
                        <h4 className="text-lg font-semibold text-green-700">
                          {u.status}
                        </h4>
                        <p className="text-gray-700 mt-2">{u.description}</p>

                        {/* comments */}
                        <div className="mt-3 space-y-2">
                          {(u.comments ?? []).map((c) => (
                            <div
                              key={c.id}
                              className="bg-gray-50 p-2 rounded-md text-sm"
                            >
                              <div className="text-xs text-gray-500">
                                {c.date}
                              </div>
                              <div>{c.text}</div>
                            </div>
                          ))}

                          <CommentBox
                            onSubmit={(text) => addComment(u.id, text)}
                          />
                        </div>
                      </div>

                      <div className="flex md:flex-row flex-col items-start md:items-end gap-3 w-full sm:w-auto justify-between">
                        <div className="flex  items-center gap-2">
                          <button
                            title="Open gallery"
                            onClick={() => openLightbox(u.photos, 0)}
                            disabled={u.photos.length === 0}
                            className="inline-flex cursor-pointer items-center gap-2 px-3 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                          >
                            <Image /> {u.photos.length}
                          </button>

                          <button
                            onClick={() => {
                              // quick download all photos as separate downloads
                              u.photos.forEach((p, idx) =>
                                downloadImage(
                                  p,
                                  `job-${id}-update-${u.id}-${idx + 1}.jpg`
                                )
                              );
                            }}
                            className="inline-flex cursor-pointer items-center gap-2 px-3 py-1 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100"
                            title="Download photos"
                          >
                            <Download /> Save
                          </button>
                        </div>

                        <div className="text-xs text-gray-400 sm:text-right text-left w-full sm:w-auto">
                          Update ID: {u.id}
                        </div>
                      </div>
                    </div>

                    {/* photos preview */}
                    {u.photos.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 md::grid-cols-3 gap-3">
                        {u.photos.map((p, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.03 }}
                            className="rounded-lg overflow-hidden border border-gray-300"
                          >
                            <img
                              src={p}
                              alt={`Update photo ${i + 1}`}
                              onClick={() => openLightbox(u.photos, i)}
                              className="w-full h-36 object-cover cursor-pointer"
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.article>
                ))
              )}
            </div>
          </div>

          {/* Add update form */}
          <motion.div
            id="add-update-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-6 shadow"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PlusCircle /> Add Update
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitUpdate();
              }}
              className="mt-4 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="md:col-span-2 border border-gray-300 focus:border focus:border-green-400 outline-none rounded-lg px-3 py-2"
                >
                  {STATUS_STEPS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="images"
                    className="w-full inline-flex items-center gap-2 justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50"
                  >
                    <Camera /> Upload Photos
                  </label>
                  <input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFiles}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Short description of update..."
                  className="w-full border border-gray-300 focus:border focus:border-green-400 outline-none rounded-lg px-3 py-2 min-h-[100px]"
                />
              </div>

              {formFiles.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {formFiles.map((f, idx) => {
                    const url = URL.createObjectURL(f);
                    return (
                      <div
                        key={idx}
                        className="w-28 h-20 rounded overflow-hidden relative border border-gray-300"
                      >
                        <img
                          src={url}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          title="Remove"
                          onClick={() => {
                            setFormFiles((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                            URL.revokeObjectURL(url);
                          }}
                          className="absolute cursor-pointer top-1 right-1 bg-white/80 rounded-full p-0.5 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex cursor-pointer items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
                >
                  <PlusCircle /> {isSubmitting ? "Adding..." : "Add Update"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormDesc("");
                    setFormFiles([]);
                    setFormStatus(STATUS_STEPS[0]);
                  }}
                  className="px-3 py-2 cursor-pointer rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </form>
          </motion.div>
        </section>

        {/* Lightbox modal */}
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            >
              <div
                ref={lightboxRef}
                className="relative max-w-4xl w-full max-h-full"
              >
                <button
                  aria-label="Close"
                  onClick={closeLightbox}
                  className="absolute top-2 right-2 p-2 bg-white cursor-pointer rounded-full"
                >
                  <X />
                </button>

                <motion.img
                  key={lightboxImages[lightboxIndex]}
                  initial={{ scale: 0.98 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.98 }}
                  src={lightboxImages[lightboxIndex]}
                  alt="Photo"
                  className="max-h-[80vh] w-auto mx-auto rounded-md object-contain"
                />

                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <button
                    onClick={prevLightbox}
                    className="p-2 bg-white/90 cursor-pointer rounded-full shadow"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M15 18l-6-6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                  <button
                    onClick={nextLightbox}
                    className="p-2 cursor-pointer bg-white/90 rounded-full shadow"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      downloadImage(
                        lightboxImages[lightboxIndex],
                        `job-${id}-photo-${lightboxIndex + 1}.jpg`
                      )
                    }
                    className="p-2 cursor-pointer bg-white/90 rounded-full shadow mt-2"
                  >
                    <Download />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="bg-white text-gray-500 text-center py-6 border-t border-gray-300">
          © {new Date().getFullYear()} Roof Estimate CRM. All rights reserved.
        </footer>
      </motion.main>
    </CustomerDashboardLayout>
  );
}

/* -------------------- CommentBox child -------------------- */
function CommentBox({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(text);
        setText("");
      }}
      className="mt-2 flex gap-2"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 border border-gray-300 focus:border focus:border-green-400 outline-none rounded-lg px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="px-3 cursor-pointer py-2 bg-blue-600 text-white rounded-lg text-sm"
      >
        <MessageSquare />
      </button>
    </form>
  );
}
