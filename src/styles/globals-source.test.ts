import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync("src/styles/globals.css", "utf8");

describe("global color tokens", () => {
  it("uses white text on secondary surfaces", () => {
    expect(source.match(/--secondary-foreground:\s*oklch\(98\.5% 0 0\);/g) ?? []).toHaveLength(2);
  });
});
