import { Schema, model, Document, Types } from "mongoose";

export interface ProposalParsedData {
  totalPrice?: number;
  currency?: string;
  deliveryDays?: number;
  paymentTerms?: string;
  warrantyYears?: number;
  lineItems?: {
    item: string;
    unitPrice?: number;
    quantity?: number;
  }[];
  extraConditions?: string;
}

export interface ProposalDocument extends Document {
  rfp: Types.ObjectId;
  vendor: Types.ObjectId;

  rawEmailId?: string;
  rawEmailSubject?: string;
  rawEmailFrom?: string;
  rawEmailBody?: string;

  parsedData?: ProposalParsedData;
  score?: number;
  recommendationExplanation?: string;

  createdAt: Date;
  updatedAt: Date;
}

const proposalSchema = new Schema<ProposalDocument>(
  {
    rfp: { type: Schema.Types.ObjectId, ref: "Rfp", required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    rawEmailId: String,
    rawEmailSubject: String,
    rawEmailFrom: String,
    rawEmailBody: String,
    parsedData: {
      totalPrice: Number,
      currency: String,
      deliveryDays: Number,
      paymentTerms: String,
      warrantyYears: Number,
      lineItems: [
        {
          item: String,
          unitPrice: Number,
          quantity: Number
        }
      ],
      extraConditions: String
    },
    score: Number,
    recommendationExplanation: String
  },
  { timestamps: true }
);

export const Proposal = model<ProposalDocument>("Proposal", proposalSchema);
