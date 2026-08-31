import { compressPdfFile } from "@/features/compress-pdf/compress-engine";
import { mergePdfFiles } from "@/features/merge-pdf/merge-engine";
import { toMaxSizeMb } from "@/features/merge-pdf/preferences";
import type { MergeProgress, MergeWorkerOutputFile, WorkerPdfFile } from "@/features/merge-pdf/types";
import { normalizeWorkflowSteps } from "./preferences";
import type { WorkflowConfig } from "./types";

type RunWorkflowInput = {
  files: WorkerPdfFile[];
  config: WorkflowConfig;
  onProgress?: (progress: MergeProgress) => void;
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
      const compressed: MergeWorkerOutputFile[] = [];
      for (const [index, file] of currentFiles.entries()) {
        input.onProgress?.({ stage: "compressing", current: index + 1, total: currentFiles.length });
        compressed.push(await compressPdfFile({ file, mode: step.settings.mode }));
      }
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
