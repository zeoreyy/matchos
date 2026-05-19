import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppHeader } from "@/components/AppHeader";
import { listClients } from "@/lib/insurance.functions";
import { ArrowUpRight, Loader2, Users } from "lucide-react";

export const Route = createFileRoute("/broker")({
  head: () => ({
    meta: [
      { title: "Broker workspace — Polis/AI" },
      { name: "description", content: "AI-reconstructed client portfolios with opportunity, gap and renewal intelligence." },
    ],
  }),
  component: BrokerHome,
});


function ScoreBar({ value, tone }: { value: number | null; tone: "risk" | "opp" }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const color = tone === "risk" ? "oklch(0.62 0.2 25)" : "oklch(0.55 0.17 255)";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-20 overflow-hidden rounded-full bg-secondary">
        <div className="h-full" style={{ width: `${v}%`, background: color }} />
      </div>
      <span className="font-mono text-[10px] text-muted-foreground">{v}</span>
    </div>
  );
}

function BrokerHome() {
  const fn = useServerFn(listClients);
  const { data, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => fn(),
    refetchOnWindowFocus: true,
  });

  return (
    <div className="min-h-screen">
      <AppHeader active="broker" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Broker workspace</p>
            <h1 className="mt-1 font-display text-4xl tracking-tight sm:text-5xl">Client portfolios</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Each consumer upload becomes a structured insurance intelligence profile — opportunities, gaps and renewals at a glance.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {data?.length ?? 0} clients
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading clients…
            </div>
          ) : !data || data.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">No clients yet.</p>
              <Link
                to="/upload"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background"
              >
                Upload a sample profile
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Client</th>
                  <th className="px-5 py-3 text-left font-medium">Docs</th>
                  <th className="px-5 py-3 text-left font-medium">Coverage</th>
                  <th className="px-5 py-3 text-left font-medium">Opportunity</th>
                  <th className="px-5 py-3 text-left font-medium">Updated</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.map((c: any) => (
                  <tr
                    key={c.id}
                    className="group border-t border-border transition-colors hover:bg-surface-2/60"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground">{c.email}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      {(c.documents as any[])?.length ?? 0}
                    </td>
                    <td className="px-5 py-4">
                      <ScoreBar value={c.risk_score} tone="risk" />
                    </td>
                    <td className="px-5 py-4">
                      <ScoreBar value={c.opportunity_score} tone="opp" />
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {new Date(c.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        to="/broker/$clientId"
                        params={{ clientId: c.id }}
                        className="inline-flex items-center gap-1 text-xs text-foreground opacity-60 group-hover:opacity-100"
                      >
                        Open <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
