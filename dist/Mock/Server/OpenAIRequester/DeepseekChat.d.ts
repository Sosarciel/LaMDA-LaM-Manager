import type { OpenAIConversationOption } from "../../../RequestFormat";
export declare const procDeepseekChat: (data: OpenAIConversationOption) => {
    choices: {
        index: number;
        message: {
            role: "assistant";
            content: string;
        };
        finish_reason: "stop";
        logprobs: null;
    }[];
    id: string;
    object: "chat.completion";
    created: number;
    model: "deepseek-chat";
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
