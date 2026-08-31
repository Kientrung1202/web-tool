import type { CompressPreferences, CompressionMode } from "./types";

export const COMPRESS_PREFERENCES_KEY = "compress-pdf-preferences";

export const DEFAULT_COMPRESS_PREFERENCES: CompressPreferences = {
  mode: "balanced"
};

export function loadCompressPreferences(storage: Storage | undefined): CompressPreferences {
  if (!storage) {
    return DEFAULT_COMPRESS_PREFERENCES;
  }

  try {
    const raw = storage.getItem(COMPRESS_PREFERENCES_KEY);
    if (!raw) {
      return DEFAULT_COMPRESS_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<CompressPreferences>;
    if (!isCompressionMode(parsed.mode)) {
      return DEFAULT_COMPRESS_PREFERENCES;
    }

    return {
      mode: parsed.mode
    };
  } catch {
    return DEFAULT_COMPRESS_PREFERENCES;
  }
}

export function saveCompressPreferences(storage: Storage | undefined, preferences: CompressPreferences): void {
  if (!storage) {
    return;
  }

  storage.setItem(COMPRESS_PREFERENCES_KEY, JSON.stringify(preferences));
}

export function isCompressionMode(value: unknown): value is CompressionMode {
  return value === "balanced" || value === "smallest";
}
