import { JObject } from "@zwa73/utils";
import { OpenAIConversationRespFormat, TemplateOpenAIConversationResponse } from "ResponseFormat";





export const procGPT35Chat = (data:JObject)=>{
    return {
        ...TemplateOpenAIConversationResponse,
        choices:[{
            index:0,
            message:{role:"assistant",content:"来自GPT35Chat的响应"},
            finish_reason:'stop'
        }]
    } satisfies OpenAIConversationRespFormat;
}