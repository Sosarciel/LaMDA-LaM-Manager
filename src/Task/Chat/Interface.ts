import { preset } from "@zwa73/utils";

import type { TextCompletionOption, TextCompletionResult } from "Task/DataInterface";


/**聊天任务配置 */
export type ChatTaskOption = TextCompletionOption&{
    /**聊天的历史记录 */
    messages: LaMChatMessages;
    /**聊天的目标名称 用于判断消息role */
    target:string;
    /**临时提示 */
    hint?:string;
}
/**默认的聊天设置 */
export const ChatTaskOptionPreset = preset<ChatTaskOption>()({
    max_tokens       : 16  ,
    temperature      : 1   ,
    top_p            : 1   ,
    presence_penalty : 0   ,
    frequency_penalty: 0   ,
    n                : 1   ,
    logit_bias       : null,
    think_budget     : 'non',
    preferred_account: [] as [],
    log_level        : "none",
});

/**通用消息表 */
export type LaMChatMessages = (CharMessageEntry|SystemMessageEntry)[];

/**角色消息对象 */
export type CharMessageEntry={
    /**必定为 chat */
    type:'chat';
    /**角色名称 */
    senderName:string;
    /**消息内容 */
    content:string;
}
/**旁白消息对象 */
export type SystemMessageEntry={
    /**必定为 desc */
    type:'desc';
    /**消息内容 */
    content:string;
}

/**消息可用类型 */
export const MessageTypeList = ["chat","desc"];
export type MessageType = typeof MessageTypeList[number];

/**聊天任务接口 */
export type ChatTaskInterface = {
    /**计算token数量
     * @async
     * @param messageList - 待计算的通用消息列表
     * @returns token数
     */
    computeTokenCount(messageList:LaMChatMessages):Promise<number>;
    /**和语言模型实例对话
     * @param opt - 对话选项
     * @returns 对话结果
     */
    execute(opt:ChatTaskOption):Promise<TextCompletionResult>
}