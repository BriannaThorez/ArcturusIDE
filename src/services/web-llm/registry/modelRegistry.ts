import { ModelRecord, prebuiltAppConfig, ModelType } from "@mlc-ai/web-llm";

/**
 * Registry mapping UI model IDs to official WebLLM ModelRecord objects.
 * This ensures we use validated model library WASMs and configurations.
 */
export const MODEL_REGISTRY: Record<string, ModelRecord> = {
  "Qwen2.5-7B-Instruct-q4f16_1-MLC": prebuiltAppConfig.model_list.find(
    (r) => r.model_id === "Qwen2.5-7B-Instruct-q4f16_1-MLC"
  )!,
  "DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC": prebuiltAppConfig.model_list.find(
    (r) => r.model_id === "DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC"
  )!,
};

/**
 * Returns a complete AppConfig based on the requested modelId.
 * Dynamically includes only the necessary model record.
 */
export function getAppConfigForModel(modelId: string) {
  const record = MODEL_REGISTRY[modelId];
  if (!record) {
    throw new Error(`Model ${modelId} not found in WebLLM registry.`);
  }

  return {
    ...prebuiltAppConfig,
    model_list: [record],
  };
}

/**
 * Validates if the selected model is supported for WebGPU local inference.
 */
export function isWebLLMSupported(modelId: string): boolean {
  return !!MODEL_REGISTRY[modelId];
}
