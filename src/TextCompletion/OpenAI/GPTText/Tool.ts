import { ChatTaskTool, MessageType } from "@/TextCompletion/ChatTaskInterface";
import { AnyOpenAITextRespFormat } from "../Resp";



export const OpenAITextChatTaskTool: ChatTaskTool<string,AnyOpenAITextRespFormat> = {
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
    formatResp:(resp)=>{
        // 提取 choices 列表
        const choices = resp.choices
            .filter(choice => choice?.text != undefined)
            .map(choice => ({ content: choice.text }));

        return {
            choices,
            vaild: choices.length > 0,
        };
    }
}