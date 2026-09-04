import { describe, expect, it } from "vitest";
import { getDirectoryTools, getToolBySlug, TOOLS } from "./tools";

describe("tool metadata", () => {
  it("contains active PDF tools", () => {
    expect(TOOLS.filter((tool) => tool.active).map((tool) => tool.slug)).toEqual([
      "compress-pdf",
      "merge-pdf",
      "workflow-builder",
      "word-to-pdf",
      "pdf-to-word"
    ]);
  });

  it("contains the planned coming-soon tools", () => {
    expect(TOOLS.map((tool) => tool.slug)).toEqual([
      "compress-pdf",
      "merge-pdf",
      "workflow-builder",
      "split-pdf",
      "word-to-pdf",
      "pdf-to-word",
      "jpg-to-pdf",
      "pdf-to-jpg",
      "rotate-pdf"
    ]);
  });

  it("shows workflow builder outside the main tool grid", () => {
    expect(getDirectoryTools().map((tool) => tool.slug)).toEqual([
      "compress-pdf",
      "merge-pdf",
      "split-pdf",
      "word-to-pdf",
      "pdf-to-word",
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
