import type { SpkCriterionType, TopsisDetails } from "../../types/spk";
import { normalizeWeights } from "./validation";

export interface TopsisInput {
  matrix: number[][]; // m alternatives x n criteria
  weights: number[]; // n
  types: SpkCriterionType[]; // n
}

export interface TopsisOutput {
  scores: number[]; // m
  details: TopsisDetails;
}

function colNorms(matrix: number[][], n: number): number[] {
  const norms: number[] = [];
  for (let j = 0; j < n; j++) {
    let sumSq = 0;
    for (let i = 0; i < matrix.length; i++) {
      const v = matrix[i]?.[j] ?? 0;
      sumSq += v * v;
    }
    norms.push(Math.sqrt(sumSq));
  }
  return norms;
}

export function computeTopsis({ matrix, weights, types }: TopsisInput): TopsisOutput {
  const m = matrix.length;
  const n = weights.length;
  const w = normalizeWeights(weights);

  const norms = colNorms(matrix, n);

  const normalized: number[][] = [];
  for (let i = 0; i < m; i++) {
    const row = matrix[i] ?? [];
    const normRow: number[] = [];
    for (let j = 0; j < n; j++) {
      const denom = norms[j] ?? 0;
      const x = Number.isFinite(row[j]) ? row[j] : 0;
      normRow.push(denom > 0 ? x / denom : 0);
    }
    normalized.push(normRow);
  }

  const weighted: number[][] = normalized.map((row) => row.map((v, j) => v * (w[j] ?? 0)));

  const idealBest: number[] = [];
  const idealWorst: number[] = [];
  for (let j = 0; j < n; j++) {
    const col = weighted.map((row) => row[j] ?? 0);
    const mx = Math.max(...col);
    const mn = Math.min(...col);
    if (types[j] === "cost") {
      idealBest.push(mn);
      idealWorst.push(mx);
    } else {
      idealBest.push(mx);
      idealWorst.push(mn);
    }
  }

  const distanceBest: number[] = [];
  const distanceWorst: number[] = [];
  for (let i = 0; i < m; i++) {
    let dPlus = 0;
    let dMinus = 0;
    for (let j = 0; j < n; j++) {
      const v = weighted[i]?.[j] ?? 0;
      const dp = v - (idealBest[j] ?? 0);
      const dm = v - (idealWorst[j] ?? 0);
      dPlus += dp * dp;
      dMinus += dm * dm;
    }
    distanceBest.push(Math.sqrt(dPlus));
    distanceWorst.push(Math.sqrt(dMinus));
  }

  const scores = distanceBest.map((dPlus, i) => {
    const dMinus = distanceWorst[i] ?? 0;
    const denom = dPlus + dMinus;
    return denom > 0 ? dMinus / denom : 0;
  });

  return {
    scores,
    details: { normalized, weighted, idealBest, idealWorst, distanceBest, distanceWorst },
  };
}

