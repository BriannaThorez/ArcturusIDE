import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Settings,
  User,
  Activity,
  Shield,
  ShieldAlert,
  Sparkles,
  Monitor,
  Palette,
  Type,
  Globe,
  KeyRound,
  Database,
  Cpu,
} from "lucide-react";
import {
  SecretPersistenceMode,
  SecretProviderId,
  useLocalSecrets,
} from "../../hooks/useLocalSecrets";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = "general" | "appearance" | "apiKeys" | "advanced";

const PROVIDER_LABELS: Record<SecretProviderId, string> = {
  gemini: "Gemini",
  openai: "OpenAI",
};

const DEFAULT_WARN =
  "Keys are stored only on this device and never sent to the build system.";

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const secrets = useLocalSecrets();

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [selectedProvider, setSelectedProvider] =
    useState<SecretProviderId>("gemini");
  const [pendingKey, setPendingKey] = useState("");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedProvider(secrets.activeProvider);
  }, [isOpen, secrets.activeProvider]);

  useEffect(() => {
    if (!isOpen) return;
    setPendingKey(secrets.providers[selectedProvider].key ?? "");
    setSaveNotice(null);
  }, [isOpen, selectedProvider, secrets.providers]);

  const handleSaveSecret = () => {
    const trimmed = pendingKey.trim();
    secrets.setKey(selectedProvider, trimmed, "local");
    secrets.setActiveProvider(selectedProvider);
    setSaveNotice(`${PROVIDER_LABELS[selectedProvider]} key saved locally.`);
  };

  const handleClearSecret = () => {
    secrets.clearKey(selectedProvider);
    setPendingKey("");
    setSaveNotice(`${PROVIDER_LABELS[selectedProvider]} key cleared.`);
  };

  const clearWebLLMCache = async () => {
    try {
      const module = await import("@mlc-ai/web-llm");
      // Cache clearing is often invoked without arguments in the WebLLM API context
      if (typeof module.deleteModelAllInfoInCache === "function") {
        await (module.deleteModelAllInfoInCache as () => Promise<void>)();
        alert("WebLLM cache cleared successfully.");
      }
    } catch (e) {
      console.error("Failed to clear cache:", e);
      alert("Failed to clear cache.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl h-[80vh] bg-[#0c0c0e] border border-glass-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-glass-border flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 rounded-lg text-primary">
                  <Monitor size={20} />
                </div>
                <div>
                  <h2 className="font-black text-lg tracking-tight text-primary">
                    SYSTEM SETTINGS
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-48 border-r border-glass-border bg-black/20 p-4 space-y-2">
                {(
                  [
                    "general",
                    "appearance",
                    "apiKeys",
                    "advanced",
                  ] as SettingsTab[]
                ).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeTab === tab
                        ? "bg-brand-primary text-black font-bold"
                        : "text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    {tab === "general" && <Cpu size={16} />}
                    {tab === "appearance" && <Palette size={16} />}
                    {tab === "apiKeys" && <KeyRound size={16} />}
                    {tab === "advanced" && <Type size={16} />}
                    <span className="capitalize">{tab}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                {activeTab === "advanced" && (
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                        <Database size={14} /> WEBLLM STORAGE
                      </h3>
                      <div className="p-4 bg-white/5 rounded-xl border border-glass-border flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-slate-200">
                            Model Cache
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Clear all locally stored WebLLM model data
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const module = await import("@mlc-ai/web-llm");
                              if (
                                typeof module.deleteModelAllInfoInCache ===
                                "function"
                              ) {
                                await module.deleteModelAllInfoInCache();
                                alert("WebLLM cache cleared successfully.");
                              }
                            } catch (e) {
                              console.error("Failed to clear cache:", e);
                              alert("Failed to clear cache.");
                            }
                          }}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/40 text-[11px] font-bold uppercase rounded-lg transition-all"
                        >
                          Clear Cache
                        </button>
                      </div>
                    </section>
                  </div>
                )}
                {activeTab === "apiKeys" && (
                  <div className="space-y-6">
                    <section className="p-4 rounded-xl border border-amber-400/20 bg-amber-400/5">
                      <div className="flex items-start gap-3">
                        <ShieldAlert
                          className="text-amber-300 mt-0.5"
                          size={18}
                        />
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-amber-200">
                            Keep API keys local
                          </h3>
                          <p className="text-xs text-amber-100/80">
                            {DEFAULT_WARN}
                          </p>
                        </div>
                      </div>
                    </section>
                    {saveNotice && (
                      <div className="p-3 rounded-lg border border-brand-primary/30 bg-brand-primary/10 text-sm text-primary flex items-center gap-2">
                        <Sparkles size={14} />
                        <span>{saveNotice}</span>
                      </div>
                    )}
                    <section className="grid gap-4">
                      <input
                        value={pendingKey}
                        onChange={(e) => setPendingKey(e.target.value)}
                        className="w-full bg-black/40 border border-glass-border rounded-lg p-3 text-sm text-white"
                        placeholder="Enter API Key"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveSecret}
                          className="px-4 py-2 bg-brand-primary text-black rounded-lg text-sm font-bold"
                        >
                          Save Key
                        </button>
                        <button
                          onClick={handleClearSecret}
                          className="px-4 py-2 bg-white/5 text-white rounded-lg text-sm"
                        >
                          Clear Key
                        </button>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
