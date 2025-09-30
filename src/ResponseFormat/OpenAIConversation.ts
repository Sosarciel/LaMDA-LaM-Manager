/**聊天API回复格式 */
export type OpenAIConversationRespFormat = {
    id: `chatcmpl-${string}`;
    object: "chat.completion";
    created: number;
    //"model":`gpt-3.5-turbo-${string}`,
    model: string;
    system_fingerprint: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    choices: ConversationChoiceFormat[];
};
/**聊天API选项格式 */
type ConversationChoiceFormat = {
    message: {
        role: "assistant";
        content?: string;
    };
    finish_reason: "stop" | "length" | "content_filter";
    index: number;
};

export const TemplateOpenAIConversationResponse: OpenAIConversationRespFormat = {
    id: "chatcmpl-123456",
    system_fingerprint: "fp_123456_prod0820_fp8_kvcache",
    object: "chat.completion",
    created: 1677723290,
    model: "gpt-3.5-turbo-0301",
    usage: { prompt_tokens: 10, completion_tokens: 18, total_tokens: 28 },
    choices: [
        {
            message: { role: "assistant", content: "\n\n您好，有什么需要帮助的吗？" },
            finish_reason: "stop",
            index: 0,
        },
    ],
};
