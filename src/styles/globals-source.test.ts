import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync("src/styles/globals.css", "utf8");

describe("global color tokens", () => {
  it("defines secondary-foreground in both light and dark palettes", () => {
    expect(source.match(/--secondary-foreground:/g) ?? []).toHaveLength(3);
  });

  it("uses system preference via @media prefers-color-scheme", () => {
    expect(source).toContain("prefers-color-scheme: dark");
  });

  it("supports explicit .dark and .light class overrides", () => {
    expect(source).toContain(".dark");
    expect(source).toMatch(/:root:not\(\.light\)/);
  });

  it("uses oklch color space for primary tokens", () => {
    expect(source).toMatch(/--primary:\s*oklch\(/);
    expect(source).toMatch(/--background:\s*oklch\(/);
  });
});
