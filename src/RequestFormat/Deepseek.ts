import { OpenAIChatAPIRole } from "./OpenAIChat";



/** Deepseek 模型请求格式 */
export type DeepseekRequest=Partial<{
    /** 模型名称 */
    model: string;
    /** 消息列表 */
    messages: DeepseekAPIEntry[];
    /** 最大生成 token 数 */
    max_tokens: number;
    /** 温度参数 */
    temperature: number;
    /** Top-P 采样参数 */
    top_p: number;
    /** 停止序列 */
    stop: string[]|null;
    /** 存在惩罚 */
    presence_penalty: number;
    /** 频率惩罚 */
    frequency_penalty: number;
}>;

/** Deepseek API 消息条目 */
export type DeepseekAPIEntry={
    /** 角色 */
    role: OpenAIChatAPIRole;
    /** 消息内容 */
    content:string;
    /** 指定为前缀补全模式 */
    prefix?:boolean;
}

export const DeepseekAPIRole = OpenAIChatAPIRole;
export type DeepseekAPIRole = OpenAIChatAPIRole;