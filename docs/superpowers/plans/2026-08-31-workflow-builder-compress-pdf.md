# Workflow Builder Compress PDF Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Compress PDF and a first-class Workflow Builder that runs the default Compress PDF -> Merge PDF workflow, enforces at least two steps, and saves one valid workflow config in localStorage.

**Architecture:** Add focused `compress-pdf` and `workflow-builder` feature modules while reusing the existing merge engine, file UI pieces, limits, and merge settings. Workflow Builder owns config validation, persistence, step normalization, and orchestration; Compress PDF owns its settings and browser-safe compression boundary.

**Tech Stack:** Next.js 15, React 19, TypeScript, pdf-lib, fflate, Vitest, Testing Library, Playwright, localStorage.

**Spec:** `docs/superpowers/specs/2026-08-31-workflow-builder-compress-pdf-design.md`

## Global Constraints

- Browser-only PDF processing; no server-side PDF processing.
- Default workflow is Compress PDF -> Merge PDF.
- Workflow Builder requires at least two workflow steps before Run is enabled.
- Save one global valid workflow configuration in localStorage.
- Do not overwrite the last valid saved workflow when the current draft has fewer than two steps.
- Merge PDF is a collection step and must run after per-file steps.
- Compress PDF v1 exposes exactly two modes: `balanced` and `smallest`.
- Do not promise a fixed compression percentage or target-size compression.
- Add English and Vietnamese copy for all new user-facing strings.

---

### Task 1: Compress PDF Core

**Files:**
- Create: `src/features/compress-pdf/types.ts`
- Create: `src/features/compress-pdf/preferences.ts`
- Create: `src/features/compress-pdf/preferences.test.ts`
- Create: `src/features/compress-pdf/compress-engine.ts`
- Create: `src/features/compress-pdf/compress-engine.test.ts`

**Interfaces:**
- Produces: `type CompressionMode = "balanced" | "smallest"`
- Produces: `type CompressPreferences = { mode: CompressionMode }`
- Produces: `const DEFAULT_COMPRESS_PREFERENCES: CompressPreferences`
- Produces: `loadCompressPreferences(storage: Storage | undefined): CompressPreferences`
- Produces: `saveCompressPreferences(storage: Storage | undefined, preferences: CompressPreferences): void`
- Produces: `compressPdfFile(input: { file: WorkerPdfFile; mode: CompressionMode }): Promise<MergeWorkerOutputFile>`
- Consumes: `WorkerPdfFile` and `MergeWorkerOutputFile` from `src/features/merge-pdf/types.ts`

- [ ] **Step 1: Write failing preferences tests**

```ts
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
```

- [ ] **Step 2: Run preferences tests to verify they fail**

Run: `npm test -- src/features/compress-pdf/preferences.test.ts`

Expected: FAIL because `src/features/compress-pdf/preferences.ts` does not exist.

- [ ] **Step 3: Implement compress preference types and storage**

```ts
export type CompressionMode = "balanced" | "smallest";

export type CompressPreferences = {
  mode: CompressionMode;
};
```

```ts
import type { CompressPreferences, CompressionMode } from "./types";

export const COMPRESS_PREFERENCES_KEY = "compress-pdf-preferences";

export const DEFAULT_COMPRESS_PREFERENCES: CompressPreferences = {
  mode: "balanced"
};

export function loadCompressPreferences(storage: Storage | undefined): CompressPreferences {
  if (!storage) return DEFAULT_COMPRESS_PREFERENCES;

  try {
    const raw = storage.getItem(COMPRESS_PREFERENCES_KEY);
    if (!raw) return DEFAULT_COMPRESS_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<CompressPreferences>;
    if (!isCompressionMode(parsed.mode)) return DEFAULT_COMPRESS_PREFERENCES;
    return { mode: parsed.mode };
  } catch {
    return DEFAULT_COMPRESS_PREFERENCES;
  }
}

export function saveCompressPreferences(storage: Storage | undefined, preferences: CompressPreferences): void {
  if (!storage) return;
  storage.setItem(COMPRESS_PREFERENCES_KEY, JSON.stringify(preferences));
}

export function isCompressionMode(value: unknown): value is CompressionMode {
  return value === "balanced" || value === "smallest";
}
```

- [ ] **Step 4: Run preferences tests to verify they pass**

Run: `npm test -- src/features/compress-pdf/preferences.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing compression engine tests**

```ts
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { createPdfBytes } from "@/test/pdf-fixtures";
import { compressPdfFile } from "./compress-engine";

describe("compressPdfFile", () => {
  it("returns a valid PDF with a compressed file name", async () => {
    const bytes = await createPdfBytes("compress me");

    const result = await compressPdfFile({
      file: { name: "sample.pdf", bytes: toArrayBuffer(bytes) },
      mode: "balanced"
    });

    expect(result.name).toBe("sample-compressed.pdf");
    expect(result.mimeType).toBe("application/pdf");
    const pdf = await PDFDocument.load(result.bytes);
    expect(pdf.getPageCount()).toBe(1);
  });

  it("uses the smallest mode without changing the PDF page count", async () => {
    const bytes = await createPdfBytes("smallest");

    const result = await compressPdfFile({
      file: { name: "report.PDF", bytes: toArrayBuffer(bytes) },
      mode: "smallest"
    });

    const pdf = await PDFDocument.load(result.bytes);
    expect(result.name).toBe("report-compressed.pdf");
    expect(pdf.getPageCount()).toBe(1);
  });
});

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
```

- [ ] **Step 6: Run compression engine tests to verify they fail**

Run: `npm test -- src/features/compress-pdf/compress-engine.test.ts`

Expected: FAIL because `compressPdfFile` is not implemented.

- [ ] **Step 7: Implement compression engine**

Use `PDFDocument.load` and `pdf.save` with object streams enabled. For v1, both modes share the same safe PDF rewrite boundary; `smallest` can use the same implementation while preserving the public settings API.

- [ ] **Step 8: Run compression engine tests to verify they pass**

Run: `npm test -- src/features/compress-pdf/compress-engine.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit Task 1**

```bash
git add src/features/compress-pdf
git commit -m "Add compress PDF core"
```

### Task 2: Workflow Config Core

**Files:**
- Create: `src/features/workflow-builder/types.ts`
- Create: `src/features/workflow-builder/preferences.ts`
- Create: `src/features/workflow-builder/preferences.test.ts`

**Interfaces:**
- Produces: `type WorkflowStepId = "compress-pdf" | "merge-pdf"`
- Produces: `type WorkflowConfig = { version: 1; steps: WorkflowStep[] }`
- Produces: `DEFAULT_WORKFLOW_CONFIG`
- Produces: `normalizeWorkflowSteps(steps: WorkflowStep[]): WorkflowStep[]`
- Produces: `isValidWorkflowConfig(config: WorkflowConfig): boolean`
- Produces: `loadWorkflowConfig(storage: Storage | undefined): WorkflowConfig`
- Produces: `saveWorkflowConfig(storage: Storage | undefined, config: WorkflowConfig): void`
- Consumes: `CompressPreferences` and `MergePreferences`

- [ ] **Step 1: Write failing workflow preference tests**

```ts
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
```

- [ ] **Step 2: Run workflow preference tests to verify they fail**

Run: `npm test -- src/features/workflow-builder/preferences.test.ts`

Expected: FAIL because workflow preferences do not exist.

- [ ] **Step 3: Implement workflow types and persistence**

Implement validation for version, step ids, compression mode, merge output mode, merge size value, and merge size unit. Reject workflows with fewer than two steps. Normalize per-file steps before collection steps.

- [ ] **Step 4: Run workflow preference tests to verify they pass**

Run: `npm test -- src/features/workflow-builder/preferences.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/features/workflow-builder
git commit -m "Add workflow config persistence"
```

### Task 3: Compress PDF Standalone UI and Route

**Files:**
- Create: `src/features/compress-pdf/CompressSettings.tsx`
- Create: `src/features/compress-pdf/CompressPdfTool.tsx`
- Create: `src/features/compress-pdf/CompressPdfTool.test.tsx`
- Create: `src/app/[locale]/compress-pdf/page.tsx`
- Modify: `src/lib/tools.ts`
- Modify: `src/i18n/dictionaries.ts`

**Interfaces:**
- Produces: `CompressSettings({ locale, preferences, onChange })`
- Produces: `CompressPdfTool({ locale })`
- Consumes: `compressPdfFile`, `loadCompressPreferences`, `saveCompressPreferences`, `FileDropzone`, `FileList`, `ProgressPanel`

- [ ] **Step 1: Write failing CompressPdfTool component tests**

Test that files are listed, non-PDFs are rejected, mode can switch to Smallest File, and the page exposes a `Compress PDF` run button.

- [ ] **Step 2: Run component tests to verify they fail**

Run: `npm test -- src/features/compress-pdf/CompressPdfTool.test.tsx`

Expected: FAIL because components do not exist.

- [ ] **Step 3: Implement localized dictionary entries and activate Compress PDF**

Set `compress-pdf` active in `src/lib/tools.ts`. Add copy for compression modes, compress button, and compress page SEO/about content in English and Vietnamese.

- [ ] **Step 4: Implement CompressSettings and CompressPdfTool**

Use the existing Merge PDF layout patterns. Save standalone compression preferences to `compress-pdf-preferences`. For multiple compressed outputs, render one download link per output.

- [ ] **Step 5: Run CompressPdfTool tests to verify they pass**

Run: `npm test -- src/features/compress-pdf/CompressPdfTool.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/features/compress-pdf src/app/[locale]/compress-pdf/page.tsx src/lib/tools.ts src/i18n/dictionaries.ts
git commit -m "Add compress PDF tool UI"
```

### Task 4: Workflow Builder Core and UI

**Files:**
- Create: `src/features/workflow-builder/workflow-engine.ts`
- Create: `src/features/workflow-builder/workflow-engine.test.ts`
- Create: `src/features/workflow-builder/WorkflowBuilderTool.tsx`
- Create: `src/features/workflow-builder/WorkflowBuilderTool.test.tsx`
- Create: `src/app/[locale]/workflow-builder/page.tsx`
- Modify: `src/lib/tools.ts`
- Modify: `src/i18n/dictionaries.ts`

**Interfaces:**
- Produces: `runWorkflow(input: { files: WorkerPdfFile[]; config: WorkflowConfig; onProgress?: (progress: WorkflowProgress) => void }): Promise<MergeWorkerOutputFile[]>`
- Produces: `WorkflowBuilderTool({ locale })`
- Consumes: `compressPdfFile`, `mergePdfFiles`, `loadWorkflowConfig`, `saveWorkflowConfig`, `CompressSettings`, `OutputSettings`

- [ ] **Step 1: Write failing workflow engine tests**

Test that default workflow returns one merged PDF with the input page count, and that a config ordered Merge then Compress still executes Compress before Merge after normalization.

- [ ] **Step 2: Run engine tests to verify they fail**

Run: `npm test -- src/features/workflow-builder/workflow-engine.test.ts`

Expected: FAIL because `runWorkflow` does not exist.

- [ ] **Step 3: Implement workflow engine**

Read files once, apply per-file steps, then apply collection steps. Emit phase progress for compressing and merging. Return `MergeWorkerOutputFile[]`.

- [ ] **Step 4: Run engine tests to verify they pass**

Run: `npm test -- src/features/workflow-builder/workflow-engine.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing WorkflowBuilderTool component tests**

Test default Compress PDF and Merge PDF step cards, invalid one-step guidance after removing a step, Smallest File setting, Multiple PDFs setting, and Run disabled when fewer than two steps remain.

- [ ] **Step 6: Run component tests to verify they fail**

Run: `npm test -- src/features/workflow-builder/WorkflowBuilderTool.test.tsx`

Expected: FAIL because component does not exist.

- [ ] **Step 7: Implement WorkflowBuilderTool, page route, tool card, and copy**

Add `workflow-builder` as an active tool. The page loads saved valid config or default config, saves only valid configs, lets users add and remove supported steps, normalizes Merge after Compress, and guides users to standalone tools when fewer than two steps remain.

- [ ] **Step 8: Run WorkflowBuilderTool tests to verify they pass**

Run: `npm test -- src/features/workflow-builder/WorkflowBuilderTool.test.tsx`

Expected: PASS.

- [ ] **Step 9: Commit Task 4**

```bash
git add src/features/workflow-builder src/app/[locale]/workflow-builder/page.tsx src/lib/tools.ts src/i18n/dictionaries.ts
git commit -m "Add workflow builder tool"
```

### Task 5: Full Verification

**Files:**
- Modify only if verification reveals defects in files changed by Tasks 1-4.

**Interfaces:**
- Consumes all task outputs.
- Produces a verified implementation ready for review.

- [ ] **Step 1: Run targeted test suite**

Run: `npm test -- src/features/compress-pdf src/features/workflow-builder src/features/merge-pdf src/lib/tools.test.ts src/i18n/locales.test.ts`

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 3: Run full unit test suite**

Run: `npm test`

Expected: PASS.

- [ ] **Step 4: Run production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Commit verification fixes if needed**

If any verification fix is required, commit only the changed implementation/test files with a focused message.
