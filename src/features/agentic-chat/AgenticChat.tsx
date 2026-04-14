import React, { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { LexicalMessageBubble } from './LexicalMessageBubble';
import { LexicalChatInput } from './LexicalChatInput';
import { Cpu, Globe, FileText, Shield, Radio } from 'lucide-react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  time?: string;
}

interface AgenticChatProps {
  messages: Message[];
  onMessageEdit?: (id: string, newContent: string) => void;
  onSend: (content: string) => void;
  disabled?: boolean;
  selectedModelName?: string;
}

export function AgenticChat({ messages, onMessageEdit, onSend, disabled, selectedModelName }: AgenticChatProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated height of a chat bubble
    overscan: 5,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
    }
  }, [messages.length, virtualizer]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div 
        ref={parentRef} 
        className="flex-1 w-full overflow-y-auto custom-scrollbar"
        style={{ contain: 'strict' }}
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-0.8 h-full p-8">
            <div className="canopy-panel" style={{ width: '5rem', height: '5rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Cpu size={32} className="text-primary animate-pulse" />
            </div>
            <h1 className="font-black text-2xl text-primary synaptic-glow mb-2">{selectedModelName || 'AI'} ONLINE</h1>
            <p className="font-mono opacity-40 text-xs mb-8 text-center">Local WebLLM engine established. Ready for tactical input.</p>
            
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {[
                { icon: Globe, label: "Global Intel", sub: "Scan regional data" },
                { icon: FileText, label: "Mission Report", sub: "Draft operational logs" },
                { icon: Shield, label: "Security Audit", sub: "Check vulnerabilities" },
                { icon: Radio, label: "Decrypt Signal", sub: "Translate comms" },
              ].map((card, i) => (
                <button 
                  key={i} 
                  onClick={() => onSend(card.label)} 
                  className="canopy-panel panel-interactive p-3 rounded-xl flex flex-col items-center !justify-center gap-0 text-center aspect-[3/2] overflow-hidden group"
                >
                  <div className="text-primary group-hover:scale-110 transition-transform">
                    <card.icon size={18} />
                  </div>
                  <div className="min-w-0 mt-0.5">
                    <div className="font-bold text-[11px] text-primary leading-none mb-0.5">{card.label}</div>
                    <div className="font-mono opacity-40 text-[8px] leading-tight">{card.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const msg = messages[virtualItem.index];
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
                    padding: '0.5rem 1rem', // Spacing between bubbles
                    display: 'flex',
                    justifyContent: 'center', // Center the bubble container
                  }}
                >
                  <div className="w-full max-w-3xl flex" style={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div className={`canopy-panel message-bubble ${msg.role === 'user' ? 'user-bubble' : 'bot-bubble'}`} style={{ maxWidth: '85%', minWidth: '200px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', opacity: 0.6 }}>
                        <span className="font-mono text-xs uppercase">{msg.role === 'user' ? 'OPERATOR' : 'ARCTURUS_AI'}</span>
                        <span className="font-mono text-xs">{msg.time}</span>
                      </div>
                      <LexicalMessageBubble 
                        initialContent={msg.content} 
                        role={msg.role} 
                        onContentChange={(newContent) => onMessageEdit?.(msg.id, newContent)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="p-4 flex justify-center w-full shrink-0">
        <div className="w-full max-w-3xl">
          <LexicalChatInput onSend={onSend} disabled={disabled} />
        </div>
      </div>
    </div>
  );
}
