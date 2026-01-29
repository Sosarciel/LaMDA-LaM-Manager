/** Deepseek 响应格式 */
export type DeepseekResponse = {
    /** 响应 ID */
    id: string;
    /** 选项列表 */
    choices: ChatChoice[];
    /** 创建时间戳 */
    created: number;
    /** 模型名称 */
    model: "deepseek-chat";
    /** 对象类型 */
    object: "chat.completion";
    /** 用量统计 */
    usage: {
        /** 完成 token 数量 */
        completion_tokens: number;
        /** 提示 token 数量 */
        prompt_tokens: number;
        /** 总 token 数量 */
        total_tokens: number;
        /** 缓存命中的提示 token 数量 */
        prompt_cache_hit_tokens: number;
        /** 缓存未命中的提示 token 数量 */
        prompt_cache_miss_tokens: number;
        /** 提示 token 详情 */
        prompt_tokens_details: { cached_tokens: number };
    };
    /** 系统指纹 */
    system_fingerprint:string;
};
/** 聊天选项 */
type ChatChoice = {
    /** 完成原因 */
    finish_reason: "stop";
    /** 索引 */
    index: number;
    /** 消息 */
    message: {
        /** 内容 */
        content: string;
        /** 角色 */
        role: "assistant";
    };
    /** 对数概率 */
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
} satisfies DeepseekResponse;
