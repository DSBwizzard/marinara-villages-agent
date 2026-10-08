
export declare const GENERATION_PARAMETER_SEND_KEYS: readonly ["temperature", "maxTokens", "topP", "topK", "frequencyPenalty", "presencePenalty", "reasoningEffort", "verbosity"];

export type GenerationParameterSendKey = (typeof GENERATION_PARAMETER_SEND_KEYS)[number];

export type GenerationParameterSendMap = Partial<Record<GenerationParameterSendKey, boolean>>;
