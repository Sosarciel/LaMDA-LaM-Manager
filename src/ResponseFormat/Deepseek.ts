export type DeepseekResponseFormat = {
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
        prompt_tokens_details: { cached_tokens: number };
    };
    system_fingerprint:string;
};
type ChatChoice = {
    finish_reason: "stop";
    index: number;
    message: {
        content: string;
        role: "assistant";
    };
    logprobs: null|number[]
};

export const TemplateDeepseekResponse = {
    id: "456a034b-6e31-4a4d-9548-e87b5d694ae0",
    object: "chat.completion",
    created: 1759123711,
    model: "deepseek-chat",
    choices: [
        {
            index: 0,
            message: {
                role: "assistant",
                content: "你好，有什么需要帮助的吗？",
            },
            logprobs: null,
            finish_reason: "stop",
        },
    ],
    usage: {
        prompt_tokens: 2115,
        completion_tokens: 253,
        total_tokens: 2368,
        prompt_tokens_details: { cached_tokens: 0 },
        prompt_cache_hit_tokens: 0,
        prompt_cache_miss_tokens: 2115,
    },
    system_fingerprint: "fp_8333852bec_prod0820_fp8_kvcache",
} satisfies DeepseekResponseFormat;
