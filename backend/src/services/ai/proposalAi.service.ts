import { openrouter } from "../../config/openrouter";
import { env } from "../../config/env";
import { logger } from "../../utils/logger";

interface ParseVendorEmailArgs {
  rfp: any; // or RfpDocument type
  emailSubject: string;
  emailFrom: string;
  emailBody: string;
}

export async function parseVendorEmail({
  rfp,
  emailSubject,
  emailFrom,
  emailBody
}: ParseVendorEmailArgs) {
  const prompt = `
You are an assistant that reads vendor proposal emails and outputs STRICT JSON.

RFP:
Title: ${rfp.title}
Budget: ${rfp.budget ?? "unknown"} ${rfp.currency ?? ""}
Delivery deadline (days): ${rfp.deliveryDeadlineDays ?? "unknown"}
Payment terms: ${rfp.paymentTerms ?? "unknown"}
Warranty terms: ${rfp.warrantyTerms ?? "unknown"}

Requested items:
${(rfp.requirements?.items ?? [])
  .map((i: any) => `- ${i.quantity} x ${i.name}`)
  .join("\n")}

Vendor email metadata:
From: ${emailFrom}
Subject: ${emailSubject}

Vendor email body:
"""
${emailBody}
"""

Return ONLY valid JSON with this exact structure:

{
  "parsedData": {
    "totalPrice": number | null,
    "currency": string | null,
    "deliveryDays": number | null,
    "paymentTerms": string | null,
    "warrantyYears": number | null,
    "lineItems": [
      {
        "item": string,
        "unitPrice": number | null,
        "quantity": number | null
      }
    ],
    "extraConditions": string | null
  }
}

Rules:
- extraConditions must be a SINGLE LINE string, max 200 characters, no line breaks.
- Do NOT include double quotes inside extraConditions; if needed, use single quotes instead.
- No extra keys.
- No comments.
- No markdown.
- Do NOT wrap the JSON in backticks or code fences.
`;

  try {
    const completion = await openrouter.chat.send({
      model: env.RFP_MODEL,
      maxTokens: 1500,
      messages: [{ role: "user", content: prompt }]
    });

    const rawContent = completion.choices[0]?.message?.content ?? "{}";

    logger.info("LLM vendor proposal raw content:", rawContent);

    let content =
      typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);

    const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
      content = fenceMatch[1].trim();
    }

    let parsed: any;

    try {
      parsed = JSON.parse(content);
    } catch (err) {

      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      if (start !== -1 && end > start) {
        const trimmed = content.slice(start, end + 1);
        try {
          parsed = JSON.parse(trimmed);
        } catch (err2) {
          logger.error(
            "Failed to parse vendor proposal JSON from LLM (trimmed):",
            trimmed
          );
          throw new Error("Failed to parse vendor proposal JSON from LLM");
        }
      } else {
        logger.error("Failed to parse vendor proposal JSON from LLM:", content);
        throw new Error("Failed to parse vendor proposal JSON from LLM");
      }
    }

    if (!parsed || typeof parsed !== "object" || !parsed.parsedData) {
      throw new Error("Parsed proposal JSON missing 'parsedData' field");
    }

    return parsed; 
  } catch (error) {
    logger.error("Error in parseVendorEmail:", error);
    throw error;
  }
}
