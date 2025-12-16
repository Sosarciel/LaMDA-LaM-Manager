/**聊天API回复格式 */
export type OpenAIConversationRespFormat = {
    id: `chatcmpl-${string}`;
    object: "chat.completion";
    created: number;
    model: string;
    system_fingerprint: null | `fp_${string}`;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        prompt_tokens_details?: {
            cached_tokens?: number;
            audio_tokens?: number;
        };
        completion_tokens_details?: {
            reasoning_tokens?: number;
            audio_tokens?: number;
            accepted_prediction_tokens?: number;
            rejected_prediction_tokens?: number;
        };
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
export declare const TemplateOpenAIConversationResponse: {
    id: "chatcmpl-An5LfoXnmT2WpgSRREQyp8tilpYRd";
    system_fingerprint: "fp_5154047bf2";
    object: "chat.completion";
    created: number;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    choices: {
        message: {
            role: "assistant";
            content: string;
        };
        finish_reason: "stop";
        index: number;
    }[];
};
export {};
