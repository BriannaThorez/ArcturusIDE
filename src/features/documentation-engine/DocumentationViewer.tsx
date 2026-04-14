import React, { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  ChevronRight,
  X,
  Brain,
  Code,
  PanelLeft,
} from "lucide-react";
import {
  SmartMarkdown,
  AxiologicalBreadcrumbs,
  RegistryStore,
  DocMetadata,
} from "../smart-docs";

interface DocumentationViewerProps {
  onClose: () => void;
}

interface DocFile {
  path: string;
  folder: string;
  name: string;
  content: string | null; // Content is null until loaded
  loader: () => Promise<string>; // Function to load content
}

const FOLDER_CONFIG: Record<string, { label: string; icon: React.ReactNode }> =
  {
    Cognitive: { label: "Cognitive", icon: <Brain size={14} /> },
    Tasks: { label: "Tasks", icon: <Code size={14} /> },
    Main: { label: "Main", icon: <BookOpen size={14} /> },
  };

export const DocumentationViewer: React.FC<DocumentationViewerProps> = ({
  onClose,
}) => {
  const [docs, setDocs] = useState<Record<string, DocFile[]>>({});
  const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>("Cognitive");
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [history, setHistory] = useState<DocMetadata[]>([]);

  // Initial Indexing (Fast)
  useEffect(() => {
    const indexDocs = () => {
      // Use **/*.md to catch files in subdirectories as well
      const modules = import.meta.glob("/src/documentation/**/*.md", {
        query: "?raw",
        import: "default",
      });
      const indexedDocs: Record<string, DocFile[]> = {};

      for (const path in modules) {
        // Extract folder and filename
        const pathParts = path.replace("/src/documentation/", "").split("/");
        let folder = "Main";
        let fileName = "";

        if (pathParts.length > 1) {
          folder = pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1);
          fileName = pathParts[pathParts.length - 1].replace(".md", "");
        } else {
          fileName = pathParts[0].replace(".md", "");
        }

        if (!indexedDocs[folder]) {
          indexedDocs[folder] = [];
        }

        indexedDocs[folder].push({
          path,
          folder,
          name: fileName,
          content: null, // Start with null content
          loader: modules[path] as () => Promise<string>,
        });
      }

      // Sort files within folders
      for (const folder in indexedDocs) {
        indexedDocs[folder].sort((a, b) => a.name.localeCompare(b.name));
      }

      setDocs(indexedDocs);

      // Select first doc in Cognitive by default if available, else fallback
      if (indexedDocs["Cognitive"] && indexedDocs["Cognitive"].length > 0) {
        const firstDoc = indexedDocs["Cognitive"][0];
        setSelectedDoc(firstDoc);
        setActiveFolder("Cognitive");
      } else if (indexedDocs["Main"] && indexedDocs["Main"].length > 0) {
        const firstDoc = indexedDocs["Main"][0];
        setSelectedDoc(firstDoc);
        setActiveFolder("Main");
      } else {
        const firstFolder = Object.keys(indexedDocs).sort()[0];
        if (firstFolder && indexedDocs[firstFolder].length > 0) {
          const firstDoc = indexedDocs[firstFolder][0];
          setSelectedDoc(firstDoc);
          setActiveFolder(firstFolder);
        }
      }
    };
    indexDocs();
  }, []);

  // Listen for DOC_NAVIGATE events
  useEffect(() => {
    const handleNavigate = (e: any) => {
      const { id, path } = e.detail;

      // Find the document in our indexed docs
      // We try to match by absolute path, relative path (filename), or ID
      for (const folder in docs) {
        const found = docs[folder].find((d) => {
          // Absolute path match
          if (d.path === path) return true;

          // Filename match (for relative links like ./04_Axiological_Dynamics.md)
          const filename = path?.split("/").pop();
          if (filename && d.path.endsWith(filename)) return true;

          // ID match
          if (d.name === id) return true;

          return false;
        });

        if (found) {
          setActiveFolder(folder);
          handleDocSelect(found);
          return; // Stop searching once found
        }
      }

      // Navigation target not found in the current document index.
    };

    window.addEventListener("DOC_NAVIGATE", handleNavigate);
    return () => window.removeEventListener("DOC_NAVIGATE", handleNavigate);
  }, [docs]);

  // Lazy Load Content when Selected
  useEffect(() => {
    const loadContent = async () => {
      if (selectedDoc && selectedDoc.content === null) {
        setLoadingContent(true);
        try {
          const content = await selectedDoc.loader();

          // Update the specific doc in state with loaded content
          setDocs((prevDocs) => {
            const newDocs = { ...prevDocs };
            const folderDocs = newDocs[selectedDoc.folder];
            const docIndex = folderDocs.findIndex(
              (d) => d.path === selectedDoc.path,
            );

            if (docIndex !== -1) {
              folderDocs[docIndex] = { ...folderDocs[docIndex], content };
            }
            return newDocs;
          });

          // Update selected doc ref
          setSelectedDoc((prev) => (prev ? { ...prev, content } : null));
        } catch (error) {
          // Failed to load document content; keep the viewer responsive.
        } finally {
          setLoadingContent(false);
        }
      }
    };

    loadContent();
  }, [selectedDoc?.path]); // Only reload if path changes

  // Background Sequential Loading (Optional/Enhancement)
  // This effect runs after initial render to slowly populate cache
  useEffect(() => {
    const backgroundLoader = async () => {
      // Wait a bit for initial render
      await new Promise((resolve) => setTimeout(resolve, 2000));

      for (const folder of Object.keys(docs)) {
        for (const doc of docs[folder]) {
          if (doc.content === null) {
            // Load one by one with a small delay to yield to main thread
            try {
              const content = await doc.loader();
              setDocs((prevDocs) => {
                // Check if already loaded by user interaction
                const currentDoc = prevDocs[folder]?.find(
                  (d) => d.path === doc.path,
                );
                if (currentDoc && currentDoc.content !== null) return prevDocs;

                const newDocs = { ...prevDocs };
                const folderDocs = newDocs[folder];
                const docIndex = folderDocs.findIndex(
                  (d) => d.path === doc.path,
                );
                if (docIndex !== -1) {
                  folderDocs[docIndex] = { ...folderDocs[docIndex], content };
                }
                return newDocs;
              });
              // Small delay to not block UI
              await new Promise((resolve) => setTimeout(resolve, 50));
            } catch (e) {
              // Background loading is best-effort only.
            }
          }
        }
      }
    };

    // Only start background loader if we have docs
    if (Object.keys(docs).length > 0) {
      backgroundLoader();
    }
  }, [Object.keys(docs).length]); // Run once when docs structure is built

  const handleDocSelect = (doc: DocFile) => {
    // If content is already loaded in state, use it immediately
    const stateDoc = docs[doc.folder].find((d) => d.path === doc.path);
    const targetDoc = stateDoc || doc;
    setSelectedDoc(targetDoc);

    // Update history
    const meta =
      RegistryStore.getInstance().resolve(targetDoc.name) ||
      RegistryStore.getInstance().resolve(targetDoc.path);
    if (meta) {
      setHistory((prev) => {
        // Don't add if it's already the last one
        if (prev.length > 0 && prev[prev.length - 1].id === meta.id)
          return prev;
        // Keep last 10
        const next = [...prev, meta];
        return next.slice(-10);
      });
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black flex items-center justify-center font-sans">
      <div className="bg-[#08080a] w-full h-full flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center px-3 py-2 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-1.5 rounded-md transition-colors ${isSidebarOpen ? "text-cyan-400 bg-cyan-500/10" : "text-slate-500 hover:text-slate-300"}`}
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <PanelLeft size={18} />
            </button>

            <div className="flex items-center gap-3 text-cyan-400">
              <BookOpen size={20} />
              <h2 className="font-bold tracking-widest text-sm uppercase">
                Documentation Engine
              </h2>
            </div>

            {/* FOLDER TABS */}
            <div className="flex bg-slate-950/50 rounded-lg p-0.5 border border-slate-800/50">
              {Object.keys(docs)
                .sort()
                .map((folder) => {
                  const config = FOLDER_CONFIG[folder] || {
                    label: folder,
                    icon: <BookOpen size={14} />,
                  };
                  return (
                    <button
                      key={folder}
                      onClick={() => {
                        setActiveFolder(folder);
                        if (docs[folder].length > 0) {
                          handleDocSelect(docs[folder][0]);
                        }
                        if (!isSidebarOpen) setIsSidebarOpen(true);
                      }}
                      className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                        activeFolder === folder
                          ? "bg-cyan-500/10 text-cyan-400 shadow-sm border border-cyan-500/20"
                          : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                      }`}
                    >
                      {config.icon}
                      {config.label.toUpperCase()}
                    </button>
                  );
                })}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <AxiologicalBreadcrumbs
            history={history}
            onNavigate={(meta) => {
              window.dispatchEvent(
                new CustomEvent("DOC_NAVIGATE", {
                  detail: { id: meta.id, path: meta.path },
                }),
              );
            }}
          />

          <div className="flex-1 flex overflow-hidden">
            {/*
              [AXIOMATIC INTENT]: The navigational index (I_nav) mapping user selection (S) to content (C).
            Function: f(S) -> C, ensuring O(1) access to domain nodes.

            [AXIOLOGICAL INTENT]: A persistent cognitive map providing structural grounding, allowing
            traversal of complex intellectual terrain without spatial disorientation.
          */}
            <div
              className={`border-r border-slate-800 bg-slate-950/30 flex flex-col transition-all duration-300 ease-in-out ${
                isSidebarOpen
                  ? "w-64 opacity-100"
                  : "w-0 opacity-0 overflow-hidden border-r-0"
              }`}
            >
              <div className="p-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between items-center border-b border-slate-800/50">
                <span>{activeFolder} Index</span>
                <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[9px]">
                  {docs[activeFolder]?.length || 0}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar px-1 py-1 space-y-0.5">
                {docs[activeFolder]?.map((doc) => (
                  <button
                    key={doc.path}
                    onClick={() => handleDocSelect(doc)}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-all flex items-center justify-between group ${
                      selectedDoc?.path === doc.path
                        ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-sm"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText
                        size={12}
                        className={
                          selectedDoc?.path === doc.path
                            ? "text-cyan-400 shrink-0"
                            : "text-slate-600 group-hover:text-slate-400 shrink-0"
                        }
                      />
                      <span className="truncate font-medium">
                        {doc.name.replace(/^\d+_/, "").replace(/_/g, " ")}
                      </span>
                    </div>
                    {selectedDoc?.path === doc.path && (
                      <ChevronRight
                        size={12}
                        className="text-cyan-500 shrink-0"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN DOCUMENT CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#08080a]">
              <div className="max-w-none mx-auto py-10 px-12">
                {selectedDoc ? (
                  <article
                    className="prose prose-invert prose-slate max-w-none
                  prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-100
                  prose-h1:text-3xl prose-h1:mb-3 prose-h1:pb-2 prose-h1:border-b prose-h1:border-slate-800 prose-h1:mt-0
                  prose-h2:text-xl prose-h2:mt-4 prose-h2:mb-2 prose-h2:text-cyan-400
                  prose-h3:text-lg prose-h3:mt-3 prose-h3:mb-1
                  prose-p:text-slate-300 prose-p:leading-relaxed prose-p:my-2
                  prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-li:text-slate-300
                  prose-strong:text-cyan-300 prose-strong:font-semibold
                  prose-code:text-orange-300 prose-code:bg-orange-500/10 prose-code:px-1 prose-code:rounded prose-code:font-mono prose-code:text-sm
                  prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:my-3 prose-pre:p-3 [&_pre]:custom-scrollbar
                "
                  >
                    {selectedDoc.content ? (
                      <SmartMarkdown>{selectedDoc.content}</SmartMarkdown>
                    ) : (
                      <div className="flex items-center justify-center h-40 text-cyan-500/50 animate-pulse">
                        Loading content...
                      </div>
                    )}
                  </article>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <BookOpen size={48} className="mb-4 opacity-20" />
                    <p>Select a document to view</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
