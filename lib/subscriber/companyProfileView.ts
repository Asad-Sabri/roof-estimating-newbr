/**
 * Normalize company payloads from GET /api/company/settings or GET /api/company/for-customer
 * into a single display shape for subscriber profile UIs.
 */
export type CompanyProfileView = {
  companyName: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
  addressLine: string;
  logoUrl?: string;
  accentHex?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
};

function formatAddressLine(addr: Record<string, unknown> | undefined): string {
  if (!addr || typeof addr !== "object") return "";
  const a = addr as Record<string, string | undefined>;
  return [a.street, a.city, a.state, a.country, a.zip_code].filter(Boolean).join(", ");
}

export function normalizeCompanyPayloadToView(raw: unknown): CompanyProfileView {
  const r =
    raw && typeof raw === "object"
      ? ((raw as Record<string, unknown>).data as Record<string, unknown>) ??
        (raw as Record<string, unknown>).settings ??
        raw
      : {};
  const o = (r && typeof r === "object" ? r : {}) as Record<string, unknown>;
  const address =
    o.address && typeof o.address === "object" ? (o.address as Record<string, unknown>) : undefined;
  const addressLine =
    formatAddressLine(address) ||
    String(o.addressLine ?? o.address_line ?? "").trim() ||
    "—";
  const logoUrl =
    (o.logoUrl as string) ||
    (o.logo_url as string) ||
    (o.logo as string) ||
    (o.company_logo as string) ||
    undefined;
  return {
    companyName: String(o.companyName ?? o.company_name ?? "—"),
    licenseNumber: (o.licenseNumber ?? o.license_number) as string | undefined,
    phone: String(o.mobile_number ?? o.phone ?? "").trim() || undefined,
    email: String(o.email ?? "").trim() || undefined,
    website: String(o.website ?? "").trim() || undefined,
    addressLine,
    logoUrl,
    accentHex: (o.accentHex ?? o.accent_hex) as string | undefined,
    contactPersonName: (o.contactPersonName ?? o.contact_person_name) as string | undefined,
    contactPersonPhone: (o.contactPersonPhone ?? o.contact_person_phone) as string | undefined,
    contactPersonEmail: (o.contactPersonEmail ?? o.contact_person_email) as string | undefined,
  };
}
