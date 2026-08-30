import { Move } from "@/types/cube";

const faces = ["U", "D", "L", "R", "F", "B"];

const modifiers = ["", "'", "2"];

export function generateScramble(
  length = 20
): Move[] {
  const result: Move[] = [];
  let previous = "";

  while (result.length < length) {
    const face =
      faces[Math.floor(Math.random() * faces.length)];

    if (face === previous) continue;

    const modifier =
      modifiers[
        Math.floor(Math.random() * modifiers.length)
      ];

    result.push(`${face}${modifier}` as Move);
    previous = face;
  }

  return result;
}