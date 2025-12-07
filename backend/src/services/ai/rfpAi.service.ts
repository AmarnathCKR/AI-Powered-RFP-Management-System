import { openrouter } from "../../config/openrouter";
import { env } from "../../config/env";
import { logger } from "../../utils/logger";

interface StructuredRfp {
  title: string;
  budget: number | null;
  currency: string | null;
  deliveryDeadlineDays: number | null;
  paymentTerms: string | null;
  warrantyTerms: string | null;
  requirements: {
    items: {
      name: string;
      quantity: number;
      specs?: Record<string, any>;
    }[];
  };
}

export async function generateStructuredRfpFromText(text: string): Promise<StructuredRfp> {
  const prompt = `
You are an assistant that converts free-text procurement descriptions into structured RFP JSON.

Input:
${text}

Return ONLY valid JSON with this EXACT shape:
{
  "title": string,
  "budget": number | null,
  "currency": string | null,
  "deliveryDeadlineDays": number | null,
  "paymentTerms": string | null,
  "warrantyTerms": string | null,
  "requirements": {
    "items": [
      { "name": string, "quantity": number, "specs": object }
    ]
  }
}
No extra keys, no comments, no explanations.
`;

  try {
    const completion = await openrouter.chat.send({
      model: env.RFP_MODEL,
      maxTokens:800,
      messages: [{ role: "user", content: prompt }]
    });

    const rawContent = completion.choices[0]?.message?.content ?? "{}";
    const content =
      typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);

    let parsed: StructuredRfp;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      logger.error("Failed to parse RFP JSON from LLM:", content);
      throw Object.assign(
        new Error("AI did not return valid JSON for RFP"),
        { status: 502 }
      );
    }

    return parsed;
  } catch (error: any) {
    logger.error("OpenRouter error in generateStructuredRfpFromText:", error);

    if (error?.statusCode === 429) {
      throw Object.assign(
        new Error(
          "AI model is temporarily rate-limited. Please try again in a bit or switch to another free model."
        ),
        { status: 503, details: error?.body }
      );
    }

    if (error?.statusCode === 404) {
      throw Object.assign(
        new Error(
          `AI model '${env.RFP_MODEL}' not found on OpenRouter. Check the model slug.`
        ),
        { status: 502, details: error?.body }
      );
    }

    throw Object.assign(
      new Error("Failed to call AI provider for RFP generation"),
      { status: 502, details: error?.body ?? error?.message }
    );
  }
}
