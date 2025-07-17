


export type GeminiChatOption={
    system_instruction:{parts:{text: string}},
    contents:GoogleChatAPIEntry[];
    generationConfig:{
        stopSequences: string[]|undefined;
        temperature?: number|undefined;
        maxOutputTokens?: number|undefined;
        topP?: number|undefined;
        topK?: number|undefined;
        thinkingBudget?: number|undefined;
    }
}
export type GoogleChatAPIEntry={
    role: GoogleChatAPIRole;
    parts:[{text:string}];
}

export enum GoogleChatAPIRole{
    User="user",
    Model="model",
}

export type GoogleChatApiData = {
    message:GoogleChatAPIEntry[];
    define :string;
}

