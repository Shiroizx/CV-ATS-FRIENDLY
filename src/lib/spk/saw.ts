import type { SpkCriterionType } from "../../types/spk";
import { normalizeWeights } from "./validation";

export interface SawInput {
  matrix: number[][]; // m alternatives x n criteria
  weights: number[]; // n
  types: SpkCriterionType[]; // n
}

export interface SawOutput {
  scores: number[]; // m
  normalized: number[][]; // m x n
}

export function computeSaw({ matrix, weights, types }: SawInput): SawOutput {
  const m = matrix.length;
  const n = weights.length;
  const w = normalizeWeights(weights);

  const colMax = Array.from({ length: n }, (_, j) =>
    Math.max(...matrix.map((row) => Number.isFinite(row[j]) ? row[j] : 0))
  );
  const colMin = Array.from({ length: n }, (_, j) => {
    const vals = matrix.map((row) => (Number.isFinite(row[j]) ? row[j] : 0));
    return Math.min(...vals);
  });

  const normalized: number[][] = [];
  for (let i = 0; i < m; i++) {
    const row = matrix[i] ?? [];
    const normRow: number[] = [];
    for (let j = 0; j < n; j++) {
      const x = Number.isFinite(row[j]) ? row[j] : 0;
      if (types[j] === "cost") {
        const mn = colMin[j] ?? 0;
        normRow.push(x > 0 ? mn / x : 0);
      } else {
        const mx = colMax[j] ?? 0;
        normRow.push(mx > 0 ? x / mx : 0);
      }
    }
    normalized.push(normRow);
  }

  const scores = normalized.map((row) => row.reduce((acc, v, j) => acc + v * (w[j] ?? 0), 0));
  return { scores, normalized };
}

