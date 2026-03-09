#!/usr/bin/env node
/**
 * Generate Scrape Report
 * 
 * Gera relatório do estado atual dos dados
 * 
 * Usage:
 *   npm run scrape:report
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const MODELS_FILE = path.join(DATA_DIR, 'models.json');

async function main() {
  console.log('📋 Generating scrape report...\n');
  
  const content = await fs.readFile(MODELS_FILE, 'utf-8');
  const data = JSON.parse(content);
  
  const activeModels = data.models.filter(m => !m.isObsolete);
  const obsoleteModels = data.models.filter(m => m.isObsolete);
  
  // Coverage stats
  const withBenchmarks = activeModels.filter(m => m.intelligence_index).length;
  const withStats = activeModels.filter(m => m.latency_p50).length;
  const withPricing = activeModels.filter(m => m.pricing?.prompt).length;
  
  console.log('=== OVERVIEW ===');
  console.log(`Total models: ${data.models.length}`);
  console.log(`Active: ${activeModels.length}`);
  console.log(`Obsolete: ${obsoleteModels.length}`);
  console.log(`Last updated: ${data.lastUpdated || 'Never'}`);
  
  console.log('\n=== COVERAGE ===');
  console.log(`Benchmarks: ${withBenchmarks}/${activeModels.length} (${Math.round(withBenchmarks/activeModels.length*100)}%)`);
  console.log(`Stats: ${withStats}/${activeModels.length} (${Math.round(withStats/activeModels.length*100)}%)`);
  console.log(`Pricing: ${withPricing}/${activeModels.length} (${Math.round(withPricing/activeModels.length*100)}%)`);
  
  // Missing by provider
  console.log('\n=== MISSING BENCHMARKS BY PROVIDER ===');
  const byProvider = {};
  
  for (const model of activeModels) {
    if (!model.intelligence_index) {
      byProvider[model.provider] = (byProvider[model.provider] || 0) + 1;
    }
  }
  
  for (const [provider, count] of Object.entries(byProvider).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${provider}: ${count} models`);
  }
  
  // Models missing benchmarks
  console.log('\n=== MODELS MISSING BENCHMARKS ===');
  const missingBenchmarks = activeModels
    .filter(m => !m.intelligence_index)
    .map(m => m.slug);
  
  if (missingBenchmarks.length > 0) {
    missingBenchmarks.forEach(slug => console.log(`  - ${slug}`));
  } else {
    console.log('  ✓ None!');
  }
  
  // Models missing stats
  console.log('\n=== MODELS MISSING STATS ===');
  const missingStats = activeModels
    .filter(m => !m.latency_p50)
    .map(m => m.slug);
  
  if (missingStats.length > 0) {
    missingStats.forEach(slug => console.log(`  - ${slug}`));
  } else {
    console.log('  ✓ None!');
  }
  
  // Recommendations
  console.log('\n=== RECOMMENDATIONS ===');
  
  if (missingBenchmarks.length > 0 || missingStats.length > 0) {
    console.log('1. Run: npm run scrape:missing');
    console.log('2. If still missing, use agent for manual verification:');
    console.log('   /scrape-benchmarks --missing-only');
  } else {
    console.log('✅ All data up to date!');
    console.log('Run: npm run build && npm run deploy');
  }
  
  // Save detailed report
  const report = {
    generatedAt: new Date().toISOString(),
    overview: {
      total: data.models.length,
      active: activeModels.length,
      obsolete: obsoleteModels.length,
      lastUpdated: data.lastUpdated
    },
    coverage: {
      benchmarks: { count: withBenchmarks, total: activeModels.length },
      stats: { count: withStats, total: activeModels.length },
      pricing: { count: withPricing, total: activeModels.length }
    },
    missing: {
      benchmarks: missingBenchmarks,
      stats: missingStats
    }
  };
  
  const reportPath = path.join(DATA_DIR, 'scrape-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);
}

main().catch(console.error);
