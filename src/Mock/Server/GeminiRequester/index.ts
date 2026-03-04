import type { JObject } from "@zwa73/js-utils";
import { match, SLogger } from "@zwa73/utils";

import { procGemini3Pro } from "./Gemini3Pro";



export const procGemini = (modelId:string, data:JObject)=>{
    return match(modelId,{
        'gemini-3-pro-preview':()=>procGemini3Pro(data as any),
    },()=>{
        SLogger.warn(`procGemini 错误 不支持的模型 modelId: ${modelId}`);
        return {};
    });
};