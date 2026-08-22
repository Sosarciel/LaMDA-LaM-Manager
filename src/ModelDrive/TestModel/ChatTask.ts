import type { OpenAITextResponse } from "@sosraciel-lamda/lam-chain";
import type { PresetOption } from "@zwa73/utils";
import { SLogger, UtilFunc } from "@zwa73/utils";

import type { ChatTaskInterface, LaMChatMessages } from "Task";
import { ChatTaskOptionPreset, OpenAITextChatTaskFormatter } from "Task";

import type { TestModel } from "./Drive";




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
    } satisfies OpenAITextResponse;
};

export const chatTaskCtor = (drive:TestModel) => {
    return {
        async execute(opt: PresetOption<typeof ChatTaskOptionPreset>) {
            const fopt = ChatTaskOptionPreset.assign(opt);
            SLogger.http(fopt);
            return {
                completed:OpenAITextChatTaskFormatter.formatResp(getMockresp()),
                pending:[]
            };
        },
        async computeTokenCount(messageList: LaMChatMessages): Promise<number> {
            let ntext:string="";
            for(const item of messageList){
                ntext=item.type=='desc'
                ? `${ntext}\n${item.content}`
                : `${ntext}\n${item.senderName}:${item.content}`;
            }
            const turboMessage = ntext.trim();
            return (await drive.encodeToken(turboMessage)).length;
        }
    } satisfies ChatTaskInterface;
};