// MODULE:请求格式 API的原始请求格式 #LaMManager
import type { DeepseekRequest } from './Deepseek';
import type { GeminiRequest } from './Gemini';
import type { GLMRequest } from './GLM';
import type { OpenAIChatRequest } from './OpenAIChat';
import type { OpenAITextRequest } from './OpenAIText';

export * from './Deepseek';
export * from './GLM';
export * from './OpenAIChat';
export * from './OpenAIText';
export * from './Gemini';
export * from './GeminiCompat';


export type AnyDeepseekRequest = DeepseekRequest;
export type AnyGLMRequest = GLMRequest;
export type AnyOpenaiRequest = OpenAIChatRequest|OpenAITextRequest;
export type AnyGeminiRequest = GeminiRequest;

/**任何文本完成模型的配置 */
export type AnyTextCompletionRequest = AnyDeepseekRequest|AnyOpenaiRequest|AnyGeminiRequest|AnyGLMRequest;