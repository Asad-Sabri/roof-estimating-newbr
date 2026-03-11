"use client";

import { useState, useEffect } from "react";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import {
  getCompanyForCustomerAPI,
  getSubscribersListAPI,
  subscribeAPI,
  unsubscribeAPI,
} from "@/services/companyAPI";
import { Building2, Phone, Mail, MapPin, User, Loader2, CheckCircle } from "lucide-react";

type SubscriberItem = {
  adminId: string;
  companyName?: string;
  company_name?: string;
  contactPersonName?: string;
  contact_person_name?: string;
  contactPersonPhone?: string;
  contact_person_phone?: string;
  contactPersonEmail?: string;
  contact_person_email?: string;
  address?: string | { street?: string; city?: string; state?: string; country?: string; zip_code?: string };
  email?: string;
  phone?: string;
  mobile_number?: string;
};

function formatAddress(addr: SubscriberItem["address"]): string {
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  const a = addr as Record<string, string>;
  return [a.street, a.city, a.state, a.country, a.zip_code].filter(Boolean).join(", ");
}

/** Normalize item from GET /api/company/subscribers (companyName, contactPersonName, contactPersonPhone, contactPersonEmail, address, adminId) */
function normalizeSubscriber(raw: any): SubscriberItem {
  const obj = raw && typeof raw === "object" ? raw : {};
  const adminId = obj.adminId ?? obj.admin_id ?? "";
  return {
    ...obj,
    adminId: String(adminId),
    companyName: obj.companyName ?? obj.company_name ?? "",
    contactPersonName: obj.contactPersonName ?? obj.contact_person_name ?? "",
    contactPersonPhone: obj.contactPersonPhone ?? obj.contact_person_phone ?? obj.mobile_number ?? obj.phone ?? "",
    contactPersonEmail: obj.contactPersonEmail ?? obj.contact_person_email ?? obj.email ?? "",
    address: obj.address,
  };
}

/** Extract adminId from GET /api/company/for-customer response (current subscriber) */
function getAdminIdFromForCustomer(res: any): string | null {
  const data = res?.data ?? res;
  const company = data?.company ?? data;
  const obj = company && typeof company === "object" ? company : data;
  if (!obj) return null;
  const id = obj.adminId ?? obj.admin_id ?? null;
  return id ? String(id) : null;
}

export default function SubscribersPage() {
  const [list, setList] = useState<SubscriberItem[]>([]);
  const [subscribedAdminId, setSubscribedAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    setMessage(null);
    getCompanyForCustomerAPI()
      .then((res: any) => {
        const adminId = getAdminIdFromForCustomer(res);
        if (adminId) setSubscribedAdminId(adminId);
        else setSubscribedAdminId(null);
      })
      .catch(() => setSubscribedAdminId(null));

    getSubscribersListAPI()
      .then((res: any) => {
        const data = res?.data ?? res;
        const arr = Array.isArray(data) ? data : data?.list ?? data?.companies ?? [];
        const normalized = (Array.isArray(arr) ? arr : []).map((item: any) => normalizeSubscriber(item));
        // Dedupe by adminId – sirf ek card per subscriber (API se same admin kabhi do baar aa sakta hai)
        const seen = new Set<string>();
        const items = normalized.filter((sub) => {
          if (!sub.adminId || seen.has(sub.adminId)) return false;
          seen.add(sub.adminId);
          return true;
        });
        setList(items);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = (adminId: string) => {
    setActionLoading(adminId);
    setMessage(null);
    subscribeAPI(adminId)
      .then(() => {
        setSubscribedAdminId(adminId);
        setMessage({ type: "success", text: "Subscribed. Report will show this company's details." });
      })
      .catch((err: any) => {
        setMessage({ type: "error", text: err?.message || "Subscribe failed." });
      })
      .finally(() => setActionLoading(null));
  };

  const handleUnsubscribe = () => {
    setActionLoading("unsubscribe");
    setMessage(null);
    unsubscribeAPI()
      .then(() => {
        setSubscribedAdminId(null);
        setMessage({ type: "success", text: "Unsubscribed." });
      })
      .catch((err: any) => {
        setMessage({ type: "error", text: err?.message || "Unsubscribe failed." });
      })
      .finally(() => setActionLoading(null));
  };

  return (
    <CustomerDashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Subscribers</h1>
        <p className="text-gray-600 mb-6">
          Choose a company to subscribe to. Your instant estimate report will show that company&apos;s details at the top.
        </p>

        {message && (
          <div
            className={`mb-4 px-4 py-2 rounded-lg ${
              message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            No subscribers available. When your admin adds companies, they will appear here.
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((sub) => {
              const isSubscribed = subscribedAdminId === sub.adminId;
              const name = sub.companyName || sub.company_name || "Company";
              const address = formatAddress(sub.address);
              const contactName = sub.contactPersonName || sub.contact_person_name || "";
              const contactPhone = sub.contactPersonPhone || sub.contact_person_phone || sub.phone || sub.mobile_number || "";
              const contactEmail = sub.contactPersonEmail || sub.contact_person_email || sub.email || "";

              return (
                <div
                  key={sub.adminId}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Building2 className="h-5 w-5 text-gray-500 shrink-0" />
                        <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
                        {isSubscribed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Subscribed
                          </span>
                        )}
                      </div>
                      {address && (
                        <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                          {address}
                        </p>
                      )}
                      {(contactName || contactPhone || contactEmail) && (
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                          {contactName && (
                            <span className="inline-flex items-center gap-1">
                              <User className="h-4 w-4 shrink-0" />
                              {contactName}
                            </span>
                          )}
                          {contactPhone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-4 w-4 shrink-0" />
                              {contactPhone}
                            </span>
                          )}
                          {contactEmail && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="h-4 w-4 shrink-0" />
                              {contactEmail}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex gap-2">
                      {isSubscribed ? (
                        <button
                          onClick={handleUnsubscribe}
                          disabled={!!actionLoading}
                          className="px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 flex items-center gap-2"
                        >
                          {actionLoading === "unsubscribe" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          Unsubscribe
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(sub.adminId)}
                          disabled={!!actionLoading}
                          className="px-4 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                          style={{ backgroundColor: "#8b0e0f" }}
                        >
                          {actionLoading === sub.adminId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          Subscribe
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CustomerDashboardLayout>
  );
}
