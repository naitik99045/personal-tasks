import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ClockSceneProps {
  score: number;
  activeTasksCount: number;
}

function ClockMesh({ score, activeTasksCount }: ClockSceneProps) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const secondHandRef = useRef<THREE.Group>(null);
  const minuteHandRef = useRef<THREE.Group>(null);

  // Derive solid OKLCH-equivalent hex colors for Three.js materials
  // Capped Chroma, strictly solid, Apple minimalism
  const getCoreColor = (s: number) => {
    if (s >= 150) return '#4f46e5'; // Master Violet
    if (s >= 100) return '#2563eb'; // Punctual Solid Blue
    if (s >= 50) return '#d97706';  // At Risk Solid Amber
    return '#dc2626';               // Critical Solid Red
  };

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    // Gentle organic floating
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.15;
      outerRingRef.current.rotation.x = Math.sin(elapsed * 0.5) * 0.08;
    }

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.4;
      coreRef.current.rotation.x = Math.cos(elapsed * 0.5) * 0.1;
      // Pulse scale gently if active tasks are ticking
      const pulse = activeTasksCount > 0 ? 1 + Math.sin(elapsed * 3) * 0.04 : 1;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }

    // Precise Clock Hands ticking
    const now = new Date();
    const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const minutes = now.getMinutes() + seconds / 60;

    if (secondHandRef.current) {
      secondHandRef.current.rotation.z = -(seconds / 60) * Math.PI * 2;
    }

    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.z = -(minutes / 60) * Math.PI * 2;
    }
  });

  const coreColor = getCoreColor(score);

  return (
    <group position={[0, 0, 0]}>
      {/* Studio Lighting - Soft Apple Minimalist Aesthetic */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      <directionalLight position={[-3, -3, -2]} intensity={0.4} color="#93c5fd" />

      {/* Outer Watch Bezel / Ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.5, 0.06, 16, 64]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      {/* Clock Face Hour Pips */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.sin(angle) * 1.35;
        const y = Math.cos(angle) * 1.35;
        const isQuarter = i % 3 === 0;
        return (
          <mesh key={i} position={[x, y, 0]}>
            <boxGeometry args={[isQuarter ? 0.04 : 0.02, isQuarter ? 0.12 : 0.06, 0.02]} />
            <meshBasicMaterial color={isQuarter ? '#e2e8f0' : '#64748b'} />
          </mesh>
        );
      })}

      {/* Minute Hand Group */}
      <group ref={minuteHandRef}>
        <mesh position={[0, 0.45, 0.02]}>
          <boxGeometry args={[0.04, 0.9, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>

      {/* Second Hand (Ticking Chrono Needle) */}
      <group ref={secondHandRef}>
        <mesh position={[0, 0.55, 0.04]}>
          <boxGeometry args={[0.02, 1.1, 0.01]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Center Discipline Core Orb (Reacts to user score) */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial
          color={coreColor}
          roughness={0.15}
          metalness={0.6}
          wireframe={false}
        />
      </mesh>
    </group>
  );
}

export const Clock3D: React.FC<ClockSceneProps> = (props) => {
  return (
    <div style={{ width: '100%', height: '180px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ClockMesh {...props} />
      </Canvas>
    </div>
  );
};
