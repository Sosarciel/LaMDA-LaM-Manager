import { ChatTaskTool, MessageType } from "@/TextCompletion/ChatTaskInterface";
import { AnyOpenAITextApiRespFormat, ITextCompletionResp } from "@/TextCompletion/TextCompletionInterface";





/**OpenAI传统API格式的响应处理
 * @class
 * @param resp - gpt系列模型的响应
 * @param apiKeyRouter - key路由器
 */
class OpenAITextAPITextAPIResp implements ITextCompletionResp {
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

export const OpenAITextChatTaskTool: ChatTaskTool<string> = {
    transReq(chatTarget,messageList){
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
    },
    formatReq(chatTarget,chatText){
        return `${chatText}\n${chatTarget}:`;
    },
    formatResp:(resp)=> new OpenAITextAPITextAPIResp(resp as AnyOpenAITextApiRespFormat)
}