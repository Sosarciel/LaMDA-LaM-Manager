export type GeminiOption = {
    system_instruction: {
        parts: {
            text: string;
        };
    };
    contents: GeminiAPIEntry[];
    generationConfig: {
        stopSequences: string[] | undefined;
        temperature?: number | undefined;
        maxOutputTokens?: number | undefined;
        topP?: number | undefined;
        topK?: number | undefined;
        thinkingBudget?: number | undefined;
    };
};
export type GeminiAPIEntry = {
    role: GeminiAPIRole;
    parts: [{
        text: string;
    }];
};
export declare const GeminiAPIRole: {
    readonly User: "user";
    readonly Model: "model";
};
export type GeminiAPIRole = typeof GeminiAPIRole[keyof typeof GeminiAPIRole];
export type GeminiApiData = {
    message: GeminiAPIEntry[];
    define: string;
};
