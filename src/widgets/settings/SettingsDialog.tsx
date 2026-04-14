import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Save,
  RotateCcw,
  Palette,
  Monitor,
  Cpu,
  Type,
  Globe,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  ShieldAlert,
  Sparkles,
  CircleHelp,
} from "lucide-react";
import { CodeMirrorEditor } from "../../features/codemirror6/CodeMirrorEditor";
import { useUserSettings } from "../../hooks/useUserSettings";
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

function maskForDisplay(maskedKey: string, hasKey: boolean) {
  if (hasKey && maskedKey) return maskedKey;
  return "••••••••";
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings } = useUserSettings();
  const secrets = useLocalSecrets();

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [jsonConfig, setJsonConfig] = useState(
    JSON.stringify(settings, null, 2),
  );

  const [selectedProvider, setSelectedProvider] =
    useState<SecretProviderId>("gemini");
  const [revealKey, setRevealKey] = useState(false);
  const [persistMode, setPersistMode] =
    useState<SecretPersistenceMode>("local");
  const [pendingKey, setPendingKey] = useState("");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const activeProviderSummary = useMemo(
    () => secrets.getSummary(selectedProvider),
    [secrets, selectedProvider],
  );

  useEffect(() => {
    if (!isOpen) return;
    setJsonConfig(JSON.stringify(settings, null, 2));
  }, [isOpen, settings]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedProvider(secrets.activeProvider);
  }, [isOpen, secrets.activeProvider]);

  useEffect(() => {
    if (!isOpen) return;

    const providerState = secrets.providers[selectedProvider];
    setPersistMode(providerState.persistence);
    setPendingKey(providerState.key ?? "");
    setRevealKey(false);
    setSaveNotice(null);
  }, [isOpen, selectedProvider, secrets.providers]);

  const safeJsonConfig = useMemo(() => {
    return jsonConfig;
  }, [jsonConfig]);

  const handleSaveJson = () => {
    try {
      JSON.parse(safeJsonConfig);
      setSaveNotice("Settings JSON validated. Secrets are managed separately.");
      onClose();
    } catch {
      alert("Invalid JSON configuration");
    }
  };

  const handleSaveSecret = () => {
    const trimmed = pendingKey.trim();
    secrets.setKey(selectedProvider, trimmed, persistMode);
    secrets.setActiveProvider(selectedProvider);
    setSaveNotice(`${PROVIDER_LABELS[selectedProvider]} key saved locally.`);
  };

  const handleClearSecret = () => {
    secrets.clearKey(selectedProvider);
    setPendingKey("");
    setRevealKey(false);
    setSaveNotice(`${PROVIDER_LABELS[selectedProvider]} key cleared.`);
  };

  const handlePersistenceToggle = (mode: SecretPersistenceMode) => {
    setPersistMode(mode);
    if (secrets.hasKey(selectedProvider)) {
      secrets.setPersistenceMode(selectedProvider, mode);
      setSaveNotice(
        `${PROVIDER_LABELS[selectedProvider]} storage mode updated.`,
      );
    }
  };

  const providerKeyValue = revealKey ? pendingKey : pendingKey;

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
            {/* Header */}
            <div className="px-6 py-4 border-b border-glass-border flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 rounded-lg text-primary">
                  <Monitor size={20} />
                </div>
                <div>
                  <h2 className="font-black text-lg tracking-tight text-primary">
                    SYSTEM SETTINGS
                  </h2>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Global Configuration Engine
                  </p>
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
              {/* Sidebar */}
              <div className="w-48 border-r border-glass-border bg-black/20 p-4 space-y-2">
                <button
                  onClick={() => setActiveTab("general")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    activeTab === "general"
                      ? "bg-brand-primary text-black font-bold"
                      : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <Cpu size={16} />
                  <span>General</span>
                </button>
                <button
                  onClick={() => setActiveTab("appearance")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    activeTab === "appearance"
                      ? "bg-brand-primary text-black font-bold"
                      : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <Palette size={16} />
                  <span>Appearance</span>
                </button>
                <button
                  onClick={() => setActiveTab("apiKeys")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    activeTab === "apiKeys"
                      ? "bg-brand-primary text-black font-bold"
                      : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <KeyRound size={16} />
                  <span>API Keys</span>
                </button>
                <button
                  onClick={() => setActiveTab("advanced")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    activeTab === "advanced"
                      ? "bg-brand-primary text-black font-bold"
                      : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <Type size={16} />
                  <span>Advanced</span>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                {activeTab === "general" && (
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                        <Globe size={14} /> WORKSPACE
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-glass-border">
                          <div>
                            <div className="text-sm font-medium text-slate-200">
                              Auto-Save
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Automatically persist changes to disk
                            </div>
                          </div>
                          <div className="w-10 h-5 bg-brand-primary rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full" />
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                        <Palette size={14} /> THEME ENGINE
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {["Amazonite", "Obsidian", "Crimson"].map((t) => (
                          <button
                            key={t}
                            className="p-4 bg-white/5 border border-glass-border rounded-xl text-center hover:border-brand-primary transition-all"
                          >
                            <div className="w-full h-12 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary mb-2" />
                            <span className="text-xs font-medium text-slate-300">
                              {t}
                            </span>
                          </button>
                        ))}
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
                          <p className="text-xs text-amber-100/80 leading-relaxed">
                            {DEFAULT_WARN}
                          </p>
                          <p className="text-[11px] text-amber-100/60 leading-relaxed">
                            Use temporary session storage for short-lived usage,
                            or local storage if you explicitly want the key
                            remembered on this device.
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
                      <div className="flex flex-wrap items-center gap-2">
                        {(
                          Object.keys(PROVIDER_LABELS) as SecretProviderId[]
                        ).map((provider) => {
                          const summary = secrets.getSummary(provider);
                          return (
                            <button
                              key={provider}
                              onClick={() => {
                                setSelectedProvider(provider);
                                setPendingKey(secrets.getKey(provider) ?? "");
                                setPersistMode(
                                  secrets.providers[provider].persistence,
                                );
                                setRevealKey(false);
                                secrets.setActiveProvider(provider);
                              }}
                              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                                selectedProvider === provider
                                  ? "bg-brand-primary text-black font-bold border-brand-primary"
                                  : "bg-white/5 text-slate-300 border-glass-border hover:border-brand-primary/60"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <CircleHelp size={14} />
                                {PROVIDER_LABELS[provider]}
                                <span className="text-[10px] opacity-80">
                                  {summary.hasKey ? "saved" : "empty"}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="p-5 rounded-2xl border border-glass-border bg-black/20 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-base font-bold text-slate-100">
                              {PROVIDER_LABELS[selectedProvider]}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                              Enter your API key. It will never be included in
                              the raw JSON editor.
                            </p>
                          </div>
                          <div className="text-right text-[11px] text-slate-500">
                            <div className="uppercase tracking-widest">
                              Storage
                            </div>
                            <div className="text-slate-300">
                              {persistMode === "local"
                                ? "Local storage"
                                : persistMode === "session"
                                  ? "Session storage"
                                  : "Memory only"}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                            API Key
                          </label>
                          <div className="relative">
                            <input
                              type={revealKey ? "text" : "password"}
                              value={providerKeyValue}
                              onChange={(e) => setPendingKey(e.target.value)}
                              placeholder={`Paste your ${PROVIDER_LABELS[selectedProvider]} API key`}
                              autoComplete="off"
                              spellCheck={false}
                              className="w-full rounded-xl border border-glass-border bg-black/40 px-4 py-3 pr-24 text-sm text-slate-100 outline-none focus:border-brand-primary/60"
                            />
                            <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setRevealKey((prev) => !prev)}
                                className="px-3 py-1.5 text-xs rounded-lg border border-glass-border text-slate-300 hover:text-white hover:border-brand-primary/60 transition-colors flex items-center gap-1"
                                aria-label={
                                  revealKey ? "Hide API key" : "Show API key"
                                }
                              >
                                {revealKey ? (
                                  <EyeOff size={13} />
                                ) : (
                                  <Eye size={13} />
                                )}
                                {revealKey ? "Hide" : "Show"}
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <CircleHelp size={12} />
                            The key is only kept in browser storage you choose
                            for this device.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => handlePersistenceToggle("memory")}
                            className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                              persistMode === "memory"
                                ? "bg-brand-primary text-black border-brand-primary font-bold"
                                : "bg-white/5 text-slate-300 border-glass-border hover:border-brand-primary/60"
                            }`}
                          >
                            Temporary session only
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePersistenceToggle("session")}
                            className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                              persistMode === "session"
                                ? "bg-brand-primary text-black border-brand-primary font-bold"
                                : "bg-white/5 text-slate-300 border-glass-border hover:border-brand-primary/60"
                            }`}
                          >
                            Session storage
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePersistenceToggle("local")}
                            className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                              persistMode === "local"
                                ? "bg-brand-primary text-black border-brand-primary font-bold"
                                : "bg-white/5 text-slate-300 border-glass-border hover:border-brand-primary/60"
                            }`}
                          >
                            Local storage
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={handleSaveSecret}
                            className="px-4 py-2 rounded-lg bg-brand-primary text-black font-bold text-sm shadow-[0_0_1rem_var(--bio-glow)] hover:scale-[1.01] transition-transform flex items-center gap-2"
                          >
                            <Save size={15} />
                            Paste and save locally
                          </button>
                          <button
                            type="button"
                            onClick={handleClearSecret}
                            className="px-4 py-2 rounded-lg border border-red-500/30 text-red-200 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                          >
                            <Trash2 size={15} />
                            Clear stored key
                          </button>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <CircleHelp size={13} />
                            {activeProviderSummary.hasKey
                              ? "A key is already stored for this provider."
                              : "No key is stored for this provider."}
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === "advanced" && (
                  <div className="h-full flex flex-col">
                    <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                      <Type size={14} /> RAW CONFIGURATION (JSON)
                    </h3>
                    <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-100/80">
                      Secrets are managed separately in the API Keys tab and are
                      not included here.
                    </div>
                    <div className="flex-1 border border-glass-border rounded-xl overflow-hidden bg-black">
                      <CodeMirrorEditor
                        value={jsonConfig}
                        onChange={setJsonConfig}
                        language="typescript"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-glass-border flex justify-between items-center bg-black/40">
              <button className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors">
                <RotateCcw size={14} />
                <span>Reset to Defaults</span>
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveJson}
                  className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-black rounded-lg font-bold text-sm shadow-[0_0_1rem_var(--bio-glow)] hover:scale-105 transition-all"
                >
                  <Save size={16} />
                  <span>Apply Changes</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
