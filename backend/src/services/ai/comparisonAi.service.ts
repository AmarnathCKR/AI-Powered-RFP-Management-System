import { openrouter } from "../../config/openrouter";
import { env } from "../../config/env";
import { logger } from "../../utils/logger";

interface ParsedProposalData {
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
}

export interface ProposalLike {
  _id: any;
  vendor?: {
    name?: string;
    email?: string;
  };
  parsedData: ParsedProposalData;
}

interface RfpLike {
  _id: any;
  title: string;
  budget?: number | null;
  currency?: string | null;
  deliveryDeadlineDays?: number | null;
  paymentTerms?: string | null;
  warrantyTerms?: string | null;
}

export interface AiComparisonResult {
  summary: string;
  recommendation: {
    vendorName: string;
    proposalId: string | null;
    reason: string;
  };
  scores: {
    proposalId: string;
    vendorName: string;
    priceScore: number;
    deliveryScore: number;
    warrantyScore: number;
    overallScore: number;
    highlights: string;
  }[];
  usingFallback?: boolean;
}

function buildFallbackComparison(
  rfp: RfpLike,
  proposals: ProposalLike[]
): AiComparisonResult {
  if (!proposals.length) {
    return {
      summary:
        "No proposals found for this RFP. Unable to provide a comparison.",
      recommendation: {
        vendorName: "",
        proposalId: null,
        reason: "There are no vendor proposals to compare."
      },
      scores: [],
      usingFallback: true
    };
  }

  const numericProposals = proposals.map((p) => ({
    proposalId: String(p._id),
    vendorName: p.vendor?.name || "Unknown Vendor",
    totalPrice: p.parsedData?.totalPrice ?? null,
    deliveryDays: p.parsedData?.deliveryDays ?? null,
    warrantyYears: p.parsedData?.warrantyYears ?? null
  }));

  const prices = numericProposals
    .map((p) => p.totalPrice)
    .filter((v): v is number => typeof v === "number");
  const deliveries = numericProposals
    .map((p) => p.deliveryDays)
    .filter((v): v is number => typeof v === "number");
  const warranties = numericProposals
    .map((p) => p.warrantyYears)
    .filter((v): v is number => typeof v === "number");

  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const minDelivery = deliveries.length ? Math.min(...deliveries) : null;
  const maxDelivery = deliveries.length ? Math.max(...deliveries) : null;
  const minWarranty = warranties.length ? Math.min(...warranties) : null;
  const maxWarranty = warranties.length ? Math.max(...warranties) : null;

  const scores = numericProposals.map((p) => {
    let priceScore = 5;
    let deliveryScore = 5;
    let warrantyScore = 5;

    if (
      p.totalPrice != null &&
      minPrice != null &&
      maxPrice != null &&
      maxPrice !== minPrice
    ) {
      const ratio = (maxPrice - p.totalPrice) / (maxPrice - minPrice);
      priceScore = 1 + ratio * 9; // 1–10
    }

    if (
      p.deliveryDays != null &&
      minDelivery != null &&
      maxDelivery != null &&
      maxDelivery !== minDelivery
    ) {
      const ratio = (maxDelivery - p.deliveryDays) / (maxDelivery - minDelivery);
      deliveryScore = 1 + ratio * 9;
    }

    if (
      p.warrantyYears != null &&
      minWarranty != null &&
      maxWarranty != null &&
      maxWarranty !== minWarranty
    ) {
      const ratio =
        (p.warrantyYears - minWarranty) / (maxWarranty - minWarranty);
      warrantyScore = 1 + ratio * 9;
    }

    const overallScore =
      (priceScore * 0.5 + deliveryScore * 0.2 + warrantyScore * 0.3);

    const highlightsParts: string[] = [];
    if (p.totalPrice != null) highlightsParts.push(`Price: ${p.totalPrice}`);
    if (p.deliveryDays != null)
      highlightsParts.push(`Delivery: ${p.deliveryDays} days`);
    if (p.warrantyYears != null)
      highlightsParts.push(`Warranty: ${p.warrantyYears} years`);

    return {
      proposalId: p.proposalId,
      vendorName: p.vendorName,
      priceScore: Number(priceScore.toFixed(1)),
      deliveryScore: Number(deliveryScore.toFixed(1)),
      warrantyScore: Number(warrantyScore.toFixed(1)),
      overallScore: Number(overallScore.toFixed(1)),
      highlights: highlightsParts.join(" | ") || "Limited data available"
    };
  });

  const best = scores.reduce((best, curr) =>
    curr.overallScore > best.overallScore ? curr : best
  );

  const summaryLines: string[] = [];
  summaryLines.push(
    `Fallback comparison based on simple heuristics (price 50%, delivery 20%, warranty 30%) because the AI response could not be parsed.`
  );
  summaryLines.push(
    `Best vendor by overall score: ${best.vendorName} (score ${best.overallScore}/10).`
  );

  if (rfp.budget && prices.length) {
    const underBudget = scores.filter((s, idx) => {
      const p = numericProposals[idx];
      return p.totalPrice != null && p.totalPrice <= rfp.budget!;
    });
    if (underBudget.length) {
      summaryLines.push(
        `${underBudget.length} proposal(s) are within the budget of ${rfp.budget} ${rfp.currency ?? ""}.`
      );
    }
  }

  return {
    summary: summaryLines.join(" "),
    recommendation: {
      vendorName: best.vendorName,
      proposalId: best.proposalId,
      reason:
        "Best trade-off between price, delivery time, and warranty among the available proposals (heuristic fallback, not LLM)."
    },
    scores,
    usingFallback: true
  };
}

export async function compareProposalsWithAi(
  rfp: RfpLike,
  proposals: ProposalLike[]
): Promise<AiComparisonResult> {
  if (!proposals.length) {
    return buildFallbackComparison(rfp, proposals);
  }

  // Compact summary we send to the model (NOT the whole raw emails).
  const proposalSummaries = proposals.map((p) => ({
    proposalId: String(p._id),
    vendorName: p.vendor?.name || "Unknown Vendor",
    totalPrice: p.parsedData?.totalPrice ?? null,
    currency: p.parsedData?.currency ?? null,
    deliveryDays: p.parsedData?.deliveryDays ?? null,
    paymentTerms: p.parsedData?.paymentTerms ?? null,
    warrantyYears: p.parsedData?.warrantyYears ?? null
  }));

  const prompt = `
You are a procurement evaluation assistant.

You will receive:
1) A single RFP description
2) A list of vendor proposals (already parsed into structured numeric fields)

Your job:
- Compare all proposals.
- Recommend exactly ONE vendor.
- Return STRICT JSON ONLY with the exact structure described below.

RFP:
- Title: ${rfp.title}
- Budget: ${rfp.budget ?? "null"} ${rfp.currency ?? ""}
- Delivery deadline (days): ${rfp.deliveryDeadlineDays ?? "null"}
- Payment terms: ${rfp.paymentTerms ?? "null"}
- Warranty terms: ${rfp.warrantyTerms ?? "null"}

Vendor proposals (parsed):
${JSON.stringify(proposalSummaries, null, 2)}

Return ONLY valid JSON with this EXACT structure:

{
  "summary": "A human-readable summary of how the vendors compare and key trade-offs.",
  "recommendation": {
    "vendorName": "Name of the recommended vendor",
    "proposalId": "proposalId of the recommended vendor (from the input list)",
    "reason": "Short explanation of why this vendor is recommended."
  },
  "scores": [
    {
      "proposalId": "proposalId from the input list",
      "vendorName": "Vendor name",
      "priceScore": 0-10 number (higher = cheaper/better value),
      "deliveryScore": 0-10 number (higher = faster delivery / meets deadline better),
      "warrantyScore": 0-10 number (higher = better warranty/coverage),
      "overallScore": 0-10 number (your combined score),
      "highlights": "Short one-line explanation of this vendor's pros/cons."
    }
  ]
}

Rules:
- Output MUST be valid JSON, not TypeScript. No comments, no trailing commas.
- Do NOT include any other keys.
- Do NOT wrap JSON in backticks or markdown code fences.
- Every "proposalId" you use MUST match one of the proposalId values from the input list.
- All score fields MUST be numbers (not strings).
`;

  try {
    const completion = await openrouter.chat.send({
      model: env.RFP_MODEL,
      messages: [{ role: "user", content: prompt }],
      maxTokens: 700,
      temperature: 0.1
    });

    const rawContent = completion.choices?.[0]?.message?.content;

    if (!rawContent) {
      logger.error("LLM comparison returned empty content", completion as any);
      return buildFallbackComparison(rfp, proposals);
    }

    let content =
      typeof rawContent === "string"
        ? rawContent
        : JSON.stringify(rawContent);

    const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
      content = fenceMatch[1].trim();
    }

    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      content = content.slice(firstBrace, lastBrace + 1);
    }

    logger.info("LLM comparison raw content:", content);

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      logger.error("Failed to parse comparison JSON from LLM:", content);

      return buildFallbackComparison(rfp, proposals);
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.summary ||
      !parsed.recommendation ||
      !Array.isArray(parsed.scores)
    ) {
      logger.error("Comparison JSON missing required fields:", parsed);
      return buildFallbackComparison(rfp, proposals);
    }

    return parsed as AiComparisonResult;
  } catch (error) {
    logger.error("Error in compareProposalsWithAi:", error);
    return buildFallbackComparison(rfp, proposals);
  }
}
