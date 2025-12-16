/**turbo模型配置 */
export type OpenAIConversationOption = Partial<{
    model: string;
    messages: OpenAIConversationAPIEntry[];
    max_tokens: number;
    temperature: number;
    top_p: number;
    stop: string[] | null;
    presence_penalty: number;
    frequency_penalty: number;
    logit_bias: Record<string, number> | null;
    n: number;
}>;
/**用于Turbo模型的消息Entry */
export type OpenAIConversationAPIEntry = {
    role: OpenAIConversationAPIRole;
    content: string;
};
export declare const OpenAIConversationAPIRole: {
    readonly User: "user";
    readonly Assistant: "assistant";
    readonly System: "system";
};
export type OpenAIConversationAPIRole = typeof OpenAIConversationAPIRole[keyof typeof OpenAIConversationAPIRole];
