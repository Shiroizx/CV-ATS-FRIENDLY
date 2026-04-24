import type { AhpResult } from "../../types/spk";
import { ensureMatrixSize, enforceAhpReciprocal, normalizeWeights } from "./validation";

// Saaty Random Index (RI) untuk n=1..15 (n>15 jarang dipakai untuk tugas)
const RI_TABLE: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
  11: 1.51,
  12: 1.48,
  13: 1.56,
  14: 1.57,
  15: 1.59,
};

function geometricMean(row: number[]): number {
  const n = row.length;
  let sumLog = 0;
  for (const v of row) sumLog += Math.log(v);
  return Math.exp(sumLog / n);
}

function matVecMul(A: number[][], v: number[]): number[] {
  return A.map((row) => row.reduce((acc, aij, j) => acc + aij * (v[j] ?? 0), 0));
}

export function computeAhp(pairwiseInput: number[][], n: number): AhpResult {
  const sized = ensureMatrixSize(pairwiseInput, n, 1);
  const A = enforceAhpReciprocal(sized);

  // Weights via geometric mean method (robust, common for AHP implementations)
  const raw = A.map((row) => geometricMean(row));
  const weights = normalizeWeights(raw);

  // Consistency approximation: lambdaMax from (A*w)_i / w_i average
  const Aw = matVecMul(A, weights);
  const ratios = Aw.map((v, i) => (weights[i] > 0 ? v / weights[i] : 0));
  const lambdaMax = ratios.reduce((a, b) => a + b, 0) / n;

  const ci = n <= 2 ? 0 : (lambdaMax - n) / (n - 1);
  const ri = RI_TABLE[n] ?? 1.59;
  const cr = ri === 0 ? 0 : ci / ri;

  return { weights, lambdaMax, ci, ri, cr };
}

