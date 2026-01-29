import type { OpenAIChatRequest } from "RequestFormat";
import type { OpenAIChatResponse } from "ResponseFormat";
import { OpenAIChatResponseExample } from "ResponseFormat";

import { LaMManagerMockTool } from "Mock/Utils";







export const procGPT35Chat = (data:OpenAIChatRequest)=>{
    const length = data?.messages?.length??2;
    const msg = data?.messages?.[length-2]?.content ?? "";
    return {
        ...OpenAIChatResponseExample,
        choices:[{
            index:0,
            message:{role:"assistant",content:LaMManagerMockTool.buildResp('GPT35Chat', msg)},
            finish_reason:'stop'
        }]
    } satisfies OpenAIChatResponse;
};