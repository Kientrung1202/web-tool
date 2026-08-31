import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { WorkflowBuilderTool } from "./WorkflowBuilderTool";

describe("WorkflowBuilderTool", () => {
  it("shows the default compress then merge workflow", () => {
    render(<WorkflowBuilderTool locale="en" />);

    expect(screen.getByRole("heading", { name: "Compress PDF" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Merge PDF Files" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run workflow" })).toBeEnabled();
  });

  it("disables running and guides users when only one step remains", async () => {
    const user = userEvent.setup();
    render(<WorkflowBuilderTool locale="en" />);

    await user.click(screen.getByRole("button", { name: "Remove Compress PDF" }));

    expect(screen.getByRole("button", { name: "Run workflow" })).toBeDisabled();
    expect(screen.getByText("Workflows need at least two steps. Add another step or use a standalone tool.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Use Merge PDF Files" })).toHaveAttribute("href", "/en/merge-pdf");
  });

  it("updates inline step settings", async () => {
    const user = userEvent.setup();
    render(<WorkflowBuilderTool locale="en" />);

    await user.click(screen.getByRole("radio", { name: "Smallest File" }));
    await user.click(screen.getByRole("radio", { name: "Multiple PDFs" }));

    expect(screen.getByRole("radio", { name: "Smallest File" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("File size limit per output")).toBeInTheDocument();
  });

  it("adds a removed step back into the workflow", async () => {
    const user = userEvent.setup();
    render(<WorkflowBuilderTool locale="en" />);

    await user.click(screen.getByRole("button", { name: "Remove Compress PDF" }));
    await user.click(screen.getByRole("button", { name: "Add Compress PDF" }));

    expect(screen.getByRole("button", { name: "Run workflow" })).toBeEnabled();
    expect(screen.getByRole("heading", { name: "Compress PDF" })).toBeInTheDocument();
  });
});
