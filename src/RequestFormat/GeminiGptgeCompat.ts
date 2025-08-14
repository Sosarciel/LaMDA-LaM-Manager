import { OpenAIConversationAPIRole } from "./OpenAIConversation";



//https://ai.google.dev/gemini-api/docs/openai?hl=zh-cn#extra-body
//https://api-gpt-ge.apifox.cn/210339408e0
/**gptge兼容api选项 */
export type GeminiGptgeCompatOption=Partial<{
    model: string;
    messages: GeminiGptgeCompatAPIEntry[];
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

/**gptge兼容api消息段 */
export type GeminiGptgeCompatAPIEntry={
    role: OpenAIConversationAPIRole;
    content:string;
}
