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
            GPT35Chat: {
                name: "GPT35Chat",
                type: "HttpAPIModel",
                data: {
                    config: {
                        endpoint: "/v1/chat/completions",
                        chat_formater: "openai_chat",
                        tokensizer: "cl100k_base",
                        interactor: "openai",
                        id: "gpt-3.5-turbo",
                        alias: "GPT35Chat",
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
            GPT35Text: {
                name: "GPT35Text",
                type: "HttpAPIModel",
                data: {
                    config: {
                        endpoint: "/v1/completions",
                        chat_formater: "openai_text",
                        tokensizer: "cl100k_base",
                        interactor: "openai",
                        id: "gpt-3.5-turbo-instruct",
                        alias: "GPT35Text",
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
            DeepseekChat: {
                name: "DeepseekChat",
                type: "HttpAPIModel",
                data: {
                    config: {
                        tokensizer: "deepseek",
                        interactor: "openai",
                        chat_formater: "deepseek_chat",
                        endpoint: "/v1/chat/completions",
                        id: "deepseek-chat",
                        alias: "DeepseekChat",
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
            }
        },
    } as const satisfies LaMServiceJsonTable;

    /**构建一个响应 */
    export const buildResp = (id:string,msg?:string)=>{
        return `来自 ${id} 对 ${msg??"未定义消息"} 的响应`;
    };
}