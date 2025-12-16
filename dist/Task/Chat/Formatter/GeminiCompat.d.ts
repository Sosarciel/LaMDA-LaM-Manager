import type { GeminiCompatAPIEntry, GeminiCompatOption } from "../../../RequestFormat";
import type { OpenAIConversationRespFormat } from "../../../ResponseFormat";
import type { ChatTaskFormatter } from "../../Chat/Adapter";
/**gemini的openai兼容api格式化工具 */
export declare const GeminiCompatChatTaskFormatter: ChatTaskFormatter<GeminiCompatAPIEntry[], GeminiCompatOption, OpenAIConversationRespFormat>;
