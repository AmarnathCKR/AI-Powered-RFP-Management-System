import { Router } from "express";
import {
  getProposalsForRfp,
  postProposalFromEmail,
  getRfpComparison
} from "../controllers/proposal.controller";

const router = Router();

router.get("/rfp/:rfpId", getProposalsForRfp);

router.post("/rfp/:rfpId/from-email", postProposalFromEmail);

router.get("/rfp/:rfpId/compare", getRfpComparison);

export default router;
