import { ChatTaskTool, MessageType } from "@/TextCompletion/ChatTaskInterface";
import { OpenAIChatAPIRole, OpenAIChatChatTaskTool } from "@/TextCompletion/OpenAI/GPTChat/Tool";
import { AnyGoogleChatRespFormat } from "../Resp";
import { AnyOpenAIChatApiRespFormat } from "@/TextCompletion/TextCompletionInterface";



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


export const GoogleChatChatTaskTool:ChatTaskTool<GoogleChatApiData,AnyGoogleChatRespFormat> = {
    transReq(chatTarget,messageList){
        let desc = "";
        let inDesc = true;
        const narr:GoogleChatAPIEntry[] = [];

        //处理主消息列表
        for(const item of messageList){
            if(item.type==MessageType.DESC){
                //头部说明直接合并
                if(inDesc){
                    desc += `${item.content}\n`;
                }
                //其他作为用户输入
                else{
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
    formatResp:(resp)=>{
        const choices = resp.candidates
            .filter(choice => choice?.content?.parts?.[0]?.text != undefined)
            .map(choice => ({ content: choice.content.parts[0].text }));

        return {
            choices,
            vaild: choices.length > 0,
        };
    }
}



/**gptge兼容api消息段 */
export type GoogleChatCompatAPIEntry={
    role: OpenAIChatAPIRole;
    content:string;
}
/**gptge兼容api的Tool */
export const GoogleChatCompatChatTaskTool:ChatTaskTool<GoogleChatCompatAPIEntry[],AnyOpenAIChatApiRespFormat> = {
    transReq(chatTarget,messageList){
        let desc = "";
        let inDesc = true;
        const narr:GoogleChatCompatAPIEntry[] = [];

        //处理主消息列表
        for(const item of messageList){
            if(item.type==MessageType.DESC){
                //头部说明直接合并 gptge兼容仅支持一条system提示
                if(inDesc){
                    desc += `${item.content}\n`;
                }
                //其他作为用户输入
                else{
                    narr.push({
                        role:OpenAIChatAPIRole.User,
                        content:item.content
                    });
                }
            }else{
                inDesc = false;
                narr.push({
                    role:OpenAIChatAPIRole.User,
                    content:item.name+":"
                });

                //为目标则视为模型输出
                if(item.name==chatTarget){
                    narr.push({
                        role:OpenAIChatAPIRole.Assistant,
                        content:item.content
                    });
                }
                //其他视为用户输入
                else{
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

        return [{role:OpenAIChatAPIRole.System,content:desc.trim()},...narr];
    },
    formatReq:OpenAIChatChatTaskTool.formatReq,
    formatResp:OpenAIChatChatTaskTool.formatResp,
}