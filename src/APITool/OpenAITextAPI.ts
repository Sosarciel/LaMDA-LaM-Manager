import { AnyOpenAITextApiRespFormat, ITextCompletionResp, LaMChatMessages, MessageType } from "../TextCompletion";


/**转换一个 OpenAI传统API 模型所用的messageEntry
 * @param messageList - 待转换的通用消息列表
 */
export function transOpenAITextAPITextApiReq(messageList:LaMChatMessages): string{
    let ntext="";

    //处理主消息列表
    for(const item of messageList){
        ntext=item.type==MessageType.DESC
        ? `${ntext}\n${item.content}`
        : `${ntext}\n${item.name}:${item.content}`;
    }

    //处理临时提示
    if(messageList.getTemporaryPrompt().length>0)
        ntext += messageList.getTemporaryPrompt();

    return ntext.trim();
}
/**给聊天信息加上询问格式, 让模型稳定输出
 * @param chatTarget - 聊天目标
 * @param chatText   - 待格式化的聊天信息
 * @returns 完成格式化 可以进行post的聊天信息
 */
export function formatOpenAITextAPITextApiReq(chatTarget:string,chatText:string):string{
    return `${chatText}\n${chatTarget}:`;
}


/**OpenAI传统API格式的响应处理
 * @class
 * @param resp - gpt系列模型的响应
 * @param apiKeyRouter - key路由器
 */
export class OpenAITextAPITextAPIResp implements ITextCompletionResp {
    constructor(resp: AnyOpenAITextApiRespFormat) {
        this.resp = resp;
    }
    private resp: AnyOpenAITextApiRespFormat;
    isVaild() {
        return this.getChoiceList().length >= 1;
    }
    getChoiceList(): string[] {
        const sList: string[] = [];
        const choices = this.resp.choices;
        for (const choice of choices) sList.push(choice.text);
        return sList;
    }
    getChoice(index: number): string | null {
        const choices = this.resp.choices;
        if (index >= choices.length || index < 0) return null;
        return choices[index].text;
    }
    setChoice(index: number, msg: string): void {
        const choices = this.resp.choices;
        if (index >= choices.length || index < 0) return;
        choices[index].text = msg;
    }
}