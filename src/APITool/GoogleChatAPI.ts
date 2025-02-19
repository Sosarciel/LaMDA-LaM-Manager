import { AnyGoogleChatApiRespFormat, ITextCompletionResp, LaMChatMessages, MessageType } from "TextCompletion";



export type GoogleChatAPIEntry={
    role: GoogleChatAPIRole;
    parts:[{text:string}];
}

export enum GoogleChatAPIRole{
    User="user",
    Model="model",
}

export type GoogleChatApiData = {
    message:GoogleChatAPIEntry[];
    define :string;
}

/**转换一个 GoogleChatApi 模型所用的messageEntry
 * @param chatTarget      - 聊天目标名
 * @param messageList     - 待转换的通用消息列表
 */
export function transGoogleChatApiReq(chatTarget:string,messageList:LaMChatMessages): GoogleChatApiData{
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
}

/**给聊天信息加上询问格式, 让模型稳定输出
 * @param chatTarget - 聊天目标
 * @param chatList   - 待格式化的聊天信息
 * @returns 完成格式化 可以进行post的聊天信息
 */
export function formatGoogleChatApiReq(chatTarget:string,chatList:GoogleChatApiData):GoogleChatApiData{
    chatList.message.push({
        role:GoogleChatAPIRole.User,
        parts:[{text:`${chatTarget}:`}],
    });
    return chatList;
}

/**GoogleChatAPI 格式的响应处理
 * @class
 * @param resp - gpt系列模型的响应
 */
export class GoogleChatAPIResp implements ITextCompletionResp{
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