import { mergePdfFiles } from "./merge-engine";
import type { MergeProgress, MergeWorkerRequest, MergeWorkerResponse, MergeWorkerOutputFile } from "./types";

type RunMergeOptions = Omit<MergeWorkerRequest, "id"> & {
  onProgress?: (progress: MergeProgress) => void;
};

export function runMergeWorker(options: RunMergeOptions): Promise<MergeWorkerOutputFile[]> {
  const id = createRequestId();

  if (typeof Worker === "undefined") {
    return mergePdfFiles(options);
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./merge.worker.ts", import.meta.url), { type: "module" });
    const transfer = options.files.map((file) => file.bytes);

    worker.onmessage = (event: MessageEvent<MergeWorkerResponse>) => {
      const response = event.data;
      if (response.id !== id) {
        return;
      }

      if (response.type === "progress") {
        options.onProgress?.(response.progress);
        return;
      }

      worker.terminate();

      if (response.type === "success") {
        resolve(response.files);
        return;
      }

      reject(new Error(response.message));
    };

    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message));
    };

    worker.postMessage(
      {
        id,
        files: options.files,
        outputMode: options.outputMode,
        maxSizeMb: options.maxSizeMb
      },
      transfer
    );
  });
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `merge-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
