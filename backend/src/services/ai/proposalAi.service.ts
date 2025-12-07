import { openrouter } from "../../config/openrouter";
import { env } from "../../config/env";
import { RfpDocument } from "../../models/rfp.model";

export interface ParsedProposal {
  parsedData: {
    totalPrice: number | null;
    currency: string | null;
    deliveryDays: number | null;
    paymentTerms: string | null;
    warrantyYears: number | null;
    lineItems: {
      item: string;
      unitPrice: number | null;
      quantity: number | null;
    }[];
    extraConditions: string | null;
  };
}

export async function parseVendorEmail({
  rfp,
  emailSubject,
  emailFrom,
  emailBody
}: {
  rfp: RfpDocument;
  emailSubject: string;
  emailFrom: string;
  emailBody: string;
}): Promise<ParsedProposal> {
  const prompt = `
You are extracting structured proposal data from a vendor email replying to an RFP.

RFP (what the buyer asked for), in JSON:
${JSON.stringify(rfp.toObject(), null, 2)}

Vendor email:
Subject: ${emailSubject}
From: ${emailFrom}
Body:
${emailBody}

Return ONLY valid JSON with this EXACT shape:
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
No extra keys, no comments, no explanations.
`;

  const completion = await openrouter.chat.send({
    model: env.RFP_MODEL,
    maxTokens:800,
    messages: [{ role: "user", content: prompt }]
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  const contentStr = typeof content === "string" ? content : "{}";

  let parsed: ParsedProposal;
  try {
    parsed = JSON.parse(contentStr);
  } catch {
    throw new Error("Failed to parse vendor proposal JSON from LLM");
  }

  return parsed;
}
