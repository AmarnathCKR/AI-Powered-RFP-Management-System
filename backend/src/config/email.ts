import nodemailer from "nodemailer";
import { env } from "./env";
import { logger } from "../utils/logger";

export const mailTransporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: env.SMTP_SECURE === "true",
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
});

mailTransporter.verify((err, success) => {
  if (err) {
    logger.error("SMTP config error", err);
  } else {
    logger.info("SMTP server is ready to send emails");
  }
});
