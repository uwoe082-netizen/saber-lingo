import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, Bar, Panel } from "@/components/AppShell";
import { byItemId, itemsQuery, progressQuery, sessionsQuery } from "@/lib/lingo-data";
import {
  LANGUAGES,
  LEVELS,
  dueCount,
  formatDateShort,
  languageLabel,
  levelLabel,
  masteryPercent,
} from "@/lib/lingo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lingo-SRS — Latihan Inggris & Mandarin 10 Menit Sehari" },
      {
        name: "description",
        content:
          "Beranda Lingo-SRS: lihat materi yang jatuh tempo hari ini, progres per bahasa dan level, lalu mulai sesi belajar singkat berbasis spaced repetition.",
      },
      { property: "og:title", content: "Lingo-SRS — Latihan Inggris & Mandarin harian" },
      {
        property: "og:description",
        content:
          "Sesi 5-15 menit dengan retrieval practice, spaced repetition, interleaving, dan metakognisi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Beranda,
});

function Beranda() {
  const items = useQuery(itemsQuery);
  const progress = useQuery(progressQuery);
  const sessions = useQuery(sessionsQuery);

  const allItems = items.data ?? [];
  const pmap = byItemId(progress.data ?? []);
  const due = dueCount(allItems, pmap);
  const dueEn = dueCount(allItems, pmap, (i) => i.language === "en");
  const dueZh = dueCount(allItems, pmap, (i) => i.language === "zh");
  const recent = (sessions.data ?? []).slice(0, 3);
  const loading = items.isLoading || progress.isLoading;

  return (
    <AppShell>
      <div className="mt-6 grid gap-4 sm:gap-5 lg:grid-cols-12">
        <section className="gloss relative overflow-hidden rounded-[28px] bg-brand-gradient p-6 text-primary-foreground shadow-glow lg:col-span-7">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 85% 10%, oklch(1 0 0 / 0.45), transparent 45%)",
            }}
          />
          <div className="relative flex items-center justify-between">
            <span className="rounded-full bg-card/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
              Sesi Interleaved
            </span>
            <div className="flex h-6 items-end gap-1">
              <span className="eq-bar" />
              <span className="eq-bar" style={{ animationDelay: ".15s" }} />
              <span className="eq-bar" style={{ animationDelay: ".3s" }} />
              <span className="eq-bar" style={{ animationDelay: ".45s" }} />
            </div>
          </div>
          <h1 className="relative mt-5 text-4xl font-extrabold leading-[1.05]">
            Mulai sesi
            <br />
            hari ini
          </h1>
          <p className="relative mt-2 max-w-sm text-sm opacity-80">
            {loading
              ? "Menyiapkan materimu…"
              : due > 0
                ? `${due} materi jatuh tempo. Campur Inggris & Mandarin biar otakmu tetap waspada — variasi ini disengaja, bukan acak.`
                : "Tidak ada yang jatuh tempo. Kamu tetap bisa berlatih materi baru — santai saja, tidak ada yang hangus."}
          </p>
          <div className="relative mt-5 flex flex-wrap gap-2">
            {["Kosakata", "Tata bahasa", "Nada (拼音)", "Terjemahan"].map((t) => (
              <span
                key={t}
                className="rounded-full bg-card/15 px-3 py-1 text-xs font-semibold"
              >
                {t}
              </span>
            ))}
          </div>
          <Link
            to="/sesi"
            className="gloss relative mt-6 inline-flex items-center gap-2 rounded-2xl bg-card px-6 py-3.5 text-base font-extrabold text-brand shadow-chrome"
          >
            Mulai Sesi Hari Ini
            <span className="grid size-5 place-items-center rounded-full bg-brand text-primary-foreground">
              →
            </span>
          </Link>
          <p className="relative mt-3 text-[11px] opacity-60">
            Perkiraan 8 menit · 1 soal per waktu
          </p>
        </section>

        <aside className="flex flex-col gap-4 sm:gap-5 lg:col-span-5">
          <Panel title="Jatuh tempo hari ini">
            <div className="mt-2 flex items-end gap-2">
              <span className="font-display text-5xl font-extrabold text-brand">
                {loading ? "…" : due}
              </span>
              <span className="mb-2 text-sm font-semibold text-muted-foreground">
                materi
              </span>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {(
                [
                  ["Inggris", dueEn, allItems.filter((i) => i.language === "en").length],
                  ["Mandarin", dueZh, allItems.filter((i) => i.language === "zh").length],
                ] as const
              ).map(([label, count, total]) => (
                <div key={label}>
                  <div className="flex justify-between font-semibold">
                    <span>{label}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <Bar value={total ? (count / total) * 100 : 0} className="mt-1" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Progres per level">
            <div className="mt-3 space-y-3">
              {LANGUAGES.map((lang) => (
                <div key={lang}>
                  <p className="text-sm font-bold">{languageLabel[lang]}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    {LEVELS.map((level) => {
                      const pct = masteryPercent(allItems, pmap, lang, level);
                      return (
                        <div key={level} className="rounded-2xl bg-muted/70 p-2">
                          <p className="font-display text-lg font-extrabold text-brand">
                            {pct}%
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                            {levelLabel[level]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </div>

      <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-12">
        <Panel title="Sesi terakhir" className="lg:col-span-7">
          <div className="mt-3 space-y-2.5">
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Belum ada sesi tersimpan. Sesi pertamamu akan muncul di sini.
              </p>
            )}
            {recent.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3"
              >
                <span className="text-sm font-semibold">
                  {formatDateShort(s.finished_at ?? s.started_at)} · {s.question_count}{" "}
                  soal
                </span>
                <span className="text-sm font-extrabold text-brand">
                  {s.avg_confidence?.toFixed(1) ?? "–"}
                  <span className="text-muted-foreground">/4</span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Telat beberapa hari? Tidak masalah — materi lama hanya menunggu, bukan hilang.
          </p>
        </Panel>

        <Panel title="Cara kerjanya" className="lg:col-span-5">
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="font-bold text-foreground">Retrieval</span> — kamu mengetik
              jawaban, bukan memilih.
            </li>
            <li>
              <span className="font-bold text-foreground">Interleaving</span> — bahasa &
              tipe soal berganti tiap nomor.
            </li>
            <li>
              <span className="font-bold text-foreground">Spaced repetition</span> —
              jadwal review menyesuaikan keyakinanmu.
            </li>
            <li>
              <span className="font-bold text-foreground">Metakognisi</span> — nilai
              keyakinanmu sendiri tiap soal.
            </li>
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
