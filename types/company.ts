/** Address object used in company create/update and response */
export interface CompanyAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

/** Payload for POST /api/company (add company) */
export interface CreateCompanyPayload {
  companyName: string;
  licenseNumber: string;
  website: string;
  email: string;
  mobile_number: string;
  address: CompanyAddress;
  user_id?: string;
  /** Required when Super Admin creates a company – assign to this admin */
  admin_id?: string;
  whatsIncluded?: string[];
  financingInterestRate?: number;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  followUpText?: string;
  disclaimer?: string;
}

/** Company as returned from API (GET all / by id) */
export interface Company {
  _id: string;
  user_id?: string;
  companyName: string;
  licenseNumber: string;
  website: string;
  email: string;
  mobile_number: string;
  address: CompanyAddress;
  whatsIncluded?: string[];
  financingInterestRate?: number;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  followUpText?: string;
  disclaimer?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/** For edit form – same as create payload; id used for PUT */
export type UpdateCompanyPayload = CreateCompanyPayload;
