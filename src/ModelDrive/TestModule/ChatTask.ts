import type { PresetOption } from "@zwa73/utils";
import { SLogger, UtilFunc } from "@zwa73/utils";

import type { OpenAITextResponseFormat } from "ResponseFormat";
import type { ChatTaskInterface, LaMChatMessages } from "Task";
import { ChatTaskOptionPreset, OpenAITextChatTaskFormatter } from "Task";

import type { TestModule } from "./Drive";




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
    } satisfies OpenAITextResponseFormat;
};

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
};