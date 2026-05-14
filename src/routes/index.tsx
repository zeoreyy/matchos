import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Layers, ShieldCheck, FileSearch } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Polis/AI — Turn insurance chaos into a live intelligence map" },
      {
        name: "description",
        content:
          "Upload PDFs, screenshots, emails and renewal notices. Polis/AI reconstructs a structured insurance intelligence map for consumers and brokers.",
      },
      { property: "og:title", content: "Polis/AI — Insurance intelligence workspace" },
      {
        property: "og:description",
        content:
          "AI-native workspace that turns fragmented insurance documents into structured coverage maps, gap detection, and broker-ready insight.",
      },
    ],
  }),
  component: Landing,
});

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {children}
    </span>
  );
}

function Landing() {
  return (
    <div className="min-h-screen">
      <AppHeader />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-aurora opacity-90" />
        <div className="pointer-events-none absolute inset-0 grain opacity-40" />
        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-24 text-center sm:pt-28 sm:pb-32">
          <Pill>Hackathon MVP · optimized for Iberian insurance</Pill>
          <h1 className="mt-6 text-balance font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl">
            Turn insurance chaos into a live{" "}
            <span className="italic text-primary">intelligence map</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            Upload any insurance artifact — PDFs, screenshots, photos, emails, renewal notices,
            WhatsApp messages — and watch Polis/AI reconstruct a structured view of your coverage,
            gaps, overlaps and renewals.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/upload"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
            >
              I'm a consumer — upload my docs
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/broker"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium hover:border-foreground/40"
            >
              I'm a broker — open workspace
            </Link>
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground">
            No account. No setup. Drop in real documents and see the magic.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              Icon: Sparkles,
              title: "Universal ingestion",
              body: "Anything insurance-related: PDFs, screenshots, scans, emails, photos of letters, WhatsApp threads — Polis/AI accepts the chaos.",
            },
            {
              Icon: Layers,
              title: "Structured map",
              body: "Health, auto, home, life, travel, devices and more — each card with provider, status, renewal and confidence.",
            },
            {
              Icon: FileSearch,
              title: "Gaps · overlaps · missing info",
              body: "Where you're potentially under- or over-covered, plus what to upload next to sharpen the picture.",
            },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-card p-6 shadow-soft sm:flex-row sm:items-center">
          <div>
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <p className="mt-3 max-w-xl text-balance text-base">
              Polis/AI is an insurance <em className="font-display">relationship</em> workspace —
              not a chatbot, not a comparator, not a replacement for your broker.
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm text-background"
          >
            Try it now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
