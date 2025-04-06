import { AnyOpenAIChatApiRespFormat, ITextCompletionResp } from "@/TextCompletion/TextCompletionInterface";
import { ChatTaskTool, MessageType } from "@/TextCompletion/ChatTaskInterface";


/**用于Turbo模型的消息Entry */
export type OpenAIChatAPIEntry={
    role: OpenAIChatAPIRole;
    content:string;
}

enum OpenAIChatAPIRole{
    User="user",
    Assistant="assistant",
    System="system",
}

/**OpenAIChatAPI格式的响应处理
 * @class
 * @param resp - gpt系列模型的响应
 */
class OpenAIChatAPIResp implements ITextCompletionResp{
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
            if(choice.message.content)
                sList.push(choice.message.content);
        }
        return sList;
    }
    getChoice (index:number):string|null{
        const choices =  this.resp.choices;
        if(index>=choices.length || index<0)
            return null;
        return choices[index].message.content ?? null;
    }
    setChoice (index:number,msg:string):void{
        const choices =  this.resp.choices;
        if(index>=choices.length || index<0)
            return;
        choices[index].message.content = msg;
    }
}


export const OpenAIChatChatTaskTool:ChatTaskTool<OpenAIChatAPIEntry[]> = {
    transReq(chatTarget,messageList){
        const narr:OpenAIChatAPIEntry[] = [];

        //处理主消息列表
        for(const item of messageList){
            if(item.type==MessageType.DESC){
                narr.push({
                    role:OpenAIChatAPIRole.System,
                    content:item.content
                });
            }else{
                narr.push({
                    role:OpenAIChatAPIRole.System,
                    content:item.name+":"
                });
                if(item.name==chatTarget){
                    narr.push({
                        role:OpenAIChatAPIRole.Assistant,
                        content:item.content
                    });
                }else{
                    narr.push({
                        role:OpenAIChatAPIRole.User,
                        content:item.content
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
        chatList.push({
            role:OpenAIChatAPIRole.System,
            content:`${chatTarget}:`,
        });
        return chatList;
    },
    formatResp:(resp)=> new OpenAIChatAPIResp(resp as AnyOpenAIChatApiRespFormat)
}