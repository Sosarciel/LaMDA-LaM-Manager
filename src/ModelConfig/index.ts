
export * from './OpenAIConversation';
export * from './OpenAIText';
export * from './Deepseek';
export * from './Gemini';


import { DeepseekOption, GeminiOption, OpenAIConversationOption, OpenAITextOption } from 'RequestFormat';
import { DeepseekModel } from './Deepseek';
import { GeminiModel } from './Gemini';
import { OpenAIConversationModel } from './OpenAIConversation';
import { OpenAITextModel } from './OpenAIText';

export type AnyOpenaiModel = OpenAITextModel|OpenAIConversationModel;

export type AnyDeepseekModel = DeepseekModel;

export type AnyGoogleModel = GeminiModel;

/**任何文本完成模型 */
export type AnyTextCompletionModel   = AnyOpenaiModel|AnyDeepseekModel|AnyGoogleModel;

export type AnyDeepseekOption = DeepseekOption;
export type AnyOpenaiOption = OpenAIConversationOption|OpenAITextOption;
export type AnyGeminiOption = GeminiOption;

/**任何文本完成模型的配置 */
export type AnyTextCompletionOption = AnyDeepseekOption|AnyOpenaiOption|AnyGeminiOption;
