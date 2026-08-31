# Workflow Builder and Compress PDF Design

Date: 2026-08-31

## Summary

Add a first-class Workflow Builder tool for browser-only PDF workflows and activate Compress PDF as a standalone tool. The Workflow Builder starts with a default valid workflow of Compress PDF followed by Merge PDF, stores one global valid workflow configuration in localStorage, and lets users add or remove supported steps while enforcing valid ordering and a minimum of two steps.

The initial supported workflow steps are:

- Compress PDF, a per-file step.
- Merge PDF, a collection step.

When both steps are present, Compress PDF runs on each selected PDF before Merge PDF combines the processed outputs.

## Goals

- Add Compress PDF as an active standalone PDF tool.
- Add Workflow Builder as an active standalone tool card and route.
- Support a default workflow of Compress PDF -> Merge PDF.
- Let users add, remove, and configure workflow steps inline.
- Require at least two workflow steps before the builder can run.
- Save one global valid workflow configuration in localStorage.
- Preserve browser-only processing and the existing privacy model.
- Reuse existing merge behavior, settings, limits, and tests where practical.

## Non-Goals

- No named workflow library in v1.
- No arbitrary drag-and-drop ordering in v1.
- No server-side PDF processing.
- No guaranteed compression percentage or target-size compression in v1.
- No implementation of unrelated tools such as Split PDF, Rotate PDF, JPG to PDF, or PDF to JPG.

## Product Behavior

Workflow Builder is for multi-step workflows only. A valid workflow must contain at least two steps. If a user configures only one step, the builder disables Run and guides them to either add another step or switch to the matching standalone tool.

Default workflow:

```text
Compress PDF -> Merge PDF
```

Supported v1 step behavior:

- Compress PDF can be added or removed.
- Merge PDF can be added or removed.
- If both are present, Merge PDF is placed after all per-file steps.
- If only one step remains, the workflow is invalid and cannot run.
- If no valid saved configuration exists, the builder loads the default workflow.

Standalone tools remain useful:

- Compress PDF processes one or more PDFs with compression settings and outputs the compressed files.
- Merge PDF keeps the current merge behavior.
- Workflow Builder combines two or more supported steps.

## User Interface

Add a new active tool card named Workflow Builder. It gets its own route, page metadata, localized copy, and tool page layout consistent with the existing Merge PDF page.

The Workflow Builder page contains:

- File dropzone and selected file list.
- Workflow panel with inline step cards.
- Progress and download panel.
- Add step control for supported steps.

Workflow step cards expose compact settings inline:

- Compress PDF:
  - Remove button.
  - Compression mode segmented control:
    - Balanced: faster and closer to original quality.
    - Smallest File: more aggressive and may reduce image quality.
- Merge PDF:
  - Remove button.
  - Output mode segmented control:
    - Single PDF.
    - Multiple PDFs.
  - Max size value and unit, shown only for multiple output.

If the workflow has fewer than two steps:

- Disable Run.
- Show guidance to add another step or use the matching standalone tool.
- Do not overwrite the last valid saved workflow configuration.

## Architecture

Use three feature areas:

```text
src/features/compress-pdf
src/features/workflow-builder
src/features/merge-pdf
```

Compress PDF owns:

- Compression preferences.
- Compression engine.
- Worker/client wiring if needed for browser responsiveness.
- Standalone Compress PDF UI.
- Compact settings UI that Workflow Builder can reuse.

Workflow Builder owns:

- Workflow configuration schema.
- localStorage load/save/fallback logic.
- Workflow validation.
- Step ordering rules.
- Pipeline orchestration.
- Workflow page UI.

Merge PDF continues to own:

- Merge engine.
- Merge worker/client.
- Merge settings.
- Existing standalone Merge PDF UI.

Shared code should stay lightweight and should only be extracted where there is clear reuse. Merge PDF should not become the owner of generic PDF workflow concerns.

## Workflow Model

Represent workflow steps with serializable ids and settings:

```ts
type WorkflowConfig = {
  version: 1;
  steps: WorkflowStep[];
};

type WorkflowStep =
  | {
      id: "compress-pdf";
      settings: {
        mode: "balanced" | "smallest";
      };
    }
  | {
      id: "merge-pdf";
      settings: {
        outputMode: "single" | "multiple";
        maxSizeValue: number;
        maxSizeUnit: "MB" | "GB";
      };
    };
```

Step categories:

- Per-file steps run independently for each selected PDF.
- Collection steps run once against the current list of processed files.

For v1:

- Compress PDF is a per-file step.
- Merge PDF is a collection step.
- Collection steps are normalized after per-file steps.
- A workflow with fewer than two steps is invalid.

## Persistence

Use one localStorage key for the global valid workflow configuration. Invalid saved values fall back to the default workflow.

Persistence rules:

- Save only valid workflows with two or more steps.
- Preserve the last valid saved workflow if the current draft becomes invalid.
- Validate each step id and settings object before loading.
- Normalize step order after loading.
- Include `version: 1` so future migrations have a stable entry point.

Existing Merge PDF preferences can remain for the standalone Merge PDF page. Workflow Builder should save its own workflow-level config so standalone tool preferences and workflow preferences do not unexpectedly overwrite each other.

## Data Flow

On page load:

1. Load workflow config from localStorage.
2. Validate version, steps, settings, and minimum step count.
3. Fall back to Compress PDF -> Merge PDF if missing or invalid.
4. Normalize collection steps after per-file steps.

On file selection:

1. Accept PDF files only.
2. Store selected files in page state.
3. Reset previous downloads and progress.

On run:

1. Validate selected files.
2. Validate workflow has at least two steps.
3. Read selected files into ArrayBuffers.
4. Run per-file steps in normalized order.
5. Run collection steps in normalized order.
6. Create object URLs for downloadable outputs.
7. Revoke old object URLs when replaced or unmounted.

Default execution:

```text
input PDFs
-> compress each PDF
-> merge compressed PDFs
-> downloadable merged PDF or ZIP
```

## Compression Behavior

Compress PDF v1 exposes two modes:

- Balanced.
- Smallest File.

The implementation should keep compression browser-safe and private. The UI must not promise a fixed reduction percentage. If a PDF cannot be meaningfully reduced, the tool still returns a valid PDF and reports completion normally.

The exact engine implementation can evolve, but it should start with a clear boundary:

- Input: PDF file name and bytes.
- Output: PDF file name, MIME type, bytes, and optional stats.
- Settings: compression mode.

## Progress

Progress should be phase-based and compatible with the existing merge progress approach.

Suggested stages:

- idle.
- reading.
- compressing.
- merging.
- zipping.
- done.
- error.

Workflow Builder can display the current phase and file count. It does not need precise byte-level progress in v1.

## Error Handling

- Non-PDF files show the existing only-PDF-supported message pattern.
- No selected files disables or rejects Run with a clear message.
- Workflows with fewer than two steps disable Run and show single-tool guidance.
- Invalid localStorage config falls back silently to the default workflow.
- Corrupt or encrypted PDFs that cannot be processed show the generic processing failure message.
- Large selections reuse existing limit warnings where practical.
- Compression that does not reduce file size is not an error.

## Internationalization

Add English and Vietnamese dictionary entries for:

- Workflow Builder title and description.
- Add step.
- Remove step.
- Compress PDF action labels.
- Balanced.
- Smallest File.
- Workflow invalid guidance.
- Switch to standalone tool guidance.
- Workflow progress phases.

Existing Merge PDF dictionary entries should be reused when the wording still fits.

## Testing

Add focused unit and component tests for:

- Workflow preference load/save/fallback behavior.
- Workflow validation and normalization.
- Minimum two-step workflow rule.
- Default workflow creation.
- Compress preference validation.
- Compression engine behavior with PDF fixtures.
- Workflow execution order: compress before merge.
- UI add/remove step behavior.
- Inline setting changes persisted only for valid workflows.
- Run disabled for invalid workflows.

Keep existing Merge PDF engine, batching, preference, and component tests passing.

## Open Decisions For Implementation Planning

- Whether Compress PDF needs its own worker immediately or can share a workflow worker boundary.
- Whether compressed individual outputs without Merge should be zipped in the standalone Compress PDF page when multiple files are selected.
- Whether Workflow Builder should show before/after size statistics in v1 or defer them.

These decisions do not change the approved product shape and can be resolved during implementation planning.
