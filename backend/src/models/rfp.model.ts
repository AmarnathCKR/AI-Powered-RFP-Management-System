import { Schema, model, Document, Types } from "mongoose";

export interface RfpItem {
  name: string;
  quantity: number;
  specs?: Record<string, any>;
}

export interface RfpDocument extends Document {
  title: string;
  descriptionRaw: string;
  budget?: number;
  currency?: string;
  deliveryDeadlineDays?: number;
  paymentTerms?: string;
  warrantyTerms?: string;
  requirements: {
    items: RfpItem[];
  };
  vendors: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const rfpSchema = new Schema<RfpDocument>(
  {
    title: { type: String, required: true },
    descriptionRaw: { type: String, required: true },
    budget: Number,
    currency: String,
    deliveryDeadlineDays: Number,
    paymentTerms: String,
    warrantyTerms: String,
    requirements: {
      items: [
        {
          name: String,
          quantity: Number,
          specs: Schema.Types.Mixed
        }
      ]
    },
    vendors: [{ type: Schema.Types.ObjectId, ref: "Vendor" }]
  },
  { timestamps: true }
);

export const Rfp = model<RfpDocument>("Rfp", rfpSchema);
