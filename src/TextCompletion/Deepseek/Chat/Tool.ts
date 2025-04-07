import { OpenAIChatAPIEntry, OpenAIChatChatTaskTool } from "@/TextCompletion/OpenAI/GPTChat/Tool";
import { AnyOpenAIChatApiRespFormat, ChatTaskTool, ITextCompletionResp, MessageType } from "TextCompletion";



/**用于Turbo模型的消息Entry */
export type DeepseekChatAPIEntry={
	role: DeepseekChatAPIRole;
	content:string;
    /**指定为前缀补全模式 */
    prefix?:boolean;
}

enum DeepseekChatAPIRole{
	User="user",
	Assistant="assistant",
	System="system",
}

/**清除特殊的对话续写格式
 * 暂时无效
 */
function formatMessage(message?:string):string|undefined{
    if(!message) return undefined;
    const match = message.match(/^.+?:([\s\S]+)$/);
    return match ? match[1] : message;
}

/**DeepseekChatAPI格式的响应处理
 * @class
 * @param resp - gpt系列模型的响应
 */
class DeepseekChatAPIResp implements ITextCompletionResp{
    constructor(resp:AnyOpenAIChatApiRespFormat){
        this.resp = resp;
    }
    private resp : AnyOpenAIChatApiRespFormat;


    isVaild(){
        return this.getChoiceList().length>=1;
    }
    getChoiceList ():string[]{
        const sList:string[] = [];
        const choices =  this.resp.choices;
        for(const choice of choices){
            const fmsg = (choice.message.content);
            if(fmsg) sList.push(fmsg);
        }
        return sList;
    }
    getChoice (index:number):string|null{
        const choices =  this.resp.choices;
        if(index>=choices.length || index<0)
            return null;
        return (choices[index].message.content) ?? null;
    }
    setChoice (index:number,msg:string):void{
        const choices =  this.resp.choices;
        if(index>=choices.length || index<0)
            return;
        choices[index].message.content = msg;
    }
}

/**传统OpenAI系统提示的Tool */
export const DeepseekChatChatTaskTool:ChatTaskTool<DeepseekChatAPIEntry[]> = {
    transReq(chatTarget,messageList){
        return OpenAIChatChatTaskTool.transReq(chatTarget,messageList) as unknown as DeepseekChatAPIEntry[];
    },
    formatReq(chatTarget,chatList){
        return OpenAIChatChatTaskTool.formatReq(chatTarget,chatList as unknown as OpenAIChatAPIEntry[]) as unknown as DeepseekChatAPIEntry[];
    },
    formatResp:(resp)=>new DeepseekChatAPIResp(resp as AnyOpenAIChatApiRespFormat),
}

/**使用前缀续写模式的Tool */
export const DeepseekChatBetaChatTaskTool:ChatTaskTool<DeepseekChatAPIEntry[]> = {
    transReq(chatTarget,messageList){
        const narr:DeepseekChatAPIEntry[] = [];

        //处理主消息列表
        for(const item of messageList){
            if(item.type==MessageType.DESC){
                narr.push({
                    role:DeepseekChatAPIRole.System,
                    content:item.content
                });
            }else{
                if(item.name==chatTarget){
                    narr.push({
                        role:DeepseekChatAPIRole.Assistant,
                        content:item.name+":"+item.content
                    });
                }else{
                    narr.push({
                        role:DeepseekChatAPIRole.User,
                        content:item.name+":"+item.content
                    });
                }
            }
        }

        //处理临时提示
        if(messageList.getTemporaryPrompt().length>0)
            narr[narr.length-1].content += messageList.getTemporaryPrompt();

        return narr;
    },
    formatReq(chatTarget,chatList){
        const out:DeepseekChatAPIEntry[] = [
            ...chatList,
            {
                role:DeepseekChatAPIRole.Assistant,
                content:chatTarget+":",
                prefix:true
            }
        ];
        return out;
    },
    formatResp:(resp)=>new DeepseekChatAPIResp(resp as AnyOpenAIChatApiRespFormat),
}