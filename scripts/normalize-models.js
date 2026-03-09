#!/usr/bin/env node
/**
 * normalize-models.js
 *
 * One-time migration: adds `model.scores` and `model.openrouterSlug` to
 * each entry in models.json from flat benchmark fields.
 *
 * Usage:
 *   npm run normalize
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_FILE = path.join(__dirname, '..', 'src', 'data', 'models.json');

async function main() {
  const content = await fs.readFile(MODELS_FILE, 'utf-8');
  const data = JSON.parse(content);

  let updated = 0;

  data.models = data.models.map((model) => {
    // Add openrouterSlug from slug if missing
    if (!model.openrouterSlug && model.slug) {
      model.openrouterSlug = model.slug;
    }

    // Build scores sub-object from flat fields
    model.scores = {
      intelligence_index: model.intelligence_index ?? null,
      coding_index:       model.coding_index ?? null,
      agentic_index:      model.agentic_index ?? null,
    };

    updated++;
    return model;
  });

  await fs.writeFile(MODELS_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Normalized ${updated} models → scores sub-object added`);
  console.log(`📄 ${MODELS_FILE}`);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
