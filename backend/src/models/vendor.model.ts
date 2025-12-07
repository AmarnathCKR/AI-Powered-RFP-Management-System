import { Schema, model, Document } from "mongoose";

export interface VendorDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<VendorDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    notes: String
  },
  { timestamps: true }
);

export const Vendor = model<VendorDocument>("Vendor", vendorSchema);
