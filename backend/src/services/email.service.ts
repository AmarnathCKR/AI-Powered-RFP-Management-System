import { mailTransporter } from "../config/email";
import { logger } from "../utils/logger";

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  const info = await mailTransporter.sendMail({
    from: `"RFP System" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html: html ?? text
  });

  logger.info("📧 Email sent:", info.messageId, "to", to);
  return info;
}
