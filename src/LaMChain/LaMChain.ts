import type { MPromise, PromiseRetryResult } from "@zwa73/js-utils";
import { SLogger, UtilFP } from "@zwa73/utils";

import type { GeminiRequest } from "RequestFormat";
import type { AnyGeminiResponse, AnyOpenAIResponse } from "ResponseFormat";

import { GeminiPostTool } from "Interactor/GeminiRequester";

import type { CredProvider, ModelInfo, ModelPrice, ModelUsage, SourceProvider } from "./Interface";


const postGeminiRequest = (cred:CredProvider,source:SourceProvider)=>async (params:{
    model:ModelInfo;
    json:GeminiRequest;
})=>{
    const {model,json} = params;
    return GeminiPostTool.postLaMRepeat({
        postJson:json,
        cred,
        source,
        modelData:model,
    });
};


async ()=>{
    const v = UtilFP.flow(
        postGeminiRequest(null as any, null as any),
        async res => LaMChain.reduceRepeatResult(res),
    );
};
export namespace LaMChain{
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


}