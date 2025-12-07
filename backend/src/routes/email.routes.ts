import { Router } from "express";
import { postEmailPoll } from "../controllers/email.controller";

const router = Router();

router.post("/poll", postEmailPoll);

export default router;
