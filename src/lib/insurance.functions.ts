import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const documentInput = z.object({
  name: z.string().max(255),
  type: z.string().max(120),
  size: z.number().int().nonnegative(),
  // base64 (no data URL prefix) for images / pdfs
  data_base64: z.string().optional(),
  // plaintext extracted client-side (for .txt, .eml, etc.)
  text: z.string().optional(),
});

const analyzeInput = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(180),
  documents: z.array(documentInput).min(1).max(15),
});

const SYSTEM_PROMPT = `You are an insurance intelligence analyst optimized for Portuguese / Iberian insurance documents.
You receive a chaotic mix of insurance-related artifacts uploaded by a single person:
PDFs, photos, screenshots, emails, renewal notices, payment receipts, WhatsApp screenshots, broker messages, claim documents, etc.

Your job: reconstruct a STRUCTURED insurance intelligence map for this person.

Rules:
- Use careful, non-deterministic language. Prefer "appears", "may indicate", "possible", "potential".
- NEVER pretend to give legal or financial advice. Frame everything as AI-assisted visibility.
- Recognize Portuguese insurer names where possible (Fidelidade, Médis, Multicare, Ageas, Tranquilidade, Allianz Portugal, Generali Tranquilidade, Lusitania, Liberty Seguros, Zurich Portugal, MAPFRE, Ocidental, etc.) but stay flexible — extract from any text.
- Confidence is a number between 0 and 1 reflecting how sure you are about each policy.
- Detect overlaps (e.g., multiple device coverages, duplicated travel protection) and surface gaps (e.g., travel activity but no travel coverage, no health insurance, no income protection).
- Output Portuguese euros (EUR) when premiums are detected.
- The "summary_plain_english" must be 2-3 short sentences, calm and clear.
- For broker_opportunities, think like a broker: upsell, cross-sell, renewal nudges, outdated coverages.
- Always return at least 1 missing_information item — chaos always has gaps.
- risk_score: 0-100 where higher means more uncovered exposure.
- opportunity_score: 0-100 where higher means more cross-sell / upsell potential.
- "source_documents" must contain document filenames you actually used.
- Always return a "reconstruction_note" (1 sentence) describing how the profile was reconstructed from the uploads (e.g., "AI reconstructed this profile from 7 fragmented uploads including PDFs, screenshots and a renewal notice.").
- Always populate "premium_optimization" with 1-4 soft, suggestive items. Use cautious language ("possible", "appears", "may"). Never claim exact savings or real-time benchmarks. Valid signals: rising_premium, outdated_policy, fragmented_providers, duplicate_spend, loyalty_inflation, other.
- Even if documents are unclear, produce your best-effort structured map.`;

const TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    summary_plain_english: { type: "string" },
    reconstruction_note: { type: "string" },
    risk_score: { type: "number" },
    opportunity_score: { type: "number" },

    policies: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["health", "auto", "home", "life", "travel", "devices", "pet", "income", "liability", "other"],
          },
          provider: { type: "string" },
          product_name: { type: "string" },
          status: { type: "string", enum: ["active", "expired", "pending", "unknown"] },
          renewal_date: { type: "string" },
          premium_monthly_eur: { type: "number" },
          coverage_summary: { type: "string" },
          confidence: { type: "number" },
          source_documents: { type: "array", items: { type: "string" } },
        },
        required: ["category", "confidence", "source_documents"],
      },
    },
    risk_gaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high"] },
          category: { type: "string" },
        },
        required: ["title", "detail", "severity"],
      },
    },
    overlaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          categories: { type: "array", items: { type: "string" } },
          estimated_waste_eur: { type: "number" },
        },
        required: ["title", "detail", "categories"],
      },
    },
    missing_information: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          suggested_upload: { type: "string" },
        },
        required: ["title", "detail"],
      },
    },
    broker_opportunities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          category: { type: "string" },
        },
        required: ["title", "detail", "priority"],
      },
    },
    premium_optimization: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          category: { type: "string" },
          signal: {
            type: "string",
            enum: ["rising_premium", "outdated_policy", "fragmented_providers", "duplicate_spend", "loyalty_inflation", "other"],
          },
        },
        required: ["title", "detail"],
      },
    },

    financial: {
      type: "object",
      properties: {
        estimated_monthly_total_eur: { type: "number" },
        upcoming_renewals_30d: { type: "number" },
        distribution: { type: "object", additionalProperties: { type: "number" } },
      },
      required: ["upcoming_renewals_30d", "distribution"],
    },
    document_timeline: {
      type: "array",
      items: {
        type: "object",
        properties: {
          document: { type: "string" },
          date: { type: "string" },
          type: { type: "string" },
          note: { type: "string" },
        },
        required: ["document"],
      },
    },
  },
  required: [
    "summary_plain_english",
    "risk_score",
    "opportunity_score",
    "policies",
    "risk_gaps",
    "overlaps",
    "missing_information",
    "broker_opportunities",
    "financial",
    "document_timeline",
  ],
};

function buildUserContent(docs: z.infer<typeof analyzeInput>["documents"]) {
  const parts: any[] = [];
  parts.push({
    type: "text",
    text: `Analyze this person's uploaded insurance materials. Filenames are listed before each artifact.\n\nDocuments:\n${docs
      .map((d, i) => `${i + 1}. ${d.name} (${d.type})`)
      .join("\n")}\n\nReconstruct the full insurance intelligence map.`,
  });

  for (const d of docs) {
    if (d.text && d.text.trim().length > 0) {
      parts.push({
        type: "text",
        text: `\n=== FILE: ${d.name} (${d.type}) — extracted text ===\n${d.text.slice(0, 18000)}`,
      });
    } else if (d.data_base64 && d.type.startsWith("image/")) {
      parts.push({
        type: "text",
        text: `\n=== FILE: ${d.name} (${d.type}) — image attached below ===`,
      });
      parts.push({
        type: "image_url",
        image_url: { url: `data:${d.type};base64,${d.data_base64}` },
      });
    } else {
      parts.push({
        type: "text",
        text: `\n=== FILE: ${d.name} (${d.type}) — binary content not directly readable; infer from filename and any other documents.`,
      });
    }
  }
  return parts;
}

export const analyzeDocuments = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => analyzeInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const userContent = buildUserContent(data.documents);

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_insurance_map",
              description: "Emit the structured insurance intelligence map.",
              parameters: TOOL_SCHEMA,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_insurance_map" } },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI gateway error", aiResp.status, txt);
      if (aiResp.status === 429) throw new Error("Rate limited. Please retry in a moment.");
      if (aiResp.status === 402) throw new Error("AI credits exhausted on this workspace.");
      throw new Error(`AI gateway error (${aiResp.status})`);
    }

    const json = await aiResp.json();
    const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
    const argStr = toolCall?.function?.arguments;
    if (!argStr) throw new Error("AI did not return structured output");

    let analysis: any;
    try {
      analysis = JSON.parse(argStr);
    } catch (e) {
      console.error("Failed to parse AI args", argStr);
      throw new Error("AI returned unparseable output");
    }

    // Persist
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const documentsMeta = data.documents.map((d) => ({ name: d.name, type: d.type, size: d.size }));

    const { data: row, error } = await supabaseAdmin
      .from("clients")
      .insert({
        name: data.name,
        email: data.email,
        analysis,
        documents: documentsMeta,
        risk_score: Math.round(analysis.risk_score ?? 0),
        opportunity_score: Math.round(analysis.opportunity_score ?? 0),
      })
      .select()
      .single();

    if (error) {
      console.error("Insert error", error);
      throw new Error(error.message);
    }

    return { id: row.id as string };
  });

export const getClient = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const listClients = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("id,name,email,risk_score,opportunity_score,documents,updated_at,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
});
