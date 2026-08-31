import { describe, expect, it } from "vitest";
import { createSequentialBatches } from "./batching";

describe("createSequentialBatches", () => {
  it("preserves order while batching", () => {
    const items = [1, 2, 3, 4, 5];
    const batches = createSequentialBatches(
      items,
      (batch, next) => [...batch, next].reduce((sum, value) => sum + value, 0) <= 5
    );
    expect(batches).toEqual([[1, 2], [3], [4], [5]]);
  });

  it("keeps a too-large item alone", () => {
    const items = [2, 9, 2];
    const batches = createSequentialBatches(
      items,
      (batch, next) => [...batch, next].reduce((sum, value) => sum + value, 0) <= 5
    );
    expect(batches).toEqual([[2], [9], [2]]);
  });
});
