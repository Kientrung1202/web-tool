import { afterEach, describe, expect, it, vi } from "vitest";
import { compressPdfFiles } from "./compress-engine";

describe("compressPdfFiles", () => {
  afterEach(() => vi.restoreAllMocks());

  it("posts PDFs and compression mode to the converter API", async () => {
    const response = new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": "attachment; filename=sample-compressed.pdf"
      }
    });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    const result = await compressPdfFiles({
      files: [{ name: "sample.pdf", bytes: new Uint8Array([4, 5, 6]).buffer }],
      mode: "smallest",
      turnstileToken: "token"
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/convert/compress-pdf", expect.objectContaining({ method: "POST" }));
    const form = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(form.get("mode")).toBe("smallest");
    expect(form.get("cf-turnstile-response")).toBe("token");
    expect(form.getAll("file")).toHaveLength(1);
    expect(result[0].name).toBe("sample-compressed.pdf");
  });
});
