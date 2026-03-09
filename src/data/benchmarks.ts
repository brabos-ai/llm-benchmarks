/**
 * Canonical BenchmarkId type used for model score keys.
 * These are slug-style IDs matching models.json score keys.
 */
export type BenchmarkId =
  | "swe-bench"
  | "humaneval"
  | "mmlu"
  | "gpqa"
  | "math"
  | "arena-elo"
  | "mt-bench"
  | "livecodebench"
  | "ifeval"
  | "simpleqa"
  | "tau-bench"
  | "gaia"
  | "webarena"
  | "agentbench";

/** Matches CategoryId from home.ts (duplicated here to avoid circular dep) */
type CategoryIdLocal = "all" | "agentic" | "multiagent" | "coding" | "general" | "reasoning";

export interface Benchmark {
  id: BenchmarkId;
  name: string;
  categories: Exclude<CategoryIdLocal, "all">[];
  descriptionKey: string;
  whatKey: string;
  relevanceScores: Record<Exclude<CategoryIdLocal, "all">, number>;
  tagKeys: string[];
  /** Score format hint for rendering */
  scoreFormat: "percent" | "elo" | "mt-bench";
}

export const benchmarks: Benchmark[] = [
  {
    id: "swe-bench",
    name: "SWE-bench",
    categories: ["agentic", "coding"],
    descriptionKey: "sweBenchDesc",
    whatKey: "sweBenchWhat",
    relevanceScores: { agentic: 5, multiagent: 3, coding: 5, general: 1, reasoning: 2 },
    tagKeys: ["tagAgentic", "tagCoding"],
    scoreFormat: "percent"
  },
  {
    id: "humaneval",
    name: "HumanEval / MBPP",
    categories: ["coding"],
    descriptionKey: "humanEvalDesc",
    whatKey: "humanEvalWhat",
    relevanceScores: { agentic: 1, multiagent: 0, coding: 4, general: 1, reasoning: 2 },
    tagKeys: ["tagCoding"],
    scoreFormat: "percent"
  },
  {
    id: "mmlu",
    name: "MMLU",
    categories: ["general"],
    descriptionKey: "mmluDesc",
    whatKey: "mmluWhat",
    relevanceScores: { agentic: 0, multiagent: 0, coding: 1, general: 5, reasoning: 2 },
    tagKeys: ["tagGeneral"],
    scoreFormat: "percent"
  },
  {
    id: "gpqa",
    name: "GPQA (Diamond)",
    categories: ["reasoning"],
    descriptionKey: "gpqaDesc",
    whatKey: "gpqaWhat",
    relevanceScores: { agentic: 0, multiagent: 0, coding: 1, general: 2, reasoning: 5 },
    tagKeys: ["tagReasoning"],
    scoreFormat: "percent"
  },
  {
    id: "math",
    name: "MATH / AIME",
    categories: ["reasoning"],
    descriptionKey: "mathDesc",
    whatKey: "mathWhat",
    relevanceScores: { agentic: 0, multiagent: 0, coding: 2, general: 1, reasoning: 5 },
    tagKeys: ["tagReasoning"],
    scoreFormat: "percent"
  },
  {
    id: "tau-bench",
    name: "TAU-bench",
    categories: ["agentic", "multiagent"],
    descriptionKey: "tauDesc",
    whatKey: "tauWhat",
    relevanceScores: { agentic: 5, multiagent: 4, coding: 1, general: 2, reasoning: 1 },
    tagKeys: ["tagAgentic", "tagMulti"],
    scoreFormat: "percent"
  },
  {
    id: "gaia",
    name: "GAIA",
    categories: ["agentic", "multiagent"],
    descriptionKey: "gaiaDesc",
    whatKey: "gaiaWhat",
    relevanceScores: { agentic: 4, multiagent: 5, coding: 2, general: 2, reasoning: 3 },
    tagKeys: ["tagAgentic", "tagMulti"],
    scoreFormat: "percent"
  },
  {
    id: "webarena",
    name: "WebArena",
    categories: ["agentic"],
    descriptionKey: "webArenaDesc",
    whatKey: "webArenaWhat",
    relevanceScores: { agentic: 5, multiagent: 2, coding: 1, general: 1, reasoning: 2 },
    tagKeys: ["tagAgentic"],
    scoreFormat: "percent"
  },
  {
    id: "arena-elo",
    name: "Chatbot Arena (LMSYS)",
    categories: ["general"],
    descriptionKey: "arenaDesc",
    whatKey: "arenaWhat",
    relevanceScores: { agentic: 2, multiagent: 1, coding: 2, general: 5, reasoning: 2 },
    tagKeys: ["tagGeneral"],
    scoreFormat: "elo"
  },
  {
    id: "mt-bench",
    name: "MT-Bench",
    categories: ["general"],
    descriptionKey: "mtBenchDesc",
    whatKey: "mtBenchWhat",
    relevanceScores: { agentic: 2, multiagent: 1, coding: 2, general: 4, reasoning: 2 },
    tagKeys: ["tagGeneral"],
    scoreFormat: "mt-bench"
  },
  {
    id: "livecodebench",
    name: "LiveCodeBench",
    categories: ["coding"],
    descriptionKey: "liveCodeDesc",
    whatKey: "liveCodeWhat",
    relevanceScores: { agentic: 1, multiagent: 0, coding: 5, general: 1, reasoning: 3 },
    tagKeys: ["tagCoding"],
    scoreFormat: "percent"
  },
  {
    id: "agentbench",
    name: "AgentBench",
    categories: ["multiagent"],
    descriptionKey: "agentBenchDesc",
    whatKey: "agentBenchWhat",
    relevanceScores: { agentic: 3, multiagent: 5, coding: 2, general: 1, reasoning: 1 },
    tagKeys: ["tagMulti"],
    scoreFormat: "percent"
  },
  {
    id: "ifeval",
    name: "IFEval",
    categories: ["general", "agentic"],
    descriptionKey: "ifEvalDesc",
    whatKey: "ifEvalWhat",
    relevanceScores: { agentic: 4, multiagent: 2, coding: 1, general: 4, reasoning: 1 },
    tagKeys: ["tagGeneral", "tagAgentic"],
    scoreFormat: "percent"
  },
  {
    id: "simpleqa",
    name: "SimpleQA",
    categories: ["general"],
    descriptionKey: "simpleQADesc",
    whatKey: "simpleQAWhat",
    relevanceScores: { agentic: 0, multiagent: 0, coding: 0, general: 3, reasoning: 1 },
    tagKeys: ["tagGeneral"],
    scoreFormat: "percent"
  }
];
