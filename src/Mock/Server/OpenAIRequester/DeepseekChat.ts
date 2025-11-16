import { OpenAIConversationOption } from "RequestFormat";
import { DeepseekRespFormat, TemplateDeepseekResponse } from "ResponseFormat";
import { LaMManagerMockTool } from "Mock";





export const procDeepseekChat = (data:OpenAIConversationOption)=>{
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
    } satisfies DeepseekRespFormat;
};