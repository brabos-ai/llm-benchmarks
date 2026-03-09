#!/usr/bin/env node
/**
 * Scrape Missing Data
 * 
 * Busca apenas os dados que faltam (benchmarks ou stats)
 * Útil após rodar o scraper principal
 * 
 * Usage:
 *   npm run scrape:missing
 *   npm run scrape:missing -- --type=benchmarks
 *   npm run scrape:missing -- --type=stats
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENROUTER_BASE = 'https://openrouter.ai/api';
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const MODELS_FILE = path.join(DATA_DIR, 'models.json');

async function fetchJson(url) {
  console.log(`Fetching: ${url}`);
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'LLM-Benchmarks-Scraper/1.0'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

async function fetchBenchmarks(slug) {
  try {
    const data = await fetchJson(
      `${OPENROUTER_BASE}/internal/v1/artificial-analysis-benchmarks?slug=${encodeURIComponent(slug)}`
    );
    
    if (!data.data || data.data.length === 0) return null;
    
    const variant = data.data[0];
    const evals = variant.benchmark_data?.evaluations || {};
    
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
      _source: 'artificial-analysis'
    };
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return null;
  }
}

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
    console.error(`  Error: ${error.message}`);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const typeFilter = args.find(arg => arg.startsWith('--type='))?.split('=')[1];
  
  console.log('🔍 Scraping missing data...\n');
  
  // Load models
  const content = await fs.readFile(MODELS_FILE, 'utf-8');
  const data = JSON.parse(content);
  
  // Find models with missing data
  const missingBenchmarks = data.models.filter(m => 
    !m.isObsolete && !m.intelligence_index && m.slug
  );
  
  const missingStats = data.models.filter(m => 
    !m.isObsolete && !m.latency_p50 && m.permaslug
  );
  
  console.log(`Models missing benchmarks: ${missingBenchmarks.length}`);
  console.log(`Models missing stats: ${missingStats.length}\n`);
  
  let updatedCount = 0;
  
  // Fetch benchmarks
  if (!typeFilter || typeFilter === 'benchmarks') {
    console.log('📊 Fetching missing benchmarks...');
    
    for (let i = 0; i < missingBenchmarks.length; i++) {
      const model = missingBenchmarks[i];
      console.log(`  [${i + 1}/${missingBenchmarks.length}] ${model.slug}`);
      
      const benchmarks = await fetchBenchmarks(model.slug);
      if (benchmarks) {
        Object.assign(model, benchmarks);
        updatedCount++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // Fetch stats
  if (!typeFilter || typeFilter === 'stats') {
    console.log('\n⚡ Fetching missing stats...');
    
    for (let i = 0; i < missingStats.length; i++) {
      const model = missingStats[i];
      console.log(`  [${i + 1}/${missingStats.length}] ${model.slug}`);
      
      const stats = await fetchStats(model.permaslug);
      if (stats) {
        Object.assign(model, stats);
        updatedCount++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // Save
  console.log('\n💾 Saving...');
  await fs.writeFile(MODELS_FILE, JSON.stringify(data, null, 2));
  
  console.log(`\n✅ Updated ${updatedCount} models`);
  
  // Still missing?
  const stillMissingBenchmarks = data.models.filter(m => 
    !m.isObsolete && !m.intelligence_index
  ).length;
  
  const stillMissingStats = data.models.filter(m => 
    !m.isObsolete && !m.latency_p50
  ).length;
  
  if (stillMissingBenchmarks > 0 || stillMissingStats > 0) {
    console.log(`\n⚠️  Still missing:`);
    console.log(`   - ${stillMissingBenchmarks} models without benchmarks`);
    console.log(`   - ${stillMissingStats} models without stats`);
    console.log(`\n💡 These may need manual verification via agent`);
  }
}

main().catch(console.error);
