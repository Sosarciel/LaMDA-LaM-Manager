import type { AnyString } from "@zwa73/utils";



export type OpenAIModelID = AnyString
    | "gpt-5" | "gpt-5-mini" | "gpt-5-nano" | "gpt-5-pro" | `gpt-5-${number}-${number}-${number}` | `gpt-5-chat-${number}-${number}-${number}`
    | "gpt-5.1" | "gpt-5.1-chat-latest"
    | "gpt-5.2" | "gpt-5.2-chat-latest" | "gpt-5-chat-latest" | "gpt-5.2-pro"
    | "gpt-4.1" | "gpt-4.1-mini" | "gpt-4.1-nano"
    | "gpt-4o" | "gpt-4o-2024-05-13" | "gpt-4o-mini" | "gpt-4o-audio-preview" | "gpt-4o-mini-audio-preview" | "gpt-4o-search-preview"
    | `gpt-3.5-turbo`
    | "gpt-audio" | "gpt-audio-mini"
    | "o1" | "o1-mini"| "o1-pro"
    | "o3" | "o3-mini"| "o3-pro"
    | "o4-mini" | "gpt-4o-mini-search-preview"
    | "gpt-5-search-api";



export type OpenAIReasoningEffort = 'none'|'minimal'|'low'|'medium'|'high'|'xhigh';
/**turbo模型配置 */
export type OpenAIConversationRequestFormat=Partial<{
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

