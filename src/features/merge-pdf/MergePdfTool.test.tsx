import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MergePdfTool } from "./MergePdfTool";

describe("MergePdfTool", () => {
  it("adds PDF files to the ordered list", async () => {
    const user = userEvent.setup();
    render(<MergePdfTool locale="en" />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const first = new File(["one"], "one.pdf", { type: "application/pdf" });
    const second = new File(["two"], "two.pdf", { type: "application/pdf" });

    await user.upload(input, [first, second]);

    expect(screen.getByText("one.pdf")).toBeInTheDocument();
    expect(screen.getByText("two.pdf")).toBeInTheDocument();
    expect(screen.getByText("2 files")).toBeInTheDocument();
  });

  it("rejects non-PDF files", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<MergePdfTool locale="en" />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(["text"], "note.txt", { type: "text/plain" }));

    expect(screen.getByText("Only PDF files are supported.")).toBeInTheDocument();
    expect(screen.getByText("0 files")).toBeInTheDocument();
  });

  it("shows file size limit only for multiple PDF output", async () => {
    const user = userEvent.setup();
    render(<MergePdfTool locale="en" />);

    expect(screen.queryByText("File size limit per output")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Multiple PDFs" }));

    expect(screen.getByText("File size limit per output")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Size unit" })).toHaveValue("MB");

    await user.selectOptions(screen.getByRole("combobox", { name: "Size unit" }), "GB");

    expect(screen.getByRole("combobox", { name: "Size unit" })).toHaveValue("GB");
  });
});
