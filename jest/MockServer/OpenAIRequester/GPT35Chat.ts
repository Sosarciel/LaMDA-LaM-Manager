import { OpenAIConversationOption } from "RequestFormat";
import { OpenAIConversationRespFormat, TemplateOpenAIConversationResponse } from "ResponseFormat";
import { buildResp } from "../../Utils";





export const procGPT35Chat = (data:OpenAIConversationOption)=>{
    const length = data?.messages?.length??2;
    const msg = data?.messages?.[length-2]?.content ?? "";
    return {
        ...TemplateOpenAIConversationResponse,
        choices:[{
            index:0,
            message:{role:"assistant",content:buildResp('GPT35Chat', msg)},
            finish_reason:'stop'
        }]
    } satisfies OpenAIConversationRespFormat;
}