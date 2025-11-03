import { PresetOption, SLogger, UtilFunc } from "@zwa73/utils";
import { TestModule } from "./Drive";
import { ChatTaskInterface, ChatTaskOption, ChatTaskOptionPreset, LaMChatMessages, MessageType, OpenAITextChatTaskFormatter } from "Task";
import { OpenAITextRespFormat } from "ResponseFormat";




const getMockresp = ()=>{
    return {
        "choices": [{
            "finish_reason": "stop",
            "index": 0,
            "logprobs": null,
            "text": `test time ${UtilFunc.getTime()}`
        }],
        "created": 1737376418,
        "id": "cmpl-ArlGEsDLJx7IJeeCynsgqAnVju4zt",
        "model": "gpt-3.5-turbo-instruct" as any,
        "object": "text_completion",
        "usage": {"completion_tokens":4248,"prompt_tokens":1849,"total_tokens":6097}
    } satisfies OpenAITextRespFormat;
}

export const chatTaskCtor = (drive:TestModule) => {
    return {
        async execute(opt: PresetOption<typeof ChatTaskOptionPreset>) {
            const fopt = ChatTaskOptionPreset.assign(opt);
            SLogger.http(fopt);
            return {
                completed:OpenAITextChatTaskFormatter.formatResp(getMockresp()),
                pending:[]
            };
        },
        async countToken(messageList: LaMChatMessages): Promise<number> {
            let ntext:string="";
            for(const item of messageList.list){
                ntext=item.type=='desc'
                ? `${ntext}\n${item.content}`
                : `${ntext}\n${item.senderName}:${item.content}`;
            }
            const turboMessage = ntext.trim();
            return (await drive.encodeToken(turboMessage)).length;
        }
    } satisfies ChatTaskInterface;
}