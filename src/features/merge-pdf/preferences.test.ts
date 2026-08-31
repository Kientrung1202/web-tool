import { describe, expect, it } from "vitest";
import { DEFAULT_PREFERENCES, loadMergePreferences, saveMergePreferences } from "./preferences";

describe("merge preferences", () => {
  it("defaults to single PDF mode", () => {
    const storage = new MapStorage();
    expect(loadMergePreferences(storage)).toEqual(DEFAULT_PREFERENCES);
  });

  it("saves and loads output preferences", () => {
    const storage = new MapStorage();
    saveMergePreferences(storage, { outputMode: "multiple", maxSizeMb: 4 });
    expect(loadMergePreferences(storage)).toEqual({ outputMode: "multiple", maxSizeMb: 4 });
  });

  it("ignores invalid persisted values", () => {
    const storage = new MapStorage();
    storage.setItem("merge-pdf-preferences", "{\"outputMode\":\"weird\",\"maxSizeMb\":-1}");
    expect(loadMergePreferences(storage)).toEqual(DEFAULT_PREFERENCES);
  });
});

class MapStorage implements Storage {
  private values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}
