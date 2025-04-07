import { AnyOpenAIChatApiRespFormat } from "@/TextCompletion/TextCompletionInterface";
import { ChatTaskTool, MessageType } from "@/TextCompletion/ChatTaskInterface";


/**用于Turbo模型的消息Entry */
export type OpenAIChatAPIEntry={
    role: OpenAIChatAPIRole;
    content:string;
}

export const OpenAIChatAPIRole = {
    User:"user",
    Assistant:"assistant",
    System:"system",
} as const;
export type OpenAIChatAPIRole = typeof OpenAIChatAPIRole[keyof typeof OpenAIChatAPIRole];


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
    formatResp:(resp)=>{
        const fxresp = resp as AnyOpenAIChatApiRespFormat;
        const choices = fxresp.choices
            .filter(choice => choice ?.message?.content!=undefined)
            .map(choice => ({content:choice .message.content!}));
        return {
            choices,
            vaild:choices.length>0
        }
    }
}