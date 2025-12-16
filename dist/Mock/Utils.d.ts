export declare namespace LaMManagerMockTool {
    const MOCK_PATH: string;
    const MOCK_USER = "mock_user";
    const MOCK_CHAR = "mock_char";
    const MOCK_PORT = 3000;
    const MOCK_CRED_CATEGORY = "MockCredCategory";
    const MOCK_CRED_APIKEY = "mock_api_key";
    const MOCK_CRED_NAME = "MockCred";
    const MOCK_CRED_CATEGORY_TABLE: {
        readonly category_table: {
            readonly MockCredCategory: {
                readonly id: "MockCredCategory";
                readonly hostname: "localhost";
                readonly port: 3000;
                readonly protocol: "http";
            };
        };
    };
    const MOCK_CRED_SERVICE_TABLE: {
        readonly instance_table: {
            readonly MockCred: {
                readonly type: "Common";
                readonly name: "MockCred";
                readonly data: {
                    readonly cred_category: "MockCredCategory";
                    readonly api_key: "mock_api_key";
                    readonly is_available: true;
                    readonly credit_limit: 100000;
                    readonly used_credit: 0;
                };
            };
        };
    };
    const MOCK_LAM_SERVICE_TABLE: {
        readonly instance_table: {
            readonly GPT35Chat: {
                readonly name: "GPT35Chat";
                readonly type: "HttpAPIModel";
                readonly data: {
                    readonly config: {
                        readonly endpoint: "/v1/chat/completions";
                        readonly chat_formater: "openai_chat";
                        readonly tokensizer: "cl100k_base";
                        readonly interactor: "openai";
                        readonly id: "gpt-3.5-turbo";
                        readonly alias: "GPT35Chat";
                        readonly price: {
                            readonly promptPrice: 0.0005;
                            readonly completionPrice: 0.0015;
                        };
                        readonly valid_account: ["MockCredCategory"];
                    };
                    readonly default_option: {
                        readonly max_hist: 6000;
                    };
                };
            };
            readonly GPT35Text: {
                readonly name: "GPT35Text";
                readonly type: "HttpAPIModel";
                readonly data: {
                    readonly config: {
                        readonly endpoint: "/v1/completions";
                        readonly chat_formater: "openai_text";
                        readonly tokensizer: "cl100k_base";
                        readonly interactor: "openai";
                        readonly id: "gpt-3.5-turbo-instruct";
                        readonly alias: "GPT35Text";
                        readonly price: {
                            readonly promptPrice: 0.0015;
                            readonly completionPrice: 0.002;
                        };
                        readonly valid_account: ["MockCredCategory"];
                    };
                    readonly default_option: {
                        readonly temperature: 0.9;
                        readonly max_hist: 3000;
                    };
                };
            };
            readonly DeepseekChat: {
                readonly name: "DeepseekChat";
                readonly type: "HttpAPIModel";
                readonly data: {
                    readonly config: {
                        readonly tokensizer: "deepseek";
                        readonly interactor: "openai";
                        readonly chat_formater: "deepseek_chat";
                        readonly endpoint: "/v1/chat/completions";
                        readonly id: "deepseek-chat";
                        readonly alias: "DeepseekChat";
                        readonly price: {
                            readonly cacheHitPromptPrice: 0.0005;
                            readonly promptPrice: 0.002;
                            readonly completionPrice: 0.008;
                        };
                        readonly valid_account: ["MockCredCategory"];
                    };
                    readonly default_option: {
                        readonly temperature: 1.5;
                        readonly max_hist: 3000;
                    };
                };
            };
        };
    };
    /**构建一个响应 */
    const buildResp: (id: string, msg?: string) => string;
}
