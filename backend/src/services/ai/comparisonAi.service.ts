import { openrouter } from "../../config/openrouter";
import { env } from "../../config/env";
import { RfpDocument } from "../../models/rfp.model";
import { ProposalDocument } from "../../models/proposal.model";

interface ComparisonResult {
  comparison: {
    proposalId: string;
    vendorName: string;
    totalPrice: number | null;
    deliveryDays: number | null;
    warrantyYears: number | null;
    score: number;
    notes: string;
  }[];
  recommendedProposalId: string | null;
  recommendedVendorName: string | null;
  explanation: string[];
}

export async function compareProposalsWithAi(
  rfp: RfpDocument,
  proposals: ProposalDocument[]
): Promise<ComparisonResult> {
  const proposalsForPrompt = proposals.map((p) => ({
    proposalId: String(p._id),
    vendorName: (p as any).vendor?.name ?? "Unknown",
    parsedData: p.parsedData
  }));

  const prompt = `
You are helping a procurement manager compare vendor proposals.

RFP (what the buyer wants):
${JSON.stringify(rfp.toObject(), null, 2)}

Vendor proposals:
${JSON.stringify(proposalsForPrompt, null, 2)}

Consider:
- Lower totalPrice is better.
- Faster deliveryDays is better.
- Longer warrantyYears is better.
- Better match to requested items is better.

Return ONLY valid JSON:
{
  "comparison": [
    {
      "proposalId": string,
      "vendorName": string,
      "totalPrice": number | null,
      "deliveryDays": number | null,
      "warrantyYears": number | null,
      "score": number,
      "notes": string
    }
  ],
  "recommendedProposalId": string | null,
  "recommendedVendorName": string | null,
  "explanation": [string, string, string]
}
No extra keys, no prose outside JSON.
`;

  const completion = await openrouter.chat.send({
    model: env.RFP_MODEL,
    maxTokens:800,
    messages: [{ role: "user", content: prompt }]
  });

  const content = completion.choices[0]?.message?.content ?? "{}";

  let parsed: ComparisonResult;
  try {
    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    parsed = JSON.parse(contentStr);
  } catch {
    throw new Error("Failed to parse comparison JSON from LLM");
  }

  return parsed;
}
