
export * from './GPTChat';
export * from './GPTText';
export * from './DeepseekChat';
export * from './GeminiInterface';


import { DeepseekChatOption, GeminiChatOption, OpenAIChatChatOption, OpenAITextOption } from '@/src/ChatTask';
import { DeepseekChatModel } from './DeepseekChat';
import { GoogleChatModel } from './GeminiInterface';
import { OpenAIChatModel } from './GPTChat';
import { OpenAITextModel } from './GPTText';

export type AnyOpenaiModel = OpenAITextModel|OpenAIChatModel;

export type AnyDeepseekModel = DeepseekChatModel;

export type AnyGoogleModel = GoogleChatModel;

/**任何文本完成模型 */
export type AnyTextCompletionModel   = AnyOpenaiModel|AnyDeepseekModel|AnyGoogleModel;

export type AnyDeepseekOption = DeepseekChatOption;
export type AnyOpenaiOption = OpenAIChatChatOption|OpenAITextOption;
export type AnyGoogleOption = GeminiChatOption;

/**任何文本完成模型的配置 */
export type AnyTextCompletionOption = AnyDeepseekOption|AnyOpenaiOption|AnyGoogleOption;
