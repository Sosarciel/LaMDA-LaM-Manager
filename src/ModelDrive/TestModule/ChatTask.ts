import { SLogger, UtilFunc } from "@zwa73/utils";
import { TestModule } from "./Drive";
import { ChatTaskOption, LaMChatMessages, MessageType, OpenAITextChatTaskFormatter } from "Task";
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
        async chat(options:ChatTaskOption){
            SLogger.http(options);
            return {
                completed:OpenAITextChatTaskFormatter.formatResp(getMockresp()),
                pending:[]
            };
        },
        async calcToken(messageList: LaMChatMessages): Promise<number> {
            let ntext:string="";
            for(const item of messageList){
                ntext=item.type==MessageType.DESC
                ? `${ntext}\n${item.content}`
                : `${ntext}\n${item.name}:${item.content}`;
            }
            const turboMessage = ntext.trim();
            return (await drive.encodeToken(turboMessage)).length;
        }
    }
}