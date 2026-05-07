/** GLM 响应格式 */
export type GLMResponse = {
    /** 响应 ID */
    id: string;
    /** 请求 ID */
    request_id?: string;
    /** 创建时间戳 */
    created: number;
    /** 模型名称 */
    model: string;
    /** 选项列表 */
    choices: GLMChatChoice[];
    /** 用量统计 */
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        prompt_tokens_details?: { cached_tokens: number };
    };
};

/** GLM 聊天选项 */
type GLMChatChoice = {
    /** 消息 */
    message: {
        /** 角色 */
        role: "assistant";
        /** 内容 */
        content?: string;
        /** 推理内容 */
        reasoning_content?: string;
    };
    /** 完成原因 */
    finish_reason: "stop"|"length"|"content_filter";
    /** 索引 */
    index: number;
};

export const GLMResponseExample = {
    id: "8803848869aad374",
    created: 1677723290,
    model: "glm-4.7",
    request_id: "8803848869aad374",
    choices: [
        {
            index: 0,
            message: { role: "assistant", content: "你好，有什么需要帮助的吗？" },
            finish_reason: "stop",
        },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
} satisfies GLMResponse;
