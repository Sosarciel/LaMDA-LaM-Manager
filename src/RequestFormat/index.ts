// MODULE:请求格式 API的原始请求格式 #LaMManager
import type { DeepseekRequestFormat } from './Deepseek';
import type { GeminiRequestFormat } from './Gemini';
import type { OpenAIConversationRequestFormat } from './OpenAIConversation';
import type { OpenAITextRequestFormat } from './OpenAIText';

export * from './Deepseek';
export * from './OpenAIConversation';
export * from './OpenAIText';
export * from './Gemini';
export * from './GeminiCompat';


export type AnyDeepseekRequestFormat = DeepseekRequestFormat;
export type AnyOpenaiRequestFormat = OpenAIConversationRequestFormat|OpenAITextRequestFormat;
export type AnyGeminiRequestFormat = GeminiRequestFormat;

/**任何文本完成模型的配置 */
export type AnyTextCompletionRequestFormat = AnyDeepseekRequestFormat|AnyOpenaiRequestFormat|AnyGeminiRequestFormat;