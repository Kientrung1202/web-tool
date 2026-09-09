import { compressPdfFiles } from "@/features/compress-pdf/compress-engine";
import { mergePdfFiles } from "@/features/merge-pdf/merge-engine";
import { toMaxSizeMb } from "@/features/merge-pdf/preferences";
import type { MergeProgress, MergeWorkerOutputFile, WorkerPdfFile } from "@/features/merge-pdf/types";
import { normalizeWorkflowSteps } from "./preferences";
import type { WorkflowConfig } from "./types";

type RunWorkflowInput = {
  files: WorkerPdfFile[];
  config: WorkflowConfig;
  onProgress?: (progress: MergeProgress) => void;
  turnstileToken?: string;
};

export async function runWorkflow(input: RunWorkflowInput): Promise<MergeWorkerOutputFile[]> {
  let currentFiles = input.files;
  let outputFiles: MergeWorkerOutputFile[] = currentFiles.map((file) => ({
    name: file.name,
    mimeType: "application/pdf",
    bytes: file.bytes
  }));

  for (const step of normalizeWorkflowSteps(input.config.steps)) {
    if (step.id === "compress-pdf") {
      input.onProgress?.({ stage: "compressing", current: 0, total: currentFiles.length });
      const compressed = await compressPdfFiles({
        files: currentFiles,
        mode: step.settings.mode,
        turnstileToken: input.turnstileToken
      });
      input.onProgress?.({ stage: "compressing", current: currentFiles.length, total: currentFiles.length });
      outputFiles = compressed;
      currentFiles = compressed.map((file) => ({
        name: file.name,
        bytes: file.bytes
      }));
    }

    if (step.id === "merge-pdf") {
      input.onProgress?.({ stage: "merging", current: 0, total: currentFiles.length });
      outputFiles = await mergePdfFiles({
        files: currentFiles,
        outputMode: step.settings.outputMode,
        maxSizeMb: toMaxSizeMb(step.settings),
        onProgress: input.onProgress
      });
      currentFiles = outputFiles.map((file) => ({
        name: file.name,
        bytes: file.bytes
      }));
    }
  }

  return outputFiles;
}
