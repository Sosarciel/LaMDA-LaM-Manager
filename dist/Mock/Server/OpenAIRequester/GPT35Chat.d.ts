import type { OpenAIConversationOption } from "../../../RequestFormat";
export declare const procGPT35Chat: (data: OpenAIConversationOption) => {
    choices: {
        index: number;
        message: {
            role: "assistant";
            content: string;
        };
        finish_reason: "stop";
    }[];
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
};
