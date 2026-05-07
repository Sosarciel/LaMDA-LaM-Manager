import path from 'pathe';

import { DATA_PATH } from 'Constant';
import type { CredCategoryJsonTable, CredServiceJsonTable } from 'CredService';
import type { LaMServiceJsonTable } from 'LaMService';
import type { ChatTaskOption, InstructTaskOption } from 'Task';

import {
    DeepseekResponseExample, GLMResponseExample, GeminiResponseExample, OpenAIChatResponseExample, OpenAITextResponseExample,
    type DeepseekResponse, type GLMResponse, type GeminiResponse, type OpenAIChatResponse, type OpenAITextResponse
} from '@/src/ResponseFormat';


export namespace LaMManagerMockTool{

    export const MOCK_PATH = path.join(DATA_PATH,'mock');
    export const MOCK_USER = "mock_user";
    export const MOCK_CHAR = "mock_char";
    export const MOCK_CRED_CATEGORY = "MockCredCategory";
    export const MOCK_CRED_APIKEY = "mock_api_key";
    export const MOCK_CRED_NAME = "MockCred";

    /** 获取 Mock 凭证类别表 */
    export const getMockCredCategoryTable = (port: number) => ({
        category_table: {
            MockCredCategory: {
                id: MOCK_CRED_CATEGORY,
                hostname: "localhost",
                port: port,
                protocol: "http",
                valid_model:["*"],
            },
        },
    } as const satisfies CredCategoryJsonTable);

    export const MOCK_CRED_SERVICE_TABLE = {
        instance_table: {
            MockCred: {
                type: "Common",
                name: MOCK_CRED_NAME,
                data: {
                    cred_category: MOCK_CRED_CATEGORY,
                    api_key: MOCK_CRED_APIKEY,
                    is_available: true,
                    credit_limit: 100000,
                    used_credit: 0,
                },
            },
        },
    } as const satisfies CredServiceJsonTable;

    export const MOCK_LAM_SERVICE_TABLE = {
        instance_table: {
            Chat_GPT35Chat: {
                name: "Chat_GPT35Chat",
                type: "HttpAPIModel",
                data: {
                    config: {
                        endpoint: "/v1/chat/completions",
                        chat_formater: "openai_chat",
                        tokensizer: "cl100k_base",
                        interactor: "openai",
                        id: "gpt-3.5-turbo",
                        alias: "Chat_GPT35Chat",
                        price: {
                            promptPrice: 0.0005,
                            completionPrice: 0.0015,
                        },
                    },
                    default_option: {
                        max_hist_length: 6000,
                    },
                },
            },
            Chat_GPT35Text: {
                name: "Chat_GPT35Text",
                type: "HttpAPIModel",
                data: {
                    config: {
                        endpoint: "/v1/completions",
                        chat_formater: "openai_text",
                        tokensizer: "cl100k_base",
                        interactor: "openai",
                        id: "gpt-3.5-turbo-instruct",
                        alias: "Chat_GPT35Text",
                        price: {
                            promptPrice: 0.0015,
                            completionPrice: 0.002,
                        },
                    },
                    default_option: {
                        temperature: 0.9,
                        max_hist_length: 3000,
                    },
                },
            },
            Chat_DeepseekChat: {
                name: "Chat_DeepseekChat",
                type: "HttpAPIModel",
                data: {
                    config: {
                        tokensizer: "deepseek",
                        interactor: "openai",
                        chat_formater: "deepseek_chat",
                        endpoint: "/v1/chat/completions",
                        id: "deepseek-chat",
                        alias: "Chat_DeepseekChat",
                        price: {
                            cacheHitPromptPrice: 0.0005,
                            promptPrice: 0.002,
                            completionPrice: 0.008,
                        },
                    },
                    default_option: {
                        temperature: 1.5,
                        max_hist_length: 3000,
                    },
                },
            },
            Chat_Gemini3Pro: {
                name: "Chat_Gemini3Pro",
                type: "HttpAPIModel",
                data: {
                    config: {
                        tokensizer: "cl100k_base",
                        interactor: "gemini",
                        chat_formater: "google_chat",
                        endpoint: "/v1beta/models",
                        id: "gemini-3-pro-preview",
                        alias: "Chat_Gemini3Pro",
                        price: {
                            promptPrice: 0.00125,
                            completionPrice: 0.01,
                        },
                    },
                    default_option: {
                        temperature: 1,
                        max_hist_length: 4000,
                        think_budget: "min",
                    },
                },
            },
            Instruct_GPT35Text: {
                name: "Instruct_GPT35Text",
                type: "HttpAPIModel",
                data: {
                    config: {
                        endpoint: "/v1/completions",
                        chat_formater: "openai_text",
                        instruct_formater: "openai_text",
                        tokensizer: "cl100k_base",
                        interactor: "openai",
                        id: "gpt-3.5-turbo-instruct",
                        alias: "Instruct_GPT35Text",
                        price: {
                            promptPrice: 0.0015,
                            completionPrice: 0.002,
                        },
                    },
                    default_option: {
                        temperature: 0.7,
                        max_tokens: 100,
                    },
                },
            },
            Instruct_DeepseekText: {
                name: "Instruct_DeepseekText",
                type: "HttpAPIModel",
                data: {
                    config: {
                        endpoint: "/v1/completions",
                        chat_formater: "openai_text",
                        instruct_formater: "deepseek_text",
                        tokensizer: "deepseek",
                        interactor: "openai",
                        id: "deepseek-chat",
                        alias: "Instruct_DeepseekText",
                        price: {
                            promptPrice: 0.002,
                            completionPrice: 0.008,
                        },
                    },
                    default_option: {
                        temperature: 0.3,
                        max_tokens: 200,
                    },
                },
            },
            Instruct_DeepseekPrefix: {
                name: "Instruct_DeepseekPrefix",
                type: "HttpAPIModel",
                data: {
                    config: {
                        endpoint: "/v1/chat/completions",
                        chat_formater: "deepseek_chat",
                        instruct_formater: "deepseek_prefix",
                        tokensizer: "deepseek",
                        interactor: "openai",
                        id: "deepseek-chat",
                        alias: "Instruct_DeepseekPrefix",
                        price: {
                            promptPrice: 0.002,
                            completionPrice: 0.008,
                        },
                    },
                    default_option: {
                        temperature: 0.3,
                        max_tokens: 200,
                    },
                },
            },
        },
    } as const satisfies LaMServiceJsonTable;

    /**构建MockServer响应文本 */
    export const buildMockResponseText = (modelId: string): string => {
        return `对 ${modelId} 反馈`;
    };

    /**构建指示模式测试选项 */
    export const buildInstructOption = (prompt: string, options?: {
        suffix?: string;
        prefix?: string;
        max_tokens?: number;
        temperature?: number;
    }) => {
        return {
            prompt: prompt,
            suffix: options?.suffix,
            prefix: options?.prefix,
            max_tokens: options?.max_tokens || 100,
            temperature: options?.temperature || 0.7,
        };
    };
}

export namespace MockResponseFactory {

    /**创建OpenAI Chat响应 */
    export const createOpenAIChatResponse = (overrides: Partial<OpenAIChatResponse> = {}): OpenAIChatResponse => ({
        ...OpenAIChatResponseExample,
        ...overrides,
    });

    /**创建OpenAI Text响应 */
    export const createOpenAITextResponse = (overrides: Partial<OpenAITextResponse> = {}): OpenAITextResponse => ({
        ...OpenAITextResponseExample,
        ...overrides,
    });

    /**创建Deepseek响应 */
    export const createDeepseekResponse = (overrides: Partial<DeepseekResponse> = {}): DeepseekResponse => ({
        ...DeepseekResponseExample,
        ...overrides,
    });

    /**创建GLM响应 */
    export const createGLMResponse = (overrides: Partial<GLMResponse> = {}): GLMResponse => ({
        ...GLMResponseExample,
        ...overrides,
    });

    /**创建Gemini响应 */
    export const createGeminiResponse = (overrides: Partial<GeminiResponse> = {}): GeminiResponse => ({
        ...GeminiResponseExample,
        ...overrides,
    });

    /**创建带思考的Gemini响应 */
    export const createGeminiResponseWithThought = (thought: string, content: string, overrides: Partial<GeminiResponse> = {}): GeminiResponse => ({
        ...GeminiResponseExample,
        candidates: [{
            content: {
                parts: [
                    { text: thought, thought: true },
                    { text: content },
                ],
                role: "model",
            },
            finishReason: "STOP",
            avgLogprobs: -0.1,
        }],
        modelVersion: "gemini-3-pro",
        ...overrides,
    });
}

export namespace MockOptionFactory {

    /**创建聊天任务选项 */
    export const createChatTaskOption = (overrides: Partial<ChatTaskOption> = {}):ChatTaskOption => ({
        messages: overrides.messages ?? [
            { type: 'desc' as const, content: '系统描述' },
            { type: 'chat' as const, senderName: 'user', content: '你好' },
            { type: 'chat' as const, senderName: 'assistant', content: '你好！' },
        ],
        target: overrides.target ?? 'assistant',
        hint: overrides.hint,
        max_tokens: overrides.max_tokens ?? 100,
        temperature: overrides.temperature ?? 1,
        top_p: overrides.top_p ?? 1,
        presence_penalty: overrides.presence_penalty ?? 0,
        frequency_penalty: overrides.frequency_penalty ?? 0,
        n: overrides.n ?? 1,
        stop: overrides.stop,
        think_budget: overrides.think_budget,
        logit_bias: null,
        preferred_account: [],
        log_level: "none" as const,
    });

    /**创建指示任务选项 */
    export const createInstructTaskOption = (overrides: Partial<InstructTaskOption> = {}):InstructTaskOption => ({
        prompt: overrides.prompt ?? '请续写以下内容：',
        suffix: overrides.suffix,
        prefix: overrides.prefix,
        max_tokens: overrides.max_tokens ?? 100,
        temperature: overrides.temperature ?? 0.7,
        top_p: overrides.top_p ?? 1,
        presence_penalty: 0,
        frequency_penalty: 0,
        n: 1,
        stop: overrides.stop,
        logprobs: overrides.logprobs,
        echo: overrides.echo,
        logit_bias: null,
        preferred_account: [],
        log_level: "none" as const,
    });
}
