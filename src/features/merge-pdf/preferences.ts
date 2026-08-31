import type { MergePreferences, OutputMode, SizeUnit } from "./types";

export const MERGE_PREFERENCES_KEY = "merge-pdf-preferences";
export const MB_PER_GB = 1024;
export const MAX_OUTPUT_SIZE_MB = 1536;

export const DEFAULT_PREFERENCES: MergePreferences = {
  outputMode: "single",
  maxSizeValue: 25,
  maxSizeUnit: "MB"
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
    const maxSizeValue = getPersistedMaxSizeValue(parsed);
    const maxSizeUnit = isSizeUnit(parsed.maxSizeUnit) ? parsed.maxSizeUnit : "MB";
    if (!isOutputMode(parsed.outputMode) || !isValidMaxSize(maxSizeValue, maxSizeUnit)) {
      return DEFAULT_PREFERENCES;
    }

    return {
      outputMode: parsed.outputMode,
      maxSizeValue,
      maxSizeUnit
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

function isSizeUnit(value: unknown): value is SizeUnit {
  return value === "MB" || value === "GB";
}

function isValidMaxSize(value: unknown, unit: SizeUnit): value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return false;
  }

  return value >= getMinOutputSize(unit) && value <= getMaxOutputSize(unit);
}

function getPersistedMaxSizeValue(parsed: Partial<MergePreferences> & { maxSizeMb?: unknown }): unknown {
  return typeof parsed.maxSizeValue === "number" ? parsed.maxSizeValue : parsed.maxSizeMb;
}

export function getMinOutputSize(unit: SizeUnit): number {
  return unit === "GB" ? 0.01 : 1;
}

export function getMaxOutputSize(unit: SizeUnit): number {
  return unit === "GB" ? MAX_OUTPUT_SIZE_MB / MB_PER_GB : MAX_OUTPUT_SIZE_MB;
}

export function clampOutputSize(value: number, unit: SizeUnit): number {
  return Math.min(getMaxOutputSize(unit), Math.max(getMinOutputSize(unit), value));
}

export function toMaxSizeMb(preferences: MergePreferences): number {
  return preferences.maxSizeUnit === "GB" ? preferences.maxSizeValue * MB_PER_GB : preferences.maxSizeValue;
}
