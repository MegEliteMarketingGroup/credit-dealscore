import { useCallback, useEffect, useState } from "react";
import { computeDealScore, dealLabel, type DealSurvey } from "@/lib/deal-scoring";

export interface SavedDeal {
  id: string;
  createdAt: number;
  survey: DealSurvey;
}

export interface SavedDealView extends SavedDeal {
  label: string;
  score: number;
}

const KEY = "deal-score.saved-deals.v1";

function readKey(): Record<string, SavedDeal> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Record<string, SavedDeal>;
  } catch {
    // ignore malformed
  }
  return {};
}

function writeKey(map: Record<string, SavedDeal>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // ignore quota
  }
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `deal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useDealStore() {
  const [map, setMap] = useState<Record<string, SavedDeal>>(() => readKey());

  // Sync across tabs / on mount.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setMap(readKey());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const deals: SavedDealView[] = Object.values(map)
    .map((d) => {
      const result = computeDealScore(d.survey);
      return { ...d, label: dealLabel(d.survey), score: result.score };
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const getDeal = useCallback((id: string): SavedDeal | undefined => map[id], [map]);

  const saveDeal = useCallback(
    (id: string, survey: DealSurvey): SavedDeal => {
      let created = map[id]?.createdAt ?? Date.now();
      const next: SavedDeal = { id, createdAt: created, survey };
      const updated = { ...map, [id]: next };
      setMap(updated);
      writeKey(updated);
      return next;
    },
    [map],
  );

  const duplicateDeal = useCallback(
    (survey: DealSurvey): SavedDeal => {
      const id = uuid();
      const next: SavedDeal = { id, createdAt: Date.now(), survey };
      const updated = { ...map, [id]: next };
      setMap(updated);
      writeKey(updated);
      return next;
    },
    [map],
  );

  const deleteDeal = useCallback(
    (id: string) => {
      const next = { ...map };
      delete next[id];
      setMap(next);
      writeKey(next);
    },
    [map],
  );

  const newDealId = useCallback((): string => uuid(), []);

  return { deals, getDeal, saveDeal, duplicateDeal, deleteDeal, newDealId };
}
