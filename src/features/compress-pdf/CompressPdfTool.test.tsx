import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CompressPdfTool } from "./CompressPdfTool";

describe("CompressPdfTool", () => {
  it("adds PDF files to the selected list", async () => {
    const user = userEvent.setup();
    render(<CompressPdfTool locale="en" />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, [
      new File(["one"], "one.pdf", { type: "application/pdf" }),
      new File(["two"], "two.pdf", { type: "application/pdf" })
    ]);

    expect(screen.getByText("one.pdf")).toBeInTheDocument();
    expect(screen.getByText("two.pdf")).toBeInTheDocument();
    expect(screen.getByText("2 files")).toBeInTheDocument();
  });

  it("rejects non-PDF files", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<CompressPdfTool locale="en" />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(["text"], "note.txt", { type: "text/plain" }));

    expect(screen.getByText("Only PDF files are supported.")).toBeInTheDocument();
    expect(screen.getByText("0 files")).toBeInTheDocument();
  });

  it("switches compression mode", async () => {
    const user = userEvent.setup();
    render(<CompressPdfTool locale="en" />);

    expect(screen.getByRole("radio", { name: "Balanced" })).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByRole("radio", { name: "Smallest File" }));

    expect(screen.getByRole("radio", { name: "Smallest File" })).toHaveAttribute("aria-checked", "true");
  });

  it("shows a compress action", () => {
    render(<CompressPdfTool locale="en" />);

    expect(screen.getByRole("button", { name: "Compress PDF" })).toBeInTheDocument();
  });
});
