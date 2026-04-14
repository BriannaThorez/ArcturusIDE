const globalCrypto = globalThis.crypto as Crypto | undefined;

if (!globalCrypto || typeof globalCrypto.randomUUID !== "function") {
  const fallbackCrypto = {
    ...globalCrypto,
    randomUUID: () =>
      `webllm-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  } as Crypto;

  Object.defineProperty(globalThis, "crypto", {
    value: fallbackCrypto,
    configurable: true,
    writable: true,
  });
}

import webLLMWorkerUrl from "./web-llm/worker.ts?worker&url";
import {
  CreateMLCEngine,
  CreateWebWorkerMLCEngine,
  InitProgressReport,
  MLCEngineInterface,
  prebuiltAppConfig,
} from "@mlc-ai/web-llm";

export type WebLLMProgressCallback = (report: InitProgressReport) => void;

export type WebLLMServiceOptions = {
  modelId?: string;
  useWorker?: boolean;
};

type WebLLMEngineMode = "main-thread" | "worker";

const DEFAULT_MODEL_ID = "Qwen2.5-7B-Instruct-q4f16_1-MLC";

import { getAppConfigForModel } from "./web-llm/registry/modelRegistry";

export class WebLLMService {
  private engine: MLCEngineInterface | null = null;
  private engineMode: WebLLMEngineMode = "main-thread";
  private modelId: string = DEFAULT_MODEL_ID;
  private worker: Worker | null = null;

  private async createWorker(): Promise<Worker> {
    return new Worker(webLLMWorkerUrl, {
      type: "module",
    });
  }

  private emitDebugStatus(message: string) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("terminal:write", {
          detail: `[WebLLM] ${message}`,
        }),
      );
    }
    console.log(`[WebLLM] ${message}`);
  }

  private attachWorkerDebugListener(worker: Worker) {
    worker.addEventListener("message", (event) => {
      const data = event.data as {
        kind?: string;
        content?: unknown;
      } | null;

      if (!data || data.kind !== "workerDebug") {
        return;
      }

      const message =
        typeof data.content === "string"
          ? data.content
          : JSON.stringify(data.content);

      this.emitDebugStatus(message);
    });
  }

  private emitConfigStatus() {
    this.emitDebugStatus(
      `engineMode=${this.engineMode}, cacheBackend=indexeddb, modelId=${this.modelId}`,
    );
  }

  private emitRuntimeStatus() {
    const hasIndexedDB = typeof indexedDB !== "undefined";
    const hasCrypto = typeof crypto !== "undefined";
    const hasRandomUUID = hasCrypto && typeof crypto.randomUUID === "function";
    const hasNavigatorGpu =
      typeof navigator !== "undefined" && "gpu" in navigator;
    const hasCrossOriginIsolated =
      typeof crossOriginIsolated !== "undefined"
        ? String(crossOriginIsolated)
        : "unknown";

    this.emitDebugStatus(`indexedDB available=${hasIndexedDB ? "yes" : "no"}`);
    this.emitDebugStatus(`crypto available=${hasCrypto ? "yes" : "no"}`);
    this.emitDebugStatus(
      `crypto.randomUUID available=${hasRandomUUID ? "yes" : "no"}`,
    );
    this.emitDebugStatus(
      `navigator.gpu available=${hasNavigatorGpu ? "yes" : "no"}`,
    );
    this.emitDebugStatus(`crossOriginIsolated=${hasCrossOriginIsolated}`);
  }

  private assertIndexedDBReady() {
    const hasIndexedDB = typeof indexedDB !== "undefined";
    this.emitDebugStatus(`indexedDB available=${hasIndexedDB ? "yes" : "no"}`);
    if (!hasIndexedDB) {
      throw new Error(
        "IndexedDB is not available in this browser context. WebLLM cacheBackend is set to indexeddb, but the runtime does not expose indexedDB.",
      );
    }
  }

  async init(
    onProgress?: WebLLMProgressCallback,
    options?: WebLLMServiceOptions,
  ) {
    const nextModelId = options?.modelId ?? this.modelId;
    const nextUseWorker = options?.useWorker ?? true;

    if (this.engine && this.modelId === nextModelId) {
      this.emitConfigStatus();
      this.emitRuntimeStatus();
      return;
    }

    if (this.engine) {
      await this.unload();
    }

    this.modelId = nextModelId;
    this.engineMode = nextUseWorker ? "worker" : "main-thread";

    this.emitConfigStatus();
    this.emitConfigStatus();
    this.assertIndexedDBReady();

    const dynamicAppConfig = getAppConfigForModel(this.modelId);

    if (this.engineMode === "worker") {
      this.emitDebugStatus("creating worker engine");
      this.worker = await this.createWorker();
      this.attachWorkerDebugListener(this.worker);
      this.engine = await CreateWebWorkerMLCEngine(this.worker, this.modelId, {
        initProgressCallback: (report) => {
          this.emitDebugStatus(
            `progress=${report.text}${typeof report.progress === "number" ? ` (${Math.round(report.progress * 100)}%)` : ""}`,
          );
          onProgress?.(report);
        },
        appConfig: dynamicAppConfig,
      });
      this.emitDebugStatus("worker engine initialized");
      return;
    }

    this.emitDebugStatus("creating main-thread engine");
    this.engine = await CreateMLCEngine(this.modelId, {
      initProgressCallback: (report) => {
        this.emitDebugStatus(
          `progress=${report.text}${typeof report.progress === "number" ? ` (${Math.round(report.progress * 100)}%)` : ""}`,
        );
        onProgress?.(report);
      },
      appConfig: dynamicAppConfig,
    });
    this.emitDebugStatus("main-thread engine initialized");
  }

  async generate(
    prompt: string,
    onUpdate?: (text: string) => void,
  ): Promise<string> {
    if (!this.engine) {
      throw new Error("WebLLM engine not initialized");
    }

    this.emitDebugStatus(`generate called with prompt length=${prompt.length}`);

    const chunks = await this.engine.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    let fullText = "";
    for await (const chunk of chunks) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullText += content;
      if (onUpdate) onUpdate(fullText);
    }

    this.emitDebugStatus(
      `generation complete, output length=${fullText.length}`,
    );
    return fullText;
  }

  async unload() {
    this.emitDebugStatus("unloading engine");
    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
    }

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const webLLM = new WebLLMService();
