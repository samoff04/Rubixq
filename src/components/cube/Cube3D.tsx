"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Canvas,
  useFrame,
} from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import Cubie from "./Cubie";
import { useCubeStore } from "@/store/cubeStore";
import {
  createPhysicalCube,
  getMoveData,
  rotatePhysicalCube,
  PhysicalCubie,
} from "@/lib/cube/physicalCube";
import {
  Color,
  Move,
} from "@/types/cube";

interface CubieColors {
  front?: Color;
  back?: Color;
  top?: Color;
  bottom?: Color;
  left?: Color;
  right?: Color;
}

function getCubieColors(
  cubie: PhysicalCubie
): CubieColors {
  const colors: CubieColors = {};

  for (const sticker of cubie.stickers) {
    const [x, y, z] =
      sticker.normal;

    if (x === 1) {
      colors.right =
        sticker.color;
    }

    if (x === -1) {
      colors.left =
        sticker.color;
    }

    if (y === 1) {
      colors.top =
        sticker.color;
    }

    if (y === -1) {
      colors.bottom =
        sticker.color;
    }

    if (z === 1) {
      colors.front =
        sticker.color;
    }

    if (z === -1) {
      colors.back =
        sticker.color;
    }
  }

  return colors;
}

function AnimatedLayer({
  move,
  cubies,
  onComplete,
}: {
  move: Move;
  cubies: PhysicalCubie[];
  onComplete: () => void;
}) {
  const groupRef =
    useRef<THREE.Group>(null);

  const completedRef =
    useRef(false);

  const data =
    getMoveData(move);

  useEffect(() => {
    completedRef.current = false;

    if (groupRef.current) {
      groupRef.current.rotation.set(
        0,
        0,
        0
      );
    }
  }, [move]);

  useFrame((_, delta) => {
    if (
      !groupRef.current ||
      completedRef.current
    ) {
      return;
    }

    const current =
      groupRef.current.rotation[
        data.axis
      ];

    const next =
      THREE.MathUtils.damp(
        current,
        data.angle,
        14,
        delta
      );

    groupRef.current.rotation[
      data.axis
    ] = next;

    if (
      Math.abs(
        data.angle - next
      ) < 0.001
    ) {
      groupRef.current.rotation[
        data.axis
      ] = data.angle;

      completedRef.current = true;

      onComplete();
    }
  });

  return (
    <group ref={groupRef}>
      {cubies.map((cubie) => (
        <Cubie
          key={cubie.id}
          position={cubie.position}
          colors={getCubieColors(
            cubie
          )}
        />
      ))}
    </group>
  );
}

function CubeModel() {
  const moveQueue =
    useCubeStore(
      (state) => state.moveQueue
    );

  const finishMove =
    useCubeStore(
      (state) => state.finishMove
    );

  const [physicalCube, setPhysicalCube] =
    useState<PhysicalCubie[]>(
      createPhysicalCube
    );

  const [activeMove, setActiveMove] =
    useState<Move | null>(null);

  const processingRef =
    useRef(false);

  useEffect(() => {
    if (
      processingRef.current ||
      moveQueue.length === 0
    ) {
      return;
    }

    processingRef.current = true;

    setActiveMove(
      moveQueue[0]
    );
  }, [moveQueue]);

  const moveData = activeMove
    ? getMoveData(activeMove)
    : null;

  const animatedIds =
    moveData
      ? new Set(
          physicalCube
            .filter((cubie) => {
              const coordinate =
                moveData.axis === "x"
                  ? cubie.position[0]
                  : moveData.axis === "y"
                    ? cubie.position[1]
                    : cubie.position[2];

              return (
                coordinate ===
                moveData.layer
              );
            })
            .map(
              (cubie) => cubie.id
            )
        )
      : new Set<string>();

  const animatedCubies =
    physicalCube.filter(
      (cubie) =>
        animatedIds.has(cubie.id)
    );

  const staticCubies =
    physicalCube.filter(
      (cubie) =>
        !animatedIds.has(cubie.id)
    );

  if (!activeMove) {
    return (
      <group>
        {physicalCube.map(
          (cubie) => (
            <Cubie
              key={cubie.id}
              position={
                cubie.position
              }
              colors={getCubieColors(
                cubie
              )}
            />
          )
        )}
      </group>
    );
  }

  return (
    <group>
      {staticCubies.map(
        (cubie) => (
          <Cubie
            key={cubie.id}
            position={
              cubie.position
            }
            colors={getCubieColors(
              cubie
            )}
          />
        )
      )}

      <AnimatedLayer
        move={activeMove}
        cubies={animatedCubies}
        onComplete={() => {
          setPhysicalCube(
            (current) =>
              rotatePhysicalCube(
                current,
                activeMove
              )
          );

          finishMove(
            activeMove
          );

          processingRef.current =
            false;

          setActiveMove(null);
        }}
      />
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={2} />

      <directionalLight
        position={[5, 8, 6]}
        intensity={4}
      />

      <directionalLight
        position={[-5, 3, -5]}
        intensity={2}
      />

      <pointLight
        position={[0, 4, 4]}
        intensity={5}
      />

      <CubeModel />

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={9}
      />
    </>
  );
}

export default function Cube3D() {
  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-2xl bg-[#050913]">
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(0,140,255,0.12),transparent_55%)]" />

      <div className="pointer-events-none absolute inset-0 z-10 opacity-30 [background-image:linear-gradient(rgba(0,180,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,180,255,0.08)_1px,transparent_1px)] [background-size:45px_45px]" />

      <div className="absolute left-5 top-5 z-20 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-cyan-300">
        INTERACTIVE 3D
      </div>

      <Canvas
        camera={{
          position: [5, 4, 6],
          fov: 42,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(
            "#050913"
          );
        }}
      >
        <Scene />
      </Canvas>

      <div className="pointer-events-none absolute bottom-5 left-5 z-20 rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-xs text-slate-400 backdrop-blur-xl">
        Drag to rotate • Scroll to zoom
      </div>

      <div className="pointer-events-none absolute bottom-5 right-5 z-20 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs text-cyan-300 backdrop-blur-xl">
        3D ENGINE ONLINE
      </div>
    </div>
  );
}