import { Router } from "express";
import rfpRoutes from "./rfp.routes";
import vendorRoutes from "./vendor.routes";
import proposalRoutes from "./proposal.routes";
import emailRoutes from "./email.routes";

const router = Router();

router.use("/rfps", rfpRoutes);
router.use("/vendors", vendorRoutes);
router.use("/proposals", proposalRoutes);
router.use("/email", emailRoutes); 
router.use("/health", (req, res) => {
    res.status(200).send("OK");
});

export default router;
