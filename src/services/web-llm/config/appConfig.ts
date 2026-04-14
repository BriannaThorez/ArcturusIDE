import { prebuiltAppConfig } from "@mlc-ai/web-llm";

export const webLLMAppConfig = {
  ...prebuiltAppConfig,
  cacheBackend: "indexeddb" as const,
};

export type WebLLMAppConfig = typeof webLLMAppConfig;
