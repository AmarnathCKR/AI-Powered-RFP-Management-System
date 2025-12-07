import { Request, Response, NextFunction } from "express";
import { createVendor, listVendors } from "../services/vendor.service";
import { ok, fail } from "../utils/apiResponse";

export async function postVendor(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("visit")
    const { name, email, phone, notes } = req.body;
    if (!name || !email) {
      return fail(res, "name and email are required", 400);
    }

    const vendor = await createVendor({ name, email, phone, notes });
    return ok(res, vendor, 201);
  } catch (err) {
    next(err);
  }
}

export async function getVendors(_req: Request, res: Response, next: NextFunction) {
  try {
    const vendors = await listVendors();
    return ok(res, vendors);
  } catch (err) {
    next(err);
  }
}
