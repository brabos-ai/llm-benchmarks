#!/usr/bin/env node
/**
 * OpenRouter Scraper
 * 
 * Busca dados de modelos LLM da API OpenRouter e atualiza models.json
 * 
 * Usage:
 *   npm run scrape:openrouter
 *   npm run scrape:openrouter -- --provider=anthropic
 *   npm run scrape:openrouter -- --model=claude-opus-4
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENROUTER_BASE = 'https://openrouter.ai/api';
const PROVIDERS = [
  'anthropic',
  'openai', 
  'google',
  'x-ai',
  'deepseek',
  'moonshotai',
  'minimax',
  'meta-llama',
  'mistralai'
];

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const MODELS_FILE = path.join(DATA_DIR, 'models.json');

/**
 * Fetch JSON from OpenRouter API
 */
async function fetchJson(url, options = {}) {
  console.log(`Fetching: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'LLM-Benchmarks-Scraper/1.0',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${url}`);
  }
  
  return response.json();
}

/**
 * Fetch models from a specific provider
 */
async function fetchProviderModels(authorSlug) {
  try {
    const data = await fetchJson(
      `${OPENROUTER_BASE}/frontend/author-models?authorSlug=${authorSlug}`
    );
    
    return data.data?.models || [];
  } catch (error) {
    console.error(`Error fetching ${authorSlug}:`, error.message);
    return [];
  }
}

/**
 * Fetch benchmarks for a model
 */
async function fetchBenchmarks(slug) {
  try {
    const data = await fetchJson(
      `${OPENROUTER_BASE}/internal/v1/artificial-analysis-benchmarks?slug=${encodeURIComponent(slug)}`
    );
    
    if (!data.data || data.data.length === 0) {
      return null;
    }
    
    // Use first variant (usually the main one)
    const variant = data.data[0];
    const evals = variant.benchmark_data?.evaluations || {};
    const percentiles = variant.percentiles || {};
    
    return {
      intelligence_index: evals.artificial_analysis_intelligence_index || null,
      coding_index: evals.artificial_analysis_coding_index || null,
      agentic_index: evals.artificial_analysis_agentic_index || null,
      gpqa: evals.gpqa || null,
      hle: evals.hle || null,
      scicode: evals.scicode || null,
      ifbench: evals.ifbench || null,
      lcr: evals.lcr || null,
      terminalbench_hard: evals.terminalbench_hard || null,
      gdpval: evals.gdpval_aa || null,
      omniscience_accuracy: evals.aa_omniscience_accuracy || null,
      omniscience_non_hallucination: evals.aa_omniscience_non_hallucination_rate || null,
      critpt: evals.critpt || null,
      intelligence_percentile: percentiles.intelligence_percentile || null,
      coding_percentile: percentiles.coding_percentile || null,
      agentic_percentile: percentiles.agentic_percentile || null,
      _source: 'artificial-analysis',
      _variant: variant.aa_slug || 'default'
    };
  } catch (error) {
    console.error(`Error fetching benchmarks for ${slug}:`, error.message);
    return null;
  }
}

/**
 * Fetch stats (latency and throughput) for a model
 */
async function fetchStats(permaslug) {
  try {
    const data = await fetchJson(
      `${OPENROUTER_BASE}/frontend/stats/endpoint?permaslug=${encodeURIComponent(permaslug)}&variant=standard`
    );
    
    const stats = data.stats || {};
    
    return {
      latency_p50: stats.p50_latency || null,
      latency_p75: stats.p75_latency || null,
      latency_p90: stats.p90_latency || null,
      latency_p95: stats.p95_latency || null,
      latency_p99: stats.p99_latency || null,
      throughput_p50: stats.p50_throughput || null,
      throughput_p75: stats.p75_throughput || null,
      throughput_p90: stats.p90_throughput || null,
      throughput_p95: stats.p95_throughput || null,
      throughput_p99: stats.p99_throughput || null,
      _source: 'openrouter-stats'
    };
  } catch (error) {
    console.error(`Error fetching stats for ${permaslug}:`, error.message);
    return null;
  }
}

/**
 * Parse model data from author-models endpoint
 */
function parseModelData(model) {
  const endpoint = model.endpoint || {};
  const pricing = endpoint.pricing || {};
  
  return {
    id: model.slug?.replace(/\//g, '-'),
    slug: model.slug,
    name: model.name || model.short_name,
    provider: model.author,
    created_at: model.created_at,
    context_length: model.context_length || null,
    max_completion_tokens: endpoint.max_completion_tokens || null,
    input_modalities: model.input_modalities || [],
    output_modalities: model.output_modalities || [],
    supports_reasoning: model.supports_reasoning || false,
    supports_tool_parameters: endpoint.supports_tool_parameters || false,
    permaslug: model.permaslug || endpoint.model_variant_permaslug,
    pricing: {
      prompt: pricing.prompt ? parseFloat(pricing.prompt) : null,
      completion: pricing.completion ? parseFloat(pricing.completion) : null,
      input_cache_read: pricing.input_cache_read ? parseFloat(pricing.input_cache_read) : null,
      input_cache_write: pricing.input_cache_write ? parseFloat(pricing.input_cache_write) : null
    },
    isObsolete: false
  };
}

/**
 * Group models by family and keep only last 3
 */
function processModelFamilies(models) {
  // Group by provider/family
  const families = {};
  
  for (const model of models) {
    const provider = model.provider;
    const group = model.slug.split('/')[1]?.split(/[-.]/)[0] || 'default';
    const key = `${provider}/${group}`;
    
    if (!families[key]) {
      families[key] = [];
    }
    families[key].push(model);
  }
  
  // Process each family
  const processed = [];
  
  for (const [key, familyModels] of Object.entries(families)) {
    // Sort by created_at (newest first)
    familyModels.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });
    
    // Keep only last 3 as active
    familyModels.forEach((model, index) => {
      model.isObsolete = index >= 3;
      processed.push(model);
    });
  }
  
  return processed;
}

/**
 * Load existing models.json
 */
async function loadExistingModels() {
  try {
    const content = await fs.readFile(MODELS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { lastUpdated: null, models: [] };
  }
}

/**
 * Save models to JSON file
 */
async function saveModels(data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(MODELS_FILE, JSON.stringify(data, null, 2));
}

/**
 * Merge new data with existing, respecting fill-nulls-only rule
 */
function mergeModels(existing, newModels) {
  const existingMap = new Map(existing.models.map(m => [m.id, m]));
  const merged = [];
  const stats = {
    updated: 0,
    added: 0,
    unchanged: 0
  };
  
  for (const newModel of newModels) {
    const existingModel = existingMap.get(newModel.id);
    
    if (!existingModel) {
      // New model
      merged.push({
        ...newModel,
        scrapedAt: new Date().toISOString()
      });
      stats.added++;
    } else {
      // Merge existing with new (fill nulls only)
      const mergedModel = { ...existingModel };
      
      for (const [key, value] of Object.entries(newModel)) {
        if (key === 'id') continue;
        
        if (key === 'pricing') {
          // Merge pricing object
          if (!mergedModel.pricing) mergedModel.pricing = {};
          for (const [priceKey, priceValue] of Object.entries(value)) {
            if (mergedModel.pricing[priceKey] === null && priceValue !== null) {
              mergedModel.pricing[priceKey] = priceValue;
              stats.updated++;
            }
          }
        } else if (mergedModel[key] === null && value !== null) {
          mergedModel[key] = value;
          stats.updated++;
        }
      }
      
      mergedModel.scrapedAt = new Date().toISOString();
      merged.push(mergedModel);
      stats.unchanged++;
    }
  }
  
  return {
    lastUpdated: new Date().toISOString(),
    models: merged,
    stats
  };
}

/**
 * Main scraper function
 */
async function scrapeOpenRouter(options = {}) {
  console.log('🚀 Starting OpenRouter Scraper...\n');
  
  const startTime = Date.now();
  const providerFilter = options.provider;
  const modelFilter = options.model;
  
  // Determine which providers to fetch
  const providersToFetch = providerFilter 
    ? [providerFilter]
    : PROVIDERS;
  
  console.log(`Providers to fetch: ${providersToFetch.join(', ')}\n`);
  
  // Step 1: Fetch all models from providers
  console.log('📦 Step 1: Fetching models from providers...');
  const allModels = [];
  
  for (const provider of providersToFetch) {
    const models = await fetchProviderModels(provider);
    
    if (modelFilter) {
      // Filter specific model
      const filtered = models.filter(m => m.slug.includes(modelFilter));
      allModels.push(...filtered.map(parseModelData));
    } else {
      allModels.push(...models.map(parseModelData));
    }
    
    console.log(`  ✓ ${provider}: ${models.length} models`);
  }
  
  console.log(`\nTotal models: ${allModels.length}`);
  
  // Step 2: Process families (keep last 3)
  console.log('\n🏷️  Step 2: Processing model families...');
  const processedModels = processModelFamilies(allModels);
  const activeModels = processedModels.filter(m => !m.isObsolete);
  console.log(`  Active: ${activeModels.length}, Obsolete: ${processedModels.length - activeModels.length}`);
  
  // Step 3: Fetch benchmarks and stats
  console.log('\n📊 Step 3: Fetching benchmarks and stats...');
  const modelsWithData = [];
  
  for (let i = 0; i < activeModels.length; i++) {
    const model = activeModels[i];
    console.log(`  [${i + 1}/${activeModels.length}] ${model.slug}`);
    
    // Fetch benchmarks
    const benchmarks = await fetchBenchmarks(model.slug);
    if (benchmarks) {
      Object.assign(model, benchmarks);
    }
    
    // Fetch stats (latency/throughput)
    if (model.permaslug) {
      const stats = await fetchStats(model.permaslug);
      if (stats) {
        Object.assign(model, stats);
      }
    }

    // Build scores sub-object for UI components
    const existing = (await loadExistingModels()).models.find((m) => m.id === model.id);
    model.openrouterSlug = model.slug;
    model.scores = {
      intelligence_index: model.intelligence_index ?? null,
      coding_index:       model.coding_index ?? null,
      agentic_index:      model.agentic_index ?? null,
    };

    // Add delay to avoid rate limiting
    if (i < activeModels.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    modelsWithData.push(model);
  }
  
  // Step 4: Merge with existing data
  console.log('\n🔄 Step 4: Merging with existing data...');
  const existing = await loadExistingModels();
  const merged = mergeModels(existing, [...modelsWithData, ...processedModels.filter(m => m.isObsolete)]);
  
  console.log(`  Added: ${merged.stats.added}`);
  console.log(`  Updated: ${merged.stats.updated} fields`);
  console.log(`  Unchanged: ${merged.stats.unchanged}`);
  
  // Step 5: Save
  console.log('\n💾 Step 5: Saving to models.json...');
  await saveModels({
    lastUpdated: merged.lastUpdated,
    models: merged.models
  });
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Done! Duration: ${duration}s`);
  console.log(`📄 File: ${MODELS_FILE}`);
  console.log(`📊 Total models: ${merged.models.length}`);
  
  // Identify missing data
  const missingBenchmarksList = modelsWithData
    .filter(m => !m.intelligence_index)
    .map(m => ({ slug: m.slug, provider: m.provider }));
  
  const missingStatsList = modelsWithData
    .filter(m => !m.latency_p50)
    .map(m => ({ slug: m.slug, provider: m.provider, permaslug: m.permaslug }));
  
  // Log missing models
  if (missingBenchmarksList.length > 0) {
    console.log('\n📊 Models missing benchmarks:');
    missingBenchmarksList.forEach(m => console.log(`   - ${m.slug}`));
  }
  
  if (missingStatsList.length > 0) {
    console.log('\n⚡ Models missing stats:');
    missingStatsList.forEach(m => console.log(`   - ${m.slug}`));
  }
  
  // Return report for agent
  return {
    success: true,
    duration,
    modelsCount: merged.models.length,
    added: merged.stats.added,
    updated: merged.stats.updated,
    missingBenchmarks: missingBenchmarksList.length,
    missingStats: missingStatsList.length,
    missingBenchmarksList,
    missingStatsList
  };
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (const arg of args) {
    if (arg.startsWith('--provider=')) {
      options.provider = arg.split('=')[1];
    } else if (arg.startsWith('--model=')) {
      options.model = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
OpenRouter Scraper

Usage:
  npm run scrape:openrouter
  npm run scrape:openrouter -- --provider=anthropic
  npm run scrape:openrouter -- --model=claude-opus-4

Options:
  --provider=NAME    Scrape only specific provider
  --model=SLUG       Scrape only specific model
  --help, -h         Show this help
`);
      process.exit(0);
    }
  }
  
  try {
    const result = await scrapeOpenRouter(options);
    
    // Save report for agent
    const reportPath = path.join(DATA_DIR, 'scrape-report.json');
    await fs.writeFile(reportPath, JSON.stringify(result, null, 2));
    
    console.log(`\n📋 Report saved to: ${reportPath}`);
    
    // Exit with error if there are missing data
    if (result.missingBenchmarks > 0 || result.missingStats > 0) {
      console.log(`\n⚠️  Missing data detected:`);
      console.log(`   - ${result.missingBenchmarks} models without benchmarks`);
      console.log(`   - ${result.missingStats} models without stats`);
      console.log(`\n💡 Run: npm run scrape:missing`);
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
