// MODULE:响应格式 API的原始响应格式 #LaMManager
import type { DeepseekResponse } from './Deepseek';
import type { GeminiResponse } from './Gemini';
import type { OpenAIChatResponse } from './OpenAIChat';
import type { OpenAITextResponse } from './OpenAIText';


export * from './Deepseek';
export * from './Gemini';
export * from './OpenAIChat';
export * from './OpenAIText';
export * from './OpenAIError';


/**任何 OpenAI对话风格 API 接口的回复格式 */
export type AnyOpenAIChatLikeResponse = OpenAIChatResponse|DeepseekResponse;

/**任何 OpenAI API 接口的回复格式*/
export type AnyOpenAIResponse = AnyOpenAIChatLikeResponse|OpenAITextResponse;

/**任何 Gemini API 接口的回复格式 */
export type AnyGeminiResponse = GeminiResponse;

/**任何 文本完成 API 接口的回复格式 */
export type AnyTextCompletionResponse = AnyOpenAIResponse|AnyGeminiResponse;