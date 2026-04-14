import React, { useState, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  FolderTree,
  Settings,
  Database,
  Code2,
  FilePlus,
  FolderPlus,
  RefreshCw,
  FileCode2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { JuicyButton } from "../../shared/ui/JuicyButton";

interface SidebarProps {
  onOpenVisualizer: () => void;
  workingDirectory: string;
  onDirectoryChange: (dir: string) => void;
}

// Mock Data for File Tree
interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  isExpanded?: boolean;
}

const INITIAL_FILE_TREE: FileNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    isExpanded: true,
    children: [
      {
        id: "features",
        name: "features",
        type: "folder",
        isExpanded: false,
        children: [
          { id: "f1", name: "chat", type: "folder" },
          { id: "f2", name: "codemirror6", type: "folder" },
        ],
      },
      {
        id: "shared",
        name: "shared",
        type: "folder",
        isExpanded: false,
        children: [{ id: "s1", name: "ui", type: "folder" }],
      },
      { id: "main", name: "main.tsx", type: "file" },
      { id: "app", name: "App.tsx", type: "file" },
    ],
  },
  { id: "pkg", name: "package.json", type: "file" },
  { id: "vite", name: "vite.config.ts", type: "file" },
];

interface FlatFileNode {
  node: FileNode;
  depth: number;
}

export function Sidebar({
  onOpenVisualizer,
  workingDirectory,
  onDirectoryChange,
}: SidebarProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>(INITIAL_FILE_TREE);
  const parentRef = useRef<HTMLDivElement>(null);

  const handleNewFile = () => {
    alert(
      "New File functionality is mocked. In a real app, this would open a file creation dialog.",
    );
  };

  const handleNewFolder = () => {
    alert(
      "New Folder functionality is mocked. In a real app, this would create a new folder.",
    );
  };

  const handleRefresh = () => {
    alert("Refreshing directory structure...");
  };

  const handleSelectDirectory = () => {
    const newDir = prompt("Enter working directory path:", workingDirectory);
    if (newDir) onDirectoryChange(newDir);
  };

  // 1. Flatten Tree Algorithm
  const flatFiles = useMemo(() => {
    const flat: FlatFileNode[] = [];

    const flatten = (nodes: FileNode[], depth: number) => {
      nodes.forEach((node) => {
        flat.push({ node, depth });
        if (node.type === "folder" && node.isExpanded && node.children) {
          flatten(node.children, depth + 1);
        }
      });
    };

    flatten(fileTree, 0);
    return flat;
  }, [fileTree]);

  // 2. Virtualizer Setup
  const virtualizer = useVirtualizer({
    count: flatFiles.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28, // Estimated height of a file row
    overscan: 5,
  });

  // Toggle Folder State
  const toggleFolder = (id: string) => {
    const toggleNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === id && node.type === "folder") {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: toggleNode(node.children) };
        }
        return node;
      });
    };
    setFileTree((prev) => toggleNode(prev));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-[0.5rem] border-b border-neon-teal/30 flex items-center justify-center">
        <div className="flex items-center gap-[0.5rem] text-neon-green">
          <Code2 size="1.1rem" />
          <h1 className="text-[0.9rem] font-medium tracking-tight">Fruitbox</h1>
        </div>
      </div>

      <div className="flex items-center justify-between px-[0.5rem] py-2 border-b border-glass-border/30">
        <div className="flex items-center gap-[0.75rem]">
          <button
            onClick={handleSelectDirectory}
            title="Select Working Directory"
            className="text-text-muted hover:text-neon-teal transition-colors"
          >
            <Settings size="0.875rem" />
          </button>
          <div className="w-[1px] h-[1rem] bg-neon-teal/20 mx-[0.25rem]" />
          <button
            onClick={handleNewFile}
            title="New File"
            className="text-text-muted hover:text-neon-teal transition-colors"
          >
            <FilePlus size="0.875rem" />
          </button>
          <button
            onClick={handleNewFolder}
            title="New Folder"
            className="text-text-muted hover:text-neon-teal transition-colors"
          >
            <FolderPlus size="0.875rem" />
          </button>
          <button
            onClick={handleRefresh}
            title="Refresh"
            className="text-text-muted hover:text-neon-teal transition-colors"
          >
            <RefreshCw size="0.875rem" />
          </button>
        </div>
      </div>

      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-1"
        style={{ contain: "strict" }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const { node, depth } = flatFiles[virtualItem.index];

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                  paddingLeft: `${depth * 1}rem`,
                }}
                className="px-1"
              >
                <div
                  className="flex items-center gap-1.5 p-1 hover:bg-white/5 rounded cursor-pointer text-white/70 hover:text-white transition-colors"
                  onClick={() =>
                    node.type === "folder" ? toggleFolder(node.id) : null
                  }
                >
                  {node.type === "folder" ? (
                    <>
                      {node.isExpanded ? (
                        <ChevronDown size={14} className="opacity-50" />
                      ) : (
                        <ChevronRight size={14} className="opacity-50" />
                      )}
                      <FolderTree size={14} className="text-brand-primary" />
                    </>
                  ) : (
                    <>
                      <div className="w-[14px]" /> {/* Spacer for alignment */}
                      <FileCode2 size={14} className="text-brand-secondary" />
                    </>
                  )}
                  <span className="text-xs font-mono truncate">
                    {node.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-[0.75rem] border-t border-neon-teal/30 space-y-[0.5rem]">
        <JuicyButton
          variant="secondary"
          className="w-full justify-start py-[0.5rem] px-[0.5rem]"
          onClick={onOpenVisualizer}
        >
          <Database size="1rem" />
          <span className="text-[0.875rem]">Vector Visualizer</span>
        </JuicyButton>
        <JuicyButton
          variant="ghost"
          className="w-full justify-start py-[0.5rem] px-[0.5rem]"
        >
          <Settings size="1rem" />
          <span className="text-[0.875rem]">Settings</span>
        </JuicyButton>
      </div>
    </div>
  );
}
