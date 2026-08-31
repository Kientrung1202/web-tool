import { describe, expect, it } from "vitest";
import { DEFAULT_COMPRESS_PREFERENCES, loadCompressPreferences, saveCompressPreferences } from "./preferences";

describe("compress preferences", () => {
  it("defaults to balanced mode", () => {
    const storage = new MapStorage();
    expect(loadCompressPreferences(storage)).toEqual(DEFAULT_COMPRESS_PREFERENCES);
  });

  it("saves and loads compression mode", () => {
    const storage = new MapStorage();
    saveCompressPreferences(storage, { mode: "smallest" });
    expect(loadCompressPreferences(storage)).toEqual({ mode: "smallest" });
  });

  it("ignores invalid persisted mode", () => {
    const storage = new MapStorage();
    storage.setItem("compress-pdf-preferences", "{\"mode\":\"tiny\"}");
    expect(loadCompressPreferences(storage)).toEqual(DEFAULT_COMPRESS_PREFERENCES);
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
