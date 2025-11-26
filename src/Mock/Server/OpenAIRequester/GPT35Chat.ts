import type { OpenAIConversationOption } from "RequestFormat";
import type { OpenAIConversationRespFormat } from "ResponseFormat";
import { TemplateOpenAIConversationResponse } from "ResponseFormat";

import { LaMManagerMockTool } from "Mock/Utils";







export const procGPT35Chat = (data:OpenAIConversationOption)=>{
    const length = data?.messages?.length??2;
    const msg = data?.messages?.[length-2]?.content ?? "";
    return {
        ...TemplateOpenAIConversationResponse,
        choices:[{
            index:0,
            message:{role:"assistant",content:LaMManagerMockTool.buildResp('GPT35Chat', msg)},
            finish_reason:'stop'
        }]
    } satisfies OpenAIConversationRespFormat;
};