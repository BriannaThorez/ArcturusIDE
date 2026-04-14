import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Database, Globe } from 'lucide-react';
import { JuicyButton } from '../../shared/ui/JuicyButton';
import * as THREE from 'three';
// @ts-ignore
import { WebGPURenderer } from 'three/webgpu';

interface VectorVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VectorVisualizerModal({ isOpen, onClose }: VectorVisualizerModalProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;

    let renderer: any;
    let isInitialized = false;

    const initRenderer = async () => {
      try {
        renderer = new WebGPURenderer({ antialias: true, alpha: true });
        await renderer.init();
        renderer.setSize(width, height);
        canvasRef.current?.appendChild(renderer.domElement);
        isInitialized = true;
      } catch (e) {
        console.warn("WebGPU not supported in modal, falling back to WebGL", e);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        canvasRef.current?.appendChild(renderer.domElement);
        isInitialized = true;
      }
      
      // Start animation only after initialization
      animate();
    };

    // Create a "Vector Space"
    const group = new THREE.Group();
    scene.add(group);

    // Grid helper
    const grid = new THREE.GridHelper(20, 20, 0x00f0ff, 0x112a20);
    grid.rotation.x = Math.PI / 2;
    group.add(grid);

    // Feature Vectors as glowing spheres
    const features = [
      { name: "Chat", pos: [2, 3, 1], color: 0x39ff14 },
      { name: "Editor", pos: [-3, 2, -2], color: 0x00f0ff },
      { name: "Agent", pos: [4, -1, 3], color: 0xff00ff },
      { name: "Visualizer", pos: [-2, -4, 2], color: 0xffff00 },
      { name: "Vibe", pos: [0, 0, 5], color: 0xffffff }
    ];

    features.forEach(f => {
      const geometry = new THREE.SphereGeometry(0.4, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: f.color });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(f.pos[0], f.pos[1], f.pos[2]);
      group.add(sphere);

      // Add a line to origin
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(f.pos[0], f.pos[1], f.pos[2])
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: f.color, transparent: true, opacity: 0.3 });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      group.add(line);
    });

    const animate = () => {
      if (!isOpen || !isInitialized) return;
      requestAnimationFrame(animate);
      group.rotation.y += 0.005;
      group.rotation.x += 0.002;
      renderer.render(scene, camera);
    };

    initRenderer();

    const handleResize = () => {
      if (!canvasRef.current || !isInitialized) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvasRef.current && renderer?.domElement) {
        canvasRef.current.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-rainforest-900/80 backdrop-blur-[0.25rem] z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: '1rem' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: '1rem' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] max-w-[95vw] h-[40rem] max-h-[90vh] glass-panel rounded-[1.5rem] shadow-2xl z-50 flex flex-col overflow-hidden neon-border"
          >
            <div className="flex items-center justify-between p-[1.5rem] border-b border-neon-teal/30">
              <div className="flex items-center gap-[0.75rem] text-neon-teal">
                <Globe className="animate-pulse" size="1.5rem" />
                <h2 className="text-[1.25rem] font-medium font-sans">WebGPU Feature Vector Space</h2>
              </div>
              <div className="w-[3rem]">
                <JuicyButton variant="ghost" onClick={onClose} className="p-[0.5rem]">
                  <X size="1.25rem" />
                </JuicyButton>
              </div>
            </div>
            <div className="flex-1 relative bg-rainforest-900/20" ref={canvasRef}>
              <div className="absolute bottom-[1.5rem] left-[1.5rem] z-10 pointer-events-none">
                <div className="text-neon-green font-mono text-[0.75rem] space-y-1">
                  <div>[SYSTEM] WebGPU Renderer Active</div>
                  <div>[STATUS] Visualizing Feature Embeddings</div>
                  <div>[VECTORS] 5 Dimensions Projected</div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
