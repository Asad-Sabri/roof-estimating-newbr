"use client";

import DashboardLayout from "@/app/page"; // update if your layout lives elsewhere
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard as CreditCardIcon,
  Check,
  Loader2,
  Download,
  Wallet,
  Calendar,
  Lock,
} from "lucide-react";
import jsPDF from "jspdf"; // default import
import CustomerDashboardLayout from "@/app/dashboard/customer/page";

/* --------------------------- Types --------------------------- */
interface PaymentForm {
  cardNumber: string;
  expiry: string;
  cvc: string;
  name: string;
  saveCard?: boolean;
}

/* -------------------- Utility helpers ------------------------ */
// Remove non-digits
const onlyDigits = (s: string) => s.replace(/\D/g, "");

// Format card number as XXXX XXXX XXXX XXXX (works with up to 19 digits)
function formatCardNumber(input: string) {
  const digits = onlyDigits(input).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

// Format expiry as MM/YY
function formatExpiry(input: string) {
  const digits = onlyDigits(input).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

// Basic Luhn check
function luhnCheck(cardNumber: string) {
  const digits = onlyDigits(cardNumber);
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      d = d * 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0 && digits.length >= 12;
}

// detect basic card brand (visa, mastercard, amex)
function detectCardBrand(cardNumber: string) {
  const d = onlyDigits(cardNumber);
  if (/^4/.test(d)) return "visa";
  if (/^5[1-5]/.test(d) || /^2(2|[3-6]|7[01])/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  return "unknown";
}

// simple expiry validation
function validateExpiry(expiry: string) {
  const [m, y] = expiry.split("/").map((s) => parseInt(s, 10));
  if (!m || !y || m < 1 || m > 12) return false;
  const fullYear = y < 100 ? 2000 + y : y;
  const now = new Date();
  const expDate = new Date(fullYear, m, 0, 23, 59, 59);
  return expDate >= now;
}

/* -------------------- Component ------------------------------ */
export default function PaymentPage() {
  const { id } = useParams();
  const invoiceId = id ?? "unknown";

  const [form, setForm] = useState<PaymentForm>({
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: "",
    saveCard: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [savedReceipt, setSavedReceipt] = useState<any | null>(null);
  const [cardBrand, setCardBrand] = useState<string>("unknown");

  const totalDue = useMemo(() => 5200.0, []); // example amount - replace with real data

  // load saved card info (demo) - optional
  useEffect(() => {
    const saved = localStorage.getItem("savedCard_demo");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm((f) => ({ ...f, name: parsed.name }));
      } catch {}
    }
  }, []);

  // format card number live & detect brand
  useEffect(() => {
    setCardBrand(detectCardBrand(form.cardNumber));
  }, [form.cardNumber]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    if (name === "cardNumber") {
      setForm((f) => ({ ...f, cardNumber: formatCardNumber(value) }));
      setErrors((s) => ({ ...s, cardNumber: "" }));
      return;
    }
    if (name === "expiry") {
      setForm((f) => ({ ...f, expiry: formatExpiry(value) }));
      setErrors((s) => ({ ...s, expiry: "" }));
      return;
    }
    if (name === "cvc") {
      const digits = onlyDigits(value).slice(0, 4); // allow up to 4 for AMEX
      setForm((f) => ({ ...f, cvc: digits }));
      setErrors((s) => ({ ...s, cvc: "" }));
      return;
    }
    if (name === "saveCard") {
      setForm((f) => ({ ...f, saveCard: (e.target as HTMLInputElement).checked }));
      return;
    }

    setForm((f) => ({ ...f, [name]: value }));
    setErrors((s) => ({ ...s, [name]: "" }));
  }

  function validateForm() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Cardholder name is required.";
    if (!onlyDigits(form.cardNumber) || onlyDigits(form.cardNumber).length < 12)
      errs.cardNumber = "Please enter a valid card number.";
    else if (!luhnCheck(form.cardNumber)) errs.cardNumber = "Card number looks invalid.";
    if (!form.expiry || !validateExpiry(form.expiry)) errs.expiry = "Invalid expiry date.";
    if (!form.cvc || !/^\d{3,4}$/.test(form.cvc)) errs.cvc = "Invalid CVC.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (processing) return;
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setProcessing(true);
    setErrors({});
    // simulate payment processing delay
    await new Promise((res) => setTimeout(res, 1200));

    // Simulated success/failure logic - make success most of the time
    const success = Math.random() > 0.05;

    if (!success) {
      setProcessing(false);
      setErrors({ form: "Payment failed. Please try another card or contact support." });
      return;
    }

    // build receipt
    const timestamp = new Date().toISOString();
    const receipt = {
      invoiceId,
      amount: totalDue,
      date: new Date().toLocaleString(),
      cardLast4: onlyDigits(form.cardNumber).slice(-4),
      name: form.name,
      id: `RECEIPT-${Date.now()}`,
      status: "Paid",
      timestamp,
    };

    // save to localStorage (demo)
    try {
      const existing = JSON.parse(localStorage.getItem("payments_demo") || "[]");
      existing.unshift(receipt);
      localStorage.setItem("payments_demo", JSON.stringify(existing));
    } catch {}

    if (form.saveCard) {
      localStorage.setItem(
        "savedCard_demo",
        JSON.stringify({ name: form.name, last4: onlyDigits(form.cardNumber).slice(-4) })
      );
    }

    setSavedReceipt(receipt);
    setPaid(true);
    setProcessing(false);

    // Auto-generate receipt PDF and download
    generateReceiptPdf(receipt).catch(console.error);
  }

  // client-side PDF via jsPDF
  async function generateReceiptPdf(receipt: any) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const left = 40;
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Receipt", left, 60);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Receipt ID: ${receipt.id}`, left, 90);
    doc.text(`Invoice ID: ${receipt.invoiceId}`, left, 110);
    doc.text(`Date: ${receipt.date}`, left, 130);
    doc.text(`Paid By: ${receipt.name}`, left, 150);
    doc.text(`Card (Last4): ${receipt.cardLast4}`, left, 170);
    doc.text(`Amount: $${Number(receipt.amount).toLocaleString()}`, left, 190);
    doc.text(`Status: ${receipt.status}`, left, 210);

    doc.setFontSize(10);
    doc.setTextColor(110);
    doc.text(
      "Thank you for your payment. This receipt confirms your payment for the roofing service. Keep it for your records.",
      left,
      250,
      { maxWidth: 520 }
    );

    doc.save(`receipt-${receipt.id}.pdf`);
  }

  // Quick helper to download last saved receipt if exists
  function downloadLastReceipt() {
    const saved = JSON.parse(localStorage.getItem("payments_demo") || "[]");
    if (!saved.length) return alert("No receipts found.");
    generateReceiptPdf(saved[0]);
  }

  /* ---------------- UI ---------------- */
  return (
    <CustomerDashboardLayout>
      <motion.main
        className="flex flex-col text-gray-900"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 px-6 md:px-12 flex flex-col md:flex-row justify-between text-center md:text-start items-center gap-3">
          <div>
            <h1 className="md:text-2xl font-bold flex items-center gap-3">
              <CreditCardIcon /> Roof Estimate Payment
            </h1>
            <p className="text-sm text-green-100 mt-1">Invoice ID: <span className="font-medium">{invoiceId}</span></p>
          </div>

          <div className="text-right">
            <div className="text-sm text-green-100">Total Due</div>
            <div className="text-2xl font-semibold">${totalDue.toLocaleString()}</div>
          </div>
        </header>

        {/* Content */}
        <section className="flex-1 my-10 flex justify-center">
          <motion.div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 md:p-8"
            initial={{ scale: 0.995, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            {!paid ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                <p className="text-sm text-gray-600 mb-6">Securely enter your card details below. (Demo mode — no real charge)</p>

                {errors.form && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{errors.form}</div>
                )}

                {/* Invoice small info */}
                <div className="mb-4 p-4 bg-gray-50 rounded-md text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <div>Due Date</div>
                    <div className="font-medium">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Cardholder */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`mt-1 w-full border border-gray-300 focus:border focus:border-green-400 outline-none rounded-lg px-3 py-2  ${errors.name ? "border-red-300" : "border-gray-200"}`}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "err-name" : undefined}
                    />
                    {errors.name && <p id="err-name" className="mt-1 text-xs text-red-600">{errors.name}</p>}
                  </div>

                  {/* Card number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Card Number</label>
                    <div className="mt-1 relative">
                      <input
                        name="cardNumber"
                        value={form.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        className={`w-full border border-gray-300 focus:border focus:border-green-400 outline-none rounded-lg px-3 py-2 pr-28  ${errors.cardNumber ? "border-red-300" : "border-gray-200"}`}
                        aria-invalid={Boolean(errors.cardNumber)}
                        aria-describedby={errors.cardNumber ? "err-card" : undefined}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 flex items-center gap-2">
                        <span className="capitalize px-2 py-1 rounded-md bg-gray-100 text-gray-700">{cardBrand}</span>
                      </div>
                    </div>
                    {errors.cardNumber && <p id="err-card" className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>}
                  </div>

                  {/* expiry & cvc */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expiry (MM/YY)</label>
                      <div className="mt-1">
                        <input
                          name="expiry"
                          value={form.expiry}
                          onChange={handleChange}
                          placeholder="MM/YY"
                          className={`w-full border border-gray-300 focus:border focus:border-green-400 outline-none rounded-lg px-3 py-2  ${errors.expiry ? "border-red-300" : "border-gray-200"}`}
                          aria-invalid={Boolean(errors.expiry)}
                          aria-describedby={errors.expiry ? "err-exp" : undefined}
                        />
                      </div>
                      {errors.expiry && <p id="err-exp" className="mt-1 text-xs text-red-600">{errors.expiry}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">CVC</label>
                      <div className="mt-1">
                        <input
                          name="cvc"
                          value={form.cvc}
                          onChange={handleChange}
                          placeholder="123"
                          className={`w-full border border-gray-300 focus:border focus:border-green-400 outline-none rounded-lg px-3 py-2  ${errors.cvc ? "border-red-300" : "border-gray-200"}`}
                          aria-invalid={Boolean(errors.cvc)}
                          aria-describedby={errors.cvc ? "err-cvc" : undefined}
                        />
                      </div>
                      {errors.cvc && <p id="err-cvc" className="mt-1 text-xs text-red-600">{errors.cvc}</p>}
                    </div>
                  </div>

                  {/* Save card */}
                  <div className="flex items-center gap-2">
                    <input id="saveCard" name="saveCard" type="checkbox" checked={!!form.saveCard} onChange={handleChange} className="w-4 h-4" />
                    <label htmlFor="saveCard" className="text-sm text-gray-700">Save card for future payments (demo)</label>
                  </div>

                  {/* Submit */}
                  <div>
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full cursor-pointer inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md disabled:opacity-60"
                      aria-busy={processing}
                    >
                      {processing ? <Loader2 className="animate-spin" /> : <Wallet />}
                      {processing ? "Processing..." : `Pay $${totalDue.toLocaleString()}`}
                    </button>
                  </div>
                </form>

                {/* small note + test card info */}
                <div className="mt-4 text-xs text-gray-500">
                  <div>Test card (demo): <span className="font-medium">4111 1111 1111 1111</span>, CVC <span className="font-medium">123</span>, Expiry any future date</div>
                  <div className="mt-2">To integrate a real gateway (Stripe, PayPal, etc.) replace the simulated logic in <code>handleSubmit</code> with a server-side payment call or Stripe Elements integration.</div>
                </div>
              </>
            ) : (
              // success
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-50 text-green-700 font-semibold">
                  <Check /> Payment Successful
                </div>

                <div className="mt-2">
                  <div className="text-sm text-gray-600">Receipt ID</div>
                  <div className="text-lg font-medium">{savedReceipt?.id}</div>

                  <div className="mt-2 text-sm text-gray-600">Amount</div>
                  <div className="text-lg font-semibold">${savedReceipt?.amount?.toLocaleString()}</div>

                  <div className="mt-2">
                    <button
                      onClick={() => downloadLastReceipt()}
                      className="inline-flex cursor-pointer items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Download /> Download Receipt
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="bg-white text-gray-500 text-center py-6 border-t">
          © {new Date().getFullYear()} Roof Estimate CRM. All rights reserved.
        </footer>
      </motion.main>
</CustomerDashboardLayout>
  );
}
