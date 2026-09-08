import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync("src/app/[locale]/page.tsx", "utf8");

describe("DirectoryPage layout source", () => {
  it("uses a uniform grid for active tools", () => {
    expect(source).toContain("lg:grid-cols-3");
    expect(source).toContain("sm:grid-cols-2");
  });

  it("uses a 4-col grid for coming-soon tools", () => {
    expect(source).toContain("md:grid-cols-4");
  });

  it("uses shadcn Badge and HeroSearch", () => {
    expect(source).toContain("Badge");
    expect(source).toContain("HeroSearch");
  });

  it("renders hero section with trust chips", () => {
    expect(source).toContain("heroHeadline");
    expect(source).toContain("privacyChip");
    expect(source).toContain("noAccountChip");
  });
});
