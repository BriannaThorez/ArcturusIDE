import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface JuicyButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export function JuicyButton({ children, onClick, variant = 'primary', className = '' }: JuicyButtonProps) {
  const baseStyles = "rounded-[0.75rem] font-medium flex items-center justify-center gap-[0.5rem] juicy-button outline-none focus:ring-[0.125rem] focus:ring-neon-teal neon-border";
  
  const variants = {
    primary: "bg-neon-teal/20 text-neon-teal hover:bg-neon-teal/40",
    secondary: "bg-neon-green/20 text-neon-green hover:bg-neon-green/40",
    ghost: "bg-transparent text-text-muted hover:bg-neon-teal/10 hover:text-neon-teal"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block w-full"
    >
      <button
        onClick={onClick}
        className={`${baseStyles} ${variants[variant]} ${className} w-full`}
      >
        {children}
      </button>
    </motion.div>
  );
}
