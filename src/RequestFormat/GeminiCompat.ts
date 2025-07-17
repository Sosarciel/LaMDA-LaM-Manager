import { GoogleChatModel } from "ModelConfig";
import { OpenAIConversationAPIRole } from "./OpenAIConversation";



/**gptge兼容api选项 */
export type GeminiCompatChatOption=Partial<{
    model: GoogleChatModel|any;
    messages: GeminiCompatChatAPIEntry[];
    max_tokens: number;
    temperature: number;
    top_p: number;
    stop: string[]|null;
    presence_penalty: number;
    frequency_penalty: number;
    thinking:{
        type: "enabled",
        budget_tokens: number,
    }
}>;

/**gptge兼容api消息段 */
export type GeminiCompatChatAPIEntry={
    role: OpenAIConversationAPIRole;
    content:string;
}
