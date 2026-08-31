import { describe, expect, it } from "vitest";
import { DEFAULT_WORKFLOW_CONFIG, loadWorkflowConfig, normalizeWorkflowSteps, saveWorkflowConfig } from "./preferences";

describe("workflow preferences", () => {
  it("defaults to compress then merge", () => {
    const storage = new MapStorage();
    expect(loadWorkflowConfig(storage)).toEqual(DEFAULT_WORKFLOW_CONFIG);
  });

  it("saves and loads a valid workflow", () => {
    const storage = new MapStorage();
    saveWorkflowConfig(storage, {
      version: 1,
      steps: [
        { id: "compress-pdf", settings: { mode: "smallest" } },
        { id: "merge-pdf", settings: { outputMode: "multiple", maxSizeValue: 1, maxSizeUnit: "GB" } }
      ]
    });

    expect(loadWorkflowConfig(storage)).toEqual({
      version: 1,
      steps: [
        { id: "compress-pdf", settings: { mode: "smallest" } },
        { id: "merge-pdf", settings: { outputMode: "multiple", maxSizeValue: 1, maxSizeUnit: "GB" } }
      ]
    });
  });

  it("does not overwrite the last valid workflow with an invalid draft", () => {
    const storage = new MapStorage();
    saveWorkflowConfig(storage, {
      version: 1,
      steps: [
        { id: "compress-pdf", settings: { mode: "smallest" } },
        { id: "merge-pdf", settings: { outputMode: "single", maxSizeValue: 25, maxSizeUnit: "MB" } }
      ]
    });

    saveWorkflowConfig(storage, {
      version: 1,
      steps: [{ id: "compress-pdf", settings: { mode: "balanced" } }]
    });

    expect(loadWorkflowConfig(storage)).toEqual({
      version: 1,
      steps: [
        { id: "compress-pdf", settings: { mode: "smallest" } },
        { id: "merge-pdf", settings: { outputMode: "single", maxSizeValue: 25, maxSizeUnit: "MB" } }
      ]
    });
  });

  it("falls back when persisted workflow has fewer than two steps", () => {
    const storage = new MapStorage();
    storage.setItem("workflow-builder-config", JSON.stringify({ version: 1, steps: [{ id: "compress-pdf", settings: { mode: "balanced" } }] }));
    expect(loadWorkflowConfig(storage)).toEqual(DEFAULT_WORKFLOW_CONFIG);
  });

  it("normalizes merge after compress", () => {
    expect(
      normalizeWorkflowSteps([
        { id: "merge-pdf", settings: { outputMode: "single", maxSizeValue: 25, maxSizeUnit: "MB" } },
        { id: "compress-pdf", settings: { mode: "balanced" } }
      ])
    ).toEqual([
      { id: "compress-pdf", settings: { mode: "balanced" } },
      { id: "merge-pdf", settings: { outputMode: "single", maxSizeValue: 25, maxSizeUnit: "MB" } }
    ]);
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
