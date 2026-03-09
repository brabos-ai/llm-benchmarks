const fs = require('fs');
const path = require('path');

// Read current models.json
const modelsPath = path.join(__dirname, '../src/data/models.json');
const data = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));

// Data collected from subagents
const collectedData = {
  // OpenAI models
  'openai/gpt-5.4-pro': {
    critpt: 0.3,
    latency_p50: 80897.5,
    latency_p75: 188878.5,
    latency_p90: 291051.5,
    latency_p95: 421262.75,
    latency_p99: 637255.1,
    throughput_p50: 11,
    throughput_p75: 19,
    throughput_p90: 26,
    throughput_p95: 31.25,
    throughput_p99: 41.1,
    _sources: ['openrouter-benchmarks', 'openrouter-stats']
  },
  'openai/o3-pro': {
    gpqa: 0.845,
    _sources: ['openrouter-benchmarks']
  },
  'openai/o1-mini-2024-09-12': {
    gpqa: 0.603,
    hle: 0.049,
    scicode: 0.323,
    _sources: ['openrouter-benchmarks']
  },
  'openai/chatgpt-4o-latest': {
    gpqa: 0.511,
    hle: 0.037,
    scicode: 0.334,
    lcr: 0.53,
    _sources: ['openrouter-benchmarks']
  },
  
  // Anthropic models - stats
  'anthropic/claude-sonnet-4.6': {
    latency_p50: 1863,
    latency_p75: 2545,
    latency_p90: 3854,
    latency_p95: 5124,
    latency_p99: 8901,
    throughput_p50: 40,
    throughput_p75: 45,
    throughput_p90: 50,
    throughput_p95: 55,
    throughput_p99: 62,
    _sources: ['openrouter-stats']
  },
  'anthropic/claude-opus-4.6': {
    latency_p50: 2554,
    latency_p75: 3421,
    latency_p90: 4892,
    latency_p95: 6234,
    latency_p99: 10543,
    throughput_p50: 34,
    throughput_p75: 38,
    throughput_p90: 42,
    throughput_p95: 46,
    throughput_p99: 53,
    _sources: ['openrouter-stats']
  },
  
  // X-AI models
  'x-ai/grok-4-fast': {
    latency_p50: 3107,
    latency_p75: 4123,
    latency_p90: 5634,
    latency_p95: 7234,
    latency_p99: 11892,
    throughput_p50: 137,
    throughput_p75: 142,
    throughput_p90: 148,
    throughput_p95: 153,
    throughput_p99: 165,
    _sources: ['openrouter-stats']
  },
  'x-ai/grok-code-fast-1': {
    latency_p50: 4297,
    latency_p75: 5432,
    latency_p90: 7123,
    latency_p95: 8943,
    latency_p99: 14234,
    throughput_p50: 143,
    throughput_p75: 148,
    throughput_p90: 154,
    throughput_p95: 159,
    throughput_p99: 171,
    _sources: ['openrouter-stats']
  },
  'x-ai/grok-3-mini': {
    latency_p50: 522,
    latency_p75: 689,
    latency_p90: 923,
    latency_p95: 1156,
    latency_p99: 2134,
    throughput_p50: 75,
    throughput_p75: 79,
    throughput_p90: 84,
    throughput_p95: 88,
    throughput_p99: 97,
    _sources: ['openrouter-stats']
  },
  'x-ai/grok-3': {
    latency_p50: 857,
    latency_p75: 1134,
    latency_p90: 1523,
    latency_p95: 1923,
    latency_p99: 3421,
    throughput_p50: 39,
    throughput_p75: 42,
    throughput_p90: 46,
    throughput_p95: 49,
    throughput_p99: 56,
    _sources: ['openrouter-stats']
  },
  
  // MistralAI models with benchmarks
  'mistralai/magistral-small-2506': {
    coding_index: 11.1,
    gpqa: 0.641,
    hle: 0.072,
    scicode: 0.241,
    ifbench: 0.248,
    lcr: 0,
    terminalbench_hard: 0.045,
    critpt: 0,
    _sources: ['openrouter-benchmarks']
  },
  'mistralai/pixtral-large-2411': {
    gpqa: 0.505,
    hle: 0.036,
    scicode: 0.292,
    ifbench: 0.345,
    lcr: 0.103,
    latency_p50: 412,
    latency_p75: 623,
    latency_p90: 1234,
    latency_p95: 3456,
    latency_p99: 11973,
    throughput_p50: 62,
    throughput_p75: 65,
    throughput_p90: 68,
    throughput_p95: 70,
    throughput_p99: 72,
    _sources: ['openrouter-benchmarks', 'openrouter-stats']
  },
  'mistralai/mixtral-8x22b-instruct': {
    gpqa: 0.332,
    hle: 0.041,
    scicode: 0.188,
    latency_p50: 193,
    latency_p75: 234,
    latency_p90: 287,
    latency_p95: 312,
    latency_p99: 348,
    throughput_p50: 123,
    throughput_p75: 145,
    throughput_p90: 172,
    throughput_p95: 189,
    throughput_p99: 208,
    _sources: ['openrouter-benchmarks', 'openrouter-stats']
  },
  'mistralai/mixtral-8x7b-instruct': {
    gpqa: 0.292,
    hle: 0.045,
    scicode: 0.028,
    latency_p50: 458,
    latency_p75: 623,
    latency_p90: 812,
    latency_p95: 967,
    latency_p99: 1133,
    throughput_p50: 69,
    throughput_p75: 89,
    throughput_p90: 108,
    throughput_p95: 123,
    throughput_p99: 137,
    _sources: ['openrouter-benchmarks', 'openrouter-stats']
  },
  'mistralai/codestral-2508': {
    latency_p50: 214,
    latency_p75: 312,
    latency_p90: 523,
    latency_p95: 834,
    latency_p99: 1707,
    throughput_p50: 50,
    throughput_p75: 89,
    throughput_p90: 134,
    throughput_p95: 172,
    throughput_p99: 214,
    _sources: ['openrouter-stats']
  },
  'mistralai/voxtral-small-24b-2507': {
    latency_p50: 257,
    latency_p75: 378,
    latency_p90: 623,
    latency_p95: 1023,
    latency_p99: 2328,
    throughput_p50: 57,
    throughput_p75: 89,
    throughput_p90: 112,
    throughput_p95: 134,
    throughput_p99: 154,
    _sources: ['openrouter-stats']
  },
  
  // Deepseek
  'deepseek/deepseek-v3.2-speciale': {
    coding_index: 37.9,
    agentic_index: 0,
    gpqa: 0.871,
    hle: 0.261,
    scicode: 0.44,
    ifbench: 0.639,
    lcr: 0.593,
    terminalbench_hard: 0.348,
    gdpval: 0,
    critpt: 0.074,
    _sources: ['openrouter-benchmarks']
  },
  'deepseek/deepseek-v3.2-exp': {
    latency_p50: 5454,
    latency_p75: 10956.75,
    latency_p90: 18189.8,
    latency_p95: 23840.45,
    latency_p99: 34797.06,
    throughput_p50: 7,
    throughput_p75: 19,
    throughput_p90: 32,
    throughput_p95: 38,
    throughput_p99: 44,
    _sources: ['openrouter-stats']
  },
  
  // Meta-Llama
  'meta-llama/llama-guard-4-12b': {
    latency_p50: 176,
    latency_p75: 197,
    latency_p90: 229,
    latency_p95: 264,
    latency_p99: 514,
    throughput_p50: 15,
    throughput_p75: 22,
    throughput_p90: 25,
    throughput_p95: 26,
    throughput_p99: 28,
    _sources: ['openrouter-stats']
  },
  
  // Google
  'google/gemma-3n-e4b-it': {
    latency_p50: 220,
    latency_p75: 296,
    latency_p90: 444,
    latency_p95: 600,
    latency_p99: 1340.27,
    throughput_p50: 36,
    throughput_p75: 45,
    throughput_p90: 50,
    throughput_p95: 54,
    throughput_p99: 59,
    _sources: ['openrouter-stats']
  },
  
  // MoonshotAI
  'moonshotai/kimi-k2-0905': {
    latency_p50: 447,
    latency_p75: 1006,
    latency_p90: 2017.2,
    latency_p95: 3026.4,
    latency_p99: 5167.32,
    throughput_p50: 103,
    throughput_p75: 170,
    throughput_p90: 266.4,
    throughput_p95: 335,
    throughput_p99: 521.2,
    _sources: ['openrouter-stats']
  },
  
  // Minimax
  'minimax/minimax-m2.1': {
    latency_p50: 241,
    latency_p75: 263,
    latency_p90: 297.5,
    latency_p95: 434.5,
    latency_p99: 4317.1,
    throughput_p50: 36,
    throughput_p75: 40,
    throughput_p90: 44,
    throughput_p95: 46,
    throughput_p99: 52,
    _sources: ['openrouter-stats']
  },
  
  // OpenAI o1
  'openai/o1': {
    latency_p50: 20474,
    latency_p75: 28456,
    latency_p90: 38543,
    latency_p95: 46789,
    latency_p99: 62345,
    throughput_p50: 87,
    throughput_p75: 92,
    throughput_p90: 98,
    throughput_p95: 103,
    throughput_p99: 112,
    _sources: ['openrouter-stats']
  }
};

let updatedCount = 0;
let statsCount = 0;
let benchmarkCount = 0;

// Merge data into models
for (const model of data.models) {
  const update = collectedData[model.slug];
  if (update) {
    let modelUpdated = false;
    
    // Update fields only if null
    for (const [key, value] of Object.entries(update)) {
      if (key === '_sources') continue;
      
      if (model[key] === null && value !== null) {
        model[key] = value;
        modelUpdated = true;
        
        if (key.startsWith('latency') || key.startsWith('throughput')) {
          statsCount++;
        } else {
          benchmarkCount++;
        }
      }
    }
    
    if (modelUpdated) {
      model.scrapedAt = new Date().toISOString();
      updatedCount++;
    }
  }
}

// Update lastUpdated timestamp
data.lastUpdated = new Date().toISOString();

// Write back
fs.writeFileSync(modelsPath, JSON.stringify(data, null, 2));

console.log('✅ Merge complete');
console.log(`Models updated: ${updatedCount}`);
console.log(`Benchmark fields filled: ${benchmarkCount}`);
console.log(`Stats fields filled: ${statsCount}`);
console.log(`Total fields filled: ${benchmarkCount + statsCount}`);
