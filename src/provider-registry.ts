import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

export type ReasoningEffort = "low" | "medium" | "high";

export interface ProviderRuntimeConfig {
  provider: string;
  baseURL: string;
  model: string;
  apiKey: string;
  reasoningEffort?: ReasoningEffort | undefined;
}

export interface ProviderProfile {
  id: string;
  aliases?: readonly string[];
  transport: "anthropic" | "openai-compatible";
  defaultBaseURL?: string;
  defaultModel?: string;
  defaultReasoningEffort?: ReasoningEffort;
  apiKeyEnvNames: readonly string[];
}

const PROVIDER_PROFILES: readonly ProviderProfile[] = [
  {
    id: "openai",
    transport: "openai-compatible",
    defaultBaseURL: "https://api.openai.com/v1",
    defaultModel: "gpt-5.6-luna",
    defaultReasoningEffort: "medium",
    apiKeyEnvNames: ["OPENAI_API_KEY"],
  },
  {
    id: "anthropic",
    aliases: ["claude"],
    transport: "anthropic",
    defaultBaseURL: "https://api.anthropic.com/v1",
    defaultModel: "claude-haiku-4-5",
    apiKeyEnvNames: ["ANTHROPIC_API_KEY"],
  },
  {
    id: "deepseek",
    transport: "openai-compatible",
    defaultBaseURL: "https://api.deepseek.com",
    defaultModel: "deepseek-v4-flash",
    apiKeyEnvNames: ["DEEPSEEK_API_KEY"],
  },
  {
    id: "kimi-code",
    transport: "openai-compatible",
    apiKeyEnvNames: ["KIMI_API_KEY"],
  },
] as const;

export function providerProfile(provider: string): ProviderProfile | undefined {
  return PROVIDER_PROFILES.find(
    (profile) => profile.id === provider || profile.aliases?.includes(provider),
  );
}

export function providerApiKeyEnvNames(provider: string): readonly string[] {
  return providerProfile(provider)?.apiKeyEnvNames ?? [];
}

export function createProviderModel(
  config: ProviderRuntimeConfig,
  transformOpenAiRequestBody: (
    body: Record<string, unknown>,
  ) => Record<string, unknown>,
): LanguageModel {
  const profile = providerProfile(config.provider);
  if (profile?.transport === "anthropic") {
    return createAnthropic({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
    })(config.model);
  }

  return createOpenAICompatible({
    name: config.provider,
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    ...(profile?.id === "openai"
      ? { transformRequestBody: transformOpenAiRequestBody }
      : {}),
  })(config.model);
}

export function providerOptions(config: ProviderRuntimeConfig) {
  if (!config.reasoningEffort) return undefined;
  const profile = providerProfile(config.provider);
  return profile?.transport === "anthropic"
    ? { anthropic: { effort: config.reasoningEffort } }
    : { openaiCompatible: { reasoningEffort: config.reasoningEffort } };
}
