

export * from './Deepseek';
export * from './Gemini';
export * from './OpenAIConversation';
export * from './OpenAIText';
export * from './OpenAIError';

import { AnyDeepseekChatRespFormat } from './Deepseek';
import { AnyGeminiChatRespFormat } from './Gemini';
import { AnyOpenAIChatRespFormat } from './OpenAIConversation';
import { AnyOpenAITextRespFormat } from './OpenAIText';

/**任何 OpenAI Chat API 接口的回复格式 */
export type AnyOpenAIChatApiRespFormat  = AnyOpenAIChatRespFormat|AnyDeepseekChatRespFormat;
/**任何 OpenAI Text API 接口的回复格式 */
export type AnyOpenAITextApiRespFormat  = AnyOpenAITextRespFormat;
/**任何 OpenAI API 接口的回复格式 */
export type AnyOpenAIApiRespFormat = AnyOpenAIChatApiRespFormat|AnyOpenAITextApiRespFormat;
/**任何 Google Chat API 接口的回复格式 */
export type AnyGeminiChatApiRespFormat  = AnyGeminiChatRespFormat;
/**任何 Google API 接口的回复格式 */
export type AnyGeminiApiRespFormat = AnyGeminiChatApiRespFormat;
/**任何 文本完成 API 接口的回复格式 */
export type AnyTextCompletionRespFormat = AnyOpenAIChatApiRespFormat|AnyOpenAITextApiRespFormat|AnyGeminiChatApiRespFormat;