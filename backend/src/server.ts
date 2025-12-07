import { app } from "./app";
import { env } from "./config/env";
import { connectDb } from "./config/db";
import { logger } from "./utils/logger";

async function bootstrap() {
  await connectDb();

  app.listen(env.PORT, () => {
    logger.info(`🚀 Server listening on port ${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
