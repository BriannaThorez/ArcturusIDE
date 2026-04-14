import React, { useState, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $getRoot, $getSelection, EditorState } from 'lexical';
import { Send, Paperclip, Mic } from 'lucide-react';

interface LexicalChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function LexicalChatInput({ onSend, disabled }: LexicalChatInputProps) {
  const [editorState, setEditorState] = useState<EditorState>();
  const [textContent, setTextContent] = useState('');

  const onChange = useCallback((state: EditorState) => {
    setEditorState(state);
    state.read(() => {
      const root = $getRoot();
      setTextContent(root.getTextContent());
    });
  }, []);

  const handleSend = () => {
    if (textContent.trim() && !disabled) {
      onSend(textContent);
      // Reset editor state would go here, typically via a command or ref
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const initialConfig = {
    namespace: 'AgenticChatInput',
    theme: {
      paragraph: 'm-0',
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
      },
    },
    onError: (error: Error) => {
      console.error('Lexical Input Error:', error);
    },
  };

  return (
    <div className="canopy-panel w-full rounded-[1.5rem] shadow-[0_2rem_4rem_-1rem_rgba(0,0,0,0.7),0_0_2rem_rgba(0,255,136,0.05)] focus-within:border-[var(--brand-primary)] focus-within:shadow-[0_0_2.5rem_var(--bio-glow)] transition-all">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative flex-1 min-h-[48px] max-h-[200px] overflow-y-auto custom-scrollbar px-2 pt-2">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="outline-none min-h-[24px] text-sm text-brand-accent font-mono" 
                onKeyDown={handleKeyDown}
              />
            }
            placeholder={
              <div className="absolute top-3 left-4 opacity-40 pointer-events-none text-sm font-mono">
                Enter command...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <OnChangePlugin onChange={onChange} />
        </div>
      </LexicalComposer>
      
      <div className="flex items-center justify-between px-4 py-2 mt-1">
        <div className="flex items-center gap-2">
          <button className="text-secondary hover:text-primary transition-colors p-2 rounded-md hover:bg-white/5">
            <Paperclip size={18} />
          </button>
          <button className="text-secondary hover:text-primary transition-colors p-2 rounded-md hover:bg-white/5">
            <Mic size={18} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] opacity-40 tracking-tight">
            {textContent.length} CHARS
          </span>
          <button 
            onClick={handleSend}
            disabled={!textContent.trim() || disabled}
            className={`w-9 h-9 rounded-full transition-all flex items-center justify-center shrink-0 ${
              textContent.trim() && !disabled 
                ? 'bg-brand-primary text-black shadow-[0_0_1.5rem_var(--bio-glow)] hover:scale-105 active:scale-95' 
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
