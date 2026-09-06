import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell, Chip, Panel } from "@/components/AppShell";
import {
  byItemId,
  createSession,
  finishSession,
  itemsQuery,
  progressQuery,
  recordAnswer,
} from "@/lib/lingo-data";
import {
  CONFIDENCE_OPTIONS,
  DIFFICULTY_OPTIONS,
  type Item,
  buildSession,
  formatInterval,
  isAnswerCorrect,
  languageLabel,
  levelLabel,
  unlockedLevels,
} from "@/lib/lingo";

export const Route = createFileRoute("/sesi")({
  head: () => ({
    meta: [
      { title: "Sesi Belajar — Lingo-SRS" },
      {
        name: "description",
        content:
          "Satu soal per waktu: ketik jawabanmu, lihat umpan balik, nilai keyakinan dirimu 1-4, dan sistem menjadwalkan review berikutnya.",
      },
      { property: "og:title", content: "Sesi Belajar — Lingo-SRS" },
      {
        property: "og:description",
        content:
          "Sesi retrieval practice 10-15 soal dengan bahasa dan tipe soal yang sengaja diselang-seling.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SesiPage,
});

type Phase = "answering" | "feedback" | "rating" | "scheduled";

function SesiPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const items = useQuery(itemsQuery);
  const progress = useQuery(progressQuery);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [queue, setQueue] = useState<Item[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [phase, setPhase] = useState<Phase>("answering");
  const [correct, setCorrect] = useState(false);
  const [confidences, setConfidences] = useState<number[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [scheduleText, setScheduleText] = useState("");
  const [done, setDone] = useState(false);
  const [savedSummary, setSavedSummary] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pmap = useMemo(() => byItemId(progress.data ?? []), [progress.data]);

  useEffect(() => {
    if (queue || !items.data || !progress.data) return;
    const unlocked = {
      en: unlockedLevels(items.data, pmap, "en"),
      zh: unlockedLevels(items.data, pmap, "zh"),
    };
    const picked = buildSession(items.data, pmap, (i) => unlocked[i.language][i.level]);
    setQueue(picked);
    if (picked.length > 0) createSession().then(setSessionId);
  }, [items.data, progress.data, pmap, queue]);

  useEffect(() => {
    if (phase === "answering") inputRef.current?.focus();
  }, [phase, index]);

  const current = queue?.[index];
  const total = queue?.length ?? 0;
  const avgConfidence = confidences.length
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0;

  function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!current || phase !== "answering") return;
    const ok = isAnswerCorrect(answer, current.answer);
    setCorrect(ok);
    if (ok) setCorrectCount((c) => c + 1);
    setPhase("rating");
  }

    async function rate(confidence: number) {
    if (!current || !sessionId) return;
    const prev = pmap[current.id];
    setConfidences((c) => [...c, confidence]);
    setPhase("scheduled");
    try {
      const result = await recordAnswer({
        sessionId,
        item: current,
        progress: prev,
        userAnswer: answer,
        correct,
        confidence,
      });
      setScheduleText(formatInterval(result.interval_days));
    } catch {
      setScheduleText("segera");
      /* jawaban tetap lanjut walau simpan gagal */
    }
    window.setTimeout(() => {
      if (index + 1 >= total) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
        setAnswer("");
        setPhase("answering");
      }
    }, 1100);
  }

  async function submitDifficulty(difficulty: number) {
    if (!sessionId) return;
    setSavedSummary(true);
    try {
      await finishSession({
        sessionId,
        questionCount: total,
        correctCount,
        avgConfidence: Number(avgConfidence.toFixed(2)),
        difficulty,
      });
    } finally {
      queryClient.invalidateQueries();
      navigate({ to: "/" });
    }
  }

  if (items.isLoading || progress.isLoading || !queue) {
    return (
      <AppShell>
        <Panel className="mt-6">
          <p className="text-sm font-semibold text-muted-foreground">
            Menyiapkan sesi…
          </p>
        </Panel>
      </AppShell>
    );
  }

  if (queue.length === 0) {
    return (
      <AppShell>
        <Panel className="mt-6" title="Sesi kosong">
          <h1 className="mt-2 text-2xl font-extrabold">Semua materi sudah terjadwal</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tidak ada materi yang jatuh tempo sekarang. Kembali lagi nanti — jadwalnya
            justru bekerja saat kamu menunggu.
          </p>
        </Panel>
      </AppShell>
    );
  }

  if (done) {
    return (
      <AppShell>
        <section className="mt-6 rounded-[28px] chrome p-1.5 shadow-chrome">
          <div className="gloss card-enter rounded-[22px] bg-card p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Sesi selesai
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">Kerja bagus 🎉</h1>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-muted/70 p-3">
                <p className="font-display text-2xl font-extrabold text-brand">{total}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Soal
                </p>
              </div>
              <div className="rounded-2xl bg-mint/15 p-3">
                <p className="font-display text-2xl font-extrabold text-emerald">
                  {correctCount}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Benar
                </p>
              </div>
              <div className="rounded-2xl bg-accent/10 p-3">
                <p className="font-display text-2xl font-extrabold text-accent">
                  {avgConfidence.toFixed(1)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Keyakinan
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-dashed border-border pt-5">
              <p className="text-sm font-bold">
                Seberapa menantang sesi ini secara keseluruhan?
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    disabled={savedSummary}
                    onClick={() => submitDifficulty(opt.value)}
                    className="gloss rounded-2xl bg-card p-3 text-left outline-1 -outline-offset-1 outline-border transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <span className="font-display text-2xl font-extrabold">
                      {opt.value}
                    </span>
                    <p className="mt-1 text-[11px] font-semibold leading-tight text-muted-foreground">
                      {opt.label}
                    </p>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Setelah dijawab, sesi tersimpan dan kamu kembali ke beranda.
              </p>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  if (!current) return null;

  return (
    <AppShell>
      <section className="mt-6 rounded-[28px] chrome p-1.5 shadow-chrome">
        <div key={current.id} className="gloss card-enter rounded-[22px] bg-card p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Chip tone="brand">{languageLabel[current.language]}</Chip>
              <Chip tone="accent">{current.type}</Chip>
              <Chip tone="sky">{levelLabel[current.level]}</Chip>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
              Soal {index + 1} / {total}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-track-gradient transition-[width] duration-300"
              style={{ width: `${((index + (phase === "answering" ? 0 : 1)) / total) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] font-semibold text-muted-foreground">
            Bahasa & tipe soal sengaja diselang-seling (interleaving).
          </p>

          <p className="mt-6 text-sm font-semibold text-muted-foreground">
            {current.topic}
          </p>
          <p
            className={`mt-2 text-2xl font-extrabold leading-snug ${
              current.language === "zh" ? "font-cn" : "font-display"
            }`}
          >
            {current.prompt}
          </p>
          {current.hint && (
            <p className="mt-2 text-xs text-muted-foreground">petunjuk: {current.hint}</p>
          )}

          <form onSubmit={submitAnswer} className="mt-6 flex gap-3">
            <input
              ref={inputRef}
              value={answer}
              disabled={phase !== "answering"}
              onChange={(e) => setAnswer(e.target.value)}
              autoComplete="off"
              className="flex-1 rounded-2xl border border-input bg-card px-5 py-4 text-base font-semibold placeholder:text-muted-foreground focus:ring-4 focus:ring-ring/20 focus:outline-none disabled:opacity-70"
              placeholder="ketik jawabanmu…"
            />
            {phase === "answering" && (
              <button
                type="submit"
                className="gloss rounded-2xl bg-brand-gradient px-6 py-4 text-base font-extrabold text-primary-foreground shadow-glow active:scale-95"
              >
                Kirim
              </button>
            )}
          </form>

          {phase !== "answering" && (
            <div
              className={`mt-4 rounded-2xl p-4 ${
                correct ? "bg-mint/15 text-emerald" : "bg-accent/10 text-accent"
              }`}
            >
              <p className="text-sm font-extrabold">
                {correct ? "Tepat sekali!" : "Belum tepat"}
              </p>
              {!correct && (
                <p className="mt-1 text-sm font-semibold text-foreground">
                  Jawaban benar:{" "}
                  <span className={current.language === "zh" ? "font-cn" : ""}>
                    {current.answer}
                  </span>
                </p>
              )}
            </div>
          )}

          {phase === "rating" && (
            <div className="mt-5 border-t border-dashed border-border pt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Seberapa yakin jawabanmu? (wajib)
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {CONFIDENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => rate(opt.value)}
                    className="gloss rounded-2xl bg-card p-3 text-left outline-1 -outline-offset-1 outline-border transition-transform active:scale-95"
                  >
                    <span className="font-display text-2xl font-extrabold">
                      {opt.value}
                    </span>
                    <p className="mt-1 text-[11px] font-semibold leading-tight text-muted-foreground">
                      {opt.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === "scheduled" && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-mint/15 px-4 py-3 text-sm font-semibold text-emerald">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-mint text-xs text-ink">
                ✓
              </span>
              Materi ini akan direview lagi {scheduleText}.
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
