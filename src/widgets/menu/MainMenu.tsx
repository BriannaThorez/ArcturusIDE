import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings,
  User,
  Activity,
  Shield,
  LogOut,
  Info,
  HelpCircle,
} from "lucide-react";

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const menuItems = [
    { label: "Settings", icon: <Settings size={16} />, action: onOpenSettings },
    { label: "Performance", icon: <Activity size={16} /> },
    { label: "Security", icon: <Shield size={16} /> },
  ];

  const profileItems = [{ label: "Profile", icon: <User size={16} /> }];

  const bottomItems = [
    { label: "Help Center", icon: <HelpCircle size={16} /> },
    { label: "About", icon: <Info size={16} /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute top-full left-0 pt-2 w-64 z-[9999]"
        >
          <div className="canopy-panel rounded-xl flex flex-col shadow-2xl border border-glass-border bg-[#0c0c0e]">
            <div className="px-4 py-3 border-b border-glass-border/30">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary opacity-60">
                System Menu
              </span>
            </div>

            <div className="flex flex-col p-2 gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action?.();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-brand-primary hover:bg-white/10 hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-transparent hover:border-glass-border rounded-sm transition-all duration-200 ease-in-out text-left group active:scale-[0.98] active:shadow-inner"
                >
                  <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}

              <div className="h-px bg-glass-border/30 my-1" />

              {profileItems.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-brand-primary hover:bg-white/10 hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-transparent hover:border-glass-border rounded-sm transition-all duration-200 ease-in-out text-left group active:scale-[0.98] active:shadow-inner"
                >
                  <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}

              <div className="h-px bg-glass-border/30 my-1" />

              {bottomItems.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-brand-primary hover:bg-white/10 hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-transparent hover:border-glass-border rounded-sm transition-all duration-200 ease-in-out text-left group active:scale-[0.98] active:shadow-inner"
                >
                  <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="p-2 border-t border-glass-border/30">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:shadow-[0_4px_12px_rgba(239,68,68,0.2)] border border-transparent hover:border-red-900/50 transition-all duration-200 text-left group active:scale-[0.98] active:shadow-inner">
                <LogOut size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
