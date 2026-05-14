import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppHeader } from "@/components/AppHeader";
import { InsuranceMap } from "@/components/InsuranceMap";
import { getClient } from "@/lib/insurance.functions";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { InsuranceAnalysis } from "@/lib/types";

export const Route = createFileRoute("/dashboard/$clientId")({
  head: () => ({
    meta: [{ title: "Your insurance map — Polis/AI" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { clientId } = useParams({ from: "/dashboard/$clientId" });
  const fetchClient = useServerFn(getClient);
  const { data, isLoading, error } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => fetchClient({ data: { id: clientId } }),
  });

  return (
    <div className="min-h-screen">
      <AppHeader active="consumer" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link
          to="/upload"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Upload more documents
        </Link>

        {isLoading && (
          <div className="mt-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-sm">Loading your map…</p>
          </div>
        )}
        {error && (
          <p className="mt-10 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {(error as Error).message}
          </p>
        )}
        {data && (
          <>
            <header className="mb-8 mt-6">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Insurance map</p>
              <h1 className="mt-1 font-display text-4xl tracking-tight sm:text-5xl">
                Hi {data.name.split(" ")[0]} — here's what we found.
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Built from {(data.documents as any[])?.length ?? 0} uploaded artifacts. Confidence shown per coverage.
              </p>
            </header>
            <InsuranceMap analysis={data.analysis as unknown as InsuranceAnalysis} variant="consumer" />
          </>
        )}
      </main>
    </div>
  );
}
