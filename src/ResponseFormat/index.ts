// MODULE:响应格式 API的原始响应格式 #LaMManager
import type { DeepseekResponse } from './Deepseek';
import type { GeminiResponse } from './Gemini';
import type { OpenAIConversationResponse } from './OpenAIConversation';
import type { OpenAITextResponse } from './OpenAIText';


export * from './Deepseek';
export * from './Gemini';
export * from './OpenAIConversation';
export * from './OpenAIText';
export * from './OpenAIError';


/**任何 OpenAI对话风格 API 接口的回复格式 */
export type AnyOpenAIConversationLikeResponse = OpenAIConversationResponse|DeepseekResponse;

/**任何 OpenAI API 接口的回复格式*/
export type AnyOpenAIResponse = AnyOpenAIConversationLikeResponse|OpenAITextResponse;

/**任何 Gemini API 接口的回复格式 */
export type AnyGeminiResponse = GeminiResponse;

/**任何 文本完成 API 接口的回复格式 */
export type AnyTextCompletionResponse = AnyOpenAIResponse|AnyGeminiResponse;