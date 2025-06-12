import { OpenAIChatAPIEntry, OpenAIChatAPIRole, OpenAIChatChatTaskTool } from "@/TextCompletion/OpenAI/GPTChat/Tool";
import { AnyOpenAIApiRespFormat, ChatTaskTool, MessageType } from "TextCompletion";
import { AnyDeepseekChatRespFormat } from "../Resp";
import { AnyOpenAIChatRespFormat } from "@/TextCompletion/OpenAI/Resp";



/**用于Deepseek模型的消息Entry */
export type DeepseekChatAPIEntry={
	role: OpenAIChatAPIRole;
	content:string;
    /**指定为前缀补全模式 */
    prefix?:boolean;
}

const DeepseekChatAPIRole = OpenAIChatAPIRole;
type DeepseekChatAPIRole = OpenAIChatAPIRole;

/**清除特殊的对话续写格式
 * 暂时无效
 */
function formatMessage(message?:string):string|undefined{
    if(!message) return undefined;
    const match = message.match(/^.+?:([\s\S]+)$/);
    return match ? match[1] : message;
}

/**传统OpenAI系统提示的Tool */
export const DeepseekChatChatTaskTool:ChatTaskTool<DeepseekChatAPIEntry[],AnyOpenAIApiRespFormat> = {
    transReq(chatTarget,messageList){
        return OpenAIChatChatTaskTool.transReq(chatTarget,messageList) as unknown as DeepseekChatAPIEntry[];
    },
    formatReq:OpenAIChatChatTaskTool.formatReq,
    formatResp:OpenAIChatChatTaskTool.formatResp,
}

/**使用前缀续写模式的Tool */
export const DeepseekChatBetaChatTaskTool:ChatTaskTool<DeepseekChatAPIEntry[],AnyOpenAIApiRespFormat> = {
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
    formatResp:OpenAIChatChatTaskTool.formatResp,
}