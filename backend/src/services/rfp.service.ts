import { Rfp, RfpDocument } from "../models/rfp.model";
import { generateStructuredRfpFromText } from "./ai/rfpAi.service";
import { Vendor } from "../models/vendor.model";
import { sendEmail } from "./email.service";

export async function createRfpFromNaturalText(text: string): Promise<RfpDocument> {
  const structured = await generateStructuredRfpFromText(text);

  const rfp = await Rfp.create({
    title: structured.title || "Untitled RFP",
    descriptionRaw: text,
    budget: structured.budget ?? undefined,
    currency: structured.currency ?? undefined,
    deliveryDeadlineDays: structured.deliveryDeadlineDays ?? undefined,
    paymentTerms: structured.paymentTerms ?? undefined,
    warrantyTerms: structured.warrantyTerms ?? undefined,
    requirements: structured.requirements
  });

  return rfp;
}

export async function getRfpById(id: string) {
  return Rfp.findById(id).populate("vendors");
}

export async function listRfps() {
  return Rfp.find().sort({ createdAt: -1 }).populate("vendors");
}

export async function attachVendorsToRfp(rfpId: string, vendorIds: string[]) {
  const rfp = await Rfp.findById(rfpId);
  if (!rfp) throw new Error("RFP not found");

  rfp.vendors = vendorIds as any;
  await rfp.save();
  return rfp.populate("vendors");
}

export async function sendRfpToVendors(rfpId: string) {
  const rfp = await Rfp.findById(rfpId).populate("vendors");
  if (!rfp) throw new Error("RFP not found");

  const vendors = (rfp as any).vendors ?? [];

  const results = [];
  for (const vendor of vendors) {
    const subject = `RFP ${rfp._id} – ${rfp.title}`;
    const text = buildRfpEmailText(rfp, vendor.name);

    const info = await sendEmail({
      to: vendor.email,
      subject,
      text
    });

    results.push({ vendorId: vendor._id, messageId: info.messageId });
  }

  return results;
}

function buildRfpEmailText(rfp: RfpDocument, vendorName: string) {
  const itemsText = (rfp.requirements?.items ?? [])
    .map((item) => `- ${item.quantity} x ${item.name}`)
    .join("\n");

  return `
Hello ${vendorName},

We would like to invite you to submit a proposal for the following RFP:

Title: ${rfp.title}
Budget: ${rfp.budget ?? "N/A"} ${rfp.currency ?? ""}
Delivery deadline (days): ${rfp.deliveryDeadlineDays ?? "N/A"}
Payment terms: ${rfp.paymentTerms ?? "N/A"}
Warranty terms: ${rfp.warrantyTerms ?? "N/A"}

Requested items:
${itemsText || "- (not specified)"}

Please reply to this email with your proposal, including pricing, delivery time, payment terms, and warranty details.
Make sure the subject line keeps this token so we can match it: [RFP-ID:${rfp._id}]

Best regards,
Procurement Team
`.trim();
}
