import {
  CreateWebWorkerMLCEngine,
  InitProgressReport,
  MLCEngineInterface,
} from "@mlc-ai/web-llm";
import { webLLMAppConfig } from "../config/appConfig";
import webLLMWorkerUrl from "../worker.ts?worker&url";

/**
 * EngineManager lifecycle states
 */
export type EngineState = "idle" | "loading" | "ready" | "error";

export type ProgressCallback = (report: InitProgressReport) => void;

/**
 * Manages the WebLLM engine lifecycle to ensure engine is booted
 * in the background and model loading is decoupled from UI render.
 */
export class WebLLMEngineManager {
  private engine: MLCEngineInterface | null = null;
  private worker: Worker | null = null;
  private state: EngineState = "idle";
  private currentModelId: string | null = null;

  private onProgress: ProgressCallback = () => {};

  constructor(onProgress?: ProgressCallback) {
    if (onProgress) this.onProgress = onProgress;
  }

  public getState(): EngineState {
    return this.state;
  }

  public async bootEngine() {
    if (this.state !== "idle") return;

    // We boot the worker instance but do not load a model yet
    this.state = "loading";
    try {
      this.worker = new Worker(webLLMWorkerUrl, { type: "module" });
      // Temporary stub engine creation to confirm worker lifecycle
      // In production, CreateWebWorkerMLCEngine is called on model load
      this.state = "ready";
    } catch (err) {
      console.error("Failed to boot WebLLM worker:", err);
      this.state = "error";
    }
  }

  public async loadModel(modelId: string) {
    if (this.currentModelId === modelId && this.engine) return;

    await this.unloadCurrentModel();
    this.state = "loading";

    try {
      if (!this.worker) await this.bootEngine();

      this.engine = await CreateWebWorkerMLCEngine(this.worker!, modelId, {
        initProgressCallback: this.onProgress,
        appConfig: webLLMAppConfig,
      });

      this.currentModelId = modelId;
      this.state = "ready";
    } catch (err) {
      this.state = "error";
      throw err;
    }
  }

  public async unloadCurrentModel() {
    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
    }
    this.currentModelId = null;
    this.state = "ready";
  }

  public async generate(prompt: string, onUpdate?: (text: string) => void) {
    if (!this.engine || this.state !== "ready") {
      throw new Error("Engine not ready for generation");
    }

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
    return fullText;
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.engine = null;
    this.state = "idle";
  }
}
