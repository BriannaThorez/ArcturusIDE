import { useCallback, useEffect, useMemo, useState } from "react";

export type SecretProviderId = "gemini" | "openai";
export type SecretPersistenceMode = "memory" | "session" | "local";

export interface ProviderSecretState {
  key: string | null;
  persistence: SecretPersistenceMode;
  updatedAt: number | null;
}

export interface LocalSecretsState {
  activeProvider: SecretProviderId;
  providers: Record<SecretProviderId, ProviderSecretState>;
}

export interface ProviderSecretSummary {
  hasKey: boolean;
  maskedKey: string;
  persistence: SecretPersistenceMode;
  updatedAt: number | null;
}

export interface UseLocalSecretsResult {
  activeProvider: SecretProviderId;
  setActiveProvider: (provider: SecretProviderId) => void;
  providers: Record<SecretProviderId, ProviderSecretState>;
  setKey: (
    provider: SecretProviderId,
    key: string,
    persistence?: SecretPersistenceMode,
  ) => void;
  clearKey: (provider: SecretProviderId) => void;
  clearAllKeys: () => void;
  setPersistenceMode: (
    provider: SecretProviderId,
    persistence: SecretPersistenceMode,
  ) => void;
  hasKey: (provider: SecretProviderId) => boolean;
  getKey: (provider: SecretProviderId) => string | null;
  getMaskedKey: (provider: SecretProviderId) => string;
  getSummary: (provider: SecretProviderId) => ProviderSecretSummary;
  isHydrated: boolean;
  storageAvailable: boolean;
}

const STORAGE_PREFIX = "arcturus_secrets";
const PROVIDERS: SecretProviderId[] = ["gemini", "openai"];

const DEFAULT_STATE: LocalSecretsState = {
  activeProvider: "gemini",
  providers: {
    gemini: {
      key: null,
      persistence: "memory",
      updatedAt: null,
    },
    openai: {
      key: null,
      persistence: "memory",
      updatedAt: null,
    },
  },
};

function isBrowserStorageAvailable(storage: Storage | undefined): boolean {
  if (!storage) return false;
  try {
    const testKey = `${STORAGE_PREFIX}__test__`;
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function getStorageKey(provider: SecretProviderId, persistence: SecretPersistenceMode) {
  return `${STORAGE_PREFIX}:${persistence}:${provider}`;
}

function normalizeKey(input: string): string | null {
  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function maskKey(key: string | null): string {
  if (!key) return "";
  if (key.length <= 4) return "••••";
  return `••••••••${key.slice(-4)}`;
}

function readStoredKey(
  provider: SecretProviderId,
  persistence: SecretPersistenceMode,
): string | null {
  if (typeof window === "undefined") return null;

  const storage = persistence === "session" ? window.sessionStorage : window.localStorage;
  if (!isBrowserStorageAvailable(storage)) return null;

  try {
    return normalizeKey(storage.getItem(getStorageKey(provider, persistence)) || "");
  } catch {
    return null;
  }
}

function writeStoredKey(
  provider: SecretProviderId,
  key: string | null,
  persistence: SecretPersistenceMode,
): void {
  if (typeof window === "undefined") return;

  const storage = persistence === "session" ? window.sessionStorage : window.localStorage;
  if (!isBrowserStorageAvailable(storage)) return;

  try {
    const storageKey = getStorageKey(provider, persistence);
    if (key) {
      storage.setItem(storageKey, key);
    } else {
      storage.removeItem(storageKey);
    }
  } catch {
    // Intentionally swallow storage errors so secrets do not leak via logs.
  }
}

function clearStoredKey(provider: SecretProviderId, persistence: SecretPersistenceMode): void {
  writeStoredKey(provider, null, persistence);
}

function hydrateStateFromStorage(): LocalSecretsState {
  const nextState: LocalSecretsState = structuredClone(DEFAULT_STATE) as LocalSecretsState;

  for (const provider of PROVIDERS) {
    const localKey = readStoredKey(provider, "local");
    const sessionKey = readStoredKey(provider, "session");

    if (localKey) {
      nextState.providers[provider] = {
        key: localKey,
        persistence: "local",
        updatedAt: Date.now(),
      };
    } else if (sessionKey) {
      nextState.providers[provider] = {
        key: sessionKey,
        persistence: "session",
        updatedAt: Date.now(),
      };
    }
  }

  return nextState;
}

export function useLocalSecrets(): UseLocalSecretsResult {
  const [isHydrated, setIsHydrated] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(false);
  const [state, setState] = useState<LocalSecretsState>(DEFAULT_STATE);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsHydrated(true);
      return;
    }

    const localAvailable = isBrowserStorageAvailable(window.localStorage);
    const sessionAvailable = isBrowserStorageAvailable(window.sessionStorage);
    setStorageAvailable(localAvailable || sessionAvailable);
    setState(hydrateStateFromStorage());
    setIsHydrated(true);
  }, []);

  const persistKey = useCallback(
    (provider: SecretProviderId, key: string | null, persistence: SecretPersistenceMode) => {
      if (persistence === "memory") return;
      writeStoredKey(provider, key, persistence);
    },
    [],
  );

  const setActiveProvider = useCallback((provider: SecretProviderId) => {
    setState((prev) => ({
      ...prev,
      activeProvider: provider,
    }));
  }, []);

  const setKey = useCallback(
    (
      provider: SecretProviderId,
      key: string,
      persistence: SecretPersistenceMode = "local",
    ) => {
      const normalized = normalizeKey(key);

      setState((prev) => {
        const next = {
          ...prev,
          providers: {
            ...prev.providers,
            [provider]: {
              key: normalized,
              persistence,
              updatedAt: normalized ? Date.now() : null,
            },
          },
        };

        return next;
      });

      if (normalized) {
        persistKey(provider, normalized, persistence);

        const alternatePersistence = persistence === "local" ? "session" : "local";
        clearStoredKey(provider, alternatePersistence);
      } else {
        clearStoredKey(provider, "local");
        clearStoredKey(provider, "session");
      }
    },
    [persistKey],
  );

  const clearKey = useCallback((provider: SecretProviderId) => {
    setState((prev) => {
      const currentPersistence = prev.providers[provider].persistence;

      clearStoredKey(provider, "local");
      clearStoredKey(provider, "session");

      return {
        ...prev,
        providers: {
          ...prev.providers,
          [provider]: {
            key: null,
            persistence: currentPersistence,
            updatedAt: null,
          },
        },
      };
    });
  }, []);

  const clearAllKeys = useCallback(() => {
    for (const provider of PROVIDERS) {
      clearStoredKey(provider, "local");
      clearStoredKey(provider, "session");
    }

    setState((prev) => ({
      ...prev,
      providers: {
        gemini: {
          key: null,
          persistence: prev.providers.gemini.persistence,
          updatedAt: null,
        },
        openai: {
          key: null,
          persistence: prev.providers.openai.persistence,
          updatedAt: null,
        },
      },
    }));
  }, []);

  const setPersistenceMode = useCallback(
    (provider: SecretProviderId, persistence: SecretPersistenceMode) => {
      setState((prev) => {
        const current = prev.providers[provider];
        const nextKey = current.key;

        if (!nextKey) {
          return {
            ...prev,
            providers: {
              ...prev.providers,
              [provider]: {
                ...current,
                persistence,
              },
            },
          };
        }

        if (current.persistence !== persistence) {
          clearStoredKey(provider, current.persistence);
          persistKey(provider, nextKey, persistence);
        }

        return {
          ...prev,
          providers: {
            ...prev.providers,
            [provider]: {
              ...current,
              persistence,
            },
          },
        };
      });
    },
    [persistKey],
  );

  const hasKey = useCallback(
    (provider: SecretProviderId) => Boolean(state.providers[provider].key),
    [state.providers],
  );

  const getKey = useCallback(
    (provider: SecretProviderId) => state.providers[provider].key,
    [state.providers],
  );

  const getMaskedKey = useCallback(
    (provider: SecretProviderId) => maskKey(state.providers[provider].key),
    [state.providers],
  );

  const getSummary = useCallback(
    (provider: SecretProviderId): ProviderSecretSummary => {
      const entry = state.providers[provider];
      return {
        hasKey: Boolean(entry.key),
        maskedKey: maskKey(entry.key),
        persistence: entry.persistence,
        updatedAt: entry.updatedAt,
      };
    },
    [state.providers],
  );

  const result = useMemo<UseLocalSecretsResult>(
    () => ({
      activeProvider: state.activeProvider,
      setActiveProvider,
      providers: state.providers,
      setKey,
      clearKey,
      clearAllKeys,
      setPersistenceMode,
      hasKey,
      getKey,
      getMaskedKey,
      getSummary,
      isHydrated,
      storageAvailable,
    }),
    [
      state.activeProvider,
      state.providers,
      setActiveProvider,
      setKey,
      clearKey,
      clearAllKeys,
      setPersistenceMode,
      hasKey,
      getKey,
      getMaskedKey,
      getSummary,
      isHydrated,
      storageAvailable,
    ],
  );

  return result;
}
