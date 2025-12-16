import type { DeepseekOption } from './Deepseek';
import type { GeminiOption } from './Gemini';
import type { OpenAIConversationOption } from './OpenAIConversation';
import type { OpenAITextOption } from './OpenAIText';
export * from './Deepseek';
export * from './OpenAIConversation';
export * from './OpenAIText';
export * from './Gemini';
export * from './GeminiCompat';
export type AnyDeepseekOption = DeepseekOption;
export type AnyOpenaiOption = OpenAIConversationOption | OpenAITextOption;
export type AnyGeminiOption = GeminiOption;
/**任何文本完成模型的配置 */
export type AnyTextCompletionOption = AnyDeepseekOption | AnyOpenaiOption | AnyGeminiOption;
