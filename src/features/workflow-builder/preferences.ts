import { DEFAULT_COMPRESS_PREFERENCES, isCompressionMode } from "@/features/compress-pdf/preferences";
import { DEFAULT_PREFERENCES, isOutputMode, isSizeUnit, isValidMaxSize } from "@/features/merge-pdf/preferences";
import type { WorkflowConfig, WorkflowStep } from "./types";

export const WORKFLOW_CONFIG_KEY = "workflow-builder-config";

export const DEFAULT_WORKFLOW_CONFIG: WorkflowConfig = {
  version: 1,
  steps: [
    { id: "compress-pdf", settings: DEFAULT_COMPRESS_PREFERENCES },
    { id: "merge-pdf", settings: DEFAULT_PREFERENCES }
  ]
};

export function loadWorkflowConfig(storage: Storage | undefined): WorkflowConfig {
  if (!storage) {
    return DEFAULT_WORKFLOW_CONFIG;
  }

  try {
    const raw = storage.getItem(WORKFLOW_CONFIG_KEY);
    if (!raw) {
      return DEFAULT_WORKFLOW_CONFIG;
    }

    const parsed = JSON.parse(raw);
    const config = parseWorkflowConfig(parsed);
    return config ?? DEFAULT_WORKFLOW_CONFIG;
  } catch {
    return DEFAULT_WORKFLOW_CONFIG;
  }
}

export function saveWorkflowConfig(storage: Storage | undefined, config: WorkflowConfig): void {
  if (!storage || !isValidWorkflowConfig(config)) {
    return;
  }

  storage.setItem(WORKFLOW_CONFIG_KEY, JSON.stringify({ ...config, steps: normalizeWorkflowSteps(config.steps) }));
}

export function isValidWorkflowConfig(config: WorkflowConfig): boolean {
  return config.version === 1 && config.steps.length >= 2 && config.steps.every(isWorkflowStep);
}

export function normalizeWorkflowSteps(steps: WorkflowStep[]): WorkflowStep[] {
  return [
    ...steps.filter((step) => step.id === "compress-pdf"),
    ...steps.filter((step) => step.id === "merge-pdf")
  ];
}

function parseWorkflowConfig(value: unknown): WorkflowConfig | null {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.steps)) {
    return null;
  }

  const steps = value.steps.filter(isWorkflowStep);
  const config: WorkflowConfig = {
    version: 1,
    steps: normalizeWorkflowSteps(steps)
  };

  return isValidWorkflowConfig(config) ? config : null;
}

function isWorkflowStep(value: unknown): value is WorkflowStep {
  if (!isRecord(value) || !isRecord(value.settings)) {
    return false;
  }

  if (value.id === "compress-pdf") {
    return isCompressionMode(value.settings.mode);
  }

  if (value.id === "merge-pdf") {
    const maxSizeUnit = value.settings.maxSizeUnit;
    return isOutputMode(value.settings.outputMode) && isSizeUnit(maxSizeUnit) && isValidMaxSize(value.settings.maxSizeValue, maxSizeUnit);
  }

  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
