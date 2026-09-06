import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, Chip, Panel } from "@/components/AppShell";
import {
  byItemId,
  confidenceTrendQuery,
  itemsQuery,
  progressQuery,
} from "@/lib/lingo-data";
import {
  LANGUAGES,
  LEVELS,
  isMastered,
  isStruggling,
  languageLabel,
  levelLabel,
} from "@/lib/lingo";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress Detail — Lingo-SRS" },
      {
        name: "description",
        content:
          "Rincian penguasaan materi per bahasa dan level, daftar materi yang paling sering salah, serta tren keyakinan diri dari waktu ke waktu.",
      },
      { property: "og:title", content: "Progress Detail — Lingo-SRS" },
      {
        property: "og:description",
        content:
          "Lihat materi yang sudah dikuasai, yang masih lemah, dan tren metakognisimu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const items = useQuery(itemsQuery);
  const progress = useQuery(progressQuery);
  const trend = useQuery(confidenceTrendQuery);

  const allItems = items.data ?? [];
  const pmap = byItemId(progress.data ?? []);

  const weakest = allItems
    .map((i) => ({ item: i, p: pmap[i.id] }))
    .filter((x) => isStruggling(x.p))
    .sort((a, b) => (b.p?.times_wrong ?? 0) - (a.p?.times_wrong ?? 0))
    .slice(0, 6);

  const points = trend.data ?? [];
  const maxTrend = 4;

  return (
    <AppShell>
      <header className="mt-6">
        <h1 className="text-3xl font-extrabold">Progress detail</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Penguasaan dihitung dari materi yang sudah beberapa kali direview dengan
          keyakinan tinggi.
        </p>
      </header>

      <div className="mt-5 grid gap-4 sm:gap-5 lg:grid-cols-2">
        {LANGUAGES.map((lang) => (
          <Panel key={lang} title={languageLabel[lang]}>
            <div className="mt-3 space-y-4">
              {LEVELS.map((level) => {
                const scoped = allItems.filter(
                  (i) => i.language === lang && i.level === level,
                );
                const mastered = scoped.filter((i) => isMastered(pmap[i.id])).length;
                const weak = scoped.filter((i) => isStruggling(pmap[i.id])).length;
                const fresh = scoped.length - mastered - weak;
                const pct = scoped.length
                  ? Math.round((mastered / scoped.length) * 100)
                  : 0;
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span>{levelLabel[level]}</span>
                      <span className="text-brand">{pct}% dikuasai</span>
                    </div>
                    <div className="mt-1.5 flex h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="bg-brand"
                        style={{ width: `${(mastered / (scoped.length || 1)) * 100}%` }}
                      />
                      <div
                        className="bg-accent/70"
                        style={{ width: `${(weak / (scoped.length || 1)) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">
                      {mastered} dikuasai · {weak} masih sering salah · {fresh} baru
                    </p>
                  </div>
                );
              })}
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-12">
        <Panel
          title="Tren keyakinan diri"
          className="lg:col-span-7"
          right={
            <span className="text-[11px] font-bold text-muted-foreground">
              per hari sesi
            </span>
          }
        >
          {points.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Belum ada data. Tren muncul setelah sesi pertamamu.
            </p>
          ) : (
            <>
              <div className="mt-4 flex h-28 items-end gap-1.5">
                {points.slice(-14).map((p, idx, arr) => (
                  <div
                    key={p.date}
                    className={`flex-1 rounded-t ${
                      idx === arr.length - 1 ? "bg-accent" : "bg-brand/60"
                    }`}
                    style={{ height: `${Math.max(8, (p.avg / maxTrend) * 100)}%` }}
                    title={`${p.date}: ${p.avg.toFixed(1)}/4`}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[11px] font-semibold text-muted-foreground">
                <span>Awal</span>
                <span>
                  Hari ini · {(points[points.length - 1]?.avg ?? 0).toFixed(1)}/4
                </span>
              </div>
            </>
          )}
        </Panel>

        <Panel title="Paling sering salah" className="lg:col-span-5">
          <div className="mt-3 space-y-2">
            {weakest.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Belum ada titik lemah tercatat. Bagus!
              </p>
            )}
            {weakest.map(({ item, p }) => (
              <div key={item.id} className="rounded-2xl bg-accent/8 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold leading-tight">{item.topic}</p>
                  <Chip tone="muted">{p?.times_wrong ?? 0}x salah</Chip>
                </div>
                <p
                  className={`mt-1 text-[12px] text-muted-foreground ${
                    item.language === "zh" ? "font-cn" : ""
                  }`}
                >
                  {item.prompt}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                  {languageLabel[item.language]} · {levelLabel[item.level]} · {item.type}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
