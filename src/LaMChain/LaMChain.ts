import type { MPromise, PromiseRetryResult } from "@zwa73/js-utils";
import { SLogger, UtilFP, UtilFunc } from "@zwa73/utils";

import { GeminiPostTool, OpenAiPostTool } from "Interactor";
import type { AnyOpenAILikeRequest, GeminiRequest } from "RequestFormat";
import type { AnyGeminiResponse, AnyOpenAIResponse, GeminiResponse } from "ResponseFormat";


import type { CredProvider, LaMPost, ModelInfo, ModelPrice, ModelUsage, SourceProvider } from "./Interface";

export namespace LaMChain{
/**发送gemini 样式的请求 */
export const postGeminiRequest = (async (param:{
    cred:CredProvider,
    source:SourceProvider
    model:ModelInfo;
    json:GeminiRequest;
})=>{
    const {model,json,cred,source} = param;
    return GeminiPostTool.postLaMRepeat({
        cred, source,
        postJson:json,
        modelData:model,
    });
}) satisfies LaMPost<GeminiRequest,GeminiResponse>;

/**发送openai 样式的请求 */
export const postOpenAIRequest = (async (param:{
    cred:CredProvider,
    source:SourceProvider
    model:ModelInfo;
    json:AnyOpenAILikeRequest;
})=>{
    const {model,json,cred,source} = param;
    return OpenAiPostTool.postLaMRepeat({
        cred, source,
        postJson:json,
        modelData:model,
    });
}) satisfies LaMPost<AnyOpenAILikeRequest,AnyOpenAIResponse>;

/**剔除重试结果 */
export const reduceRepeatResult =  async <T>(t:MPromise<PromiseRetryResult<T>>) => (await t)?.completed;

/**计算价格 */
export const computeCost = (price:ModelPrice,usage:ModelUsage)=>{
    const promptCount = usage.promptCacheMissTokens ?? usage.promptTokens ?? 0;
    const cachedPromptCount = usage.promptCacheHitTokens ?? 0;
    const completionCount = usage.completionTokens ?? 0;

    const {
        completionPrice = 0,
        promptPrice = 0,
    } = price;

    const cacheHitPromptPrice = price.cacheHitPromptPrice??promptPrice;

    const totalPrice =
        (promptCount * promptPrice)+
        (completionCount * completionPrice)+
        (cachedPromptCount* cacheHitPromptPrice);
    if(isNaN(totalPrice)){
        SLogger.error(`computeCost 错误 无法计算价格`);
        SLogger.error(usage);
        return 0;
    }
    return totalPrice;
};

/**计算gemini使用量 */
export const computeGeminiUsage = (resp:AnyGeminiResponse)=>{
    const {usageMetadata} = resp;
    return {
        completionTokens :(usageMetadata.candidatesTokenCount??0) + (usageMetadata.thoughtsTokenCount??0),
        promptTokens     :usageMetadata.promptTokenCount??0,
    } satisfies ModelUsage;
};

/**计算openai使用量 */
export const computeOpenAIUsage = (resp:AnyOpenAIResponse)=>{
    const {usage} = resp;
    return {
        completionTokens      : usage.completion_tokens??0,
        promptTokens          : usage.prompt_tokens??0,
        promptCacheHitTokens  : 'prompt_cache_hit_tokens' in usage ? usage.prompt_cache_hit_tokens : undefined,
        promptCacheMissTokens  : 'prompt_cache_miss_tokens' in usage ? usage.prompt_cache_miss_tokens : undefined,
    } satisfies ModelUsage;
};

/**依照source将option转为对应source的异构格式, 例硅基流动 */
export const specializeOpenAILikeRequest = <T extends {}>(param:{
    json:AnyOpenAILikeRequest;
    source:SourceProvider;
})=>{
    const {json,source} = param;
    const out = {...json};
    if(UtilFunc.checkSharpSchema(out,{model:"string"})){
        //如果存在id映射则直接替换opt的model
        const mapname = source.modelIdMap?.[out.model];
        if(mapname!=null) out.model = mapname;
    }
    return out;
};

}


async ()=>{
    const v = UtilFP.flow(
        LaMChain.postGeminiRequest,
        async res => LaMChain.reduceRepeatResult(res),
    );
};