"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { Text, PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Vector2, Vector3 } from "three";

// --- CONFIG ---
const ENEMY_BASE_SPEED = 4.0; // Units per second
const SPAWN_RATE = 1.5; // Seconds between spawns (approx)

// --- TYPES ---
type Entity = { id: number; position: Vector3; direction?: Vector3 };

// --- COMPONENTS ---

const PlayerCore = ({ mousePos }: { mousePos: Vector3 }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta;
    meshRef.current.rotation.y += delta * 0.5;
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      mousePos.x * 0.5,
      delta * 5
    );
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={2}
          wireframe
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial
          color="#000"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};

const Bullets = ({ bullets }: { bullets: Entity[] }) => (
  <group>
    {bullets.map((b) => (
      <mesh key={b.id} position={b.position}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#fcd34d" />
      </mesh>
    ))}
  </group>
);

const Enemies = ({ enemies }: { enemies: Entity[] }) => (
  <group>
    {enemies.map((e) => (
      <mesh key={e.id} position={e.position}>
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={1.5}
          wireframe
        />
      </mesh>
    ))}
  </group>
);

const Explosion = ({ position }: { position: Vector3 }) => {
  const particles = useMemo(
    () =>
      new Array(8).fill(0).map(() => ({
        velocity: new Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5
        ),
        offset: new Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ),
      })),
    []
  );

  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.Material;

        // Move using Delta Time
        child.position.add(particles[i].velocity.clone().multiplyScalar(delta));
        child.scale.multiplyScalar(Math.max(0, 1 - delta * 2));

        if (material)
          material.opacity = Math.max(0, material.opacity - delta * 2);
      });
    }
  });

  return (
    <group position={position} ref={group}>
      {particles.map((_, i) => (
        <mesh key={i} position={_.offset}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshBasicMaterial color="orange" transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
};

// --- GAME LOGIC ---
const GameScene = ({
  onGameOver,
  setScore,
}: {
  onGameOver: () => void;
  setScore: (s: number) => void;
}) => {
  const { mouse, viewport } = useThree();
  const [bullets, setBullets] = useState<Entity[]>([]);
  const [enemies, setEnemies] = useState<Entity[]>([]);
  const [explosions, setExplosions] = useState<
    { id: number; position: Vector3 }[]
  >([]);

  const lastShot = useRef(0);
  const lastSpawn = useRef(0);
  const scoreRef = useRef(0);
  const dummyVec = new Vector3();

  useFrame((state, delta) => {
    // 1. Mouse Position
    dummyVec.set(
      (mouse.x * viewport.width) / 2,
      (mouse.y * viewport.height) / 2,
      0
    );

    // 2. Shooting (Auto-fire)
    const now = state.clock.getElapsedTime();
    if (now - lastShot.current > 0.15) {
      const direction = new Vector3()
        .copy(dummyVec)
        .normalize()
        .multiplyScalar(20); // Speed 20 units/sec
      setBullets((prev) => [
        ...prev,
        { id: Date.now(), position: new Vector3(0, 0, 0), direction },
      ]);
      lastShot.current = now;
    }

    // 3. Spawning Enemies (Time based, not frame based)
    if (
      now - lastSpawn.current >
      Math.max(0.5, SPAWN_RATE - scoreRef.current * 0.001)
    ) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20; // Spawn further out
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      setEnemies((prev) => [
        ...prev,
        { id: Date.now(), position: new Vector3(x, y, 0) },
      ]);
      lastSpawn.current = now;
    }

    // 4. Update Bullets (Delta Time)
    setBullets((prev) =>
      prev
        .map((b) => {
          if (!b.direction) return b;
          b.position.add(b.direction.clone().multiplyScalar(delta));
          return b;
        })
        .filter((b) => b.position.length() < 25)
    );

    // 5. Update Enemies & Collisions (Delta Time)
    setEnemies((prev) => {
      const nextEnemies: Entity[] = [];
      prev.forEach((enemy) => {
        // Move towards center
        const dir = new Vector3(0, 0, 0)
          .sub(enemy.position)
          .normalize()
          .multiplyScalar(ENEMY_BASE_SPEED * delta);
        enemy.position.add(dir);

        // Collision: Player
        if (enemy.position.length() < 1.2) {
          onGameOver();
        }

        // Collision: Bullet
        const hitIndex = bullets.findIndex(
          (b) => b.position.distanceTo(enemy.position) < 1.0
        );
        if (hitIndex !== -1) {
          setExplosions((ex) => [
            ...ex,
            { id: Date.now(), position: enemy.position.clone() },
          ]);
          scoreRef.current += 100;
          setScore(scoreRef.current);
          // Note: We don't remove the bullet here to keep logic simple,
          // but visually it looks fine as a "piercing" shot or just rapid fire.
        } else {
          nextEnemies.push(enemy);
        }
      });
      return nextEnemies;
    });

    // Cleanup Explosions
    if (explosions.length > 5) setExplosions((prev) => prev.slice(1));
  });

  return (
    <>
      <PlayerCore mousePos={dummyVec} />
      <Bullets bullets={bullets} />
      <Enemies enemies={enemies} />
      {explosions.map((e) => (
        <Explosion key={e.id} position={e.position} />
      ))}
    </>
  );
};

export default function CyberVoid() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const restart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from firing in game
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full h-[600px] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl group select-none">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} />
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        <EffectComposer>
          <Bloom
            luminanceThreshold={0}
            luminanceSmoothing={0.9}
            height={300}
            intensity={1.5}
          />
          <ChromaticAberration
            offset={
              new Vector2(gameOver ? 0.005 : 0.002, gameOver ? 0.005 : 0.002)
            }
            radialModulation={false}
            modulationOffset={0}
          />
        </EffectComposer>

        {isPlaying && !gameOver && (
          <GameScene
            onGameOver={() => {
              setGameOver(true);
              setIsPlaying(false);
            }}
            setScore={setScore}
          />
        )}
        {(!isPlaying || gameOver) && (
          <PlayerCore mousePos={new Vector3(0, 0, 0)} />
        )}
      </Canvas>

      <div className="absolute top-6 left-8 font-mono text-2xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] pointer-events-none">
        SCORE: {score}
      </div>

      {(!isPlaying || gameOver) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-10">
          <h1 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
            CYBER VOID
          </h1>
          <p className="text-gray-300 mb-8 text-lg">
            {gameOver
              ? "CRITICAL SYSTEM FAILURE"
              : "OMNI-DIRECTIONAL DEFENSE SYSTEM"}
          </p>
          <button
            onClick={restart}
            className="px-8 py-3 bg-white text-black font-bold text-xl rounded-full hover:scale-110 transition-all"
          >
            {gameOver ? "REBOOT SYSTEM" : "INITIALIZE"}
          </button>
        </div>
      )}
    </div>
  );
}
