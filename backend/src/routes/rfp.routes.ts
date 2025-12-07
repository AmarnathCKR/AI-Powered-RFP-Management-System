import { Router } from "express";
import {
  postRfpFromText,
  getRfp,
  getRfps,
  postRfpVendors,
  postRfpSend
} from "../controllers/rfp.controller";

const router = Router();

router.post("/nl", postRfpFromText);      // POST /api/rfps/nl
router.get("/", getRfps);                 // GET  /api/rfps
router.get("/:id", getRfp);               // GET  /api/rfps/:id
router.post("/:id/vendors", postRfpVendors); // POST /api/rfps/:id/vendors
router.post("/:id/send", postRfpSend);       // POST /api/rfps/:id/send

export default router;
