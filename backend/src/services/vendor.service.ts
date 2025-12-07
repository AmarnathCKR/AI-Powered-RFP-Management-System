import { Vendor, VendorDocument } from "../models/vendor.model";

export async function createVendor(data: {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}): Promise<VendorDocument> {
  return Vendor.create(data);
}

export async function listVendors(): Promise<VendorDocument[]> {
  return Vendor.find().sort({ createdAt: -1 });
}
