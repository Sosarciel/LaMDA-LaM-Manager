


export type GeminiOption={
    system_instruction:{parts:{text: string}},
    contents:GeminiAPIEntry[];
    generationConfig:{
        stopSequences: string[]|undefined;
        temperature?: number|undefined;
        maxOutputTokens?: number|undefined;
        topP?: number|undefined;
        topK?: number|undefined;
        thinkingBudget?: number|undefined;
        thinkingConfig?: {
            thinkingBudget:number|undefined;
            /**是否返回明文思考过程 默认false 返回思考key */
            includeThoughts:boolean|undefined;
        }
    }
}

export type GeminiAPIEntry={
    role: GeminiAPIRole;
    parts:[{text:string}];
}

export const GeminiAPIRole = {
    User:"user",
    Model:"model",
} as const;
export type GeminiAPIRole = typeof GeminiAPIRole[keyof typeof GeminiAPIRole];


export type GeminiApiData = {
    message:GeminiAPIEntry[];
    define :string;
}

