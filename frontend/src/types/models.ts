// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  details?: unknown;
}

// Vendor
export interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorDto {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

// RFP
export interface RfpItemRequirement {
  _id?: string;
  name: string;
  quantity: number;
  specs?: Record<string, unknown>;
}

export interface Rfp {
  _id: string;
  title: string;
  descriptionRaw: string;
  budget?: number;
  currency?: string;
  deliveryDeadlineDays?: number;
  paymentTerms?: string;
  warrantyTerms?: string;
  requirements: {
    items: RfpItemRequirement[];
  };
  vendors: Vendor[] | string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRfpFromNLDto {
  text: string;
}

export interface AttachVendorsDto {
  vendorIds: string[];
}

export interface SendRfpEmailsResponse {
  sent: { vendorId: string; messageId: string }[];
}

// Proposal
export interface ProposalParsedData {
  totalPrice?: number | null;
  currency?: string | null;
  deliveryDays?: number | null;
  paymentTerms?: string | null;
  warrantyYears?: number | null;
  lineItems?: {
    item: string;
    unitPrice?: number | null;
    quantity?: number | null;
  }[];
  extraConditions?: string | null;
}

export interface Proposal {
  _id: string;
  rfp: string | Rfp;
  vendor: Vendor | string;
  rawEmailId?: string;
  rawEmailSubject?: string;
  rawEmailFrom?: string;
  rawEmailBody?: string;
  parsedData?: ProposalParsedData;
  score?: number;
  recommendationExplanation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProposalFromEmailDto {
  vendorEmail: string;
  subject: string;
  body: string;
}

export interface ComparisonItem {
  proposalId: string;
  vendorName: string;
  totalPrice: number | null;
  deliveryDays: number | null;
  warrantyYears: number | null;
  score: number;
  notes: string;
}

export interface CompareProposalsResponse {
  summary: string;
  recommendation: {
    vendorName: string;
    proposalId: string;
    reason: string;
  } | null;
  scores: {
    proposalId: string;
    vendorName: string;
    priceScore: number;
    deliveryScore: number;
    warrantyScore: number;
    overallScore: number;
    highlights: string;
  }[];
  usingFallback: boolean;
}
