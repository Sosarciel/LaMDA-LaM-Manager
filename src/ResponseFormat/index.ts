// MODULE:响应格式 API的原始响应格式 #LaMManager
import type { DeepseekResponseFormat } from './Deepseek';
import type { GeminiResponseFormat } from './Gemini';
import type { OpenAIConversationResponseFormat } from './OpenAIConversation';
import type { OpenAITextResponseFormat } from './OpenAIText';


export * from './Deepseek';
export * from './Gemini';
export * from './OpenAIConversation';
export * from './OpenAIText';
export * from './OpenAIError';


/**任何 OpenAI对话风格 API 接口的回复格式 */
export type AnyOpenAIConversationLikeResponseFormat = OpenAIConversationResponseFormat|DeepseekResponseFormat;

/**任何 OpenAI API 接口的回复格式*/
export type AnyOpenAIResponseFormat = AnyOpenAIConversationLikeResponseFormat|OpenAITextResponseFormat;

/**任何 Gemini API 接口的回复格式 */
export type AnyGeminiResponseFormat = GeminiResponseFormat;

/**任何 文本完成 API 接口的回复格式 */
export type AnyTextCompletionResponseFormat = AnyOpenAIResponseFormat|AnyGeminiResponseFormat;