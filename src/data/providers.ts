export type ProviderId =
  | "anthropic"
  | "openai"
  | "google"
  | "xai"
  | "deepseek"
  | "moonshotai"
  | "minimax";

export interface ProviderModel {
  id: string;
  name: string;
  openrouterSlug: string;
  family: string;
  version: string;
  variant?: string;
  isObsolete?: boolean;
}

export interface Provider {
  id: ProviderId;
  name: string;
  colorToken: string;
  logoPath: string;
  website: string;
  models: ProviderModel[];
}

export const providers: Provider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    colorToken: "--provider-anthropic",
    logoPath: "/images/providers/anthropic.svg",
    website: "https://anthropic.com",
    models: [
      { id: "claude-opus-4-6",    name: "Claude Opus 4.6",    openrouterSlug: "anthropic/claude-opus-4.6",    family: "claude", version: "4.6", variant: "opus"   },
      { id: "claude-sonnet-4-6",  name: "Claude Sonnet 4.6",  openrouterSlug: "anthropic/claude-sonnet-4.6",  family: "claude", version: "4.6", variant: "sonnet" },
      { id: "claude-opus-4-5",    name: "Claude Opus 4.5",    openrouterSlug: "anthropic/claude-opus-4.5",    family: "claude", version: "4.5", variant: "opus"   },
      // Archived — superseded by 4.5/4.6
      { id: "claude-opus-4",      name: "Claude Opus 4",      openrouterSlug: "anthropic/claude-opus-4",      family: "claude", version: "4",   variant: "opus",   isObsolete: true },
      { id: "claude-sonnet-4",    name: "Claude Sonnet 4",    openrouterSlug: "anthropic/claude-sonnet-4",    family: "claude", version: "4",   variant: "sonnet", isObsolete: true },
      { id: "claude-haiku-3-5",   name: "Claude Haiku 3.5",   openrouterSlug: "anthropic/claude-haiku-3.5",   family: "claude", version: "3.5", variant: "haiku",  isObsolete: true }
    ]
  },
  {
    id: "openai",
    name: "OpenAI",
    colorToken: "--provider-openai",
    logoPath: "/images/providers/openai.svg",
    website: "https://openai.com",
    models: [
      { id: "gpt-5-4-pro",   name: "GPT-5.4 Pro",   openrouterSlug: "openai/gpt-5.4-pro",   family: "gpt-5",    version: "5.4", variant: "pro"   },
      { id: "gpt-5-4",       name: "GPT-5.4",        openrouterSlug: "openai/gpt-5.4",        family: "gpt-5",    version: "5.4"                   },
      { id: "gpt-5-3-codex", name: "GPT-5.3 Codex",  openrouterSlug: "openai/gpt-5.3-codex",  family: "gpt-5",    version: "5.3", variant: "codex" },
      { id: "gpt-5-3-chat",  name: "GPT-5.3 Chat",   openrouterSlug: "openai/gpt-5.3-chat",   family: "gpt-5",    version: "5.3", variant: "chat"  },
      { id: "gpt-5-2-pro",   name: "GPT-5.2 Pro",    openrouterSlug: "openai/gpt-5.2-pro",    family: "gpt-5",    version: "5.2", variant: "pro"   },
      { id: "gpt-5-2",       name: "GPT-5.2",         openrouterSlug: "openai/gpt-5.2",        family: "gpt-5",    version: "5.2"                   },
      { id: "o3",            name: "o3",              openrouterSlug: "openai/o3",             family: "openai-o", version: "3"                     },
      { id: "o4-mini",       name: "o4-mini",         openrouterSlug: "openai/o4-mini",        family: "openai-o", version: "4",   variant: "mini"  },
      // Archived — superseded by GPT-5 series
      { id: "gpt-4o",  name: "GPT-4o",  openrouterSlug: "openai/gpt-4o",  family: "gpt-4", version: "4o",  isObsolete: true },
      { id: "gpt-4-1", name: "GPT-4.1", openrouterSlug: "openai/gpt-4.1", family: "gpt-4", version: "4.1", isObsolete: true }
    ]
  },
  {
    id: "google",
    name: "Google",
    colorToken: "--provider-google",
    logoPath: "/images/providers/google.svg",
    website: "https://deepmind.google",
    models: [
      { id: "gemini-3-1-pro",   name: "Gemini 3.1 Pro",        openrouterSlug: "google/gemini-3.1-pro-preview",        family: "gemini", version: "3.1", variant: "pro"        },
      { id: "gemini-3-1-flash", name: "Gemini 3.1 Flash Lite",  openrouterSlug: "google/gemini-3.1-flash-lite-preview",  family: "gemini", version: "3.1", variant: "flash-lite" },
      { id: "gemini-3-flash",   name: "Gemini 3 Flash",         openrouterSlug: "google/gemini-3-flash-preview",         family: "gemini", version: "3",   variant: "flash"      },
      // Archived — superseded by Gemini 3.x
      { id: "gemini-2-5-pro",   name: "Gemini 2.5 Pro",   openrouterSlug: "google/gemini-2.5-pro",   family: "gemini", version: "2.5", variant: "pro",   isObsolete: true },
      { id: "gemini-2-5-flash", name: "Gemini 2.5 Flash",  openrouterSlug: "google/gemini-2.5-flash", family: "gemini", version: "2.5", variant: "flash", isObsolete: true }
    ]
  },
  {
    id: "xai",
    name: "xAI",
    colorToken: "--provider-xai",
    logoPath: "/images/providers/xai.svg",
    website: "https://x.ai",
    models: [
      { id: "grok-3",      name: "Grok 3",      openrouterSlug: "x-ai/grok-3",      family: "grok", version: "3"                   },
      { id: "grok-3-mini", name: "Grok 3 Mini", openrouterSlug: "x-ai/grok-3-mini", family: "grok", version: "3", variant: "mini" }
    ]
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    colorToken: "--provider-deepseek",
    logoPath: "/images/providers/deepseek.svg",
    website: "https://deepseek.com",
    models: [
      { id: "deepseek-v3-2",          name: "DeepSeek V3.2",          openrouterSlug: "deepseek/deepseek-v3.2",          family: "deepseek-v", version: "3.2"                     },
      { id: "deepseek-v3-2-speciale", name: "DeepSeek V3.2 Speciale", openrouterSlug: "deepseek/deepseek-v3.2-speciale", family: "deepseek-v", version: "3.2", variant: "speciale" },
      { id: "deepseek-r1",            name: "DeepSeek R1",            openrouterSlug: "deepseek/deepseek-r1",            family: "deepseek-r", version: "1"                        },
      // Archived — superseded by V3.2
      { id: "deepseek-v3", name: "DeepSeek V3", openrouterSlug: "deepseek/deepseek-chat", family: "deepseek-v", version: "3", isObsolete: true }
    ]
  },
  {
    id: "moonshotai",
    name: "Moonshot AI",
    colorToken: "--provider-moonshotai",
    logoPath: "/images/providers/moonshotai.svg",
    website: "https://kimi.ai",
    models: [
      { id: "kimi-k2-5", name: "Kimi K2.5", openrouterSlug: "moonshotai/kimi-k2.5", family: "kimi", version: "k2.5" },
      // Archived — superseded by K2.5
      { id: "kimi-k2", name: "Kimi K2", openrouterSlug: "moonshotai/kimi-k2", family: "kimi", version: "k2", isObsolete: true }
    ]
  },
  {
    id: "minimax",
    name: "MiniMax",
    colorToken: "--provider-minimax",
    logoPath: "/images/providers/minimax.svg",
    website: "https://minimaxi.com",
    models: [
      { id: "minimax-m2-5",   name: "MiniMax M2.5",     openrouterSlug: "minimax/minimax-m2.5",   family: "minimax-m", version: "2.5"                  },
      { id: "minimax-m2-1",   name: "MiniMax M2.1",     openrouterSlug: "minimax/minimax-m2.1",   family: "minimax-m", version: "2.1"                  },
      { id: "minimax-m2-her", name: "MiniMax M2-her",   openrouterSlug: "minimax/minimax-m2-her", family: "minimax-m", version: "2",   variant: "her"  },
      // Archived — superseded by M2.x
      { id: "minimax-m1", name: "MiniMax-M1", openrouterSlug: "minimax/minimax-m1", family: "minimax-m", version: "1", isObsolete: true }
    ]
  }
];

/** Flat list of all models across all providers */
export const allModels: ProviderModel[] = providers.flatMap((p) => p.models);

/** Look up a provider by ID */
export function getProvider(id: ProviderId): Provider {
  const found = providers.find((p) => p.id === id);
  if (!found) {
    throw new Error(`Provider not found: ${id}`);
  }
  return found;
}
