"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaMManagerMockTool = void 0;
const pathe_1 = __importDefault(require("pathe"));
const Constant_1 = require("../Constant");
var LaMManagerMockTool;
(function (LaMManagerMockTool) {
    LaMManagerMockTool.MOCK_PATH = pathe_1.default.join(Constant_1.DATA_PATH, 'mock');
    LaMManagerMockTool.MOCK_USER = "mock_user";
    LaMManagerMockTool.MOCK_CHAR = "mock_char";
    LaMManagerMockTool.MOCK_PORT = 3000;
    LaMManagerMockTool.MOCK_CRED_CATEGORY = "MockCredCategory";
    LaMManagerMockTool.MOCK_CRED_APIKEY = "mock_api_key";
    LaMManagerMockTool.MOCK_CRED_NAME = "MockCred";
    LaMManagerMockTool.MOCK_CRED_CATEGORY_TABLE = {
        category_table: {
            MockCredCategory: {
                id: LaMManagerMockTool.MOCK_CRED_CATEGORY,
                hostname: "localhost",
                port: 3000,
                protocol: "http",
            },
        },
    };
    LaMManagerMockTool.MOCK_CRED_SERVICE_TABLE = {
        instance_table: {
            MockCred: {
                type: "Common",
                name: LaMManagerMockTool.MOCK_CRED_NAME,
                data: {
                    cred_category: LaMManagerMockTool.MOCK_CRED_CATEGORY,
                    api_key: LaMManagerMockTool.MOCK_CRED_APIKEY,
                    is_available: true,
                    credit_limit: 100000,
                    used_credit: 0,
                },
            },
        },
    };
    LaMManagerMockTool.MOCK_LAM_SERVICE_TABLE = {
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
                        valid_account: [LaMManagerMockTool.MOCK_CRED_CATEGORY],
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
                        valid_account: [LaMManagerMockTool.MOCK_CRED_CATEGORY],
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
                        valid_account: [LaMManagerMockTool.MOCK_CRED_CATEGORY],
                    },
                    default_option: {
                        temperature: 1.5,
                        max_hist: 3000,
                    },
                },
            }
        },
    };
    /**构建一个响应 */
    LaMManagerMockTool.buildResp = (id, msg) => {
        return `来自 ${id} 对 ${msg ?? "未定义消息"} 的响应`;
    };
})(LaMManagerMockTool || (exports.LaMManagerMockTool = LaMManagerMockTool = {}));
