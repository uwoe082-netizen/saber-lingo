import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Item, Progress, StudySession } from "./lingo";

export const itemsQuery = queryOptions({
  queryKey: ["items"],
  queryFn: async (): Promise<Item[]> => {
    const { data, error } = await supabase
      .from("items")
      .select("id, language, level, topic, type, prompt, answer, hint")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Item[];
  },
});

export const progressQuery = queryOptions({
  queryKey: ["item_progress"],
  queryFn: async (): Promise<Progress[]> => {
    const { data, error } = await supabase
      .from("item_progress")
      .select(
        "id, item_id, times_seen, times_correct, times_wrong, last_confidence, streak, interval_days, due_at",
      );
    if (error) throw error;
    return (data ?? []) as Progress[];
  },
});

export const sessionsQuery = queryOptions({
  queryKey: ["study_sessions"],
  queryFn: async (): Promise<StudySession[]> => {
    const { data, error } = await supabase
      .from("study_sessions")
      .select(
        "id, started_at, finished_at, question_count, correct_count, avg_confidence, difficulty_rating",
      )
      .not("finished_at", "is", null)
      .order("finished_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return (data ?? []) as StudySession[];
  },
});

export function byItemId(progress: Progress[]): Record<string, Progress> {
  return Object.fromEntries(progress.map((p) => [p.item_id, p]));
}

export async function createSession() {
  const { data, error } = await supabase
    .from("study_sessions")
    .insert({})
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function recordAnswer(params: {
  sessionId: string;
  item: Item;
  progress: Progress | undefined;
  userAnswer: string;
  correct: boolean;
  confidence: number;
  nextInterval: number;
}) {
  const { sessionId, item, progress, userAnswer, correct, confidence, nextInterval } =
    params;

  const dueAt = new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000).toISOString();

  const nextProgress = {
    item_id: item.id,
    times_seen: (progress?.times_seen ?? 0) + 1,
    times_correct: (progress?.times_correct ?? 0) + (correct ? 1 : 0),
    times_wrong: (progress?.times_wrong ?? 0) + (correct ? 0 : 1),
    last_confidence: confidence,
    streak: correct ? (progress?.streak ?? 0) + 1 : 0,
    interval_days: nextInterval,
    due_at: dueAt,
    updated_at: new Date().toISOString(),
  };

  const { error: progressError } = await supabase
    .from("item_progress")
    .upsert(nextProgress, { onConflict: "item_id" });
  if (progressError) throw progressError;

  const { error: answerError } = await supabase.from("session_answers").insert({
    session_id: sessionId,
    item_id: item.id,
    user_answer: userAnswer,
    is_correct: correct,
    confidence,
  });
  if (answerError) throw answerError;
}

export async function finishSession(params: {
  sessionId: string;
  questionCount: number;
  correctCount: number;
  avgConfidence: number;
  difficulty: number;
}) {
  const { error } = await supabase
    .from("study_sessions")
    .update({
      finished_at: new Date().toISOString(),
      question_count: params.questionCount,
      correct_count: params.correctCount,
      avg_confidence: params.avgConfidence,
      difficulty_rating: params.difficulty,
    })
    .eq("id", params.sessionId);
  if (error) throw error;
}

export type ConfidencePoint = { date: string; avg: number };

export const confidenceTrendQuery = queryOptions({
  queryKey: ["confidence_trend"],
  queryFn: async (): Promise<ConfidencePoint[]> => {
    const { data, error } = await supabase
      .from("session_answers")
      .select("confidence, answered_at")
      .order("answered_at", { ascending: true })
      .limit(500);
    if (error) throw error;
    const buckets = new Map<string, number[]>();
    for (const row of data ?? []) {
      const key = new Date(row.answered_at as string).toISOString().slice(0, 10);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(row.confidence as number);
    }
    return [...buckets.entries()].map(([date, values]) => ({
      date,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    }));
  },
});
