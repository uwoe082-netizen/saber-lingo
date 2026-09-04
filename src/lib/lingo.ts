export type Language = "en" | "zh";
export type Level = "pemula" | "menengah" | "mahir";
export type ItemType = "kosakata" | "tata bahasa" | "nada" | "terjemahan";

export type Item = {
  id: string;
  language: Language;
  level: Level;
  topic: string;
  type: ItemType;
  prompt: string;
  answer: string;
  hint: string;
};

export type Progress = {
  id: string;
  item_id: string;
  times_seen: number;
  times_correct: number;
  times_wrong: number;
  last_confidence: number | null;
  streak: number;
  interval_days: number;
  due_at: string;
};

export type StudySession = {
  id: string;
  started_at: string;
  finished_at: string | null;
  question_count: number;
  correct_count: number;
  avg_confidence: number | null;
  difficulty_rating: number | null;
};

export const LANGUAGES: Language[] = ["en", "zh"];
export const LEVELS: Level[] = ["pemula", "menengah", "mahir"];

export const languageLabel: Record<Language, string> = {
  en: "Inggris",
  zh: "Mandarin",
};

export const levelLabel: Record<Level, string> = {
  pemula: "Pemula",
  menengah: "Menengah",
  mahir: "Mahir",
};

export const CONFIDENCE_OPTIONS = [
  { value: 1, label: "Lupa total / menebak" },
  { value: 2, label: "Ingat tapi ragu" },
  { value: 3, label: "Ingat, cukup yakin" },
  { value: 4, label: "Sangat yakin / mudah" },
] as const;

export const DIFFICULTY_OPTIONS = [
  { value: 1, label: "Terasa ringan" },
  { value: 2, label: "Cukup pas" },
  { value: 3, label: "Agak menantang" },
  { value: 4, label: "Sangat menantang" },
] as const;

export const SESSION_TARGET = 12;

/** Loose answer comparison: case, spasi, dan tanda baca diabaikan. */
export function isAnswerCorrect(given: string, expected: string) {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,!?;:'"()\/]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const a = norm(given);
  const b = norm(expected);
  if (!a) return false;
  if (a === b) return true;
  // jawaban benar bisa berisi beberapa alternatif dipisah "/"
  return expected
    .split("/")
    .map((part) => norm(part))
    .some((part) => part.length > 0 && part === a);
}

/** Jadwal spaced repetition sederhana berbasis keyakinan diri + benar/salah. */
export function nextIntervalDays(
  previousInterval: number,
  confidence: number,
  correct: boolean,
): number {
  if (!correct || confidence === 1) return 0.5;
  const base = previousInterval > 0 ? previousInterval : 1;
  if (confidence === 2) return Math.min(60, Math.max(1, Math.round(base * 1.5)));
  if (confidence === 3) return Math.min(120, Math.max(3, Math.round(base * 2.3)));
  return Math.min(240, Math.max(5, Math.round(base * 3.1)));
}

export function formatInterval(days: number) {
  if (days < 1) return "beberapa jam lagi";
  if (days === 1) return "besok";
  if (days < 30) return `${days} hari lagi`;
  const months = Math.round(days / 30);
  return `${months} bulan lagi`;
}

export function isMastered(p: Progress | undefined) {
  if (!p) return false;
  return p.times_seen >= 3 && p.interval_days >= 5 && (p.last_confidence ?? 0) >= 3;
}

export function isStruggling(p: Progress | undefined) {
  if (!p) return false;
  return p.times_wrong >= 2 || ((p.last_confidence ?? 4) <= 2 && p.times_seen > 0);
}

/**
 * Interleaving: susun soal supaya bahasa & tipe berganti-ganti secara sengaja.
 */
export function interleave(items: Item[]): Item[] {
  const pool = [...items];
  const out: Item[] = [];
  let lastLang: Language | null = null;
  let lastType: ItemType | null = null;

  while (pool.length) {
    let idx = pool.findIndex((i) => i.language !== lastLang && i.type !== lastType);
    if (idx === -1) idx = pool.findIndex((i) => i.language !== lastLang);
    if (idx === -1) idx = 0;
    const [picked] = pool.splice(idx, 1);
    out.push(picked);
    lastLang = picked.language;
    lastType = picked.type;
  }
  return out;
}

/** Pilih soal untuk sesi hari ini: yang jatuh tempo lebih dulu, lalu materi baru. */
export function buildSession(
  items: Item[],
  progressByItem: Record<string, Progress>,
  unlocked: (item: Item) => boolean,
  target = SESSION_TARGET,
): Item[] {
  const now = Date.now();
  const eligible = items.filter(unlocked);
  const due = eligible
    .filter((i) => {
      const p = progressByItem[i.id];
      return p && p.times_seen > 0 && new Date(p.due_at).getTime() <= now;
    })
    .sort(
      (a, b) =>
        new Date(progressByItem[a.id].due_at).getTime() -
        new Date(progressByItem[b.id].due_at).getTime(),
    );
  const fresh = eligible.filter((i) => (progressByItem[i.id]?.times_seen ?? 0) === 0);
  const picked = [...due.slice(0, target)];
  for (const item of fresh) {
    if (picked.length >= target) break;
    picked.push(item);
  }
  return interleave(picked);
}

export function dueCount(
  items: Item[],
  progressByItem: Record<string, Progress>,
  filter?: (i: Item) => boolean,
) {
  const now = Date.now();
  return items.filter((i) => {
    if (filter && !filter(i)) return false;
    const p = progressByItem[i.id];
    if (!p) return false;
    return new Date(p.due_at).getTime() <= now;
  }).length;
}

/** Persen materi yang sudah dikuasai untuk satu bahasa+level. */
export function masteryPercent(
  items: Item[],
  progressByItem: Record<string, Progress>,
  language: Language,
  level: Level,
) {
  const scoped = items.filter((i) => i.language === language && i.level === level);
  if (!scoped.length) return 0;
  const mastered = scoped.filter((i) => isMastered(progressByItem[i.id])).length;
  return Math.round((mastered / scoped.length) * 100);
}

/** Level lanjut terbuka setelah level sebelumnya dikuasai >= 50%. */
export function unlockedLevels(
  items: Item[],
  progressByItem: Record<string, Progress>,
  language: Language,
): Record<Level, boolean> {
  const pemula = true;
  const menengah = masteryPercent(items, progressByItem, language, "pemula") >= 50;
  const mahir =
    menengah && masteryPercent(items, progressByItem, language, "menengah") >= 50;
  return { pemula, menengah, mahir };
}

export function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
