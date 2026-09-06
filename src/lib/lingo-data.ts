import { queryOptions } from "@tanstack/react-query";
import type { Item, Progress, StudySession } from "./lingo";

// PENTING: isi env var ini di pengaturan project Lovable / file .env
// (VITE_API_BASE_URL) dengan URL backend API kita setelah di-deploy,
// misalnya https://lingo-srs-api.up.railway.app -- TANPA garis miring
// di akhir.
const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!API_BASE) {
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_API_BASE_URL belum diisi -- lingo-data.ts tidak akan bisa memanggil backend."
  );
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} gagal: ${res.status}`);
  return res.json() as Promise<T>;
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`POST ${path} gagal: ${res.status}`);
  return res.json() as Promise<T>;
}

export const itemsQuery = queryOptions({
  queryKey: ["items"],
  queryFn: (): Promise<Item[]> => apiGet<Item[]>("/items"),
});

export const progressQuery = queryOptions({
  queryKey: ["item_progress"],
  queryFn: (): Promise<Progress[]> => apiGet<Progress[]>("/progress"),
});

export const sessionsQuery = queryOptions({
  queryKey: ["study_sessions"],
  queryFn: (): Promise<StudySession[]> => apiGet<StudySession[]>("/sessions"),
});

export function byItemId(progress: Progress[]): Record<string, Progress> {
  return Object.fromEntries(progress.map((p) => [p.item_id, p]));
}

export async function createSession(): Promise<string> {
  const { id } = await apiPost<{ id: string }>("/sessions");
  return id;
}

/**
 * Hasil dari backend -- dipakai sesi.tsx untuk menampilkan teks
 * "akan direview lagi X hari lagi" berdasarkan keputusan ALGORITMA
 * BACKEND (H+1/H+3/H+7/H+14), bukan hitungan sendiri di frontend.
 */
export type RecordAnswerResult = {
  interval_stage: string;
  due_at: string;
  interval_days: number;
};

export async function recordAnswer(params: {
  sessionId: string;
  item: Item;
  progress: Progress | undefined;
  userAnswer: string;
  correct: boolean;
  confidence: number;
  /** Sudah tidak dipakai backend (backend yang menghitung sendiri),
   * tetap ada di signature supaya sesi.tsx tidak perlu diubah kalau
   * masih memanggilnya -- boleh diisi angka berapa saja / 0. */
  nextInterval?: number;
}): Promise<RecordAnswerResult> {
  const { sessionId, item, userAnswer, correct, confidence } = params;
  return apiPost<RecordAnswerResult>("/answers", {
    session_id: sessionId,
    item_id: item.id,
    user_answer: userAnswer,
    correct,
    confidence,
  });
}

export async function finishSession(params: {
  sessionId: string;
  questionCount: number;
  correctCount: number;
  avgConfidence: number;
  difficulty: number;
}): Promise<void> {
  const { sessionId, questionCount, avgConfidence, difficulty } = params;
  await apiPost(`/sessions/${sessionId}/finish`, {
    items_reviewed: questionCount,
    avg_confidence: avgConfidence,
    difficulty_rating: difficulty,
  });
}
