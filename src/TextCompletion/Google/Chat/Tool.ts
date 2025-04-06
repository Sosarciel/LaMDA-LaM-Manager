import { ChatTaskTool, MessageType } from "@/TextCompletion/ChatTaskInterface";
import { AnyGoogleChatApiRespFormat, ITextCompletionResp } from "@/TextCompletion/TextCompletionInterface";



export type GoogleChatAPIEntry={
    role: GoogleChatAPIRole;
    parts:[{text:string}];
}

enum GoogleChatAPIRole{
    User="user",
    Model="model",
}

type GoogleChatApiData = {
    message:GoogleChatAPIEntry[];
    define :string;
}

/**GoogleChatAPI 格式的响应处理
 * @class
 * @param resp - gpt系列模型的响应
 */
class GoogleChatAPIResp implements ITextCompletionResp{
    constructor(resp:AnyGoogleChatApiRespFormat){
        this.resp = resp;
    }
    private resp : AnyGoogleChatApiRespFormat;
    isVaild(){
        return this.getChoiceList().length>=1;
    }
    getChoiceList ():string[]{
        const sList:string[] = [];
        const choices =  this.resp.candidates;
        for(const choice of choices){
            if (choice?.content?.parts?.[0].text)
                sList.push(choice.content.parts[0].text);
        }
        return sList;
    }
    getChoice (index:number):string|null{
        const choices =  this.resp.candidates;
        if(index>=choices.length || index<0)
            return null;
        return choices[index].content.parts[0].text ?? null;
    }
    setChoice (index:number,msg:string):void{
        const choices =  this.resp.candidates;
        if(index>=choices.length || index<0)
            return;
        choices[index].content.parts[0].text = msg;
    }
}


export const GoogleChatChatTaskTool:ChatTaskTool<GoogleChatApiData> = {
    transReq(chatTarget,messageList){
        let desc = "";
        let inDesc = true;
        const narr:GoogleChatAPIEntry[] = [];
    
        //处理主消息列表
        for(const item of messageList){
            if(item.type==MessageType.DESC){
                if(inDesc){
                    desc += `${item.content}\n`;
                }else{
                    narr.push({
                        role:GoogleChatAPIRole.User,
                        parts:[{text:item.content}]
                    });
                }
            }else{
                inDesc = false;
                narr.push({
                    role:GoogleChatAPIRole.User,
                    parts:[{text:item.name+":"}]
                });
                if(item.name==chatTarget){
                    narr.push({
                        role:GoogleChatAPIRole.Model,
                        parts:[{text:item.content}]
                    });
                }else{
                    narr.push({
                        role:GoogleChatAPIRole.User,
                        parts:[{text:item.content}]
                    });
                }
            }
        }
    
        //处理临时提示
        if(messageList.getTemporaryPrompt().length>0)
            narr[narr.length-1].parts[0].text += messageList.getTemporaryPrompt();
    
        return {
            message:narr,
            define:desc.trim(),
        };
    },
    formatReq(chatTarget,chatList){
        chatList.message.push({
            role:GoogleChatAPIRole.User,
            parts:[{text:`${chatTarget}:`}],
        });
        return chatList;
    },
    formatResp:(resp)=>new GoogleChatAPIResp(resp as AnyGoogleChatApiRespFormat),
}