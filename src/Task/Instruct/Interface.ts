import type { TextCompletionOption, TextCompletionResult } from "Task/DataInterface";

/**指导式文本生成任务选项
 * 扩展自 TextCompletionOption
 */
export type InstructTaskOption = TextCompletionOption & {
    /** 主要提示文本（必需） */
    prompt: string;
    /** 前缀文本（用于前缀续写模式） */
    prefix?: string;
    /** FIM 模式：后缀文本 */
    suffix?: string;
    /** 停止词列表 */
    stop?: string[];
    /** 是否返回 logprobs。
     * 传统 Instruct/Completion 任务常用于代码评估，此字段很有用。
     */
    logprobs?: number;
    /** 是否在返回结果中包含原始 prompt */
    echo?: boolean;
};

/** 指导式文本生成任务接口 */
export type InstructTaskInterface = {
    /** 计算提示文本的 Token 数量 */
    computeTokenCount(prompt: string): Promise<number>;
    /** 执行指导式文本生成 */
    execute(opt: InstructTaskOption): Promise<TextCompletionResult>;
};
