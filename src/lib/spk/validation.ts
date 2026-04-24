export function clampNonNegative(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return n < 0 ? 0 : n;
}

export function parseNumber(input: unknown): number | null {
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const normalized = trimmed.replace(",", ".");
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

export function normalizeWeights(weights: number[]): number[] {
  const clean = weights.map((w) => (Number.isFinite(w) ? Math.max(0, w) : 0));
  const sum = clean.reduce((a, b) => a + b, 0);
  if (sum <= 0) return clean.map(() => 1 / clean.length);
  return clean.map((w) => w / sum);
}

export function ensureMatrixSize(matrix: number[][], n: number, fill = 1): number[][] {
  const next: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row = matrix[i] ?? [];
    const newRow: number[] = [];
    for (let j = 0; j < n; j++) {
      const v = row[j];
      newRow.push(Number.isFinite(v) && v > 0 ? v : fill);
    }
    next.push(newRow);
  }
  return next;
}

export function enforceAhpReciprocal(matrix: number[][]): number[][] {
  const n = matrix.length;
  const out = matrix.map((row) => row.slice());
  for (let i = 0; i < n; i++) {
    out[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      const v = out[i][j];
      const safe = Number.isFinite(v) && v > 0 ? v : 1;
      out[i][j] = safe;
      out[j][i] = 1 / safe;
    }
  }
  return out;
}
