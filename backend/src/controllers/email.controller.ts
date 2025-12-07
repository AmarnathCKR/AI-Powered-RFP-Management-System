import { Request, Response, NextFunction } from "express";
import { pollInboxForRfpEmails } from "../services/emailReceiver.service";
import { ok, fail } from "../utils/apiResponse";

export async function postEmailPoll(req: Request, res: Response, next: NextFunction) {
  try {
    const { rfpId } = req.body;
    if (!rfpId) return fail(res, "rfpId is required", 400);

    await pollInboxForRfpEmails(rfpId);
    return ok(res, { message: "Email poll triggered" });
  } catch (err) {
    next(err);
  }
}
