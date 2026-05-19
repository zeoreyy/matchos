import type { InsuranceAnalysis, InsuranceCategory } from "@/lib/types";
import {
  HeartPulse,
  Car,
  Home,
  Plane,
  Smartphone,
  Shield,
  Briefcase,
  PawPrint,
  CircleEllipsis,
  Sparkles,
  AlertTriangle,
  CalendarClock,
  TrendingUp,
  FileSearch,
  Activity,
  Layers,
  Wand2,
  TrendingDown,
} from "lucide-react";

const CAT_META: Record<InsuranceCategory, { label: string; Icon: any; tint: string }> = {
  health: { label: "Health", Icon: HeartPulse, tint: "oklch(0.95 0.04 25)" },
  auto: { label: "Auto", Icon: Car, tint: "oklch(0.94 0.04 255)" },
  home: { label: "Home", Icon: Home, tint: "oklch(0.94 0.04 155)" },
  life: { label: "Life", Icon: Shield, tint: "oklch(0.94 0.04 320)" },
  travel: { label: "Travel", Icon: Plane, tint: "oklch(0.94 0.04 200)" },
  devices: { label: "Devices", Icon: Smartphone, tint: "oklch(0.94 0.04 70)" },
  pet: { label: "Pet", Icon: PawPrint, tint: "oklch(0.94 0.04 100)" },
  income: { label: "Income", Icon: Briefcase, tint: "oklch(0.94 0.04 280)" },
  liability: { label: "Liability", Icon: Shield, tint: "oklch(0.94 0.04 230)" },
  other: { label: "Other", Icon: CircleEllipsis, tint: "oklch(0.94 0.01 250)" },
};

function ConfidenceDot({ value }: { value: number }) {
  const pct = Math.round((value || 0) * 100);
  const color =
    pct >= 75 ? "var(--success)" : pct >= 45 ? "var(--warning)" : "var(--destructive)";
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {pct}% confidence
    </span>
  );
}

function SectionHead({ icon: Icon, title, count, hint }: any) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium tracking-tight">{title}</h3>
        {typeof count === "number" && (
          <span className="rounded-full border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

function PolicyCard({ p }: { p: InsuranceAnalysis["policies"][number] }) {
  const meta = CAT_META[p.category] ?? CAT_META.other;
  const { Icon } = meta;
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:border-border-strong hover:shadow-elevated">
      <div
        className="absolute inset-x-0 top-0 h-12 opacity-60"
        style={{ background: `linear-gradient(to bottom, ${meta.tint}, transparent)` }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface ring-1 ring-border">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{meta.label}</p>
            <p className="text-sm font-medium leading-tight">
              {p.provider || "Unknown provider"}
            </p>
          </div>
        </div>
        {p.status && (
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
              p.status === "active"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : p.status === "expired"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-border bg-surface text-muted-foreground"
            }`}
          >
            {p.status}
          </span>
        )}
      </div>

      {p.product_name && (
        <p className="relative mt-2 text-xs text-muted-foreground">{p.product_name}</p>
      )}
      {p.coverage_summary && (
        <p className="relative mt-3 line-clamp-3 text-xs leading-relaxed text-foreground/80">
          {p.coverage_summary}
        </p>
      )}

      <div className="relative mt-3 flex items-center justify-between border-t border-border/60 pt-3">
        <ConfidenceDot value={p.confidence} />
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {p.premium_monthly_eur != null && (
            <span className="font-mono">{Math.round(p.premium_monthly_eur)} €/mo</span>
          )}
          {p.renewal_date && (
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              {p.renewal_date}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function GapItem({ g }: { g: InsuranceAnalysis["risk_gaps"][number] }) {
  const tone =
    g.severity === "high"
      ? "border-rose-200 bg-rose-50/60"
      : g.severity === "medium"
        ? "border-amber-200 bg-amber-50/60"
        : "border-border bg-surface";
  return (
    <li className={`rounded-lg border p-3 ${tone}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{g.title}</p>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{g.severity}</span>
      </div>
      <p className="mt-1 text-xs text-foreground/80">{g.detail}</p>
    </li>
  );
}

function MissingItem({ m }: { m: InsuranceAnalysis["missing_information"][number] }) {
  return (
    <li className="rounded-lg border border-dashed border-border-strong bg-surface/50 p-3">
      <p className="text-sm font-medium">{m.title}</p>
      <p className="mt-1 text-xs text-foreground/80">{m.detail}</p>
      {m.suggested_upload && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Try uploading: <span className="text-foreground">{m.suggested_upload}</span>
        </p>
      )}
    </li>
  );
}

function FinancialBlock({ a }: { a: InsuranceAnalysis }) {
  const dist = Object.entries(a.financial.distribution || {}).slice(0, 6);
  const total = dist.reduce((s, [, v]) => s + (Number(v) || 0), 0) || 1;
  return (
    <div className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-soft sm:grid-cols-3">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Estimated monthly</p>
        <p className="mt-1 font-display text-3xl">
          {a.financial.estimated_monthly_total_eur != null
            ? `${Math.round(a.financial.estimated_monthly_total_eur)} €`
            : "—"}
        </p>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Renewals · 30d</p>
        <p className="mt-1 font-display text-3xl">{a.financial.upcoming_renewals_30d ?? 0}</p>
      </div>
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Distribution</p>
        <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
          {dist.map(([k, v], i) => {
            const pct = ((Number(v) || 0) / total) * 100;
            const meta = CAT_META[(k as InsuranceCategory) ?? "other"] ?? CAT_META.other;
            return (
              <div
                key={k}
                style={{ width: `${pct}%`, background: meta.tint, filter: "saturate(1.4) brightness(0.85)" }}
                title={`${meta.label}: ${Math.round(pct)}%`}
              />
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          {dist.map(([k]) => {
            const meta = CAT_META[(k as InsuranceCategory) ?? "other"] ?? CAT_META.other;
            return (
              <span key={k} className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.tint, filter: "saturate(1.4) brightness(0.85)" }} />
                {meta.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ value, label, tone }: { value: number; label: string; tone: "risk" | "opp" }) {
  const v = Math.max(0, Math.min(100, value));
  const color = tone === "risk" ? "oklch(0.62 0.2 25)" : "oklch(0.55 0.17 255)";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-soft">
      <div
        className="relative flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(${color} ${v * 3.6}deg, var(--secondary) 0)` }}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-card font-mono text-sm">
          {v}
        </div>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{tone === "risk" ? "Exposure" : "Opportunity"} score</p>
      </div>
    </div>
  );
}

export function InsuranceMap({
  analysis,
  variant = "consumer",
}: {
  analysis: InsuranceAnalysis;
  variant?: "consumer" | "broker";
}) {
  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          AI summary
        </div>
        <p className="mt-2 text-balance font-display text-2xl leading-snug sm:text-3xl">
          {analysis.summary_plain_english}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ScoreRing value={analysis.risk_score ?? 0} label="Coverage" tone="risk" />
          <ScoreRing value={analysis.opportunity_score ?? 0} label={variant === "broker" ? "Upsell" : "Optimization"} tone="opp" />
        </div>
      </div>

      {/* Reconstruction note */}
      {analysis.reconstruction_note && (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-4">
          <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Profile reconstruction</p>
            <p className="mt-0.5 text-sm text-foreground/90">{analysis.reconstruction_note}</p>
          </div>
        </div>
      )}

      {/* Financial */}
      <FinancialBlock a={analysis} />


      {/* Policies */}
      <section>
        <SectionHead icon={Layers} title="Insurance map" count={analysis.policies.length} hint="Detected coverages" />
        {analysis.policies.length === 0 ? (
          <p className="text-sm text-muted-foreground">No policies detected from current uploads.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {analysis.policies.map((p, i) => (
              <PolicyCard key={i} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* Risk gaps + Overlaps */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionHead icon={AlertTriangle} title="Possible risk gaps" count={analysis.risk_gaps.length} />
          <ul className="space-y-2">
            {analysis.risk_gaps.length === 0 ? (
              <li className="text-sm text-muted-foreground">No gaps surfaced.</li>
            ) : (
              analysis.risk_gaps.map((g, i) => <GapItem key={i} g={g} />)
            )}
          </ul>
        </section>
        <section>
          <SectionHead icon={Activity} title="Potential overlaps" count={analysis.overlaps.length} />
          <ul className="space-y-2">
            {analysis.overlaps.length === 0 ? (
              <li className="text-sm text-muted-foreground">No overlaps detected.</li>
            ) : (
              analysis.overlaps.map((o, i) => (
                <li key={i} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{o.title}</p>
                    {o.estimated_waste_eur != null && (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        ~{Math.round(o.estimated_waste_eur)} €/mo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-foreground/80">{o.detail}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      {/* Missing info */}
      <section>
        <SectionHead icon={FileSearch} title="Missing information" count={analysis.missing_information.length} hint="What to upload next" />
        <ul className="grid gap-2 sm:grid-cols-2">
          {analysis.missing_information.map((m, i) => (
            <MissingItem key={i} m={m} />
          ))}
        </ul>
      </section>

      {/* Broker view extras */}
      {variant === "broker" && (
        <section>
          <SectionHead icon={TrendingUp} title="Broker priority actions" count={analysis.broker_opportunities.length} />
          <ul className="space-y-2">
            {analysis.broker_opportunities.map((o, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    o.priority === "high"
                      ? "bg-rose-500"
                      : o.priority === "medium"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{o.title}</p>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{o.priority}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-foreground/80">{o.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Document timeline */}
      <section>
        <SectionHead icon={CalendarClock} title="Document timeline" count={analysis.document_timeline.length} />
        <ol className="relative space-y-3 border-l border-border pl-4">
          {analysis.document_timeline.map((d, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-foreground/70 ring-4 ring-background" />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-sm font-medium">{d.document}</p>
                {d.type && <span className="text-[11px] text-muted-foreground">· {d.type}</span>}
                {d.date && <span className="font-mono text-[11px] text-muted-foreground">{d.date}</span>}
              </div>
              {d.note && <p className="mt-0.5 text-xs text-foreground/70">{d.note}</p>}
            </li>
          ))}
        </ol>
      </section>

      <p className="pt-4 text-center text-[11px] text-muted-foreground">
        AI-generated visibility — not legal or financial advice. Always confirm details with your broker.
      </p>
    </div>
  );
}
