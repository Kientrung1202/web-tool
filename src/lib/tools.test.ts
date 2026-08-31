import { describe, expect, it } from "vitest";
import { getToolBySlug, TOOLS } from "./tools";

describe("tool metadata", () => {
  it("contains active PDF tools", () => {
    expect(TOOLS.filter((tool) => tool.active).map((tool) => tool.slug)).toEqual(["merge-pdf", "compress-pdf"]);
  });

  it("contains the planned coming-soon tools", () => {
    expect(TOOLS.map((tool) => tool.slug)).toEqual([
      "merge-pdf",
      "split-pdf",
      "compress-pdf",
      "jpg-to-pdf",
      "pdf-to-jpg",
      "rotate-pdf"
    ]);
  });

  it("finds a tool by slug", () => {
    expect(getToolBySlug("merge-pdf")?.active).toBe(true);
    expect(getToolBySlug("missing")).toBeUndefined();
  });
});
