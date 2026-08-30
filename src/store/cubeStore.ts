import { create } from "zustand";
import { CubeState, Move } from "@/types/cube";
import {
  cloneCube,
  createSolvedCube,
} from "@/lib/cube/cubeState";
import { applyMove } from "@/lib/cube/moves";
import { generateScramble } from "@/lib/cube/scramble";
import { solveCube } from "@/lib/solver/solver";

interface CubeStore {
  cube: CubeState;
  history: Move[];
  redoStack: Move[];
  solution: Move[];
  currentStep: number;
  moveQueue: Move[];
  isAnimating: boolean;
  solutionPlaying: boolean;

  applyMove: (move: Move) => void;
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
}

const getCubeAfterHistory = (
  history: Move[]
): CubeState => {
  let cube = createSolvedCube();

  for (const move of history) {
    cube = applyMove(cube, move);
  }

  return cube;
};

const getCubeAtSolutionStep = (
  history: Move[],
  solution: Move[],
  step: number
): CubeState => {
  let cube = getCubeAfterHistory(history);

  for (let i = 0; i < step; i++) {
    cube = applyMove(cube, solution[i]);
  }

  return cube;
};

export const useCubeStore = create<CubeStore>(
  (set, get) => ({
    cube: createSolvedCube(),
    history: [],
    redoStack: [],
    solution: [],
    currentStep: 0,
    moveQueue: [],
    isAnimating: false,
    solutionPlaying: false,

    applyMove: (move) => {
      set((state) => ({
        cube: applyMove(state.cube, move),
        history: [...state.history, move],
        redoStack: [],
        solution: [],
        currentStep: 0,
        moveQueue: [],
        isAnimating: false,
        solutionPlaying: false,
      }));
    },

    queueMove: (move) => {
      set((state) => {
        if (state.isAnimating) {
          return state;
        }

        return {
          moveQueue: [...state.moveQueue, move],
          isAnimating: true,
          solutionPlaying: false,
          solution: [],
          currentStep: 0,
        };
      });
    },

    finishMove: (move) => {
      set((state) => {
        const isSolutionMove =
          state.solutionPlaying;

        return {
          cube: applyMove(state.cube, move),
          history: isSolutionMove
            ? state.history
            : [...state.history, move],
          redoStack: isSolutionMove
            ? state.redoStack
            : [],
          moveQueue: state.moveQueue.slice(1),
          isAnimating:
            state.moveQueue.length > 1,
        };
      });
    },

    scramble: () => {
      const moves = generateScramble();

      set((state) => {
        let cube = cloneCube(state.cube);

        for (const move of moves) {
          cube = applyMove(cube, move);
        }

        return {
          cube,
          history: [
            ...state.history,
            ...moves,
          ],
          redoStack: [],
          solution: [],
          currentStep: 0,
          moveQueue: [],
          isAnimating: false,
          solutionPlaying: false,
        };
      });
    },

    reset: () => {
      set({
        cube: createSolvedCube(),
        history: [],
        redoStack: [],
        solution: [],
        currentStep: 0,
        moveQueue: [],
        isAnimating: false,
        solutionPlaying: false,
      });
    },

    undo: () => {
      const state = get();

      if (
        state.history.length === 0 ||
        state.isAnimating
      ) {
        return;
      }

      const history = [...state.history];
      const move = history.pop();

      if (!move) {
        return;
      }

      const cube =
        getCubeAfterHistory(history);

      set({
        cube,
        history,
        redoStack: [
          ...state.redoStack,
          move,
        ],
        solution: [],
        currentStep: 0,
        moveQueue: [],
        isAnimating: false,
        solutionPlaying: false,
      });
    },

    redo: () => {
      const state = get();

      if (state.isAnimating) {
        return;
      }

      const move =
        state.redoStack.at(-1);

      if (!move) {
        return;
      }

      const cube = applyMove(
        state.cube,
        move
      );

      set({
        cube,
        history: [
          ...state.history,
          move,
        ],
        redoStack:
          state.redoStack.slice(0, -1),
        solution: [],
        currentStep: 0,
        moveQueue: [],
        isAnimating: false,
        solutionPlaying: false,
      });
    },

    generateSolution: () => {
      const state = get();

      if (state.isAnimating) {
        return;
      }

      const solution = solveCube(
        state.cube,
        state.history
      );

      set({
        solution,
        currentStep: 0,
        moveQueue: [],
        isAnimating: false,
        solutionPlaying: false,
      });
    },

    nextStep: () => {
      const state = get();

      if (
        state.currentStep >=
          state.solution.length ||
        state.isAnimating
      ) {
        return;
      }

      const move =
        state.solution[state.currentStep];

      set({
        moveQueue: [
          ...state.moveQueue,
          move,
        ],
        currentStep:
          state.currentStep + 1,
        isAnimating: true,
        solutionPlaying: true,
      });
    },

    previousStep: () => {
      const state = get();

      if (
        state.currentStep <= 0 ||
        state.isAnimating
      ) {
        return;
      }

      const previousStep =
        state.currentStep - 1;

      const cube =
        getCubeAtSolutionStep(
          state.history,
          state.solution,
          previousStep
        );

      set({
        cube,
        currentStep: previousStep,
        moveQueue: [],
        isAnimating: false,
        solutionPlaying: true,
      });
    },

    restartSolution: () => {
      const state = get();

      if (state.isAnimating) {
        return;
      }

      const cube =
        getCubeAfterHistory(
          state.history
        );

      set({
        cube,
        currentStep: 0,
        moveQueue: [],
        isAnimating: false,
        solutionPlaying: true,
      });
    },
  })
);