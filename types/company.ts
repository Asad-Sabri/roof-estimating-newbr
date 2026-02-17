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
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/** For edit form – same as create payload; id used for PUT */
export type UpdateCompanyPayload = CreateCompanyPayload;
