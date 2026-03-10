import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load current models
const modelsPath = path.join(process.cwd(), 'src', 'data', 'models.json');
const modelsData = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));

// Scrape results from subagents
const scrapeResults = {
  // OpenAI models
  "openai/gpt-5.4-pro": {
    "intelligence_index": null,
    "coding_index": null,
    "agentic_index": null,
    "gpqa": null,
    "hle": null,
    "scicode": null,
    "ifbench": null,
    "lcr": null,
    "terminalbench_hard": null,
    "gdpval": null,
    "omniscience_accuracy": null,
    "omniscience_non_hallucination": null,
    "critpt": 0.3,
    "latency_p50": 131566,
    "latency_p75": 262752,
    "latency_p90": 393323,
    "latency_p95": 472648,
    "latency_p99": 914384.8,
    "throughput_p50": 13,
    "throughput_p75": 21,
    "throughput_p90": 27,
    "throughput_p95": 32,
    "throughput_p99": 39.6,
    "_sources": ["openrouter-benchmarks", "openrouter-stats"]
  },
  "openai/o3": {
    "intelligence_index": 38.4,
    "coding_index": 38.4,
    "agentic_index": 36.1,
    "gpqa": 0.827,
    "hle": 0.2,
    "scicode": 0.41,
    "ifbench": 0.714,
    "lcr": 0.693,
    "terminalbench_hard": 0.371,
    "gdpval": 0.129,
    "omniscience_accuracy": 0.384,
    "omniscience_non_hallucination": 0.129,
    "critpt": 0.011,
    "_sources": ["openrouter-benchmarks"]
  },
  "openai/o3-pro": {
    "gpqa": 0.845,
    "_sources": ["openrouter-benchmarks"]
  },
  "openai/o4-mini": {
    "intelligence_index": 33.1,
    "coding_index": 25.6,
    "agentic_index": 36.1,
    "gpqa": 0.784,
    "hle": 0.175,
    "scicode": 0.465,
    "ifbench": 0.687,
    "lcr": 0.55,
    "terminalbench_hard": 0.152,
    "gdpval": 0.258,
    "omniscience_accuracy": 0.246,
    "omniscience_non_hallucination": 0.199,
    "critpt": 0.006,
    "_sources": ["openrouter-benchmarks"]
  },
  "openai/chatgpt-4o-latest": {
    "gpqa": 0.511,
    "hle": 0.037,
    "scicode": 0.334,
    "lcr": 0.53,
    "_sources": ["openrouter-benchmarks"]
  },
  // Meta-LLaMA models
  "meta-llama/llama-4-maverick": {
    "intelligence_index": 18.4,
    "coding_index": 15.6,
    "agentic_index": 7.2,
    "gpqa": 0.671,
    "hle": 0.048,
    "scicode": 0.331,
    "ifbench": 0.43,
    "lcr": 0.46,
    "terminalbench_hard": 0.068,
    "omniscience_accuracy": 0.243,
    "omniscience_non_hallucination": 0.127,
    "critpt": 0,
    "intelligence_percentile": 40,
    "coding_percentile": 47,
    "agentic_percentile": 23,
    "_sources": ["openrouter-benchmarks"]
  },
  "meta-llama/llama-guard-4-12b": {
    "latency_p50": 182,
    "latency_p75": 214,
    "latency_p90": 265,
    "latency_p95": 301.9,
    "latency_p99": 580.58,
    "throughput_p50": 15,
    "throughput_p75": 23,
    "throughput_p90": 25,
    "throughput_p95": 26,
    "throughput_p99": 29,
    "_sources": ["openrouter-stats"]
  },
  // DeepSeek models
  "deepseek/deepseek-v3.2": {
    "intelligence_index": 34.8,
    "coding_index": 33.2,
    "agentic_index": 32.1,
    "intelligence_percentile": 90,
    "coding_percentile": 90,
    "agentic_percentile": 90,
    "_sources": ["openrouter-benchmarks"]
  },
  "deepseek/deepseek-v3.2-speciale": {
    "coding_index": 35.8,
    "coding_percentile": 91,
    "_sources": ["openrouter-benchmarks"]
  },
  // MoonshotAI models
  "moonshotai/kimi-k2.5": {
    "intelligence_index": 48.2,
    "coding_index": 46.5,
    "agentic_index": 52.3,
    "intelligence_percentile": 96,
    "coding_percentile": 94,
    "agentic_percentile": 95,
    "_sources": ["openrouter-benchmarks"]
  },
  "moonshotai/kimi-k2-thinking": {
    "intelligence_index": 42.1,
    "coding_index": 38.9,
    "agentic_index": 45.2,
    "intelligence_percentile": 88,
    "coding_percentile": 85,
    "agentic_percentile": 87,
    "_sources": ["openrouter-benchmarks"]
  }
};

let updatedCount = 0;
const updatedModels = [];
const fieldsFilled = {};

// Merge data
modelsData.models.forEach(model => {
  const updates = scrapeResults[model.slug];
  if (updates) {
    let modelUpdated = false;
    const modelFields = [];
    
    Object.keys(updates).forEach(key => {
      if (key === '_sources') return;
      
      // Only update if current value is null and new value exists
      if (model[key] === null && updates[key] !== null && updates[key] !== undefined) {
        model[key] = updates[key];
        modelUpdated = true;
        modelFields.push(`${key}=${updates[key]}`);
      }
    });
    
    if (modelUpdated) {
      model.scrapedAt = new Date().toISOString();
      model._source = updates._sources ? updates._sources[0] : 'openrouter-benchmarks';
      updatedCount++;
      updatedModels.push(model.slug);
      fieldsFilled[model.slug] = modelFields;
    }
  }
});

// Update metadata
modelsData.lastUpdated = new Date().toISOString();

// Write updated file
fs.writeFileSync(modelsPath, JSON.stringify(modelsData, null, 2));

console.log(`✅ Merge complete!`);
console.log(`Updated ${updatedCount} models with new data`);
console.log(`\nUpdated models:`);
updatedModels.forEach(slug => {
  console.log(`  - ${slug}: ${fieldsFilled[slug].join(', ')}`);
});
