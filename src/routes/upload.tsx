import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppHeader } from "@/components/AppHeader";
import { FileDropzone, type PreparedFile } from "@/components/FileDropzone";
import { analyzeDocuments } from "@/lib/insurance.functions";
import { Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload your insurance documents — Polis/AI" },
      {
        name: "description",
        content:
          "Drop any insurance artifact and Polis/AI will rebuild your coverage map in seconds.",
      },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeDocuments);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState<PreparedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim() && email.trim() && files.length > 0 && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyze({
        data: {
          name: name.trim(),
          email: email.trim(),
          documents: files,
        },
      });
      navigate({ to: "/dashboard/$clientId", params: { clientId: res.id } });
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader active="consumer" />

      <main className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-aurora opacity-70" />
        <div className="mx-auto max-w-3xl px-6 pt-16 pb-24">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              Step 1 · introduce yourself & drop your docs
            </span>
            <h1 className="mt-5 text-balance font-display text-4xl leading-tight tracking-tight sm:text-5xl">
              Let's rebuild your insurance picture.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Two quick fields, then drop anything insurance-related. We'll do the structuring.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-10 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-elevated">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Full name</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maria Santos"
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-ring/20"
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria@email.pt"
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-ring/20"
                />
              </label>
            </div>

            <FileDropzone files={files} onChange={setFiles} disabled={loading} />

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-muted-foreground">
                Stays private to this demo. AI-generated visibility, not legal advice.
              </p>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reconstructing your map…
                  </>
                ) : (
                  <>Generate insurance map</>
                )}
              </button>
            </div>
          </form>

          {loading && (
            <div className="mt-6 grid gap-2 text-center text-xs text-muted-foreground">
              <p>Reading your documents · classifying providers · detecting renewals</p>
              <p>Inferring categories · spotting gaps · estimating overlaps</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
