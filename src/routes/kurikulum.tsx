import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, Chip, Panel } from "@/components/AppShell";
import { byItemId, itemsQuery, progressQuery } from "@/lib/lingo-data";
import {
  LANGUAGES,
  LEVELS,
  languageLabel,
  levelLabel,
  masteryPercent,
  unlockedLevels,
} from "@/lib/lingo";

export const Route = createFileRoute("/kurikulum")({
  head: () => ({
    meta: [
      { title: "Peta Kurikulum — Lingo-SRS" },
      {
        name: "description",
        content:
          "Jalur belajar Pemula → Menengah → Mahir untuk Inggris dan Mandarin: topik di setiap level, mana yang sudah terbuka dan mana yang masih terkunci.",
      },
      { property: "og:title", content: "Peta Kurikulum — Lingo-SRS" },
      {
        property: "og:description",
        content:
          "Level lanjut terbuka setelah level sebelumnya cukup dikuasai (minimal 50%).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KurikulumPage,
});

function KurikulumPage() {
  const items = useQuery(itemsQuery);
  const progress = useQuery(progressQuery);
  const allItems = items.data ?? [];
  const pmap = byItemId(progress.data ?? []);

  return (
    <AppShell>
      <header className="mt-6">
        <h1 className="text-3xl font-extrabold">Peta kurikulum</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Level berikutnya terbuka setelah level sebelumnya dikuasai minimal 50%.
        </p>
      </header>

      <div className="mt-5 space-y-4 sm:space-y-5">
        {LANGUAGES.map((lang) => {
          const unlocked = unlockedLevels(allItems, pmap, lang);
          return (
            <Panel key={lang} title={languageLabel[lang]}>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {LEVELS.map((level, i) => {
                  const open = unlocked[level];
                  const pct = masteryPercent(allItems, pmap, lang, level);
                  const topics = [
                    ...new Set(
                      allItems
                        .filter((it) => it.language === lang && it.level === level)
                        .map((it) => it.topic),
                    ),
                  ];
                  return (
                    <div
                      key={level}
                      className={`gloss relative rounded-3xl p-4 outline-1 -outline-offset-1 ${
                        open
                          ? "bg-card outline-brand/30"
                          : "bg-muted/50 outline-border opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
                          Tahap {i + 1}
                        </span>
                        {open ? (
                          <Chip tone="brand">{pct}% dikuasai</Chip>
                        ) : (
                          <Chip tone="muted">Terkunci</Chip>
                        )}
                      </div>
                      <h2 className="mt-2 text-xl font-extrabold">{levelLabel[level]}</h2>
                      <ul className="mt-3 space-y-1.5">
                        {topics.map((t) => (
                          <li
                            key={t}
                            className="flex items-center gap-2 text-sm font-semibold"
                          >
                            <span
                              className={`size-1.5 shrink-0 rounded-full ${
                                open ? "bg-brand" : "bg-muted-foreground/50"
                              }`}
                            />
                            {t}
                          </li>
                        ))}
                      </ul>
                      {!open && (
                        <p className="mt-3 text-[11px] font-semibold text-muted-foreground">
                          Kuasai tahap sebelumnya dulu untuk membuka tahap ini.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </div>
    </AppShell>
  );
}
