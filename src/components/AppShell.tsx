import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Beranda" },
  { to: "/progress", label: "Progress" },
  { to: "/kurikulum", label: "Kurikulum" },
  { to: "/kursus", label: "Kursus" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-16 -right-10 size-72 rounded-full bg-brand/20 blur-3xl"
          style={{ animation: "floaty 7s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none absolute top-52 -left-16 size-64 rounded-full bg-accent/20 blur-3xl"
          style={{ animation: "floaty2 9s ease-in-out infinite" }}
        />
        <div className="pointer-events-none absolute bottom-10 right-1/4 size-56 rounded-full bg-mint/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pt-5 pb-28 sm:px-5 sm:pb-8">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="gloss grid size-9 place-items-center rounded-xl bg-brand-gradient font-display text-primary-foreground shadow-glow">
                L
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight">
                Lingo<span className="text-accent">-SRS</span>
              </span>
            </Link>
            <div className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground sm:flex">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeProps={{ className: "text-foreground" }}
                  className="transition-colors hover:text-foreground"
                >
                  {n.label}
                </Link>
              ))}
            </div>
            <span className="gloss chrome grid size-9 place-items-center rounded-full text-xs font-bold">
              AK
            </span>
          </nav>

          {children}

          <footer className="mt-8 hidden flex-col items-center justify-between gap-2 border-t border-border pt-5 text-xs font-semibold text-muted-foreground sm:flex sm:flex-row">
            <span>Lingo-SRS · belajar yang disengaja, bukan kebetulan</span>
            <span>Retrieval · Spaced Repetition · Interleaving · Metakognisi</span>
          </footer>
        </div>
      </div>

      {/* Bottom tab nav — mobile, mudah dijangkau satu tangan */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/90 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2 py-2">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-brand" }}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-bold text-muted-foreground"
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function Panel({
  title,
  children,
  className = "",
  right,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  right?: ReactNode;
}) {
  return (
    <section className={`gloss rounded-3xl bg-card p-5 shadow-card ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between gap-2">
          {title && (
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {title}
            </p>
          )}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Chip({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "accent" | "sky" | "muted";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand/10 text-brand",
    accent: "bg-accent/10 text-accent",
    sky: "bg-sky/15 text-skyed",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Bar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2.5 overflow-hidden rounded-full bg-muted ${className}`}>
      <div
        className="h-full rounded-full bg-track-gradient transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(2, value))}%` }}
      />
    </div>
  );
}
