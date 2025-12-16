export declare const InteractorTable: {
    openai: {
        postLaM(partialOpt: import("@zwa73/js-utils").PresetOption<typeof import("./Interface").PostLaMOptionPreset>): Promise<import("..").DeepseekRespFormat | import("..").OpenAIConversationRespFormat | import("..").OpenAITextRespFormat | undefined>;
        postLaMRepeat(partialOpt: import("@zwa73/js-utils").PresetOption<typeof import("./Interface").PostLaMOptionPreset>): Promise<import("@zwa73/js-utils").PromiseRetryResult<import("..").DeepseekRespFormat | import("..").OpenAIConversationRespFormat | import("..").OpenAITextRespFormat | undefined>>;
    };
    gemini: {
        postLaM(partialOpt: import("@zwa73/js-utils").PresetOption<typeof import("./Interface").PostLaMOptionPreset>): Promise<import("..").GeminiRespFormat | undefined>;
        postLaMRepeat(partialOpt: import("@zwa73/js-utils").PresetOption<typeof import("./Interface").PostLaMOptionPreset>): Promise<import("@zwa73/js-utils").PromiseRetryResult<import("..").GeminiRespFormat | undefined>>;
    };
};
export type InteractorType = keyof typeof InteractorTable;
