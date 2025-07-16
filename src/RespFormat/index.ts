

export * from './Deepseek';
export * from './Google';
export * from './OpenAI';


import { AnyDeepseekChatRespFormat } from './Deepseek';
import { AnyGoogleChatRespFormat } from './Google';
import { AnyOpenAIChatRespFormat, AnyOpenAITextRespFormat } from './OpenAI';
/**任何 OpenAI Chat API 接口的回复格式 */
export type AnyOpenAIChatApiRespFormat  = AnyOpenAIChatRespFormat|AnyDeepseekChatRespFormat;
/**任何 OpenAI Text API 接口的回复格式 */
export type AnyOpenAITextApiRespFormat  = AnyOpenAITextRespFormat;
/**任何 OpenAI API 接口的回复格式 */
export type AnyOpenAIApiRespFormat = AnyOpenAIChatApiRespFormat|AnyOpenAITextApiRespFormat;
/**任何 Google Chat API 接口的回复格式 */
export type AnyGoogleChatApiRespFormat  = AnyGoogleChatRespFormat;
/**任何 Google API 接口的回复格式 */
export type AnyGoogleApiRespFormat = AnyGoogleChatApiRespFormat;
/**任何 文本完成 API 接口的回复格式 */
export type AnyTextCompletionRespFormat = AnyOpenAIChatApiRespFormat|AnyOpenAITextApiRespFormat|AnyGoogleChatApiRespFormat;