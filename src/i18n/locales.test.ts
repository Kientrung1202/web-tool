import { describe, expect, it } from "vitest";
import { buildLocalizedPath, getAlternateLocale, isLocale } from "./locales";

describe("locale helpers", () => {
  it("recognizes supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("vi")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("returns the alternate locale", () => {
    expect(getAlternateLocale("en")).toBe("vi");
    expect(getAlternateLocale("vi")).toBe("en");
  });

  it("builds localized paths with English slugs", () => {
    expect(buildLocalizedPath("en")).toBe("/en");
    expect(buildLocalizedPath("vi")).toBe("/vi");
    expect(buildLocalizedPath("vi", "merge-pdf")).toBe("/vi/merge-pdf");
  });
});
