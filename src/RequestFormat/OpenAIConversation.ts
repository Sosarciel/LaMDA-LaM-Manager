

export type OpenAIReasoningEffort = 'none'|'minimal'|'low'|'medium'|'high'|'xhigh';
/**turbo模型配置 */
export type OpenAIConversationOption=Partial<{
    model: string;
    messages: OpenAIConversationAPIEntry[];
    /**最大生成令牌数 弃用转为max_completion_tokens */
    max_tokens: number;
    /**最大生成令牌数 */
    max_completion_tokens: number;
    /**思考预算 */
    reasoning_effort: OpenAIReasoningEffort;
    temperature: number;
    top_p: number;
    stop: string[]|null;
    presence_penalty: number;
    frequency_penalty: number;
    logit_bias: Record<string, number>|null;
    n: number;
}>;

/**用于Turbo模型的消息Entry */
export type OpenAIConversationAPIEntry={
    role: OpenAIConversationAPIRole;
    content:string;
}

export const OpenAIConversationAPIRole = {
    User:"user",
    Assistant:"assistant",
    System:"system",
} as const;
export type OpenAIConversationAPIRole = typeof OpenAIConversationAPIRole[keyof typeof OpenAIConversationAPIRole];

