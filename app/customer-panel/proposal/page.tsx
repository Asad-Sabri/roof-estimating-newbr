"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/app/page"; // <-- update if your layout is elsewhere
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  MapPin,
  Smile,
  Trash2,
  Download,
  Check,
  X,
} from "lucide-react";
import { jsPDF } from "jspdf";
import CustomerDashboardLayout from "@/app/dashboard/customer/page";

/**
 * Proposal Page (Professional + Functional)
 *
 * - Signature canvas built with native canvas APIs
 * - Captures name, signature, date/time, userAgent, and public IP (fetch)
 * - Generates downloadable signed PDF via jsPDF
 * - Persists signed state locally (localStorage) so user sees confirmation
 * - Responsive + animated UI
 */

/* --------------------- Types --------------------- */
type SignedRecord = {
  name: string;
  signatureDataUrl: string; // base64 image
  timestamp: string;
  userAgent: string;
  ip?: string;
};

/* --------------------- SignaturePad component --------------------- */
/* Small, robust canvas signature pad using pointer events */
function SignaturePad({
  width = 800,
  height = 200,
  className,
  onChange,
}: {
  width?: number;
  height?: number;
  className?: string;
  onChange?: (hasStroke: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const hasStrokeRef = useRef(false);
  const undoStackRef = useRef<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = width * (window.devicePixelRatio || 1);
    canvas.height = height * (window.devicePixelRatio || 1);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0f172a"; // slate-900
    ctxRef.current = ctx;

    // clear initially
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [width, height]);

  function pointerToLocal(e: PointerEvent | MouseEvent | Touch) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    // pointer events use clientX/clientY
    const clientX = (e as PointerEvent).clientX ?? (e as MouseEvent).clientX;
    const clientY = (e as PointerEvent).clientY ?? (e as MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function handlePointerDown(e: PointerEvent) {
    e.preventDefault();
    const ctx = ctxRef.current!;
    undoStackRef.current.push(
      ctx.getImageData(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      )
    );
    drawingRef.current = true;
    const p = pointerToLocal(e);
    lastPointRef.current = p;
    hasStrokeRef.current = true;
    onChange?.(true);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!drawingRef.current) return;
    const ctx = ctxRef.current!;
    const p = pointerToLocal(e);
    const last = lastPointRef.current!;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPointRef.current = p;
  }

  function handlePointerUp() {
    drawingRef.current = false;
    lastPointRef.current = null;
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    // use pointer events (works for mouse + touch + stylus)
    canvas.addEventListener("pointerdown", handlePointerDown as any);
    window.addEventListener("pointermove", handlePointerMove as any);
    window.addEventListener("pointerup", handlePointerUp as any);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown as any);
      window.removeEventListener("pointermove", handlePointerMove as any);
      window.removeEventListener("pointerup", handlePointerUp as any);
    };
  }, []);

  function clear() {
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStrokeRef.current = false;
    undoStackRef.current = [];
    onChange?.(false);
  }

  function undo() {
    if (!undoStackRef.current.length) return;
    const img = undoStackRef.current.pop()!;
    ctxRef.current!.putImageData(img, 0, 0);
    // determine if canvas empty by checking non-transparent pixel
    onChange?.(true);
  }

  function toDataUrl(type = "image/png", quality = 0.92) {
    return canvasRef.current!.toDataURL(type, quality);
  }

  return (
    <div
      className={`rounded-md border border-gray-300 hover:border-green-400 focus:border focus:border-green-400 outline-none ${
        className ?? ""
      } overflow-hidden`}
    >
      <canvas
        ref={canvasRef}
        className="block w-full"
        style={{ background: "white", touchAction: "none" }}
      />
      <div className="flex gap-2 p-2 bg-gray-50">
        <button
          type="button"
          onClick={clear}
          className="inline-flex cursor-pointer items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
          aria-label="Clear signature"
        >
          <Trash2 size={14} /> Clear
        </button>

        <button
          type="button"
          onClick={undo}
          className="inline-flex cursor-pointer items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
          aria-label="Undo"
        >
          Undo
        </button>

        <div className="ml-auto text-xs text-gray-500">
          Sign with finger or stylus
        </div>
      </div>
    </div>
  );
}

/* --------------------- Page Component --------------------- */
export default function ProposalPage() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [signedRecord, setSignedRecord] = useState<SignedRecord | null>(null);
  const signaturePadRef = useRef<{ toDataUrl: () => string } | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [ip, setIp] = useState<string | undefined>(undefined);
  const proposalTitle = `Roofing Proposal #${id}`;
  const dobj = new Date();

  // load any saved signature record from localStorage
  useEffect(() => {
    const key = `proposal-signed-${id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed: SignedRecord = JSON.parse(saved);
        setSignedRecord(parsed);
      } catch (e) {
        // ignore
      }
    }
  }, [id]);

  // fetch public IP (best-effort)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setIp(data.ip);
        }
      } catch (e) {
        // network / cors may block; leave ip undefined
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // helper: store record to localStorage
  function persistSignedRecord(rec: SignedRecord) {
    try {
      localStorage.setItem(`proposal-signed-${id}`, JSON.stringify(rec));
    } catch {
      // ignore storage errors
    }
  }

  // handle sign action: capture canvas image, metadata, save local + create PDF
  async function handleSign(signatureDataUrl: string | null) {
    if (!name.trim()) {
      alert("Please enter your full name before signing.");
      return;
    }
    if (!signatureDataUrl) {
      alert("Please provide a signature before signing.");
      return;
    }

    setIsSigning(true);
    try {
      const timestamp = new Date().toISOString();
      const userAgent =
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown";

      const rec: SignedRecord = {
        name: name.trim(),
        signatureDataUrl,
        timestamp,
        userAgent,
        ip,
      };

      // persist locally
      persistSignedRecord(rec);
      setSignedRecord(rec);

      // generate PDF and auto-download
      await generateSignedPdf(rec);

      // optionally: call backend API to store signed record (not implemented)
      // await fetch('/api/proposals/sign', { method: 'POST', body: JSON.stringify({ id, ...rec }) });

      alert("Signed successfully. A signed PDF has been downloaded.");
    } catch (err) {
      console.error(err);
      alert("An error occurred while signing. Check console.");
    } finally {
      setIsSigning(false);
    }
  }

  // client-side PDF using jsPDF
  async function generateSignedPdf(rec: SignedRecord) {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 40;
    const contentW = pageW - margin * 2;

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(proposalTitle, margin, 60);

    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.setFont("helvetica", "normal");
    doc.text(`Proposal ID: ${id}`, margin, 85);
    doc.text(`Date: ${new Date(rec.timestamp).toLocaleString()}`, margin, 100);

    // Add sample proposal content (you'd use actual data)
    const bodyStartY = 130;
    doc.setFontSize(11);
    const paragraph = [
      "Scope of Work:",
      "- Full roof replacement with architectural shingles.",
      "- Removal of existing roofing materials and disposal.",
      "- Replace drip edge, underlayment, and install new ridge vents.",
      "- 10-year workmanship warranty.",
      "",
      "Total: $12,500.00",
      "",
      "Terms: 30% down payment, progress payment on completion of 50%, final payment at sign-off.",
    ].join("\n");

    const splitBody = doc.splitTextToSize(paragraph, contentW);
    doc.text(splitBody, margin, bodyStartY);

    // Signature block area
    const sigY = bodyStartY + splitBody.length * 14 + 30;
    doc.setFontSize(12);
    doc.text("Signed by:", margin, sigY);
    doc.text(`Name: ${rec.name}`, margin, sigY + 16);
    doc.text(
      `Date: ${new Date(rec.timestamp).toLocaleString()}`,
      margin,
      sigY + 32
    );
    doc.text(`Device: ${rec.userAgent}`, margin, sigY + 48);
    if (rec.ip) doc.text(`IP: ${rec.ip}`, margin, sigY + 64);

    // place signature image to the right
    try {
      const img = rec.signatureDataUrl;
      // calculate width/height that fits
      const imgProps = await new Promise<{ w: number; h: number }>(
        (resolve) => {
          const i = new Image();
          i.onload = () => resolve({ w: i.width, h: i.height });
          i.src = img;
        }
      );

      const maxW = 180;
      const ratio = imgProps.w / imgProps.h;
      const drawW = Math.min(maxW, imgProps.w);
      const drawH = drawW / ratio;

      doc.addImage(
        rec.signatureDataUrl,
        "PNG",
        pageW - margin - drawW,
        sigY - 10,
        drawW,
        drawH
      );
    } catch (e) {
      // ignore image errors
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      "Roof Estimate CRM — Signed document",
      margin,
      doc.internal.pageSize.getHeight() - 30
    );

    // Save PDF
    const fileName = `proposal-${id}-signed.pdf`;
    doc.save(fileName);
  }

  // helper to get signature from canvas child via DOM (we created SignaturePad above, but here we rely on built-in canvas usage)
  // We'll create a ref to the canvas using document querySelector (easier inside this single-file).
  // In this implementation we will render the <canvas> directly and capture it via toDataURL when Sign clicked.

  // Instead of a separate child ref, we'll store signature data URL when signature changes.
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);

  // We'll implement a small canvas inside this component for simplicity instead of the separate SignaturePad component above.
  // But since we already have SignaturePad above, we'll create a ref to it using an id.
  // For simplicity, render the SignaturePad and when user clicks "Sign" we query for the first canvas inside .signature-area and call toDataURL.

  // function to extract dataUrl from canvas inside .signature-area wrapper
  function readSignatureDataUrl(): string | null {
    const wrapper = document.querySelector<HTMLDivElement>(".signature-area");
    if (!wrapper) return null;
    const canvas = wrapper.querySelector<HTMLCanvasElement>("canvas");
    if (!canvas) return null;
    try {
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  }

  // decline action (user cancels)
  function handleDecline() {
    if (!confirm("Are you sure you want to decline this proposal?")) return;
    // you could post to server here. For now we mark locally as declined
    localStorage.setItem(
      `proposal-declined-${id}`,
      JSON.stringify({ date: new Date().toISOString() })
    );
    alert("Proposal declined.");
  }

  // If already signed, show signed block and a download button
  async function handleDownloadExisting() {
    if (!signedRecord) {
      alert("No signed record found.");
      return;
    }
    // generate PDF again from stored record
    await generateSignedPdf(signedRecord);
  }

  return (
    <CustomerDashboardLayout>
      <motion.main
        className="text-gray-900 flex flex-col"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Header */}
        <header className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 px-4 md:px-8 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <FileText /> Roof Estimate Proposal
            </h1>
            <p className="text-sm text-green-100 mt-1">
              Proposal ID: <span className="font-medium">{id}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-green-100 flex items-center gap-2">
              <Clock /> {new Date().toLocaleDateString()}
            </div>
            <div className="text-xs text-green-100 flex items-center gap-2">
              <MapPin /> {ip ?? "IP unknown"}
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="flex-1 my-10  w-full space-y-6">
          {/* Proposal Card */}
          <motion.div
            className="bg-white shadow-lg rounded-2xl p-4 md:p-10"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h2 className="md:text-3xl font-bold mb-2">
                  {proposalTitle}
                </h2>
                <p className="text-gray-600 leading-relaxed max-w-2xl">
                  Thank you for considering our roofing services. Please review
                  the scope, pricing, and terms below. Sign at the bottom to
                  accept.
                </p>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">Status</div>
                <div className="mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                  Pending
                </div>
                <div className="mt-3 text-sm text-gray-400">
                  Total: <span className="font-semibold">$12,500.00</span>
                </div>
              </div>
            </div>

            {/* Proposal Items */}
            <div className="mt-6 border border-gray-300 rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Scope & Line Items</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base">
                <li>Remove existing roof system and dispose.</li>
                <li>
                  Install new architectural shingles (IKO/Atlas equivalent).
                </li>
                <li>Install new underlayment, flashing, and ridge vents.</li>
                <li>10-year workmanship warranty.</li>
              </ul>
            </div>

            <div className="mt-6 text-sm text-gray-600">
              <strong>Terms:</strong> 30% down payment to schedule work,
              progress payment at 50% completion, final balance due at final
              inspection and sign-off.
            </div>
          </motion.div>

          {/* Signature / Acceptance Area */}
          <motion.div
            className="bg-white rounded-2xl p-4 md:p-6 shadow-md"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.06 }}
          >
            {!signedRecord ? (
              <>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileSignatureIconPlaceholder /> Sign & Accept
                </h3>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full border border-gray-300 focus:border focus:border-green-400 outline-none rounded-lg px-3 py-2 "
                    />

                    <div className="mt-4 signature-area">
                      {/* SignaturePad component instance */}
                      <SignaturePad
                        width={800}
                        height={160}
                        onChange={(has) => {
                          setHasSignature(has);
                          if (has) {
                            // capture current signature preview (not full fidelity)
                            const wrapper =
                              document.querySelector<HTMLDivElement>(
                                ".signature-area"
                              );
                            const canvas =
                              wrapper?.querySelector<HTMLCanvasElement>(
                                "canvas"
                              );
                            if (canvas) {
                              setCapturedDataUrl(canvas.toDataURL("image/png"));
                            }
                          }
                        }}
                      />
                    </div>

                    <div className="mt-3 flex items-center flex-col md:flex-row gap-3">
                      <button
                        onClick={async () => {
                          // read latest signature from canvas
                          const url = readSignatureDataUrl();
                          if (!url) return alert("Please sign first.");
                          await handleSign(url);
                        }}
                        disabled={isSigning}
                        className="inline-flex w-full md:w-fit cursor-pointer items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
                        aria-label="Sign proposal"
                      >
                        <Check size={16} />{" "}
                        {isSigning ? "Signing..." : "Sign & Download"}
                      </button>

                      <button
                        onClick={handleDecline}
                        className="inline-flex w-full md:w-fit cursor-pointer items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                      >
                        <X size={14} /> Decline
                      </button>

                      <button
                        onClick={() => {
                          // preview PDF (generate signed PDF with placeholder data if no signature yet)
                          const url = readSignatureDataUrl();
                          if (!url) {
                            alert(
                              "Please sign (or capture signature) to generate a signed PDF preview."
                            );
                            return;
                          }
                          // generate pdf from current signature without persisting
                          const tempRec: SignedRecord = {
                            name: name || "Signer",
                            signatureDataUrl: url,
                            timestamp: new Date().toISOString(),
                            userAgent: navigator.userAgent,
                            ip,
                          };
                          generateSignedPdf(tempRec);
                        }}
                        className="inline-flex w-full md:w-fit cursor-pointer items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                      >
                        <Download size={14} /> Preview PDF
                      </button>
                    </div>
                  </div>

                  <aside className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                    <div className="font-medium mb-2">What we capture</div>
                    <ul className="list-inside list-disc space-y-1">
                      <li>Full name</li>
                      <li>Signature image</li>
                      <li>Timestamp & timezone</li>
                      <li>Device (user-agent) & public IP (if available)</li>
                      <li>Signed PDF download</li>
                    </ul>
                    <div className="mt-3 text-xs text-gray-500">
                      A signed copy will be generated and downloaded to your
                      device. Backend saving/integration is optional and can be
                      wired to an API endpoint.
                    </div>
                  </aside>
                </div>
              </>
            ) : (
              // Signed view
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-block"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-50 text-green-700 font-medium">
                    <Check size={16} /> Signed Successfully
                  </div>
                </motion.div>

                <div className="mt-2">
                  <div className="text-sm text-gray-600">Signed by</div>
                  <div className="text-lg font-semibold">
                    {signedRecord.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(signedRecord.timestamp).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Device: {signedRecord.userAgent}
                  </div>
                  <div className="text-xs text-gray-400">
                    IP: {signedRecord.ip ?? "unknown"}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 mt-3">
                  <button
                    onClick={handleDownloadExisting}
                    className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download size={14} /> Download Signed PDF
                  </button>

                  <button
                    onClick={() => {
                      // allow re-sign: remove local record
                      if (!confirm("Remove signed record and allow re-sign?"))
                        return;
                      localStorage.removeItem(`proposal-signed-${id}`);
                      setSignedRecord(null);
                      setName("");
                    }}
                    className="inline-flex cursor-pointer items-center gap-2 px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="bg-white text-gray-500 text-center py-6 border-t border-gray-300">
          © {new Date().getFullYear()} Roof Estimate CRM. All rights reserved.
        </footer>
      </motion.main>
    </CustomerDashboardLayout>
  );
}

/* --------------------- Helper placeholder icon component --------------------- */
/* lucide-react doesn't include FileSignature easily in all versions; provide a small inline placeholder using svg */
function FileSignatureIconPlaceholder() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="text-gray-700"
    >
      <path
        d="M21 15v4a1 1 0 0 1-1 1h-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 7h18M3 11h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 21s1-4 4-4 4 4 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
