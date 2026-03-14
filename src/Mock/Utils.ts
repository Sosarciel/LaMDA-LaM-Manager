import path from 'pathe';

import { DATA_PATH } from 'Constant';
import type { CredCategoryJsonTable, CredServiceJsonTable } from 'CredService';
import type { LaMServiceJsonTable } from 'LaMService';


export namespace LaMManagerMockTool{

    export const MOCK_PATH = path.join(DATA_PATH,'mock');
    export const MOCK_USER = "mock_user";
    export const MOCK_CHAR = "mock_char";
    export const MOCK_PORT = 3000;
    export const MOCK_CRED_CATEGORY = "MockCredCategory";
    export const MOCK_CRED_APIKEY = "mock_api_key";
    export const MOCK_CRED_NAME = "MockCred";

    export const MOCK_CRED_CATEGORY_TABLE = {
        category_table: {
            MockCredCategory: {
                id: MOCK_CRED_CATEGORY,
                hostname: "localhost",
                port: 3000,
                protocol: "http",
                valid_model:["*"],
            },
        },
    } as const satisfies CredCategoryJsonTable;

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
            // Chat 任务模型（添加 Chat_ 前缀）
            Chat_GPT35Chat: {
                name: "Chat_GPT35Chat",
                type: "HttpAPIModel",
                data: {
                    config: {
                        endpoint: "/chat/v1/chat/completions",
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
                        max_hist: 6000,
                    },
                },
            },
            Chat_GPT35Text: {
                name: "Chat_GPT35Text",
                type: "HttpAPIModel",
                data: {
                    config: {
                        endpoint: "/chat/v1/completions",
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
                        max_hist: 3000,
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
                        endpoint: "/chat/v1/chat/completions",
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
                        max_hist: 3000,
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
                        endpoint: "/chat/v1beta/models",
                        id: "gemini-3-pro-preview",
                        alias: "Chat_Gemini3Pro",
                        price: {
                            promptPrice: 0.00125,
                            completionPrice: 0.01,
                        },
                    },
                    default_option: {
                        temperature: 1,
                        max_hist: 4000,
                        think_budget: "min",
                    },
                },
            },
            // 指示模式测试模型（添加 Instruct_ 前缀）
            Instruct_GPT35Text: {
                name: "Instruct_GPT35Text",
                type: "HttpAPIModel",
                data: {
                    config: {
                        endpoint: "/instruct/v1/completions",
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
                        endpoint: "/instruct/v1/completions",
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
                        endpoint: "/instruct/v1/chat/completions",
                        chat_formater: "deepseek_chat",
                        instruct_formater: "deepseek_prefix",
                        tokensizer: "deepseek",
                        interactor: "openai",
                        id: "deepseek-chat",
                        alias: "Instruct_DeepseekPrefixCompletion",
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

    /**构建一个响应 */
    export const buildResp = (id:string,msg?:string)=>{
        return `来自 ${id} 对 ${msg??"未定义消息"} 的响应`;
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
