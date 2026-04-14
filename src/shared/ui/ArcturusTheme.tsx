import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export const THEMES = {
  AMAZONITE: {
    name: 'Amazonite High-Gloss',
    primary: '#00ff88', // Electric Emerald
    secondary: '#059669',
    accent: '#ffffff',
    bg: '#040a07', // Deep forest floor
    glass: 'rgba(255, 255, 255, 0.08)', // High-clarity white glass
    border: 'rgba(255, 255, 255, 0.12)', // Sharp glass edge
    glow: 'rgba(0, 255, 136, 0.25)'
  },
  BAMBOO: {
    name: 'Bamboo Mist',
    primary: '#d9f99d', // Fresh sprout
    secondary: '#65a30d',
    accent: '#f7fee7',
    bg: '#060802',
    glass: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.15)',
    glow: 'rgba(217, 249, 157, 0.15)'
  },
  HIBISCUS: {
    name: 'Floral Vapor',
    primary: '#fda4af', // Soft petal pink
    secondary: '#e11d48',
    accent: '#fff1f2',
    bg: '#080304',
    glass: 'rgba(255, 255, 255, 0.09)',
    border: 'rgba(255, 255, 255, 0.2)',
    glow: 'rgba(253, 164, 175, 0.2)'
  },
  ORCHID: {
    name: 'Rainforest Orchid',
    primary: '#e9d5ff', // Pale lilac
    secondary: '#a855f7',
    accent: '#faf5ff',
    bg: '#060408',
    glass: 'rgba(255, 255, 255, 0.07)',
    border: 'rgba(255, 255, 255, 0.18)',
    glow: 'rgba(233, 213, 255, 0.2)'
  }
};

export const GlobalStyles = ({ theme }: { theme: any }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@200;300;400;500;600&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@200;300;400;500;600&display=swap');
    
    :root {
      font-size: clamp(10px, 0.6vw + 6px, 16px);
      
      --brand-primary: ${theme.primary};
      --brand-secondary: ${theme.secondary};
      --brand-accent: ${theme.accent};
      --glass-bg: ${theme.glass};
      --glass-border: ${theme.border};
      --bio-glow: ${theme.glow};
      
      --space-4xs: 0.14rem;
      --space-3xs: 0.28rem;
      --space-2xs: 0.42rem;
      --space-xs: 0.57rem;
      --space-sm: 0.85rem;
      --space-md: 1.28rem;
      --space-lg: 1.71rem;

      --font-main: 'Lexend', sans-serif;
      --font-mono: 'Atkinson Hyperlegible Mono', 'Fira Code', monospace;
      
      --header-height: 4rem;
      --text-xs: 0.65rem;
      --text-sm: 0.72rem;
      --text-base: 0.85rem;
      --text-lg: 1.1rem;
      
      --radius-sm: 0.42rem;
      --radius-md: 0.85rem;
      --radius-lg: 1.31rem;
      --radius-full: 9999px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: ${theme.bg};
      color: ${theme.primary};
      font-family: var(--font-main);
      font-size: 1rem;
      line-height: 1.12rem;
      -webkit-font-smoothing: antialiased;
      transition: background 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .app-root {
      height: 100vh;
      width: 100vw;
      display: flex;
      overflow: hidden;
      position: relative;
      background: ${theme.bg}; 
      color: ${theme.secondary};
      padding: 10px;
    }

    .mist {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% -20%, rgba(255,255,255,0.05), transparent 70%);
      pointer-events: none;
      z-index: 1;
    }

    .sidebar {
      width: 18rem;
      max-width: 90vw;
      height: 100vh;
      padding: var(--space-sm);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      z-index: 20;
      backdrop-filter: blur(12px);
      background: rgba(0,0,0,0.2);
      border-right: 1px solid var(--glass-border);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
    }

    .sidebar.collapsed {
        width: 0;
        opacity: 0;
        padding: 0;
        overflow: hidden;
        border: none;
    }

    .main-deck {
      flex: 1;
      position: relative;
      display: flex;
      flex-direction: column;
      z-index: 10;
      height: 100%;
      min-width: 0;
    }

    .canopy-panel {
      background: var(--glass-bg);
      backdrop-filter: blur(40px) saturate(180%);
      border: 1px solid var(--glass-border);
      box-shadow: 0 0.28rem 1.28rem -0.28rem rgba(0,0,0,0.3);
      position: relative;
      transition: all 0.3s ease;
      padding: var(--space-sm);
    }

    .panel-interactive {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      border: 1px solid transparent;
    }
    .panel-interactive:hover {
        border-color: var(--brand-primary);
        box-shadow: 0 0 1rem var(--bio-glow);
    }

    .card-base {
      border-radius: var(--radius-md);
      padding: var(--space-2xs);
      display: flex;
      flex-direction: column;
      gap: var(--space-3xs);
    }

    .juicy-label {
      font-weight: 300;
      font-family: var(--font-main);
      font-size: var(--text-xs);
      opacity: 0.6;
      white-space: nowrap;
    }

    .font-mono { font-family: var(--font-mono) !important; letter-spacing: -0.02em; }
    .font-black { font-weight: 900; }
    .font-bold { font-weight: 700; }
    
    .text-primary { color: ${theme.primary}; }
    .text-secondary { color: ${theme.secondary}; }
    
    .opacity-30 { opacity: 0.3; }
    .opacity-60 { opacity: 0.6; }

    .synaptic-glow { transition: all 0.3s ease; }
    .synaptic-glow:hover {
      color: var(--brand-primary);
      text-shadow: 0 0 0.71rem var(--bio-glow);
    }
    
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }

    .custom-scrollbar {
        overflow-y: auto;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 0.25rem; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--brand-primary); border-radius: 0.71rem; opacity: 0.15; }

    /* --- Chat Specifics --- */
    .chat-container {
        flex: 1;
        overflow-y: auto;
        padding: var(--space-md);
        scroll-behavior: smooth;
        display: flex;
        flex-direction: column;
    }

    .message-bubble {
        padding: var(--space-sm);
        border-radius: var(--radius-lg);
        max-width: 85%;
        margin-bottom: var(--space-md);
        animation: slideIn 0.3s ease-out;
    }
    
    .user-bubble {
        align-self: flex-end;
        background: rgba(74, 222, 128, 0.1); /* Primary tint */
        border: 1px solid var(--brand-primary);
        border-bottom-right-radius: 2px;
        color: white;
    }

    .bot-bubble {
        align-self: flex-start;
        background: rgba(0,0,0,0.3);
        border: 1px solid var(--glass-border);
        border-top-left-radius: 2px;
    }

    @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .input-deck {
        padding: var(--space-md);
        display: flex;
        justify-content: center;
        width: 100%;
    }

    .inspector-card {
        width: 100%;
        max-width: 48rem;
        border-radius: 2rem;
        padding: 0.5rem;
        display: flex;
        align-items: flex-end; 
        gap: 1rem;
        border: 1px solid var(--glass-border);
        background: var(--glass-bg);
        box-shadow: 0 2rem 4rem -1rem rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(40px);
        min-height: 4rem;
    }

    .textarea-ghost {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--brand-accent);
        font-family: var(--font-mono);
        font-size: 0.9rem;
        padding: 0.75rem;
        resize: none;
        outline: none;
        min-height: 2.5rem;
        max-height: 12rem;
    }

    .circle-btn {
        height: 2.5rem;
        width: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        background: rgba(255,255,255,0.05);
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--brand-accent);
        flex-shrink: 0;
    }
    .circle-btn:hover:not(:disabled) {
        background: var(--brand-primary);
        color: black;
        box-shadow: 0 0 1rem var(--bio-glow);
    }
    .circle-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    .header-bar {
        height: 4rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--space-md);
        border-bottom: 1px solid var(--glass-border);
        background: rgba(0,0,0,0.2);
    }

    .log-item {
      padding: 0.625rem;
      border-radius: 0.75rem;
      border: 1px solid transparent;
      transition: all 0.2s ease;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .log-item:hover {
        border-color: var(--glass-border);
        background: rgba(255, 255, 255, 0.03);
    }
    .log-item.active {
        background: rgba(74, 222, 128, 0.1);
        border-color: var(--brand-primary);
    }

    /* Modal Overlay */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(5px);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }
    .modal-content {
        width: 100%;
        max-width: 32rem;
        border-radius: var(--radius-lg);
        background: #050505;
        border: 1px solid var(--brand-primary);
        box-shadow: 0 0 3rem rgba(0,0,0,0.8);
    }

    .dropdown-menu-styled {
      position: absolute;
      top: 100%;
      right: 0;
      width: 12rem;
      background: #0a0a0a;
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      z-index: 999;
      box-shadow: 0 1rem 2rem rgba(0,0,0,0.5);
    }
    .dropdown-item {
        padding: 0.5rem;
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: var(--text-xs);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: rgba(255,255,255,0.7);
        background: transparent;
        border: none;
        width: 100%;
        text-align: left;
    }
    .dropdown-item:hover {
        background: rgba(255,255,255,0.1);
        color: white;
    }
    /* Fern sparkle firefly effects */
    .forest-effects-container {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 2; /* Sits behind your UI panels */
      overflow: hidden;
    }
    .firefly {
      position: absolute;
      width: 0.5rem; 
      height: 0.5rem; 
      border-radius: 50%;
      filter: drop-shadow(0 0 10px var(--brand-primary));
      background: white; 
    }
    
    .fern {
      position: absolute;
      bottom: -20px;
      filter: drop-shadow(0 0 1.5rem var(--bio-glow)); 
      opacity: 0.6; 
      z-index: 3;
    }
    .fern-left { left: -1rem; transform-origin: bottom left; }
    .fern-right { right: -2rem; bottom: -2rem; transform-origin: bottom right; }
  `}</style>
);

export const BackgroundEffects = ({ theme }: { theme: any }) => {
  const fireflies = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      initialX: Math.random() * 100 + "vw",
      initialY: Math.random() * 100 + "vh",
      moveX: (Math.random() - 0.5) * 200 + "px",
      moveY: (Math.random() - 0.5) * 200 + "px",
      duration: Math.random() * 5 + 5
    }));
  }, []); 

  return (
    <div className="forest-effects-container">
      {fireflies.map((fly) => (
        <motion.div
          key={`fly-${fly.id}`}
          className="firefly"
          initial={{ opacity: 0, x: fly.initialX, y: fly.initialY }}
          animate={{
            opacity: [0, 0.7, 0],
            x: [null, fly.moveX], 
            y: [null, fly.moveY],
          }}
          transition={{
            duration: fly.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ backgroundColor: theme.primary }}
        />
      ))}

      <motion.div 
        className="fern fern-left"
        animate={{ rotate: [0, 5, 0] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity: 0.3 }} 
      >
        <Leaf size={240} color={theme.primary} strokeWidth={1.9} />
      </motion.div>
      
      <motion.div 
        className="fern fern-right"
        animate={{ rotate: [0, -6, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity: 0.25 }}
      >
        <Leaf size={300} color={theme.secondary} strokeWidth={1.9} />
      </motion.div>
    </div>
  );
};

export const ThreeWebGPUField = ({ primaryColor, onEngineInit }: { primaryColor: string, onEngineInit?: (status: string) => void }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let renderer: any, scene: any, camera: any, particles: any;

    const initThreeJS = async () => {
      try {
        // Dynamically import Three.js
        const THREE = await import('three');
        
        let RendererClass = THREE.WebGLRenderer;
        if (onEngineInit) onEngineInit("WEBGL2_ACTIVE");

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        renderer = new RendererClass({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        if(mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        // Particle System Geometry
        const geometry = new THREE.BufferGeometry();
        const count = 500;
        const positions = new Float32Array(count * 3);
        
        for(let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 15;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: primaryColor,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });
        
        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            particles.rotation.y += 0.001;
            particles.rotation.x += 0.0005;
            renderer.render(scene, camera);
        };
        
        animate();
      } catch (err) {
        console.error("Three.js Initialization Failed:", err);
      }
    };

    initThreeJS();

    const handleResize = () => {
        if(camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (renderer && mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [primaryColor, onEngineInit]);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />;
};
