export type DeepseekRespFormat = {
    id: string;
    choices: ChatChoice[];
    created: number;
    model: "deepseek-chat";
    object: "chat.completion";
    usage: {
        completion_tokens: number;
        prompt_tokens: number;
        total_tokens: number;
        prompt_cache_hit_tokens: number;
        prompt_cache_miss_tokens: number;
        prompt_tokens_details: {
            cached_tokens: number;
        };
    };
    system_fingerprint: string;
};
type ChatChoice = {
    finish_reason: "stop";
    index: number;
    message: {
        content: string;
        role: "assistant";
    };
    logprobs: null | number[];
};
export declare const TemplateDeepseekResponse: {
    id: string;
    object: "chat.completion";
    created: number;
    model: "deepseek-chat";
    choices: {
        index: number;
        message: {
            role: "assistant";
            content: string;
        };
        logprobs: null;
        finish_reason: "stop";
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        prompt_tokens_details: {
            cached_tokens: number;
        };
        prompt_cache_hit_tokens: number;
        prompt_cache_miss_tokens: number;
    };
    system_fingerprint: string;
};
export {};
