/**
 * Canonical BenchmarkId type used for model score keys.
 * These are slug-style IDs matching models.json score keys.
 */
export type BenchmarkId =
  | "intelligence_index"
  | "coding_index"
  | "agentic_index";

export interface Benchmark {
  id: BenchmarkId;
  name: string;
  /** Score format hint for rendering */
  scoreFormat: "index" | "elo" | "mt-bench";
  description: string;
}

export const benchmarks: Benchmark[] = [
  {
    id: "intelligence_index",
    name: "Intelligence",
    scoreFormat: "index",
    description: "Overall reasoning & knowledge (Artificial Analysis)"
  },
  {
    id: "coding_index",
    name: "Coding",
    scoreFormat: "index",
    description: "Coding capability (Artificial Analysis)"
  },
  {
    id: "agentic_index",
    name: "Agentic",
    scoreFormat: "index",
    description: "Agent & automation tasks (Artificial Analysis)"
  },
];
