export type SpkCriterionType = "benefit" | "cost";

export interface SpkCriterion {
  id: string;
  name: string;
  type: SpkCriterionType;
}

export interface SpkAlternative {
  id: string;
  name: string;
}

// scores[alternativeId][criterionId] = number
export type SpkScores = Record<string, Record<string, number>>;

export type SpkWeightMode = "ahp" | "manual";

export interface SpkState {
  criteria: SpkCriterion[];
  alternatives: SpkAlternative[];
  scores: SpkScores;
  weightMode: SpkWeightMode;
  // manualWeights[criterionId] = number (not necessarily normalized)
  manualWeights: Record<string, number>;
  // ahpPairwise[i][j] where i/j refer to criteria index
  ahpPairwise: number[][];
}

export interface AhpResult {
  weights: number[];
  lambdaMax: number;
  ci: number;
  ri: number;
  cr: number;
}

export interface TopsisDetails {
  normalized: number[][];
  weighted: number[][];
  idealBest: number[];
  idealWorst: number[];
  distanceBest: number[];
  distanceWorst: number[];
}

export interface SpkRankingRow {
  alternativeId: string;
  alternativeName: string;
  score: number;
  rank: number;
}

export interface SpkComputeOutput {
  method: "topsis" | "saw";
  ranking: SpkRankingRow[];
  weights: number[];
  details?: TopsisDetails;
}
