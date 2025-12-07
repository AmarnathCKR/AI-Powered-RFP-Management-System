import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("4000"),
  MONGO_URI: z.string(),
  OPENROUTER_API_KEY: z.string(),
  OPENROUTER_BASE_URL: z.string().default("https://openrouter.ai/api/v1"),
  RFP_MODEL: z.string().default("mistralai/mistral-small-3.1-24b-instruct:free"),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.string().default("587"),
  SMTP_SECURE: z.string().default("false"),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  IMAP_HOST: z.string().default("imap.gmail.com"),
  IMAP_PORT: z.string().default("993"),
  IMAP_SECURE: z.string().default("true"),
  IMAP_USER: z.string(),
  IMAP_PASS: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
