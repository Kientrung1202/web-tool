import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdSlot } from "./AdSlot";

describe("AdSlot", () => {
  it("stays pinned in the viewport", () => {
    render(<AdSlot label="Ad space" />);

    expect(screen.getByRole("complementary", { name: "Ad space" })).toHaveClass("fixed");
  });
});
