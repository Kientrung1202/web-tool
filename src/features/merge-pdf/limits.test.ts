import { describe, expect, it } from "vitest";
import { getLimitLevel } from "./limits";

const mb = 1024 * 1024;

describe("getLimitLevel", () => {
  it("returns none below soft thresholds", () => {
    expect(getLimitLevel(10, 20 * mb)).toBe("none");
  });

  it("returns soft over 100 files or 500 MB", () => {
    expect(getLimitLevel(101, 20 * mb)).toBe("soft");
    expect(getLimitLevel(10, 501 * mb)).toBe("soft");
  });

  it("returns strong over 200 files or 1 GB", () => {
    expect(getLimitLevel(201, 20 * mb)).toBe("strong");
    expect(getLimitLevel(10, 1025 * mb)).toBe("strong");
  });

  it("returns hard at 300 files or 1.5 GB", () => {
    expect(getLimitLevel(300, 20 * mb)).toBe("hard");
    expect(getLimitLevel(10, 1536 * mb)).toBe("hard");
  });

  it("warns earlier on mobile", () => {
    expect(getLimitLevel(75, 300 * mb, true)).toBe("soft");
  });
});
