import { assertType, LogLevel, PartialOption } from "@zwa73/utils";
import { AnyTextCompletionRespFormat, TextCompletionResp, TextCompletionOptions } from "./TextCompletionInterface";
import { CredsType } from "@sosraciel-lamda/creds-manager";

//#region 缺省option参数

/**默认的聊天设置 */
export const DEF_CHAT_OPT = {
    max_tokens       : 16  ,
    temperature      : 1   ,
    top_p            : 1   ,
    presence_penalty : 0   ,
    frequency_penalty: 0   ,
    n                : 1   ,
    preferred_account: [] as [],
} as const;
assertType<Partial<ChatTaskOption>>(DEF_CHAT_OPT);
/**默认设置为可选项的聊天设置 */
export type PartialChatOption = PartialOption<ChatTaskOption,typeof DEF_CHAT_OPT>;
//#endregion

/**聊天任务配置 */
export type ChatTaskOption = TextCompletionOptions&{
    /**聊天的历史记录 */
    messages: LaMChatMessages;
    /**聊天的目标名称 */
    target:string;
    /**首选账户 */
    preferred_account:CredsType[];
    /**log等级 */
    logLevel:LogLevel|'none';
}


/**通用消息表 */
export class LaMChatMessages extends Array<CharMessageEntry|SystemMessageEntry>{
    /**临时提示 */
    private _temporaryPrompt = '';
    /**添加一条角色entry
     * @param name      - 名称
     * @param content   - 内容
     * @param id        - 消息id 未定义代表未记录的临时消息或系统消息
     * @returns 添加后的数组长度
     */
    pushCharMessage(name:string,content:string,id:undefined|string):number{
        return this.push({
            type:MessageType.CHAT,
            name,
            content,
            id
        });
    }
    /**在头部添加一条角色entry
     * @param name      - 名称
     * @param content   - 内容
     * @param id        - 消息id 未定义代表未记录的临时消息或系统消息
     * @returns 添加后的数组长度
     */
    unshiftCharMessage(name:string,content:string,id:undefined|string):number{
        return this.unshift({
            type:MessageType.CHAT,
            name,
            content,
            id
        });
    }
    /**添加一条旁白entry
     * @param content   - 内容
     * @returns 添加后的数组长度
     */
    pushDescMessage(content:string):number{
        return this.push({
            type:MessageType.DESC,
            content,
        });
    }
    /**在头部添加一条旁白entry
     * @param content   - 内容
     * @returns 添加后的数组长度
     */
    unshiftDescMessage(content:string):number{
        return this.unshift({
            type:MessageType.DESC,
            content,
        });
    }
    /**克隆
     * @returns 新的 LaMChatMessages
     */
    clone():LaMChatMessages{
        const nlist = new LaMChatMessages(this.length);
        for(let i=0;i<this.length;i++)
            nlist[i] = this[i];
        nlist._temporaryPrompt = this._temporaryPrompt;
        return nlist;
    }
    /**链接
     * @returns 新的 LaMChatMessages
     */
    concatMessage(messageList:LaMChatMessages):LaMChatMessages{
        const nlist = this.clone();
        for(const item of messageList)
            nlist.push(item);
        return nlist;
    }

    /**设置临时提示 */
    setTemporaryPrompt(temporaryPrompt:string):LaMChatMessages{
        this._temporaryPrompt = temporaryPrompt;
        return this;
    }
    /**获取临时提示 */
    getTemporaryPrompt():string{
        return this._temporaryPrompt;
    }
}

/**角色消息对象 */
export type CharMessageEntry={
    /**必定为 chat */
    type:MessageType.CHAT;
    /**角色名称 */
    name:string;
    /**消息内容 */
    content:string;
    /**消息id 未定义代表未记录的临时消息或系统消息*/
    id?:string;
}
/**旁白消息对象 */
export type SystemMessageEntry={
    /**必定为 desc */
    type:MessageType.DESC;
    /**消息内容 */
    content:string;
}

/**消息可用角色类型 */
export enum MessageType{
    /**聊天信息 */
    CHAT="chat",
    /**旁白/描述 */
    DESC="desc",
}

export type ChatTaskTool<ModelMessageData> = {
    /**转换一个模型所用的messageEntry
     * @param chatTarget      - 聊天目标名
     * @param messageList     - 待转换的通用消息列表
     */
    transReq(chatTarget:string,messageList:LaMChatMessages): ModelMessageData;
    /**给聊天信息加上询问格式, 让模型稳定输出
     * @param chatTarget - 聊天目标
     * @param chatList   - 待格式化的聊天信息
     * @returns 完成格式化 可以进行post的聊天信息
     */
    formatReq(chatTarget:string,chatList:ModelMessageData):ModelMessageData;
    /**回复包装 */
    formatResp(resp:AnyTextCompletionRespFormat):TextCompletionResp;
}