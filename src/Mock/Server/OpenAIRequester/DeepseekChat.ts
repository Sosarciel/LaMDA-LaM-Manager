import type { OpenAIConversationRequest } from "RequestFormat";
import type { DeepseekResponse } from "ResponseFormat";
import { TemplateDeepseekResponse } from "ResponseFormat";

import { LaMManagerMockTool } from "Mock/Utils";







export const procDeepseekChat = (data:OpenAIConversationRequest)=>{
    const length = data?.messages?.length??2;
    const msg = data?.messages?.[length-2]?.content ?? "";
    return {
        ...TemplateDeepseekResponse,
        choices:[{
            index:0,
            message:{role:"assistant",content:LaMManagerMockTool.buildResp('DeepseekChat', msg)},
            finish_reason:'stop',
            logprobs:null
        }]
    } satisfies DeepseekResponse;
};