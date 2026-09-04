import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConvertFileTool } from "./ConvertFileTool";

describe("ConvertFileTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the configured max file size", () => {
    render(<ConvertFileTool kind="word-to-pdf" locale="en" maxFileSizeMb={20} turnstileSiteKey="site-key" />);

    expect(screen.getByText(/Maximum file size: 20 MB/i)).toBeInTheDocument();
  });

  it("rejects oversized files before upload", async () => {
    const user = userEvent.setup();
    const file = new File(["x".repeat(6)], "large.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
    Object.defineProperty(file, "size", { value: 21 * 1024 * 1024 });
    render(<ConvertFileTool kind="word-to-pdf" locale="en" maxFileSizeMb={20} turnstileSiteKey="" />);

    await user.upload(screen.getByLabelText(/choose file/i), file);

    expect(screen.getByText(/File is larger than the configured limit/i)).toBeInTheDocument();
  });

  it("labels PDF to Word as best effort", () => {
    render(<ConvertFileTool kind="pdf-to-word" locale="en" maxFileSizeMb={20} turnstileSiteKey="" />);

    expect(screen.getByText(/Best effort conversion/i)).toBeInTheDocument();
  });

  it("posts the selected file to the matching API endpoint", async () => {
    const user = userEvent.setup();
    const blob = new Blob(["converted"], { type: "application/pdf" });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(blob, { status: 200 }));
    URL.createObjectURL = vi.fn(() => "blob:converted");
    URL.revokeObjectURL = vi.fn();

    render(<ConvertFileTool kind="word-to-pdf" locale="en" maxFileSizeMb={20} turnstileSiteKey="" />);

    await user.upload(screen.getByLabelText(/choose file/i), new File(["doc"], "sample.docx"));
    await user.click(screen.getByRole("button", { name: /convert/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/convert/word-to-pdf", expect.objectContaining({ method: "POST" })));
    expect(await screen.findByRole("link", { name: /download result/i })).toHaveAttribute("href", "blob:converted");
  });
});
