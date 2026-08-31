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
  Color,
  CubeState,
  Move,
} from "@/types/cube";

interface MoveData {
  axis: "x" | "y" | "z";
  layer: number;
  angle: number;
}

interface CubieColors {
  front?: Color;
  back?: Color;
  top?: Color;
  bottom?: Color;
  left?: Color;
  right?: Color;
}

function getMoveData(move: Move): MoveData {
  const face = move[0];
  const double = move.endsWith("2");
  const prime = move.endsWith("'");

  let axis: "x" | "y" | "z" = "x";
  let layer = 1;
  let direction = 1;

  switch (face) {
    case "R":
      axis = "x";
      layer = 1;
      direction = -1;
      break;

    case "L":
      axis = "x";
      layer = -1;
      direction = 1;
      break;

    case "U":
      axis = "y";
      layer = 1;
      direction = -1;
      break;

    case "D":
      axis = "y";
      layer = -1;
      direction = 1;
      break;

    case "F":
      axis = "z";
      layer = 1;
      direction = -1;
      break;

    case "B":
      axis = "z";
      layer = -1;
      direction = 1;
      break;
  }

  if (prime) {
    direction *= -1;
  }

  return {
    axis,
    layer,
    angle:
      (Math.PI / 2) *
      direction *
      (double ? 2 : 1),
  };
}

function getCubieColors(
  cube: CubeState,
  x: number,
  y: number,
  z: number
): CubieColors {
  const colors: CubieColors = {};

  if (z === 1) {
    colors.front =
      cube.F[1 - y][x + 1];
  }

  if (z === -1) {
    colors.back =
      cube.B[1 - y][1 - x];
  }

  if (y === 1) {
    colors.top =
      cube.U[
        z === -1
          ? 2
          : z === 1
            ? 0
            : 1
      ][x + 1];
  }

  if (y === -1) {
    colors.bottom =
      cube.D[
        z === 1
          ? 0
          : z === -1
            ? 2
            : 1
      ][x + 1];
  }

  if (x === -1) {
    colors.left =
      cube.L[1 - y][z + 1];
  }

  if (x === 1) {
    colors.right =
      cube.R[1 - y][1 - z];
  }

  return colors;
}

function AnimatedLayer({
  move,
  children,
  onComplete,
}: {
  move: Move;
  children: React.ReactNode;
  onComplete: () => void;
}) {
  const groupRef =
    useRef<THREE.Group>(null);

  const completedRef =
    useRef(false);

  const data = getMoveData(move);

  const targetRotation =
    useRef(data.angle);

  useEffect(() => {
    completedRef.current = false;

    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.set(
      0,
      0,
      0
    );

    targetRotation.current =
      data.angle;
  }, [move, data.angle]);

  useFrame((_, delta) => {
    if (
      !groupRef.current ||
      completedRef.current
    ) {
      return;
    }

    const axis = data.axis;

    const current =
      groupRef.current.rotation[axis];

    const target =
      targetRotation.current;

    const next =
      THREE.MathUtils.damp(
        current,
        target,
        14,
        delta
      );

    groupRef.current.rotation[axis] =
      next;

    if (
      Math.abs(target - next) <
      0.001
    ) {
      groupRef.current.rotation[axis] =
        target;

      completedRef.current = true;

      onComplete();
    }
  });

  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
}

function StaticCubies({
  cube,
  excludeLayer,
  axis,
}: {
  cube: CubeState;
  excludeLayer?: number;
  axis?: "x" | "y" | "z";
}) {
  const cubies = [];

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (
          axis !== undefined &&
          excludeLayer !== undefined
        ) {
          const value =
            axis === "x"
              ? x
              : axis === "y"
                ? y
                : z;

          if (value === excludeLayer) {
            continue;
          }
        }

        cubies.push(
          <Cubie
            key={`${x}-${y}-${z}`}
            position={[x, y, z]}
            colors={getCubieColors(
              cube,
              x,
              y,
              z
            )}
          />
        );
      }
    }
  }

  return <>{cubies}</>;
}

function CubeModel() {
  const cube = useCubeStore(
    (state) => state.cube
  );

  const moveQueue = useCubeStore(
    (state) => state.moveQueue
  );

  const finishMove = useCubeStore(
    (state) => state.finishMove
  );

  const [activeMove, setActiveMove] =
    useState<Move | null>(null);

  const [animationCube, setAnimationCube] =
    useState<CubeState | null>(null);

  const processingRef =
    useRef(false);

  useEffect(() => {
    if (
      processingRef.current ||
      moveQueue.length === 0
    ) {
      return;
    }

    const move = moveQueue[0];

    /*
     * Capture the exact cube state BEFORE
     * the logical move is completed.
     *
     * This snapshot remains unchanged for
     * the entire physical animation.
     */
    setAnimationCube({
      U: cube.U.map((row) => [...row]),
      D: cube.D.map((row) => [...row]),
      L: cube.L.map((row) => [...row]),
      R: cube.R.map((row) => [...row]),
      F: cube.F.map((row) => [...row]),
      B: cube.B.map((row) => [...row]),
    });

    processingRef.current = true;
    setActiveMove(move);
  }, [moveQueue, cube]);

  const moveData = activeMove
    ? getMoveData(activeMove)
    : null;

  if (
    activeMove === null ||
    moveData === null ||
    animationCube === null
  ) {
    return (
      <group>
        <StaticCubies cube={cube} />
      </group>
    );
  }

  const animatedCubies = [];

  const {
    axis,
    layer,
  } = moveData;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const currentLayer =
          axis === "x"
            ? x
            : axis === "y"
              ? y
              : z;

        if (currentLayer !== layer) {
          continue;
        }

        animatedCubies.push(
          <Cubie
            key={`${x}-${y}-${z}`}
            position={[x, y, z]}
            colors={getCubieColors(
              animationCube,
              x,
              y,
              z
            )}
          />
        );
      }
    }
  }

  return (
    <group>
      <StaticCubies
        cube={animationCube}
        excludeLayer={layer}
        axis={axis}
      />

      <AnimatedLayer
        move={activeMove}
        onComplete={() => {
          finishMove(activeMove);

          processingRef.current = false;

          setActiveMove(null);
          setAnimationCube(null);
        }}
      >
        {animatedCubies}
      </AnimatedLayer>
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
          gl.setClearColor("#050913");
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