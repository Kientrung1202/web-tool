import type { CompressPreferences } from "@/features/compress-pdf/types";
import type { MergePreferences } from "@/features/merge-pdf/types";

export type WorkflowStepId = "compress-pdf" | "merge-pdf";

export type CompressWorkflowStep = {
  id: "compress-pdf";
  settings: CompressPreferences;
};

export type MergeWorkflowStep = {
  id: "merge-pdf";
  settings: MergePreferences;
};

export type WorkflowStep = CompressWorkflowStep | MergeWorkflowStep;

export type WorkflowConfig = {
  version: 1;
  steps: WorkflowStep[];
};
