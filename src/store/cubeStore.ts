import { create } from "zustand";

import {
  CubeState,
  Move,
} from "@/types/cube";

import {
  createSolvedCube,
} from "@/lib/cube/cubeState";

import {
  applyPhysicalMove,
  createPhysicalCube,
  physicalCubeToState,
  PhysicalCubie,
} from "@/lib/cube/physicalCube";

import { generateScramble } from "@/lib/cube/scramble";
import { solveCube } from "@/lib/solver/solver";

type AnimationAction =
  | "normal"
  | "undo"
  | "redo"
  | "solution"
  | "scramble"
  | "reset";

interface CubeStore {
  physicalCube: PhysicalCubie[];
  cube: CubeState;

  history: Move[];
  redoStack: Move[];

  solution: Move[];
  currentStep: number;

  moveQueue: Move[];
  isAnimating: boolean;
  solutionPlaying: boolean;

  animationAction: AnimationAction;

  queueMove: (move: Move) => void;
  finishMove: (move: Move) => void;

  scramble: () => void;
  reset: () => void;

  undo: () => void;
  redo: () => void;

  generateSolution: () => void;

  nextStep: () => void;
  previousStep: () => void;
  restartSolution: () => void;

  playSolution: () => void;
  pauseSolution: () => void;

  applyMove: (move: Move) => void;
}

function inverseMove(move: Move): Move {
  if (move.endsWith("2")) {
    return move;
  }

  if (move.endsWith("'")) {
    return move[0] as Move;
  }

  return `${move[0]}'` as Move;
}

function physicalFromHistory(
  history: Move[]
): PhysicalCubie[] {
  let physical = createPhysicalCube();

  for (const move of history) {
    physical = applyPhysicalMove(
      physical,
      move
    );
  }

  return physical;
}

function physicalAtSolutionStep(
  history: Move[],
  solution: Move[],
  step: number
): PhysicalCubie[] {
  let physical =
    physicalFromHistory(history);

  for (let i = 0; i < step; i++) {
    physical = applyPhysicalMove(
      physical,
      solution[i]
    );
  }

  return physical;
}

export const useCubeStore =
  create<CubeStore>((set, get) => ({
    physicalCube:
      createPhysicalCube(),

    cube:
      createSolvedCube(),

    history: [],
    redoStack: [],

    solution: [],
    currentStep: 0,

    moveQueue: [],

    isAnimating: false,
    solutionPlaying: false,

    animationAction: "normal",

    applyMove: (move) => {
      set((state) => {
        const nextPhysical =
          applyPhysicalMove(
            state.physicalCube,
            move
          );

        return {
          physicalCube:
            nextPhysical,

          cube:
            physicalCubeToState(
              nextPhysical
            ),

          history: [
            ...state.history,
            move,
          ],

          redoStack: [],

          solution: [],
          currentStep: 0,

          moveQueue: [],
          isAnimating: false,

          solutionPlaying: false,

          animationAction: "normal",
        };
      });
    },

    queueMove: (move) => {
      const state = get();

      if (state.isAnimating) {
        return;
      }

      set({
        moveQueue: [move],
        isAnimating: true,

        solution: [],
        currentStep: 0,

        solutionPlaying: false,

        animationAction: "normal",
      });
    },

    finishMove: (move) => {
      set((state) => {
        const action =
          state.animationAction;

        const nextPhysical =
          applyPhysicalMove(
            state.physicalCube,
            move
          );

        const nextCube =
          physicalCubeToState(
            nextPhysical
          );

        if (action === "normal") {
          return {
            physicalCube:
              nextPhysical,

            cube:
              nextCube,

            history: [
              ...state.history,
              move,
            ],

            redoStack: [],

            solution: [],
            currentStep: 0,

            moveQueue:
              state.moveQueue.slice(1),

            isAnimating:
              state.moveQueue.length > 1,

            solutionPlaying: false,

            animationAction: "normal",
          };
        }

        if (action === "undo") {
          const history = [
            ...state.history,
          ];

          const originalMove =
            history.pop();

          if (!originalMove) {
            return {
              moveQueue: [],
              isAnimating: false,
              animationAction: "normal",
            };
          }

          return {
            physicalCube:
              nextPhysical,

            cube:
              nextCube,

            history,

            redoStack: [
              ...state.redoStack,
              originalMove,
            ],

            solution: [],
            currentStep: 0,

            moveQueue: [],

            isAnimating: false,

            solutionPlaying: false,

            animationAction: "normal",
          };
        }

        if (action === "redo") {
          const redoStack = [
            ...state.redoStack,
          ];

          const originalMove =
            redoStack.pop();

          if (!originalMove) {
            return {
              moveQueue: [],
              isAnimating: false,
              animationAction: "normal",
            };
          }

          return {
            physicalCube:
              nextPhysical,

            cube:
              nextCube,

            history: [
              ...state.history,
              originalMove,
            ],

            redoStack,

            solution: [],
            currentStep: 0,

            moveQueue: [],

            isAnimating: false,

            solutionPlaying: false,

            animationAction: "normal",
          };
        }

        if (action === "solution") {
          const nextStep =
            state.currentStep;

          if (
            state.solutionPlaying &&
            nextStep <
              state.solution.length
          ) {
            return {
              physicalCube:
                nextPhysical,

              cube:
                nextCube,

              moveQueue: [
                state.solution[nextStep],
              ],

              currentStep:
                nextStep + 1,

              isAnimating: true,

              solutionPlaying: true,

              animationAction: "solution",
            };
          }

          return {
            physicalCube:
              nextPhysical,

            cube:
              nextCube,

            moveQueue: [],

            isAnimating: false,

            solutionPlaying: false,

            animationAction: "normal",
          };
        }

        if (action === "scramble") {
          const remaining =
            state.moveQueue.slice(1);

          return {
            physicalCube:
              nextPhysical,

            cube:
              nextCube,

            history: [
              ...state.history,
              move,
            ],

            redoStack: [],

            solution: [],
            currentStep: 0,

            moveQueue: remaining,

            isAnimating:
              remaining.length > 0,

            solutionPlaying: false,

            animationAction:
              remaining.length > 0
                ? "scramble"
                : "normal",
          };
        }

        if (action === "reset") {
          const history = [
            ...state.history,
          ];

          history.pop();

          const remaining =
            state.moveQueue.slice(1);

          return {
            physicalCube:
              nextPhysical,

            cube:
              nextCube,

            history,

            redoStack: [],

            solution: [],
            currentStep: 0,

            moveQueue: remaining,

            isAnimating:
              remaining.length > 0,

            solutionPlaying: false,

            animationAction:
              remaining.length > 0
                ? "reset"
                : "normal",
          };
        }

        const remaining =
          state.moveQueue.slice(1);

        return {
          physicalCube:
            nextPhysical,

          cube:
            nextCube,

          history: [
            ...state.history,
            move,
          ],

          redoStack: [],

          solution: [],
          currentStep: 0,

          moveQueue: remaining,

          isAnimating:
            remaining.length > 0,

          solutionPlaying: false,

          animationAction: "normal",
        };
      });
    },

    scramble: () => {
      const state = get();

      if (state.isAnimating) {
        return;
      }

      const moves =
        generateScramble();

      if (!moves.length) {
        return;
      }

      set({
        moveQueue: moves,
        isAnimating: true,

        redoStack: [],

        solution: [],
        currentStep: 0,

        solutionPlaying: false,

        animationAction: "scramble",
      });
    },

    reset: () => {
      const state = get();

      if (state.isAnimating) {
        return;
      }

      if (!state.history.length) {
        set({
          physicalCube:
            createPhysicalCube(),

          cube:
            createSolvedCube(),

          redoStack: [],

          solution: [],
          currentStep: 0,

          moveQueue: [],

          isAnimating: false,

          solutionPlaying: false,

          animationAction: "normal",
        });

        return;
      }

      const resetMoves =
        [...state.history]
          .reverse()
          .map(inverseMove);

      set({
        moveQueue: resetMoves,

        isAnimating: true,

        redoStack: [],

        solution: [],
        currentStep: 0,

        solutionPlaying: false,

        animationAction: "reset",
      });
    },

    undo: () => {
      const state = get();

      if (
        state.isAnimating ||
        state.history.length === 0
      ) {
        return;
      }

      const move =
        state.history.at(-1);

      if (!move) {
        return;
      }

      set({
        moveQueue: [
          inverseMove(move),
        ],

        isAnimating: true,

        solution: [],
        currentStep: 0,

        solutionPlaying: false,

        animationAction: "undo",
      });
    },

    redo: () => {
      const state = get();

      if (
        state.isAnimating ||
        state.redoStack.length === 0
      ) {
        return;
      }

      const move =
        state.redoStack.at(-1);

      if (!move) {
        return;
      }

      set({
        moveQueue: [move],

        isAnimating: true,

        solution: [],
        currentStep: 0,

        solutionPlaying: false,

        animationAction: "redo",
      });
    },

    generateSolution: () => {
      const state = get();

      if (state.isAnimating) {
        return;
      }

      const solution =
        solveCube(
          state.cube,
          state.history
        );

      set({
        solution,

        currentStep: 0,

        moveQueue: [],

        isAnimating: false,

        solutionPlaying: false,

        animationAction: "normal",
      });
    },

    nextStep: () => {
      const state = get();

      if (
        state.isAnimating ||
        state.currentStep >=
          state.solution.length
      ) {
        return;
      }

      const move =
        state.solution[
          state.currentStep
        ];

      set({
        moveQueue: [move],

        currentStep:
          state.currentStep + 1,

        isAnimating: true,

        solutionPlaying: false,

        animationAction: "solution",
      });
    },

    playSolution: () => {
      const state = get();

      if (
        state.isAnimating ||
        state.currentStep >=
          state.solution.length
      ) {
        return;
      }

      const move =
        state.solution[
          state.currentStep
        ];

      set({
        moveQueue: [move],

        currentStep:
          state.currentStep + 1,

        isAnimating: true,

        solutionPlaying: true,

        animationAction: "solution",
      });
    },

    pauseSolution: () => {
      set({
        solutionPlaying: false,
      });
    },

    previousStep: () => {
      const state = get();

      if (
        state.isAnimating ||
        state.currentStep <= 0
      ) {
        return;
      }

      const previousStep =
        state.currentStep - 1;

      const physical =
        physicalAtSolutionStep(
          state.history,
          state.solution,
          previousStep
        );

      set({
        physicalCube: physical,

        cube:
          physicalCubeToState(
            physical
          ),

        currentStep:
          previousStep,

        moveQueue: [],

        isAnimating: false,

        solutionPlaying: false,

        animationAction: "normal",
      });
    },

    restartSolution: () => {
      const state = get();

      if (state.isAnimating) {
        return;
      }

      const physical =
        physicalFromHistory(
          state.history
        );

      set({
        physicalCube: physical,

        cube:
          physicalCubeToState(
            physical
          ),

        currentStep: 0,

        moveQueue: [],

        isAnimating: false,

        solutionPlaying: false,

        animationAction: "normal",
      });
    },
  }));