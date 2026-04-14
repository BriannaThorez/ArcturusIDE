import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, User, Activity, Shield, LogOut, X, Info, HelpCircle } from 'lucide-react';

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ isOpen, onClose, onOpenSettings }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          className="absolute top-full left-0 mt-[var(--space-xs)] w-[16rem] canopy-panel rounded-[var(--radius-md)] z-[9999] flex flex-col"
          style={{ padding: 'var(--space-sm)' }}
          onMouseEnter={() => {}} // Keep open
          onMouseLeave={onClose}
        >
          <div className="pb-[var(--space-xs)] border-b border-[var(--glass-border)]">
            <span className="text-[var(--text-xs)] font-bold uppercase tracking-widest text-[var(--brand-primary)] opacity-60">Menu</span>
          </div>

          <div className="py-[var(--space-xs)] flex flex-col gap-[var(--space-2xs)]">
            <button 
              onClick={() => { onOpenSettings(); onClose(); }}
              className="w-full flex items-center gap-[var(--space-sm)] px-[var(--space-sm)] py-[var(--space-xs)] text-[var(--text-sm)] text-white/80 hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] rounded-[var(--radius-sm)] transition-colors text-left"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center gap-[var(--space-sm)] px-[var(--space-sm)] py-[var(--space-xs)] text-[var(--text-sm)] text-white/80 hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] rounded-[var(--radius-sm)] transition-colors text-left">
              <Activity size={16} />
              <span>Performance</span>
            </button>
            <button className="w-full flex items-center gap-[var(--space-sm)] px-[var(--space-sm)] py-[var(--space-xs)] text-[var(--text-sm)] text-white/80 hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] rounded-[var(--radius-sm)] transition-colors text-left">
              <Shield size={16} />
              <span>Security</span>
            </button>
            
            <div className="h-px bg-[var(--glass-border)] my-[var(--space-2xs)]" />
            
            <button className="w-full flex items-center gap-[var(--space-sm)] px-[var(--space-sm)] py-[var(--space-xs)] text-[var(--text-sm)] text-white/80 hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] rounded-[var(--radius-sm)] transition-colors text-left">
              <User size={16} />
              <span>Profile</span>
            </button>
            
            <div className="h-px bg-[var(--glass-border)] my-[var(--space-2xs)]" />
 
            <button className="w-full flex items-center gap-[var(--space-sm)] px-[var(--space-sm)] py-[var(--space-xs)] text-[var(--text-sm)] text-white/80 hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] rounded-[var(--radius-sm)] transition-colors text-left">
              <HelpCircle size={16} />
              <span>Help Center</span>
            </button>
            <button className="w-full flex items-center gap-[var(--space-sm)] px-[var(--space-sm)] py-[var(--space-xs)] text-[var(--text-sm)] text-white/80 hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] rounded-[var(--radius-sm)] transition-colors text-left">
              <Info size={16} />
              <span>About</span>
            </button>
          </div>
 
          <div className="pt-[var(--space-xs)] border-t border-[var(--glass-border)]">
            <button className="w-full flex items-center gap-[var(--space-sm)] px-[var(--space-sm)] py-[var(--space-xs)] rounded-[var(--radius-sm)] text-red-400 hover:bg-red-500/10 transition-colors text-left">
              <LogOut size={16} />
              <span className="text-[var(--text-xs)] font-bold uppercase tracking-wider">Logout</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
