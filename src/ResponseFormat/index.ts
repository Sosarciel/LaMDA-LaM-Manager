import { DeepseekRespFormat } from './Deepseek';
import { GeminiRespFormat } from './Gemini';
import { OpenAIConversationRespFormat } from './OpenAIConversation';
import { OpenAITextRespFormat } from './OpenAIText';


export * from './Deepseek';
export * from './Gemini';
export * from './OpenAIConversation';
export * from './OpenAIText';
export * from './OpenAIError';


/**任何 OpenAI对话风格 API 接口的回复格式 */
export type AnyOpenAIConversationLikeRespFormat = OpenAIConversationRespFormat|DeepseekRespFormat;
/**任何 文本完成 API 接口的回复格式 */
export type AnyTextCompletionRespFormat = AnyOpenAIConversationLikeRespFormat|OpenAITextRespFormat|GeminiRespFormat;