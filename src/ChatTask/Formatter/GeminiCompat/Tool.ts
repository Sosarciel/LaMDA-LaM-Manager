import { AnyOpenAIChatApiRespFormat } from "RespFormat";
import { OpenAIChatAPIRole, OpenAIChatChatTaskTool } from "../GPTChat/Tool";
import { ChatTaskTool, MessageType } from "@/src/ChatTask/ChatTaskInterface";



/**gptge兼容api消息段 */
export type GeminiCompatChatAPIEntry={
    role: OpenAIChatAPIRole;
    content:string;
}
/**gptge兼容api的Tool */
export const GeminiChatCompatChatTaskTool:ChatTaskTool<GeminiCompatChatAPIEntry[],AnyOpenAIChatApiRespFormat> = {
    transReq(chatTarget,messageList){
        let desc = "";
        let inDesc = true;
        const narr:GeminiCompatChatAPIEntry[] = [];

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