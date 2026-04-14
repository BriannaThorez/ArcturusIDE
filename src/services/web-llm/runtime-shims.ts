/**
 * runtime-shims.ts
 *
 * Centralizes compatibility shims for browser APIs that might be missing
 * in specific execution contexts (like WebWorkers or restricted environments)
 * where WebLLM dependencies are loaded.
 */

export function patchRuntime() {
  // 1. Shim crypto.randomUUID
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

  // 2. Shim caches (if not present) to avoid "caches is not defined"
  if (typeof globalThis.caches === "undefined") {
    Object.defineProperty(globalThis, "caches", {
      value: {
        open: async () => ({
          put: async () => {},
          match: async () => null,
        }),
      },
      configurable: true,
      writable: true,
    });
  }
}
