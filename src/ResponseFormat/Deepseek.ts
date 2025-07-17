type ChatResp = {
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
    };
};
type ChatChoice = {
    finish_reason: "stop";
    index: number;
    message: {
        content: string;
        role: "assistant";
    };
};

export type AnyDeepseekChatRespFormat = ChatResp;
