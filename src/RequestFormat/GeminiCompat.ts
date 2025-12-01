import type { OpenAIConversationAPIRole } from "./OpenAIConversation";



//https://ai.google.dev/gemini-api/docs/openai?hl=zh-cn#extra-body
//https://api-gpt-ge.apifox.cn/210339408e0
/**openai兼容选项 */
export type GeminiCompatOption=Partial<{
    model: string;
    messages: GeminiCompatAPIEntry[];
    max_tokens: number;
    temperature: number;
    top_p: number;
    stop: string[]|null;
    presence_penalty: number;
    frequency_penalty: number;
    extra_body:{
        google?:{
            thinking_config?:{
                include_thoughts?: boolean,
                thinking_budget?: number,
            }
        }
    }
    /**提供三个级别的思维控制："low"、"medium" 和 "high"，分别对应于 1,024、8,192 和 24,576 个令牌 */
    reasoning_effort:"low"|"medium"|"high";
}>;

/**兼容api消息段 */
export type GeminiCompatAPIEntry={
    role: OpenAIConversationAPIRole;
    content:string;
}
