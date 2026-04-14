import React, { useState, useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MessageSquare, Pin, Folder, Trash2, Edit2, Check, X, Plus, ChevronRight, ChevronDown } from 'lucide-react';

export interface Thread {
  id: string;
  title: string;
  pinned: boolean;
  folderId: string | null;
  timestamp: number;
}

export interface FolderData {
  id: string;
  title: string;
  isExpanded: boolean;
}

interface ConversationManagerProps {
  onSelectThread?: (id: string) => void;
}

// Mock Data for demonstration
const INITIAL_FOLDERS: FolderData[] = [
  { id: 'f1', title: 'Project Alpha', isExpanded: true },
  { id: 'f2', title: 'Archived', isExpanded: false },
];

const INITIAL_THREADS: Thread[] = [
  { id: 't1', title: 'Initial Setup & Architecture', pinned: true, folderId: null, timestamp: Date.now() - 100000 },
  { id: 't2', title: 'Database Schema Design', pinned: false, folderId: 'f1', timestamp: Date.now() - 50000 },
  { id: 't3', title: 'API Endpoint Planning', pinned: false, folderId: 'f1', timestamp: Date.now() - 20000 },
  { id: 't4', title: 'Old Bug Fixes', pinned: false, folderId: 'f2', timestamp: Date.now() - 800000 },
  { id: 't5', title: 'General Chat', pinned: false, folderId: null, timestamp: Date.now() },
];

type FlatItem = 
  | { type: 'folder'; data: FolderData }
  | { type: 'thread'; data: Thread; depth: number };

export function ConversationManager({ onSelectThread }: ConversationManagerProps) {
  const [folders, setFolders] = useState<FolderData[]>(INITIAL_FOLDERS);
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const parentRef = useRef<HTMLDivElement>(null);

  // 1. Flatten and Sort Data
  const flatItems = useMemo(() => {
    const items: FlatItem[] = [];
    
    // Pinned Threads (Always at top, not in folders)
    const pinnedThreads = threads.filter(t => t.pinned).sort((a, b) => b.timestamp - a.timestamp);
    pinnedThreads.forEach(t => items.push({ type: 'thread', data: t, depth: 0 }));

    // Folders and their contents
    folders.forEach(folder => {
      items.push({ type: 'folder', data: folder });
      if (folder.isExpanded) {
        const folderThreads = threads
          .filter(t => t.folderId === folder.id && !t.pinned)
          .sort((a, b) => b.timestamp - a.timestamp);
        folderThreads.forEach(t => items.push({ type: 'thread', data: t, depth: 1 }));
      }
    });

    // Unpinned, Unfoldered Threads
    const rootThreads = threads
      .filter(t => !t.pinned && !t.folderId)
      .sort((a, b) => b.timestamp - a.timestamp);
    rootThreads.forEach(t => items.push({ type: 'thread', data: t, depth: 0 }));

    return items;
  }, [threads, folders]);

  // 2. Virtualizer Setup
  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Estimated height of a row
    overscan: 5,
  });

  // Actions
  const toggleFolder = (id: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, isExpanded: !f.isExpanded } : f));
  };

  const togglePin = (id: string) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t));
  };

  const deleteThread = (id: string) => {
    setThreads(prev => prev.filter(t => t.id !== id));
  };

  const startEdit = (thread: Thread) => {
    setEditingId(thread.id);
    setEditTitle(thread.title);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      setThreads(prev => prev.map(t => t.id === editingId ? { ...t, title: editTitle.trim() } : t));
    }
    setEditingId(null);
  };

  const createNewThread = () => {
    const newThread: Thread = {
      id: `t${Date.now()}`,
      title: 'New Conversation',
      pinned: false,
      folderId: null,
      timestamp: Date.now()
    };
    setThreads(prev => [newThread, ...prev]);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between p-2 border-b border-glass-border/50">
        <span className="text-xs font-bold text-secondary">THREADS</span>
        <button 
          onClick={createNewThread}
          className="p-1 hover:bg-brand-secondary/20 text-secondary rounded transition-colors"
          title="New Thread"
        >
          <Plus size={14} />
        </button>
      </div>

      <div 
        ref={parentRef} 
        className="flex-1 overflow-y-auto custom-scrollbar"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = flatItems[virtualItem.index];
            
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="px-2 py-1"
              >
                {item.type === 'folder' ? (
                  // FOLDER ROW
                  <div 
                    className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded cursor-pointer text-white/70 hover:text-white transition-colors"
                    onClick={() => toggleFolder(item.data.id)}
                  >
                    {item.data.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <Folder size={14} className="text-brand-secondary" />
                    <span className="text-xs font-bold truncate">{item.data.title}</span>
                  </div>
                ) : (
                  // THREAD ROW
                  <div 
                    className={`group flex items-center justify-between p-1.5 hover:bg-white/5 rounded cursor-pointer transition-colors ${item.depth > 0 ? 'ml-4' : ''}`}
                    onClick={() => onSelectThread?.(item.data.id)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      <MessageSquare size={14} className={item.data.pinned ? 'text-brand-primary' : 'text-white/40'} />
                      
                      {editingId === item.data.id ? (
                        <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                          <input 
                            autoFocus
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveEdit()}
                            className="bg-black/50 border border-brand-secondary/50 rounded px-1 text-xs text-white w-full outline-none"
                          />
                          <button onClick={saveEdit} className="text-green-400 hover:text-green-300"><Check size={12} /></button>
                          <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300"><X size={12} /></button>
                        </div>
                      ) : (
                        <span className="text-xs truncate text-white/80 group-hover:text-white">{item.data.title}</span>
                      )}
                    </div>

                    {/* Actions (Visible on Hover) */}
                    {!editingId && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button onClick={() => togglePin(item.data.id)} className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-brand-primary">
                          <Pin size={12} />
                        </button>
                        <button onClick={() => startEdit(item.data)} className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => deleteThread(item.data.id)} className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-red-400">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
