import type { MergePreferences, OutputMode } from "./types";

export const MERGE_PREFERENCES_KEY = "merge-pdf-preferences";

export const DEFAULT_PREFERENCES: MergePreferences = {
  outputMode: "single",
  maxSizeMb: 25
};

export function loadMergePreferences(storage: Storage | undefined): MergePreferences {
  if (!storage) {
    return DEFAULT_PREFERENCES;
  }

  try {
    const raw = storage.getItem(MERGE_PREFERENCES_KEY);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<MergePreferences>;
    if (!isOutputMode(parsed.outputMode) || !isValidMaxSize(parsed.maxSizeMb)) {
      return DEFAULT_PREFERENCES;
    }

    return {
      outputMode: parsed.outputMode,
      maxSizeMb: parsed.maxSizeMb
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveMergePreferences(storage: Storage | undefined, preferences: MergePreferences): void {
  if (!storage) {
    return;
  }

  storage.setItem(MERGE_PREFERENCES_KEY, JSON.stringify(preferences));
}

function isOutputMode(value: unknown): value is OutputMode {
  return value === "single" || value === "multiple";
}

function isValidMaxSize(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 500;
}
