import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { WorkflowBuilderTool } from "./WorkflowBuilderTool";

describe("WorkflowBuilderTool", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the default compress then merge workflow", () => {
    const { container } = render(<WorkflowBuilderTool locale="en" maxFileSizeMb={20} maxFilesPerRequest={20} turnstileSiteKey="" />);

    expect(screen.getByRole("heading", { name: "Compress PDF" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Merge PDF Files" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run workflow" })).toBeEnabled();
    expect(container.firstElementChild).toHaveClass("lg:grid-cols-[minmax(0,3fr)_minmax(20rem,2fr)]");
  });

  it("disables running and guides users when only one step remains", async () => {
    const user = userEvent.setup();
    render(<WorkflowBuilderTool locale="en" maxFileSizeMb={20} maxFilesPerRequest={20} turnstileSiteKey="" />);

    await user.click(screen.getByRole("button", { name: "Remove Compress PDF" }));

    expect(screen.getByRole("button", { name: "Run workflow" })).toBeDisabled();
    expect(screen.getByText("Workflows need at least two steps. Add another step or use a standalone tool.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Use Merge PDF Files" })).toHaveAttribute("href", "/en/merge-pdf");
  });

  it("updates inline step settings", async () => {
    const user = userEvent.setup();
    render(<WorkflowBuilderTool locale="en" maxFileSizeMb={20} maxFilesPerRequest={20} turnstileSiteKey="" />);

    await user.click(screen.getByRole("radio", { name: "Smallest File" }));
    await user.click(screen.getByRole("radio", { name: "Multiple PDFs" }));

    expect(screen.getByRole("radio", { name: "Smallest File" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("File size limit per output")).toBeInTheDocument();
  });

  it("adds a removed step back into the workflow", async () => {
    const user = userEvent.setup();
    render(<WorkflowBuilderTool locale="en" maxFileSizeMb={20} maxFilesPerRequest={20} turnstileSiteKey="" />);

    await user.click(screen.getByRole("button", { name: "Remove Compress PDF" }));
    await user.click(screen.getByRole("button", { name: "Add Compress PDF" }));

    expect(screen.getByRole("button", { name: "Run workflow" })).toBeEnabled();
    expect(screen.getByRole("heading", { name: "Compress PDF" })).toBeInTheDocument();
  });

  it("collapses workflow settings into step summaries", async () => {
    const user = userEvent.setup();
    render(<WorkflowBuilderTool locale="en" maxFileSizeMb={20} maxFilesPerRequest={20} turnstileSiteKey="" />);

    await user.click(screen.getByRole("button", { name: "Collapse settings" }));

    expect(screen.getByRole("button", { name: "Expand settings" })).toBeInTheDocument();
    expect(screen.getByText("Compress PDF · Balanced")).toBeInTheDocument();
    expect(screen.getByText("Merge PDF Files · Single PDF")).toBeInTheDocument();
    expect(screen.queryByText("Compression options")).not.toBeInTheDocument();
    expect(screen.queryByText("Output options")).not.toBeInTheDocument();
  });
});
