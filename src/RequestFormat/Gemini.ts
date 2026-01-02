

/** Gemini API 请求格式 */
export type GeminiRequestFormat={
    /** 系统指令 */
    system_instruction:{parts:{text: string}};
    /** 对话内容列表 */
    contents:GeminiAPIEntry[];
    /** 生成配置 */
    generationConfig:{
        /** 停止序列 */
        stopSequences: string[]|undefined;
        /** 温度参数 */
        temperature?: number|undefined;
        /** 最大输出 token 数 */
        maxOutputTokens?: number|undefined;
        /** Top-P 采样参数 */
        topP?: number|undefined;
        /** Top-K 采样参数 */
        topK?: number|undefined;
        /** 思考预算 */
        thinkingBudget?: number|undefined;
        /** 思考配置 */
        thinkingConfig?: {
            /** 思考预算 */
            thinkingBudget:number|undefined;
            /** 是否返回明文思考过程，默认返回思考 key */
            includeThoughts:boolean|undefined;
        }
    }
}

/** Gemini API 消息条目 */
export type GeminiAPIEntry={
    /** 角色 */
    role: GeminiAPIRole;
    /** 消息部分列表 */
    parts:[{text:string}];
}

/** Gemini API 角色枚举 */
export const GeminiAPIRole = {
    /** 用户角色 */
    User:"user",
    /** 模型角色 */
    Model:"model",
} as const;
export type GeminiAPIRole = typeof GeminiAPIRole[keyof typeof GeminiAPIRole];

/** 用于 Gemini API 的消息数据 */
export type GeminiApiData = {
    /** 消息列表 */
    message:GeminiAPIEntry[];
    /** 定义 */
    define :string;
}

