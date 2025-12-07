import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export async function connectDb() {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info("✅ Connected to MongoDB");
  } catch (err) {
    logger.error("❌ MongoDB connection error", err);
    process.exit(1);
  }
}
