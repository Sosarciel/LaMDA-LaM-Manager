import { JObject } from "@zwa73/js-utils";
import { match, SLogger, UtilFunc } from "@zwa73/utils";
import { procGPT35Chat } from "./GPT35Chat";





export const procOpenAIChat = (data:JObject)=>{
    if(UtilFunc.checkSharpSchema(data,{
        model:"string",
    })){
        return match(data.model,{
            'gpt-3.5-turbo':()=>procGPT35Chat(data),
        },()=>{
            SLogger.warn(`procOpenAIChat 错误 不支持的模型 data:`,data);
            return {}
        });
    }
    SLogger.warn(`procOpenAIChat 错误 不支持的数据格式 data:`,data);
    return {};
}