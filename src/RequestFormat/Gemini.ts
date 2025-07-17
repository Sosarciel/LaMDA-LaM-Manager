


export type GeminiChatOption={
    system_instruction:{parts:{text: string}},
    contents:GeminiChatAPIEntry[];
    generationConfig:{
        stopSequences: string[]|undefined;
        temperature?: number|undefined;
        maxOutputTokens?: number|undefined;
        topP?: number|undefined;
        topK?: number|undefined;
        thinkingBudget?: number|undefined;
    }
}

export type GeminiChatAPIEntry={
    role: GeminiChatAPIRole;
    parts:[{text:string}];
}

export const GeminiChatAPIRole = {
    User:"user",
    Model:"model",
} as const;
export type GeminiChatAPIRole = typeof GeminiChatAPIRole[keyof typeof GeminiChatAPIRole];


export type GeminiChatApiData = {
    message:GeminiChatAPIEntry[];
    define :string;
}

