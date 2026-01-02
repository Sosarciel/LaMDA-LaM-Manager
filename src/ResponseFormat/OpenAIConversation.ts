/**聊天API回复格式 */
export type OpenAIConversationResponseFormat = {
    id: `chatcmpl-${string}`;
    object: "chat.completion";
    created: number;
    //"model":`gpt-3.5-turbo-${string}`,
    model: string;
    system_fingerprint: null|`fp_${string}`;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        prompt_tokens_details?: {
			cached_tokens?: number;
			audio_tokens?: number;
		},
		completion_tokens_details?: {
			reasoning_tokens?: number;
			audio_tokens?: number;
			accepted_prediction_tokens?: number;
			rejected_prediction_tokens?: number;
		}
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

export const TemplateOpenAIConversationResponse = {
    id: "chatcmpl-An5LfoXnmT2WpgSRREQyp8tilpYRd",
    system_fingerprint: "fp_5154047bf2",
    object: "chat.completion",
    created: 1677723290,
    model: "gpt-3.5-turbo-0301",
    usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
    choices: [
        {
            message: { role: "assistant", content: "您好，有什么需要帮助的吗？" },
            finish_reason: "stop",
            index: 0,
        },
        {
            message: { role: "assistant", content: "您好，有什么需要帮助的吗？" },
            finish_reason: "stop",
            index: 1,
        },
    ],
} satisfies OpenAIConversationResponseFormat;
