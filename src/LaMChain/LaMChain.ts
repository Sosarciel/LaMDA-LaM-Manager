import type { MPromise, PromiseRetryResult } from "@zwa73/js-utils";
import { SLogger, UtilFP } from "@zwa73/utils";

import type { APIPrice, APIPriceResp } from "CredService";
import type { HttpApiModelInfo } from "ModelDrive";
import type { GeminiRequest } from "RequestFormat";

import { GeminiPostTool } from "Interactor/GeminiRequester";

import type { CredProvider, SourceProvider } from "./Interface";


const postGeminiRequest = (cred:CredProvider,source:SourceProvider)=>async (params:{
    model:HttpApiModelInfo;
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
export const computeCost = (price:APIPrice,usage:APIPriceResp)=>{
    const promptCount = usage.prompt_cache_miss_tokens ?? usage.prompt_tokens;
    const cachedPromptCount = usage.prompt_cache_hit_tokens ?? 0;
    const completionCount = usage.completion_tokens;
    const totalPrice =
        (promptCount*price.promptPrice)+
        (completionCount*price.completionPrice)+
        (cachedPromptCount*(price.cacheHitPromptPrice??0));
    if(isNaN(totalPrice)){
        SLogger.error(`computeCost 错误 无法计算价格`);
        SLogger.error(usage);
        return 0;
    }
    return totalPrice;
};
}