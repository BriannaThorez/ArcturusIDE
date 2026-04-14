import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, PaintRoller } from 'lucide-react';
import { JuicyButton } from '../../shared/ui/JuicyButton';

interface HighlightPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  highlightedCode: string;
}

export function HighlightPromptModal({ isOpen, onClose, onSubmit, highlightedCode }: HighlightPromptModalProps) {
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPrompt('Please review and fix any obvious errors in this highlighted code.');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmit(`${prompt}\n\n\`\`\`typescript\n${highlightedCode}\n\`\`\``);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-[1rem]">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-rainforest-900/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-[32rem] glass-panel neon-border rounded-[1rem] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-[1rem] border-b border-neon-teal/30 flex items-center justify-between bg-rainforest-800/50">
              <div className="flex items-center gap-[0.75rem] text-neon-teal">
                <div className="flex">
                  <PaintRoller size="1.25rem" />
                  <Sparkles size="1rem" className="-ml-2 -mt-2 text-neon-green" />
                </div>
                <h2 className="text-[1.125rem] font-medium tracking-tight">Highlight@AI</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-text-muted hover:text-neon-teal transition-colors"
              >
                <X size="1.25rem" />
              </button>
            </div>

            {/* Content */}
            <div className="p-[1.5rem] space-y-[1.5rem]">
              <div>
                <label className="block text-[0.875rem] text-text-muted mb-[0.5rem] font-mono">
                  Your Prompt
                </label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-[6rem] bg-rainforest-900/50 text-text-main p-[0.75rem] rounded-[0.5rem] outline-none focus:ring-[0.125rem] focus:ring-neon-teal font-sans neon-border text-[0.875rem] resize-none"
                  placeholder="What should the AI do with this code?"
                />
              </div>

              <div>
                <label className="block text-[0.875rem] text-text-muted mb-[0.5rem] font-mono">
                  Highlighted Context
                </label>
                <div className="max-h-[10rem] overflow-y-auto bg-rainforest-900/80 p-[0.75rem] rounded-[0.5rem] border border-neon-teal/20">
                  <pre className="text-[0.75rem] font-mono text-text-muted whitespace-pre-wrap break-all">
                    {highlightedCode}
                  </pre>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-[1rem] border-t border-neon-teal/30 flex justify-end gap-[0.75rem] bg-rainforest-800/30">
              <JuicyButton variant="ghost" onClick={onClose}>
                Cancel
              </JuicyButton>
              <JuicyButton variant="primary" onClick={handleSubmit}>
                <Sparkles size="1rem" className="mr-[0.5rem]" />
                Submit to Agent
              </JuicyButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
