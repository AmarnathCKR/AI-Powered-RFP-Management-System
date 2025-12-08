import { Request, Response, NextFunction } from "express";
import {
  createRfpFromNaturalText,
  getRfpById,
  listRfps,
  attachVendorsToRfp,
  sendRfpToVendors
} from "../services/rfp.service";
import { ok, fail } from "../utils/apiResponse";
import { env } from "process";

export async function postRfpFromText(req: Request, res: Response, next: NextFunction) {
  try {
    const { text } = req.body;
    if (!text) return fail(res, "text is required", 400);

    const rfp = await createRfpFromNaturalText(text);
    return ok(res, rfp, 201);
  } catch (err) {
    next(err);
  }
}

export async function getRfp(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const rfp = await getRfpById(id);
    if (!rfp) return fail(res, "RFP not found", 404);
    return ok(res, rfp);
  } catch (err) {
    next(err);
  }
}

export async function getRfps(_req: Request, res: Response, next: NextFunction) {
  try {
    const rfps = await listRfps();
    return ok(res, rfps);
  } catch (err) {
    next(err);
  }
}

export async function postRfpVendors(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { vendorIds } = req.body as { vendorIds: string[] };

    if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
      return fail(res, "vendorIds must be a non-empty array", 400);
    }

    const rfp = await attachVendorsToRfp(id, vendorIds);
    return ok(res, rfp);
  } catch (err) {
    next(err);
  }
}

export async function postRfpSend(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    console.log("SMTP Host:", env.SMTP_HOST, env.SMTP_SECURE,env.SMTP_USER,env.SMTP_PASS,"passowrds");
    const results = await sendRfpToVendors(id);
    return ok(res, { sent: results });
  } catch (err) {
    next(err);
  }
}
