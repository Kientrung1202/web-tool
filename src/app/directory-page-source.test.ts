import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync("src/app/[locale]/page.tsx", "utf8");

describe("DirectoryPage layout source", () => {
  it("uses a four-column desktop tool grid", () => {
    expect(source).toContain("xl:grid-cols-4");
  });

  it("highlights the workflow builder link with the secondary orange palette", () => {
    expect(source).toContain("bg-secondary");
    expect(source).toContain("text-secondary-foreground");
  });
});
