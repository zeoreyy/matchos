export type InsuranceCategory =
  | "health"
  | "auto"
  | "home"
  | "life"
  | "travel"
  | "devices"
  | "pet"
  | "income"
  | "liability"
  | "other";

export interface InsurancePolicy {
  category: InsuranceCategory;
  provider?: string | null;
  product_name?: string | null;
  status?: "active" | "expired" | "pending" | "unknown" | null;
  renewal_date?: string | null;
  premium_monthly_eur?: number | null;
  coverage_summary?: string | null;
  confidence: number; // 0-1
  source_documents: string[];
}

export interface RiskGap {
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
  category?: InsuranceCategory;
}

export interface Overlap {
  title: string;
  detail: string;
  categories: InsuranceCategory[];
  estimated_waste_eur?: number | null;
}

export interface MissingInfo {
  title: string;
  detail: string;
  suggested_upload?: string;
}

export interface BrokerOpportunity {
  title: string;
  detail: string;
  priority: "low" | "medium" | "high";
  category?: InsuranceCategory;
}

export interface PremiumOptimization {
  title: string;
  detail: string;
  category?: InsuranceCategory;
  signal?: "rising_premium" | "outdated_policy" | "fragmented_providers" | "duplicate_spend" | "loyalty_inflation" | "other";
}

export interface InsuranceAnalysis {
  summary_plain_english: string;
  reconstruction_note?: string | null;
  policies: InsurancePolicy[];
  risk_gaps: RiskGap[];
  overlaps: Overlap[];
  missing_information: MissingInfo[];
  broker_opportunities: BrokerOpportunity[];
  premium_optimization?: PremiumOptimization[];
  financial: {
    estimated_monthly_total_eur?: number | null;
    upcoming_renewals_30d: number;
    distribution: Record<string, number>;
  };

  risk_score: number; // 0-100 (higher = more exposure)
  opportunity_score: number; // 0-100 (higher = more upsell potential)
  document_timeline: { document: string; date?: string | null; type?: string | null; note?: string | null }[];
}

export interface ClientRow {
  id: string;
  name: string;
  email: string;
  analysis: InsuranceAnalysis | null;
  documents: { name: string; type: string; size: number }[];
  risk_score: number | null;
  opportunity_score: number | null;
  created_at: string;
  updated_at: string;
}
