import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function AppHeader({ active }: { active?: "consumer" | "broker" }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/upload"
            className={`rounded-md px-3 py-1.5 transition-colors ${
              active === "consumer" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Consumer
          </Link>
          <Link
            to="/broker"
            className={`rounded-md px-3 py-1.5 transition-colors ${
              active === "broker" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Broker workspace
          </Link>
        </nav>
      </div>
    </header>
  );
}
