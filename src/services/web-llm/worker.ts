function createUUID() {
  const nativeCrypto = globalThis.crypto;
  if (nativeCrypto && typeof nativeCrypto.randomUUID === "function") {
    return nativeCrypto.randomUUID();
  }

  return `webllm-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function installCryptoFallback() {
  const globalCrypto = globalThis.crypto as Crypto | undefined;

  if (globalCrypto && typeof globalCrypto.randomUUID === "function") {
    return;
  }

  const fallbackCrypto = {
    ...globalCrypto,
    randomUUID: createUUID,
  } as Crypto;

  Object.defineProperty(globalThis, "crypto", {
    value: fallbackCrypto,
    configurable: true,
    writable: true,
  });
}

installCryptoFallback();

import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

const handler = new WebWorkerMLCEngineHandler();

self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
