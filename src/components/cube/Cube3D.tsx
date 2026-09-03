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

import {
  OrbitControls,
} from "@react-three/drei";

import * as THREE from "three";

import Cubie from "./Cubie";

import {
  useCubeStore,
} from "@/store/cubeStore";

import {
  Axis,
  PhysicalCubie,
  MOVE_DATA,
} from "@/lib/cube/physicalCube";

import {
  Color,
  Face,
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

function getMoveData(
  move: Move
): {
  axis: Axis;
  layer: number;
  angle: number;
} {
  const face = move[0] as Face;
  const data = MOVE_DATA[face];

  const prime = move.endsWith("'");
  const double = move.endsWith("2");

  let direction = data.direction;

  if (prime) {
    direction *= -1;
  }

  return {
    axis: data.axis,
    layer: data.layer,
    angle:
      direction *
      (Math.PI / 2) *
      (double ? 2 : 1),
  };
}

function getAxisValue(
  cubie: PhysicalCubie,
  axis: Axis
): number {
  if (axis === "x") {
    return cubie.x;
  }

  if (axis === "y") {
    return cubie.y;
  }

  return cubie.z;
}

function physicalCubieColors(
  cubie: PhysicalCubie
): CubieColors {
  return {
    front: cubie.stickers.F,
    back: cubie.stickers.B,
    top: cubie.stickers.U,
    bottom: cubie.stickers.D,
    left: cubie.stickers.L,
    right: cubie.stickers.R,
  };
}

function CubieView({
  cubie,
}: {
  cubie: PhysicalCubie;
}) {
  return (
    <Cubie
      position={[
        cubie.x,
        cubie.y,
        cubie.z,
      ]}
      colors={physicalCubieColors(cubie)}
    />
  );
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

  const elapsed =
    useRef(0);

  const completed =
    useRef(false);

  const data =
    getMoveData(move);

  useEffect(() => {
    elapsed.current = 0;
    completed.current = false;

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
      completed.current
    ) {
      return;
    }

    elapsed.current += delta;

    const duration = 0.32;

    const progress =
      Math.min(
        elapsed.current / duration,
        1
      );

    const eased =
      progress *
      progress *
      (3 - 2 * progress);

    const angle =
      data.angle * eased;

    if (data.axis === "x") {
      groupRef.current.rotation.set(
        angle,
        0,
        0
      );
    } else if (data.axis === "y") {
      groupRef.current.rotation.set(
        0,
        angle,
        0
      );
    } else {
      groupRef.current.rotation.set(
        0,
        0,
        angle
      );
    }

    if (progress >= 1) {
      completed.current = true;

      if (data.axis === "x") {
        groupRef.current.rotation.set(
          data.angle,
          0,
          0
        );
      } else if (data.axis === "y") {
        groupRef.current.rotation.set(
          0,
          data.angle,
          0
        );
      } else {
        groupRef.current.rotation.set(
          0,
          0,
          data.angle
        );
      }

      onComplete();
    }
  });

  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
}

function CubeModel() {
  const physicalCube =
    useCubeStore(
      (state) =>
        state.physicalCube
    );

  const moveQueue =
    useCubeStore(
      (state) =>
        state.moveQueue
    );

  const finishMove =
    useCubeStore(
      (state) =>
        state.finishMove
    );

  const [activeMove, setActiveMove] =
    useState<Move | null>(null);

  const [snapshot, setSnapshot] =
    useState<PhysicalCubie[] | null>(
      null
    );

  const activeMoveRef =
    useRef<Move | null>(null);

  useEffect(() => {
    if (
      activeMoveRef.current !== null ||
      moveQueue.length === 0
    ) {
      return;
    }

    const move = moveQueue[0];

    const frozen =
      physicalCube.map(
        (cubie) => ({
          id: cubie.id,
          x: cubie.x,
          y: cubie.y,
          z: cubie.z,
          stickers: {
            ...cubie.stickers,
          },
        })
      );

    activeMoveRef.current = move;

    setSnapshot(frozen);
    setActiveMove(move);
  }, [
    moveQueue,
    physicalCube,
  ]);

  const completeAnimation = () => {
    const move =
      activeMoveRef.current;

    if (!move) {
      return;
    }

    activeMoveRef.current = null;

    finishMove(move);

    setActiveMove(null);
    setSnapshot(null);
  };

  if (
    !activeMove ||
    !snapshot
  ) {
    return (
      <group>
        {physicalCube.map(
          (cubie) => (
            <CubieView
              key={cubie.id}
              cubie={cubie}
            />
          )
        )}
      </group>
    );
  }

  const {
    axis,
    layer,
  } = getMoveData(activeMove);

  const staticCubies =
    snapshot.filter(
      (cubie) =>
        getAxisValue(
          cubie,
          axis
        ) !== layer
    );

  const animatedCubies =
    snapshot.filter(
      (cubie) =>
        getAxisValue(
          cubie,
          axis
        ) === layer
    );

  return (
    <group>
      {staticCubies.map(
        (cubie) => (
          <CubieView
            key={cubie.id}
            cubie={cubie}
          />
        )
      )}

      <AnimatedLayer
        move={activeMove}
        onComplete={
          completeAnimation
        }
      >
        {animatedCubies.map(
          (cubie) => (
            <CubieView
              key={cubie.id}
              cubie={cubie}
            />
          )
        )}
      </AnimatedLayer>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight
        intensity={2}
      />

      <directionalLight
        position={[
          5,
          8,
          6,
        ]}
        intensity={4}
      />

      <directionalLight
        position={[
          -5,
          3,
          -5,
        ]}
        intensity={2}
      />

      <pointLight
        position={[
          0,
          4,
          4,
        ]}
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
          position: [
            5,
            4,
            6,
          ],
          fov: 42,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
        }}
        onCreated={({
          gl,
        }) => {
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