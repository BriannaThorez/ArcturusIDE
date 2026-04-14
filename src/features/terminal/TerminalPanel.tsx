import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import 'xterm/css/xterm.css';

interface TerminalPanelProps {
  height: number;
}

export function TerminalPanel({ height }: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#000000',
        foreground: '#ffffff',
        cursor: '#4ade80',
        selectionBackground: 'rgba(74, 222, 128, 0.3)',
      },
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 14,
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    
    // Small delay to ensure terminal is ready before fitting
    setTimeout(() => {
      if (terminalRef.current && terminalRef.current.offsetWidth > 0) {
        fitAddon.fit();
      }
    }, 100);

    term.writeln('\x1b[1;32mArcturus Terminal v1.0\x1b[0m');
    term.writeln('Welcome to the sovereign IDE.');
    term.writeln('Type \x1b[1;36mhelp\x1b[0m to see available commands.');
    term.write('\r\n$ ');

    term.onData(e => {
      // Basic echo for demonstration
      if (e === '\r') {
        term.write('\r\n$ ');
      } else if (e === '\u007F') {
        // Handle backspace
        term.write('\b \b');
      } else {
        term.write(e);
      }
    });

    // Listen for external write events
    const handleExternalWrite = (e: any) => {
      if (e.detail && typeof e.detail === 'string') {
        term.writeln(`\x1b[1;33m[SYSTEM]\x1b[0m ${e.detail}`);
        term.write('$ ');
      }
    };
    window.addEventListener('terminal:write', handleExternalWrite);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('terminal:write', handleExternalWrite);
      term.dispose();
    };
  }, []);

  // Refit when height changes
  useEffect(() => {
    if (fitAddonRef.current && terminalRef.current && terminalRef.current.offsetWidth > 0) {
      // Small timeout to allow DOM to settle
      setTimeout(() => {
        fitAddonRef.current?.fit();
      }, 50);
    }
  }, [height]);

  return (
    <div className="w-full h-full bg-black flex flex-col">
      <div className="flex items-center justify-between px-2 py-1 border-b border-glass-border/50 bg-black/50">
        <span className="text-xs font-mono text-brand-primary">Terminal</span>
      </div>
      <div className="flex-1 overflow-hidden p-2" ref={terminalRef} />
    </div>
  );
}
