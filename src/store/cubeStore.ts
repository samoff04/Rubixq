import { create } from "zustand";
import { CubeState, Move } from "@/types/cube";
import {
  cloneCube,
  createSolvedCube,
} from "@/lib/cube/cubeState";
import { applyMove } from "@/lib/cube/moves";
import { generateScramble } from "@/lib/cube/scramble";
import { solveCube } from "@/lib/solver/solver";

type AnimationAction =
  | "normal"
  | "undo"
  | "redo"
  | "solution";

interface CubeStore {
  cube: CubeState;
  history: Move[];
  redoStack: Move[];
  solution: Move[];
  currentStep: number;
  moveQueue: Move[];
  isAnimating: boolean;
  solutionPlaying: boolean;
  animationAction: AnimationAction;

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

const getInverseMove = (move: Move): Move => {
  if (move.endsWith("2")) {
    return move;
  }

  if (move.endsWith("'")) {
    return move[0] as Move;
  }

  return `${move[0]}'` as Move;
};

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
    animationAction: "normal",

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
        animationAction: "normal",
      }));
    },

    queueMove: (move) => {
      set((state) => {
        if (state.isAnimating) {
          return state;
        }

        return {
          moveQueue: [move],
          isAnimating: true,
          solutionPlaying: false,
          solution: [],
          currentStep: 0,
          animationAction: "normal",
        };
      });
    },

    finishMove: (move) => {
      set((state) => {
        const action = state.animationAction;

        if (action === "undo") {
          const history = [...state.history];
          const originalMove = history.pop();

          if (!originalMove) {
            return {
              moveQueue: [],
              isAnimating: false,
              animationAction: "normal",
            };
          }

          return {
            cube: applyMove(state.cube, move),
            history,
            redoStack: [
              ...state.redoStack,
              originalMove,
            ],
            solution: [],
            currentStep: 0,
            moveQueue: state.moveQueue.slice(1),
            isAnimating:
              state.moveQueue.length > 1,
            solutionPlaying: false,
            animationAction:
              state.moveQueue.length > 1
                ? action
                : "normal",
          };
        }

        if (action === "redo") {
          const redoStack = [...state.redoStack];
          const originalMove = redoStack.pop();

          if (!originalMove) {
            return {
              moveQueue: [],
              isAnimating: false,
              animationAction: "normal",
            };
          }

          return {
            cube: applyMove(state.cube, move),
            history: [
              ...state.history,
              originalMove,
            ],
            redoStack,
            solution: [],
            currentStep: 0,
            moveQueue: state.moveQueue.slice(1),
            isAnimating:
              state.moveQueue.length > 1,
            solutionPlaying: false,
            animationAction:
              state.moveQueue.length > 1
                ? action
                : "normal",
          };
        }

        if (action === "solution") {
          return {
            cube: applyMove(state.cube, move),
            history: state.history,
            redoStack: state.redoStack,
            moveQueue: state.moveQueue.slice(1),
            isAnimating:
              state.moveQueue.length > 1,
            solutionPlaying: true,
            animationAction:
              state.moveQueue.length > 1
                ? action
                : "normal",
          };
        }

        return {
          cube: applyMove(state.cube, move),
          history: [...state.history, move],
          redoStack: [],
          moveQueue: state.moveQueue.slice(1),
          isAnimating:
            state.moveQueue.length > 1,
          solutionPlaying: false,
          animationAction:
            state.moveQueue.length > 1
              ? action
              : "normal",
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
          animationAction: "normal",
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
        animationAction: "normal",
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

      const move = state.history.at(-1);

      if (!move) {
        return;
      }

      const inverseMove = getInverseMove(move);

      set({
        moveQueue: [inverseMove],
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
        state.redoStack.length === 0 ||
        state.isAnimating
      ) {
        return;
      }

      const move = state.redoStack.at(-1);

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
        animationAction: "normal",
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
        moveQueue: [move],
        currentStep:
          state.currentStep + 1,
        isAnimating: true,
        solutionPlaying: true,
        animationAction: "solution",
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
        animationAction: "solution",
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
        animationAction: "solution",
      });
    },
  })
);