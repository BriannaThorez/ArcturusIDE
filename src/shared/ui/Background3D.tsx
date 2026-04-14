import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { WebGPURenderer } from 'three/webgpu';

export function Background3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050d0a);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Use WebGPURenderer if possible
    let renderer: any;
    let isInitialized = false;

    const initRenderer = async () => {
      try {
        renderer = new WebGPURenderer({ antialias: true });
        await renderer.init();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        containerRef.current?.appendChild(renderer.domElement);
        isInitialized = true;
      } catch (e) {
        console.warn("WebGPU not supported, falling back to WebGL", e);
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        containerRef.current?.appendChild(renderer.domElement);
        isInitialized = true;
      }
      
      // Start animation only after initialization
      animate();
    };

    // Bioluminescent Particles
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 5000; i++) {
      vertices.push(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 10
      );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x39ff14,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Floating bioluminescent "vines" or lines
    const lineGroup = new THREE.Group();
    for (let i = 0; i < 20; i++) {
      const points = [];
      for (let j = 0; j < 10; j++) {
        points.push(new THREE.Vector3(
          Math.random() * 10 - 5,
          Math.random() * 10 - 5,
          Math.random() * 10 - 5
        ));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: i % 2 === 0 ? 0x00f0ff : 0x39ff14,
        transparent: true,
        opacity: 0.2
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      lineGroup.add(line);
    }
    scene.add(lineGroup);

    const handleResize = () => {
      if (!isInitialized) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      if (!isInitialized) return;
      requestAnimationFrame(animate);
      
      const elapsedTime = Date.now() * 0.001;
      
      particles.rotation.y += 0.0005;
      particles.rotation.x += 0.0002;
      
      // Pulse effect
      const pulse = Math.sin(elapsedTime * 0.5) * 0.1 + 0.9;
      particles.scale.set(pulse, pulse, pulse);
      
      lineGroup.rotation.y -= 0.0003;
      lineGroup.children.forEach((line: any, i) => {
        line.rotation.z = Math.sin(elapsedTime * 0.2 + i) * 0.1;
        line.scale.setScalar(1 + Math.sin(elapsedTime * 0.5 + i) * 0.05);
      });
      
      renderer.render(scene, camera);
    };

    initRenderer();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer?.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ background: '#050d0a' }}
    />
  );
}
