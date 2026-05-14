import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppHeader } from "@/components/AppHeader";
import { InsuranceMap } from "@/components/InsuranceMap";
import { getClient } from "@/lib/insurance.functions";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import type { InsuranceAnalysis } from "@/lib/types";

export const Route = createFileRoute("/broker/$clientId")({
  head: () => ({
    meta: [{ title: "Client profile — Polis/AI broker" }],
  }),
  component: BrokerClient,
});

function BrokerClient() {
  const { clientId } = useParams({ from: "/broker/$clientId" });
  const fn = useServerFn(getClient);
  const { data, isLoading, error } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => fn({ data: { id: clientId } }),
  });

  return (
    <div className="min-h-screen">
      <AppHeader active="broker" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/broker" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          All clients
        </Link>

        {isLoading && (
          <div className="mt-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-sm">Loading profile…</p>
          </div>
        )}
        {error && (
          <p className="mt-10 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {(error as Error).message}
          </p>
        )}
        {data && (
          <>
            <header className="mt-6 mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Client profile</p>
                <h1 className="mt-1 font-display text-4xl tracking-tight sm:text-5xl">{data.name}</h1>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {data.email}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] text-muted-foreground">
                  {(data.documents as any[])?.length ?? 0} documents
                </span>
                <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] text-muted-foreground">
                  Updated {new Date(data.updated_at).toLocaleDateString()}
                </span>
              </div>
            </header>
            <InsuranceMap analysis={data.analysis as unknown as InsuranceAnalysis} variant="broker" />
          </>
        )}
      </main>
    </div>
  );
}
