import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolCard } from "./ToolCard";

describe("ToolCard", () => {
  it("links active tools", () => {
    render(
      <ToolCard
        locale="en"
        tool={{
          slug: "merge-pdf",
          titleKey: "mergeTitle",
          descriptionKey: "mergeDescription",
          active: true,
          icon: "combine"
        }}
      />
    );

    expect(screen.getByRole("link", { name: /merge pdf files/i })).toHaveAttribute("href", "/en/merge-pdf");
  });

  it("marks inactive tools as coming soon", () => {
    render(
      <ToolCard
        locale="en"
        tool={{
          slug: "compress-pdf",
          titleKey: "compressTitle",
          descriptionKey: "compressDescription",
          active: false,
          icon: "archive"
        }}
      />
    );

    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });
});
