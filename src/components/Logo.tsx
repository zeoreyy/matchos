import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 group ${className}`}>
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
        <span className="absolute inset-0 rounded-lg bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
        <svg viewBox="0 0 24 24" className="relative h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
        </svg>
      </span>
      <span className="text-sm font-medium tracking-tight">
        Polis<span className="text-muted-foreground">/AI</span>
      </span>
    </Link>
  );
}
