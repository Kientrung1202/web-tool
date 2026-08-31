import { mergePdfFiles } from "./merge-engine";
import type { MergeWorkerRequest, MergeWorkerResponse } from "./types";

const isWorkerRuntime = typeof self !== "undefined" && typeof document === "undefined";

if (isWorkerRuntime) {
  self.onmessage = async (event: MessageEvent<MergeWorkerRequest>) => {
    const request = event.data;

    try {
      const files = await mergePdfFiles({
        files: request.files,
        outputMode: request.outputMode,
        maxSizeMb: request.maxSizeMb,
        onProgress: (progress) => {
          const response: MergeWorkerResponse = {
            id: request.id,
            type: "progress",
            progress
          };
          self.postMessage(response);
        }
      });

      const response: MergeWorkerResponse = {
        id: request.id,
        type: "success",
        files
      };
      self.postMessage(
        response,
        files.map((file) => file.bytes)
      );
    } catch (error) {
      const response: MergeWorkerResponse = {
        id: request.id,
        type: "error",
        message: error instanceof Error ? error.message : "Unknown merge error"
      };
      self.postMessage(response);
    }
  };
}
