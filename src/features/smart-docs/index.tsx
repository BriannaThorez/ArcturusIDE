import React from 'react';

export interface DocMetadata {
  id: string;
  path: string;
  title: string;
}

export const SmartMarkdown: React.FC<{ children: string }> = ({ children }) => {
  return <div className="markdown-body">{children}</div>;
};

export const AxiologicalBreadcrumbs: React.FC<{ history: DocMetadata[]; onNavigate: (meta: DocMetadata) => void }> = () => {
  return <div className="flex gap-2 text-[10px] font-mono opacity-50 px-4 py-1 border-b border-glass-border">ROOT / DOCS</div>;
};

export class RegistryStore {
  private static instance: RegistryStore;
  static getInstance() {
    if (!this.instance) this.instance = new RegistryStore();
    return this.instance;
  }
  resolve(id: string): DocMetadata | null {
    return null;
  }
}
