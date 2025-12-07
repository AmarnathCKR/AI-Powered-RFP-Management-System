import { Request, Response, NextFunction } from "express";
import {
  listProposalsForRfp,
  createProposalFromEmail,
  compareProposalsForRfp
} from "../services/proposal.service";
import { ok, fail } from "../utils/apiResponse";

export async function getProposalsForRfp(req: Request, res: Response, next: NextFunction) {
  try {
    const { rfpId } = req.params;
    const proposals = await listProposalsForRfp(rfpId);
    return ok(res, proposals);
  } catch (err) {
    next(err);
  }
}

// Mock/manual inbound email endpoint (can be used by frontend or webhook)
export async function postProposalFromEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { rfpId } = req.params;
    const { vendorEmail, subject, body, rawEmailId } = req.body;

    if (!vendorEmail || !subject || !body) {
      return fail(res, "vendorEmail, subject, and body are required", 400);
    }

    const proposal = await createProposalFromEmail({
      rfpId,
      vendorEmail,
      emailSubject: subject,
      emailBody: body,
      rawEmailId
    });

    return ok(res, proposal, 201);
  } catch (err) {
    next(err);
  }
}

export async function getRfpComparison(req: Request, res: Response, next: NextFunction) {
  try {
    const { rfpId } = req.params;
    const data = await compareProposalsForRfp(rfpId);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}
