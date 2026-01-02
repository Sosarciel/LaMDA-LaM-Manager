



/** OpenAI 文本补全请求格式 */
export type OpenAITextRequestFormat = Partial<{
    /** 模型名称 */
    model: string;
    /** 提示词 */
    prompt: string;
    /** 最大生成 token 数 */
    max_tokens: number;
    /** 温度参数 */
    temperature: number;
    /** Top-P 采样参数 */
    top_p: number;
    /** 停止序列 */
    stop: string[] | null;
    /** 存在惩罚 */
    presence_penalty: number;
    /** 频率惩罚 */
    frequency_penalty: number;
    /** Logit 偏置 */
    logit_bias: Record<string, number> | null;
    /** 生成数量 */
    n: number;
}>;
