import type { TextCompletionOption, TextCompletionResult } from "../Interface";
/**聊天任务配置 */
export type ChatTaskOption = TextCompletionOption & {
    /**聊天的历史记录 */
    messages: LaMChatMessages;
    /**聊天的目标名称 */
    target: string;
};
/**默认的聊天设置 */
export declare const ChatTaskOptionPreset: import("@zwa73/utils").Preset<ChatTaskOption, {
    max_tokens: number;
    temperature: number;
    top_p: number;
    presence_penalty: number;
    frequency_penalty: number;
    n: number;
    logit_bias: null;
    think_budget: null;
    preferred_account: [];
    log_level: "none";
}>;
/**通用消息表 */
export type LaMChatMessages = {
    /**临时提示 */
    tempPrompt?: string;
    /**对话消息 */
    list: (CharMessageEntry | SystemMessageEntry)[];
};
/**角色消息对象 */
export type CharMessageEntry = {
    /**必定为 chat */
    type: 'chat';
    /**角色名称 */
    senderName: string;
    /**消息内容 */
    content: string;
};
/**旁白消息对象 */
export type SystemMessageEntry = {
    /**必定为 desc */
    type: 'desc';
    /**消息内容 */
    content: string;
};
/**消息可用类型 */
export declare const MessageTypeList: string[];
export type MessageType = typeof MessageTypeList[number];
/**聊天任务接口 */
export type ChatTaskInterface = {
    /**计算token数量
     * @async
     * @param messageList - 待计算的通用消息列表
     * @returns token数
     */
    countToken(messageList: LaMChatMessages): Promise<number>;
    /**和语言模型实例对话
     * @param opt - 对话选项
     * @returns 对话结果
     */
    execute(opt: ChatTaskOption): Promise<TextCompletionResult>;
};
