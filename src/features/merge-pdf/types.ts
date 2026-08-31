export type OutputMode = "single" | "multiple";
export type SizeUnit = "MB" | "GB";

export type LimitLevel = "none" | "soft" | "strong" | "hard";

export type MergePreferences = {
  outputMode: OutputMode;
  maxSizeValue: number;
  maxSizeUnit: SizeUnit;
};

export type PdfFileItem = {
  id: string;
  file: File;
};

export type MergeProgressStage = "idle" | "reading" | "compressing" | "building" | "merging" | "zipping" | "done" | "error";

export type MergeProgress = {
  stage: MergeProgressStage;
  current: number;
  total: number;
};

export type WorkerPdfFile = {
  name: string;
  bytes: ArrayBuffer;
};

export type MergeWorkerRequest = {
  id: string;
  files: WorkerPdfFile[];
  outputMode: OutputMode;
  maxSizeMb: number;
};

export type MergeWorkerOutputFile = {
  name: string;
  mimeType: string;
  bytes: ArrayBuffer;
};

export type MergeWorkerResponse =
  | {
      id: string;
      type: "progress";
      progress: MergeProgress;
    }
  | {
      id: string;
      type: "success";
      files: MergeWorkerOutputFile[];
    }
  | {
      id: string;
      type: "error";
      message: string;
    };
