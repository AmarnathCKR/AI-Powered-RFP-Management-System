import { Proposal, ProposalDocument } from "../models/proposal.model";
import { Rfp } from "../models/rfp.model";
import { Vendor } from "../models/vendor.model";
import { parseVendorEmail } from "./ai/proposalAi.service";
import { compareProposalsWithAi } from "./ai/comparisonAi.service";

export async function listProposalsForRfp(rfpId: string) {
  return Proposal.find({ rfp: rfpId }).populate("vendor");
}

export async function createProposalFromEmail({
  rfpId,
  vendorEmail,
  emailSubject,
  emailBody,
  rawEmailId
}: {
  rfpId: string;
  vendorEmail: string;
  emailSubject: string;
  emailBody: string;
  rawEmailId?: string;
}): Promise<ProposalDocument> {
  const rfp = await Rfp.findById(rfpId);
  if (!rfp) throw new Error("RFP not found");

  const vendor = await Vendor.findOne({ email: vendorEmail });
  if (!vendor) throw new Error(`Vendor with email ${vendorEmail} not found`);

  const parsed = await parseVendorEmail({
    rfp,
    emailSubject,
    emailFrom: vendorEmail,
    emailBody
  });

  const proposal = await Proposal.create({
    rfp: rfp._id,
    vendor: vendor._id,
    rawEmailId,
    rawEmailSubject: emailSubject,
    rawEmailFrom: vendorEmail,
    rawEmailBody: emailBody,
    parsedData: parsed.parsedData
  });

  return proposal;
}

export async function compareProposalsForRfp(rfpId: string) {
  const rfp = await Rfp.findById(rfpId);
  if (!rfp) throw new Error("RFP not found");

  const proposals = await Proposal.find({ rfp: rfpId }).populate("vendor");
  return compareProposalsWithAi(rfp, proposals);
}
