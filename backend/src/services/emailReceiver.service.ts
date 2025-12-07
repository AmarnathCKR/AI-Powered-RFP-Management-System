// src/services/emailReceiver.service.ts
import { ImapFlow } from "imapflow";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { createProposalFromEmail } from "./proposal.service";

export async function pollInboxForRfpEmails(rfpId: string) {
  const client = new ImapFlow({
    host: env.IMAP_HOST,
    port: Number(env.IMAP_PORT),
    secure: env.IMAP_SECURE === "true",
    auth: {
      user: env.IMAP_USER,
      pass: env.IMAP_PASS,
    },
  });

  try {
    await client.connect();
    logger.info("📥 Connected to IMAP server");

    const lock = await client.getMailboxLock("INBOX");
    try {
      const searchCriteria = {
        seen: false,
        subject: `[RFP-ID:${rfpId}]`,
      };

      const messageSeqs = await client.search(searchCriteria);

      if (!messageSeqs || messageSeqs.length === 0) {
        logger.info(`📥 No new emails found for RFP ${rfpId}`);
        return;
      }

      logger.info(`📥 Found ${messageSeqs.length} new emails for RFP ${rfpId}`);

      for (const seq of messageSeqs) {
        const msg = await client.fetchOne(seq, {
          envelope: true,
          source: true,
        });

        if (!msg) {
          logger.warn(`⚠️ Skipped seq=${seq} because message not found`);
          continue;
        }

        const subject = msg.envelope?.subject ?? "";
        const fromAddress = msg.envelope?.from?.[0]?.address ?? "";
        const body = msg.source?.toString() ?? "";

        try {
          await createProposalFromEmail({
            rfpId,
            vendorEmail: fromAddress,
            emailSubject: subject,
            emailBody: body,
            rawEmailId: String(seq),
          });

          await client.messageFlagsAdd(seq, ["\\Seen"]);
          logger.info(`✔ Processed email seq=${seq}`);
        } catch (err) {
          logger.error(`❌ Failed to create proposal from seq=${seq}`, err);
        }
      }
    } finally {
      lock.release();
    }
  } catch (err) {
    logger.error("❌ IMAP polling error", err);
    throw err;
  } finally {
    try {
      await client.logout();
      logger.info("📥 IMAP connection closed");
    } catch {
      // ignore
    }
  }
}
