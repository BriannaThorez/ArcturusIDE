import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "../widgets/sidebar/Sidebar";
import { VectorVisualizerModal } from "../features/visualizer/VectorVisualizerModal";
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import {
  CodeMirrorEditor,
  CodeMirrorEditorRef,
} from "../features/codemirror6/CodeMirrorEditor";
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  Search,
  Zap,
  PaintRoller,
  Sparkles,
  Menu,
  ChevronDown,
  Check,
  Cpu,
  Globe,
  FileText,
  Shield,
  Radio,
  Send,
  Image as ImageIcon,
  Mic,
  X,
  FolderInput,
  Pin,
  Archive,
  Copy,
  Edit3,
  Share2,
  Settings,
  User,
  Activity,
  MessageSquare,
  MoreVertical,
  Leaf,
  Palette,
  Plus,
  Terminal as TerminalIcon,
  Brain,
  Book,
  Folder,
} from "lucide-react";
import { HighlightPromptModal } from "../features/chat/HighlightPromptModal";
import { webLLM } from "../services/web-llm";
import {
  AgenticChat,
  LexicalChatInput,
  ConversationManager,
} from "../features/agentic-chat";
import { TerminalPanel } from "../features/terminal/TerminalPanel";
import { DocumentationViewer } from "../features/documentation-engine/DocumentationViewer";
import { MainMenu } from "../widgets/menu/MainMenu";
import { SettingsDialog } from "../widgets/settings/SettingsDialog";
import {
  THEMES,
  GlobalStyles,
  BackgroundEffects,
  ThreeWebGPUField,
} from "../shared/ui/ArcturusTheme";
import { useUserSettings } from "../hooks/useUserSettings";
import { useLocalSecrets } from "../hooks/useLocalSecrets";

export interface Model {
  id: string;
  name: string;
  type: "cloud" | "local" | "webgpu";
}

export const AVAILABLE_MODELS: Model[] = [
  {
    id: "gemini-3-flash-preview",
    name: "gemini-3-flash-preview",
    type: "cloud",
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "gemini-3.1-pro-preview",
    type: "cloud",
  },
  { id: "gemini-2.5-flash", name: "gemini-2.5-flash", type: "cloud" },
  { id: "gemini-2.5-pro", name: "gemini-2.5-pro", type: "cloud" },
  {
    id: "Qwen2.5-7B-Instruct-q4f16_1-MLC",
    name: "Qwen2.5 7B q4f16_1 (WebGPU)",
    type: "webgpu",
  },
  {
    id: "deepseek-r1-distill-qwen-7b",
    name: "DeepSeek-R1-Distill-Qwen-7B",
    type: "local",
  },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  time?: string;
}

export function Layout() {
  const { settings, updateLayout, updatePanel } = useUserSettings();
  const secrets = useLocalSecrets();
  const [theme, setTheme] = useState(THEMES.AMAZONITE);
  const [showPalette, setShowPalette] = useState(false);

  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("");
  const [modelLoadingProgress, setModelLoadingProgress] = useState<
    string | null
  >(null);
  const [isModelReady, setIsModelReady] = useState(false);

  // Sidebar State (File Explorer & Conversation Manager)
  const [isFileTreeOpen, setIsFileTreeOpen] = useState(false);
  const [isConvManagerOpen, setIsConvManagerOpen] = useState(false);

  // Main Panels State
  const [isCenterPanelOpen, setIsCenterPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(
    () => Number(localStorage.getItem("rightPanelWidth")) || 600,
  );

  // Panel Dropdown State
  const [centerPanelMenuOpen, setCenterPanelMenuOpen] = useState(false);
  const [rightPanelMenuOpen, setRightPanelMenuOpen] = useState(false);

  // Terminal State
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [selectedModel, setSelectedModel] = useState<Model>(
    AVAILABLE_MODELS[0],
  );
  const [modelMenuOpen, setModelMenuOpen] = useState(false);

  const [workingDirectory, setWorkingDirectory] = useState("/DefaultProject");
  const [code, setCode] = useState(
    '// Welcome to Fruitbox\n// Bioluminescent Code Editor\n\nfunction vibeCheck() {\n  console.log("Vibing with the codebase...");\n}\n',
  );

  const editorRef = useRef<CodeMirrorEditorRef>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [renderEngine, setRenderEngine] = useState("AWAITING_GPU");

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Persistence
  useEffect(() => {
    localStorage.setItem("rightPanelWidth", String(rightPanelWidth));
  }, [rightPanelWidth]);

  // Resizing Logic for Left Panels
  const isResizingFileTree = useRef(false);
  const isResizingConvManager = useRef(false);

  const startResizingFileTree = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingFileTree.current = true;
    document.addEventListener("mousemove", handleMouseMoveFileTree);
    document.addEventListener("mouseup", stopResizingLeftPanels);
  }, []);

  const startResizingConvManager = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingConvManager.current = true;
    document.addEventListener("mousemove", handleMouseMoveConvManager);
    document.addEventListener("mouseup", stopResizingLeftPanels);
  }, []);

  const stopResizingLeftPanels = useCallback(() => {
    isResizingFileTree.current = false;
    isResizingConvManager.current = false;
    document.removeEventListener("mousemove", handleMouseMoveFileTree);
    document.removeEventListener("mousemove", handleMouseMoveConvManager);
    document.removeEventListener("mouseup", stopResizingLeftPanels);
  }, []);

  const handleMouseMoveFileTree = useCallback(
    (e: MouseEvent) => {
      if (isResizingFileTree.current) {
        const newWidth = e.clientX;
        if (
          newWidth >= settings.layout.fileTreeMin &&
          newWidth <= settings.layout.fileTreeMax
        ) {
          updateLayout("fileTreeWidth", newWidth);
        }
      }
    },
    [settings.layout.fileTreeMin, settings.layout.fileTreeMax, updateLayout],
  );

  const handleMouseMoveConvManager = useCallback(
    (e: MouseEvent) => {
      if (isResizingConvManager.current) {
        // If File Tree is open, the Conv Manager starts after it.
        const offset = isFileTreeOpen ? settings.layout.fileTreeWidth : 0;
        const newWidth = e.clientX - offset;
        if (
          newWidth >= settings.layout.convManagerMin &&
          newWidth <= settings.layout.convManagerMax
        ) {
          updateLayout("convManagerWidth", newWidth);
        }
      }
    },
    [
      isFileTreeOpen,
      settings.layout.fileTreeWidth,
      settings.layout.convManagerMin,
      settings.layout.convManagerMax,
      updateLayout,
    ],
  );

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newUserMsg = {
      id: Date.now().toString(),
      role: "user" as const,
      content,
      time,
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");

    if (selectedModel.type === "webgpu") {
      try {
        setModelLoadingProgress("Initializing WebLLM worker engine...");
        window.dispatchEvent(
          new CustomEvent("terminal:write", {
            detail: `Initializing WebLLM worker engine for ${selectedModel.name}...`,
          }),
        );

        window.dispatchEvent(
          new CustomEvent("terminal:write", {
            detail: `[WebLLM UI] requested backend=indexeddb, mode=worker, model=${selectedModel.id}`,
          }),
        );

        await webLLM.init(
          (report) => {
            setModelLoadingProgress(report.text);
            window.dispatchEvent(
              new CustomEvent("terminal:write", { detail: report.text }),
            );
          },
          {
            modelId: selectedModel.id,
            useWorker: true,
          },
        );

        setModelLoadingProgress(null);
        setIsModelReady(true);
        window.dispatchEvent(
          new CustomEvent("terminal:write", {
            detail: `WebLLM worker engine ready for ${selectedModel.name}.`,
          }),
        );
        window.dispatchEvent(
          new CustomEvent("terminal:write", {
            detail: `[WebLLM UI] engine ready, indexedDB backend should now be active if supported by the runtime.`,
          }),
        );

        const assistantMsgId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: "assistant",
            content: "",
            model: selectedModel.name,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);

        await webLLM.generate(content, (text) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: text } : m,
            ),
          );
        });
      } catch (error) {
        console.error("WebLLM Error:", error);
        setModelLoadingProgress(null);
        window.dispatchEvent(
          new CustomEvent("terminal:write", {
            detail: `WebLLM init/generation failed: ${error instanceof Error ? error.message : String(error)}`,
          }),
        );
        window.dispatchEvent(
          new CustomEvent("terminal:write", {
            detail: `[WebLLM UI] diagnostics: model=${selectedModel.id}, backend=indexeddb, mode=worker, indexedDB=${typeof indexedDB !== "undefined" ? "available" : "missing"}`,
          }),
        );
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `WebGPU Error: ${error instanceof Error ? error.message : String(error)}`,
            model: "System Error",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    } else if (selectedModel.type === "local") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `*(${selectedModel.name} local model response simulated)*\n\nI have analyzed the request. The codebase structure looks solid.`,
            model: selectedModel.name,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }, 1000);
    } else {
      try {
        const response = await new GoogleGenAI({
          apiKey: secrets.getKey(secrets.activeProvider) || "",
        }).models.generateContent({
          model: selectedModel.id,
          contents: content,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response.text || "No response generated.",
            model: selectedModel.name,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } catch (error) {
        console.error(error);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Error connecting to Gemini API.",
            model: "System Error",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  // Resizing Logic
  const isResizingRightPanel = useRef(false);
  const isResizingTerminal = useRef(false);

  const startResizingRightPanel = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRightPanel.current = true;
    document.addEventListener("mousemove", handleMouseMoveRightPanel);
    document.addEventListener("mouseup", stopResizingRightPanel);
  }, []);

  const startResizingTerminal = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingTerminal.current = true;
    document.addEventListener("mousemove", handleMouseMoveTerminal);
    document.addEventListener("mouseup", stopResizingTerminal);
  }, []);

  const stopResizingRightPanel = useCallback(() => {
    isResizingRightPanel.current = false;
    document.removeEventListener("mousemove", handleMouseMoveRightPanel);
    document.removeEventListener("mouseup", stopResizingRightPanel);
  }, []);

  const stopResizingTerminal = useCallback(() => {
    isResizingTerminal.current = false;
    document.removeEventListener("mousemove", handleMouseMoveTerminal);
    document.removeEventListener("mouseup", stopResizingTerminal);
  }, []);

  const handleMouseMoveRightPanel = useCallback((e: MouseEvent) => {
    if (isResizingRightPanel.current) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < window.innerWidth - 300)
        setRightPanelWidth(newWidth);
    }
  }, []);

  const handleMouseMoveTerminal = useCallback(
    (e: MouseEvent) => {
      if (isResizingTerminal.current) {
        const newHeight = window.innerHeight - e.clientY;
        if (
          newHeight >= settings.layout.terminalMin &&
          newHeight <= settings.layout.terminalMax
        ) {
          updateLayout("terminalHeight", newHeight);
        }
      }
    },
    [settings.layout.terminalMin, settings.layout.terminalMax, updateLayout],
  );

  // Header Tool Handlers
  const handleFormat = () => {
    editorRef.current?.format();
    setCode((prev) => prev.trim() + "\n");
  };

  const handleFind = () => {
    editorRef.current?.openSearch();
  };

  const handleAIFix = async () => {
    const selection = editorRef.current?.getSelection();
    if (!selection) {
      alert("Please highlight some code first to use Highlight@AI.");
      return;
    }
    setHighlightedCode(selection);
    setIsHighlightModalOpen(true);
  };

  const handleHighlightSubmit = async (prompt: string) => {
    // setIsEditorOpen(false); // Optionally close editor to focus on chat
    await handleSendMessage(
      `Regarding the highlighted code:\n\`\`\`\n${highlightedCode}\n\`\`\`\n\n${prompt}`,
    );
  };

  return (
    <div className="app-root">
      <GlobalStyles theme={theme} />
      <BackgroundEffects theme={theme} />
      <div className="mist" />
      <ThreeWebGPUField
        primaryColor={theme.primary}
        onEngineInit={setRenderEngine}
      />

      {/* --- MODULAR SIDEBARS --- */}
      <div className="flex h-full z-30 relative pointer-events-none">
        {/* File Tree Panel (Always furthest left if open) */}
        <AnimatePresence>
          {isFileTreeOpen && (
            <motion.aside
              initial={{ x: -settings.layout.fileTreeWidth, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -settings.layout.fileTreeWidth, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="sidebar pointer-events-auto relative shrink-0"
              style={{
                width: settings.layout.fileTreeWidth,
                borderRight: "1px solid var(--glass-border)",
              }}
            >
              <div
                onMouseDown={startResizingFileTree}
                className="absolute top-0 right-0 w-[0.25rem] h-full cursor-col-resize hover:bg-brand-primary/30 transition-colors z-30"
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid var(--glass-border)",
                }}
              >
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "0.5rem",
                    background: "rgba(74, 222, 128, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 1rem var(--bio-glow)",
                  }}
                >
                  <Leaf size={16} className="text-primary" />
                </div>
                <div>
                  <h1
                    className="juicy-label text-primary font-black"
                    style={{ fontSize: "1rem", opacity: 1 }}
                  >
                    Arcturus_GUI
                  </h1>
                  <span className="juicy-label" style={{ fontSize: "0.5rem" }}>
                    v1.2 SOVEREIGN_IDE
                  </span>
                </div>
              </div>

              {/* Theme Toggle */}
              <div style={{ position: "relative", marginTop: "0.5rem" }}>
                <button
                  onClick={() => setShowPalette(!showPalette)}
                  className="canopy-panel panel-interactive"
                  style={{
                    padding: "0.5rem",
                    width: "100%",
                    borderRadius: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <Palette size={14} className="opacity-60" />
                    <span className="juicy-label opacity-100">
                      {theme.name}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "0.5rem",
                      height: "0.5rem",
                      borderRadius: "50%",
                      background: theme.primary,
                    }}
                  />
                </button>
                {showPalette && (
                  <div
                    className="canopy-panel"
                    style={{
                      position: "absolute",
                      top: "110%",
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      padding: "0.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    {Object.keys(THEMES).map((k) => (
                      <button
                        key={k}
                        onClick={() => {
                          setTheme(THEMES[k as keyof typeof THEMES]);
                          setShowPalette(false);
                        }}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.5rem",
                          background: "transparent",
                          border: "none",
                          color: "white",
                          cursor: "pointer",
                          borderRadius: "0.25rem",
                        }}
                      >
                        <span className="font-bold text-xs">
                          {THEMES[k as keyof typeof THEMES].name}
                        </span>
                        <div
                          style={{
                            width: "0.5rem",
                            height: "0.5rem",
                            borderRadius: "50%",
                            background:
                              THEMES[k as keyof typeof THEMES].primary,
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-hidden flex flex-col mt-2">
                <div
                  className="canopy-panel card-base custom-scrollbar"
                  style={{ flex: 1, padding: 0 }}
                >
                  <Sidebar
                    onOpenVisualizer={() => setIsVisualizerOpen(true)}
                    workingDirectory={workingDirectory}
                    onDirectoryChange={setWorkingDirectory}
                  />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Conversation Manager Panel */}
        <AnimatePresence>
          {isConvManagerOpen && (
            <motion.aside
              initial={{ x: -settings.layout.convManagerWidth, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -settings.layout.convManagerWidth, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="sidebar pointer-events-auto relative shrink-0"
              style={{
                width: settings.layout.convManagerWidth,
                borderRight: "1px solid var(--glass-border)",
              }}
            >
              <div
                onMouseDown={startResizingConvManager}
                className="absolute top-0 right-0 w-[0.25rem] h-full cursor-col-resize hover:bg-brand-secondary/30 transition-colors z-30"
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid var(--glass-border)",
                }}
              >
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "0.5rem",
                    background: "rgba(56, 189, 248, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 1rem var(--brand-secondary)",
                  }}
                >
                  <MessageSquare size={16} className="text-secondary" />
                </div>
                <div>
                  <h1
                    className="juicy-label text-secondary font-black"
                    style={{ fontSize: "1rem", opacity: 1 }}
                  >
                    Threads
                  </h1>
                  <span className="juicy-label" style={{ fontSize: "0.5rem" }}>
                    CONVERSATION_MANAGER
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col mt-2">
                <div
                  className="canopy-panel card-base custom-scrollbar"
                  style={{
                    flex: 1,
                    padding: 0,
                    display: "flex",
                    alignItems: "stretch",
                    justifyContent: "stretch",
                  }}
                >
                  <ConversationManager />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* --- MAIN DECK --- */}
      <main className="main-deck">
        {/* Header */}
        <header className="header-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div className="relative">
              <button
                onClick={() => setIsMainMenuOpen(!isMainMenuOpen)}
                onMouseEnter={() => setIsMainMenuOpen(true)}
                onMouseLeave={() => setIsMainMenuOpen(false)}
                className="circle-btn"
                title="Main Menu"
                style={{
                  background: isMainMenuOpen ? "var(--brand-primary)" : "",
                  color: isMainMenuOpen ? "black" : "",
                }}
              >
                <Menu size={16} />
              </button>
              <MainMenu
                isOpen={isMainMenuOpen}
                onClose={() => setIsMainMenuOpen(false)}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </div>
            <button
              onClick={() => setIsFileTreeOpen(!isFileTreeOpen)}
              className="circle-btn"
              title="Toggle File Explorer"
              style={{
                background: isFileTreeOpen ? "var(--brand-primary)" : "",
                color: isFileTreeOpen ? "black" : "",
              }}
            >
              <Folder size={16} />
            </button>
            <button
              onClick={() => setIsConvManagerOpen(!isConvManagerOpen)}
              className="circle-btn"
              title="Conversation Manager"
              style={{
                background: isConvManagerOpen ? "var(--brand-secondary)" : "",
                color: isConvManagerOpen ? "black" : "",
              }}
            >
              <MessageSquare size={16} />
            </button>

            {/* Center Panel Toggle & Dropdown */}
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setCenterPanelMenuOpen(true)}
              onMouseLeave={() => setCenterPanelMenuOpen(false)}
            >
              <button
                onClick={() => setIsCenterPanelOpen(!isCenterPanelOpen)}
                className="circle-btn"
                title="Toggle Center Panel"
                style={{
                  background: isCenterPanelOpen ? "var(--brand-primary)" : "",
                  color: isCenterPanelOpen ? "black" : "",
                }}
              >
                {settings.panels.center === "chat" ? (
                  <MessageSquare size={16} />
                ) : (
                  <Code2 size={16} />
                )}
              </button>
              <AnimatePresence>
                {centerPanelMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="dropdown-menu-styled"
                    style={{
                      left: 0,
                      top: "100%",
                      marginTop: "0.5rem",
                      zIndex: 100,
                    }}
                  >
                    <button
                      onClick={() => updatePanel("center", "chat")}
                      className="dropdown-item"
                    >
                      {settings.panels.center === "chat" && (
                        <Check size={10} className="text-primary" />
                      )}{" "}
                      Chat GUI
                    </button>
                    <button
                      onClick={() => updatePanel("center", "editor")}
                      className="dropdown-item"
                    >
                      {settings.panels.center === "editor" && (
                        <Check size={10} className="text-primary" />
                      )}{" "}
                      Code Editor
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Panel Toggle & Dropdown */}
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setRightPanelMenuOpen(true)}
              onMouseLeave={() => setRightPanelMenuOpen(false)}
            >
              <button
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className="circle-btn"
                title="Toggle Right Panel"
                style={{
                  background: isRightPanelOpen ? "var(--brand-primary)" : "",
                  color: isRightPanelOpen ? "black" : "",
                }}
              >
                {settings.panels.right === "chat" ? (
                  <MessageSquare size={16} />
                ) : (
                  <Code2 size={16} />
                )}
              </button>
              <AnimatePresence>
                {rightPanelMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="dropdown-menu-styled"
                    style={{
                      left: 0,
                      top: "100%",
                      marginTop: "0.5rem",
                      zIndex: 100,
                    }}
                  >
                    <button
                      onClick={() => updatePanel("right", "chat")}
                      className="dropdown-item"
                    >
                      {settings.panels.right === "chat" && (
                        <Check size={10} className="text-primary" />
                      )}{" "}
                      Chat GUI
                    </button>
                    <button
                      onClick={() => updatePanel("right", "editor")}
                      className="dropdown-item"
                    >
                      {settings.panels.right === "editor" && (
                        <Check size={10} className="text-primary" />
                      )}{" "}
                      Code Editor
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
              className="circle-btn"
              title="Toggle Terminal"
              style={{
                background: isTerminalOpen ? "var(--brand-primary)" : "",
                color: isTerminalOpen ? "black" : "",
              }}
            >
              <TerminalIcon size={16} />
            </button>
            <div className="flex items-center gap-2">
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setModelMenuOpen(!modelMenuOpen)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="juicy-label text-primary font-black"
                    style={{ fontSize: "0.8rem", opacity: 1 }}
                  >
                    {selectedModel.name}
                  </span>
                  <ChevronDown size={12} className="text-primary" />
                </button>
                {modelMenuOpen && (
                  <div className="dropdown-menu-styled" style={{ left: 0 }}>
                    {AVAILABLE_MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m);
                          setModelMenuOpen(false);
                          if (m.type !== "webgpu") setIsModelReady(false);
                        }}
                        className="dropdown-item"
                      >
                        {selectedModel.id === m.id && (
                          <Check size={10} className="text-primary" />
                        )}
                        {m.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Local Model Status Badge */}
              <AnimatePresence>
                {(modelLoadingProgress || isModelReady) && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${
                      modelLoadingProgress
                        ? "bg-[#ff7f7f] shadow-[0_0_15px_#ff7f7f]"
                        : "bg-[#00f0ff] shadow-[0_0_15px_#00f0ff]"
                    }`}
                  >
                    <motion.div
                      animate={
                        modelLoadingProgress ? { opacity: [0.4, 1, 0.4] } : {}
                      }
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Brain
                        size={18}
                        className={
                          modelLoadingProgress ? "text-white" : "text-black"
                        }
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {modelLoadingProgress && (
              <span
                className="font-mono text-primary animate-pulse"
                style={{ fontSize: "0.6rem", letterSpacing: "0.1em" }}
              >
                {modelLoadingProgress}
              </span>
            )}
            <button
              onClick={() => setIsDocViewerOpen(!isDocViewerOpen)}
              className="circle-btn"
              title="Documentation Engine"
              style={{
                background: isDocViewerOpen ? "var(--brand-primary)" : "",
                color: isDocViewerOpen ? "black" : "",
              }}
            >
              <Book size={16} />
            </button>
            <div
              className="canopy-panel"
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <div
                className="animate-pulse"
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--brand-primary)",
                }}
              />
              <span
                className="font-mono text-primary"
                style={{ fontSize: "0.6rem", letterSpacing: "0.1em" }}
              >
                UPLINK_STABLE
              </span>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {isDocViewerOpen && (
            <DocumentationViewer onClose={() => setIsDocViewerOpen(false)} />
          )}
        </AnimatePresence>

        <SettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        <div className="flex-1 flex overflow-hidden relative">
          {/* Main content area (Chat + Editor) */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 flex overflow-hidden relative">
              {/* Center Panel */}
              <AnimatePresence initial={false}>
                {isCenterPanelOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col overflow-hidden relative"
                  >
                    {settings.panels.center === "chat" ? (
                      <div className="chat-container">
                        <AgenticChat
                          messages={messages}
                          onMessageEdit={(id, newContent) => {
                            setMessages((prev) =>
                              prev.map((m) =>
                                m.id === id ? { ...m, content: newContent } : m,
                              ),
                            );
                          }}
                          onSend={handleSendMessage}
                          selectedModelName={selectedModel.name}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col h-full relative">
                        <div className="h-[3rem] border-b border-glass-border flex items-center justify-between px-[1rem] bg-black/20 shrink-0">
                          <div className="text-[0.7rem] font-mono text-primary opacity-80">
                            {workingDirectory}/src/main.tsx
                          </div>
                          <div className="flex items-center gap-[1rem]">
                            <button
                              onClick={handleFormat}
                              className="text-secondary hover:text-primary transition-colors flex items-center gap-[0.25rem] text-[0.75rem]"
                            >
                              <Code2 size="0.875rem" />
                              <span>Format</span>
                            </button>
                            <button
                              onClick={handleFind}
                              className="text-secondary hover:text-primary transition-colors flex items-center gap-[0.25rem] text-[0.75rem]"
                            >
                              <Search size="0.875rem" />
                              <span>Find</span>
                            </button>
                            <button
                              onClick={handleAIFix}
                              className="text-secondary hover:text-primary transition-colors flex items-center gap-[0.25rem] text-[0.75rem]"
                            >
                              <PaintRoller size="0.875rem" />
                              <span>Highlight@AI</span>
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 relative overflow-hidden bg-black/40">
                          <div className="absolute inset-0">
                            <CodeMirrorEditor
                              ref={editorRef}
                              value={code}
                              onChange={(val) => setCode(val)}
                              language="typescript"
                              aiKey={secrets.getKey(secrets.activeProvider)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right Panel */}
              <AnimatePresence initial={false}>
                {isRightPanelOpen && (
                  <motion.div
                    initial={{ x: rightPanelWidth, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: rightPanelWidth, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    style={{ width: rightPanelWidth }}
                    className="h-full canopy-panel border-l border-neon-teal/30 flex flex-col shrink-0 overflow-hidden z-20 relative shadow-2xl"
                  >
                    {/* Resize Handle */}
                    <div
                      onMouseDown={startResizingRightPanel}
                      className="absolute top-0 left-0 w-[0.25rem] h-full cursor-col-resize hover:bg-brand-primary/30 transition-colors z-30"
                    />

                    {settings.panels.right === "chat" ? (
                      <div className="chat-container">
                        <AgenticChat
                          messages={messages}
                          onMessageEdit={(id, newContent) => {
                            setMessages((prev) =>
                              prev.map((m) =>
                                m.id === id ? { ...m, content: newContent } : m,
                              ),
                            );
                          }}
                          onSend={handleSendMessage}
                          selectedModelName={selectedModel.name}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col h-full relative">
                        <div className="h-[3rem] border-b border-glass-border flex items-center justify-between px-[1rem] pl-[1.5rem] bg-black/20 shrink-0">
                          <div className="text-[0.7rem] font-mono text-primary opacity-80">
                            {workingDirectory}/src/main.tsx
                          </div>
                          <div className="flex items-center gap-[1rem]">
                            <button
                              onClick={handleFormat}
                              className="text-secondary hover:text-primary transition-colors flex items-center gap-[0.25rem] text-[0.75rem]"
                            >
                              <Code2 size="0.875rem" />
                              <span>Format</span>
                            </button>
                            <button
                              onClick={handleFind}
                              className="text-secondary hover:text-primary transition-colors flex items-center gap-[0.25rem] text-[0.75rem]"
                            >
                              <Search size="0.875rem" />
                              <span>Find</span>
                            </button>
                            <button
                              onClick={handleAIFix}
                              className="text-secondary hover:text-primary transition-colors flex items-center gap-[0.25rem] text-[0.75rem]"
                            >
                              <PaintRoller size="0.875rem" />
                              <span>Highlight@AI</span>
                            </button>
                            <button
                              onClick={() => setIsRightPanelOpen(false)}
                              className="text-secondary hover:text-primary ml-2"
                            >
                              <X size="1rem" />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 relative overflow-hidden bg-black/40">
                          <div className="absolute inset-0">
                            <CodeMirrorEditor
                              ref={editorRef}
                              value={code}
                              onChange={(val) => setCode(val)}
                              language="typescript"
                              aiKey={secrets.getKey(secrets.activeProvider)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Terminal Panel */}
          <AnimatePresence>
            {isTerminalOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: settings.layout.terminalHeight, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="absolute bottom-0 left-0 right-0 z-40 bg-black border-t border-glass-border shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                style={{ height: settings.layout.terminalHeight }}
              >
                {/* Resize Handle */}
                <div
                  onMouseDown={startResizingTerminal}
                  className="absolute top-0 left-0 w-full h-[0.25rem] cursor-row-resize hover:bg-brand-primary/30 transition-colors z-50"
                />
                <TerminalPanel height={settings.layout.terminalHeight} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <VectorVisualizerModal
        isOpen={isVisualizerOpen}
        onClose={() => setIsVisualizerOpen(false)}
      />

      <HighlightPromptModal
        isOpen={isHighlightModalOpen}
        onClose={() => setIsHighlightModalOpen(false)}
        onSubmit={handleHighlightSubmit}
        highlightedCode={highlightedCode}
      />
    </div>
  );
}
