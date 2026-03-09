export interface OpenRouterPricing {
  prompt: number | null;
  completion: number | null;
  input_cache_read: number | null;
  internal_reasoning: number | null;
}

export interface OpenRouterStats {
  p50_latency: number | null;
  p75_latency: number | null;
  p90_latency: number | null;
  p99_latency: number | null;
  p50_throughput: number | null;
  p99_throughput: number | null;
}

export interface OpenRouterModelData {
  slug: string;
  pricing: OpenRouterPricing | null;
  stats: OpenRouterStats | null;
  context_length: number | null;
  max_completion_tokens: number | null;
  input_modalities: string[];
  output_modalities: string[];
  supports_reasoning: boolean;
  supports_tool_parameters: boolean;
  is_deranked: boolean;
}

/**
 * Fetches model data from OpenRouter's frontend stats endpoint.
 * Returns null on any error — never throws.
 * Graceful degradation: callers should handle null by displaying "—".
 */
export async function fetchModelData(openrouterSlug: string): Promise<OpenRouterModelData | null> {
  try {
    const url = `https://openrouter.ai/api/frontend/stats/endpoint?permaslug=${encodeURIComponent(openrouterSlug)}&variant=standard`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) return null;

    const raw = await res.json() as Record<string, unknown>;

    const pricing = raw.pricing as Record<string, unknown> | undefined;
    const stats = raw.stats as Record<string, unknown> | undefined;

    return {
      slug: openrouterSlug,
      pricing: pricing
        ? {
            prompt: typeof pricing.prompt === "number" ? pricing.prompt : null,
            completion: typeof pricing.completion === "number" ? pricing.completion : null,
            input_cache_read: typeof pricing.input_cache_read === "number" ? pricing.input_cache_read : null,
            internal_reasoning: typeof pricing.internal_reasoning === "number" ? pricing.internal_reasoning : null
          }
        : null,
      stats: stats
        ? {
            p50_latency: typeof stats.p50_latency === "number" ? stats.p50_latency : null,
            p75_latency: typeof stats.p75_latency === "number" ? stats.p75_latency : null,
            p90_latency: typeof stats.p90_latency === "number" ? stats.p90_latency : null,
            p99_latency: typeof stats.p99_latency === "number" ? stats.p99_latency : null,
            p50_throughput: typeof stats.p50_throughput === "number" ? stats.p50_throughput : null,
            p99_throughput: typeof stats.p99_throughput === "number" ? stats.p99_throughput : null
          }
        : null,
      context_length: typeof raw.context_length === "number" ? raw.context_length : null,
      max_completion_tokens: typeof raw.max_completion_tokens === "number" ? raw.max_completion_tokens : null,
      input_modalities: Array.isArray(raw.input_modalities) ? (raw.input_modalities as string[]) : [],
      output_modalities: Array.isArray(raw.output_modalities) ? (raw.output_modalities as string[]) : [],
      supports_reasoning: raw.supports_reasoning === true,
      supports_tool_parameters: raw.supports_tool_parameters === true,
      is_deranked: raw.is_deranked === true
    };
  } catch {
    return null;
  }
}

/**
 * Fetches data for all provided slugs concurrently.
 * Returns a Map<slug, OpenRouterModelData>. Slugs that fail are absent from the map.
 */
export async function fetchAllModels(slugs: string[]): Promise<Map<string, OpenRouterModelData>> {
  const results = await Promise.allSettled(
    slugs.map(async (slug) => ({ slug, data: await fetchModelData(slug) }))
  );

  const map = new Map<string, OpenRouterModelData>();
  for (const result of results) {
    if (result.status === "fulfilled" && result.value.data !== null) {
      map.set(result.value.slug, result.value.data);
    }
  }
  return map;
}

// ─── Catalog fetch ──────────────────────────────────────────────────────────

export interface OpenRouterCatalogModel {
  id: string;           // e.g. "anthropic/claude-opus-4"
  name: string;         // display name from OpenRouter
  context_length: number | null;
  pricing: {
    prompt: string;     // OpenRouter returns strings for catalog pricing
    completion: string;
  } | null;
  architecture?: {
    modality?: string;
  };
}

export interface OpenRouterCatalogResponse {
  data: OpenRouterCatalogModel[];
}

/**
 * Fetches the full model catalog from OpenRouter's public API.
 * Filters to only models whose slug starts with one of the provided prefixes.
 * Returns empty array on any error — never throws.
 *
 * Used by the /scrape-benchmarks agent command (not at build time).
 *
 * @param prefixWhitelist - Array of slug prefixes to include (e.g. ["anthropic/", "openai/"])
 *   Pass empty array or omit to return all models.
 */
export async function fetchModelCatalog(prefixWhitelist: string[] = []): Promise<OpenRouterCatalogModel[]> {
  try {
    const url = "https://openrouter.ai/api/v1/models";
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) return [];

    const raw = await res.json() as OpenRouterCatalogResponse;

    if (!Array.isArray(raw.data)) return [];

    const models = raw.data as OpenRouterCatalogModel[];

    if (prefixWhitelist.length === 0) return models;

    return models.filter((m) =>
      prefixWhitelist.some((prefix) => m.id.startsWith(prefix))
    );
  } catch {
    return [];
  }
}
