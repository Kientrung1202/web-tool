import type { LimitLevel } from "./types";

const MB = 1024 * 1024;

export const MERGE_LIMITS = {
  softFiles: 100,
  softBytes: 500 * MB,
  strongFiles: 200,
  strongBytes: 1024 * MB,
  hardFiles: 300,
  hardBytes: 1536 * MB,
  mobileSoftFiles: 74,
  mobileSoftBytes: 299 * MB
} as const;

export function getLimitLevel(fileCount: number, totalBytes: number, isMobile = false): LimitLevel {
  if (fileCount >= MERGE_LIMITS.hardFiles || totalBytes >= MERGE_LIMITS.hardBytes) {
    return "hard";
  }

  if (fileCount > MERGE_LIMITS.strongFiles || totalBytes > MERGE_LIMITS.strongBytes) {
    return "strong";
  }

  if (
    fileCount > MERGE_LIMITS.softFiles ||
    totalBytes > MERGE_LIMITS.softBytes ||
    (isMobile && (fileCount > MERGE_LIMITS.mobileSoftFiles || totalBytes > MERGE_LIMITS.mobileSoftBytes))
  ) {
    return "soft";
  }

  return "none";
}
