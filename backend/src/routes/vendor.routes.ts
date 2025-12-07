import { Router } from "express";
import { postVendor, getVendors } from "../controllers/vendor.controller";

const router = Router();

router.post("/", postVendor); 
router.get("/", getVendors);  

export default router;
