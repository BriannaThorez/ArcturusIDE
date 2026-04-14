import React from "react";
import { motion, AnimatePresence } from "motion/react";

interface MenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  width?: string;
  itemClassName?: string;
}

export const MenuDropdown: React.FC<MenuDropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "w-64",
  width = "w-64",
  itemClassName = "text-base py-3",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={`absolute top-full left-0 pt-2 z-[9999] ${width}`}
        >
          <div
            className={`canopy-panel rounded-xl flex flex-col shadow-2xl border border-glass-border bg-[#0c0c0e] p-4 gap-2.5 ${className}`}
          >
            <div className={`flex flex-col gap-[0.5rem] ${itemClassName}`}>
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
