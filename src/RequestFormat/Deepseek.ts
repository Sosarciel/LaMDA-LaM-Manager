import { OpenAIConversationAPIRole } from "./OpenAIConversation";



/**Deepseek模型配置 */
export type DeepseekOption=Partial<{
    model: string;
    messages: DeepseekAPIEntry[];
    max_tokens: number;
    temperature: number;
    top_p: number;
    stop: string[]|null;
    presence_penalty: number;
    frequency_penalty: number;
}>;

/**用于Deepseek模型的消息Entry */
export type DeepseekAPIEntry={
    role: OpenAIConversationAPIRole;
    content:string;
    /**指定为前缀补全模式 */
    prefix?:boolean;
}

export const DeepseekAPIRole = OpenAIConversationAPIRole;
export type DeepseekAPIRole = OpenAIConversationAPIRole;