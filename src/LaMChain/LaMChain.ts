import type { MPromise, PromiseRetries, PromiseRetryResult } from "@zwa73/js-utils";
import { memoize, SLogger, UtilFP, UtilFunc } from "@zwa73/utils";

import { GeminiPostTool, OpenAiPostTool } from "Interactor";
import type { AnyOpenAILikeRequest, GeminiRequest } from "RequestFormat";
import type { AnyGeminiResponse, AnyOpenAIResponse, GeminiResponse } from "ResponseFormat";
import type { TokensizerType } from "Tokensizer";
import { getTokensizer } from "Tokensizer";

import type { CredProvider, LaMComputeUsageFunc, LaMPostRequestFunc, ModelInfo, ModelPrice, ModelUsage, SourceProvider } from "./Interface";




export namespace LaMChain{
/**发送gemini 样式的请求 */
export const postGeminiRequest = (async (param:{
    cred:CredProvider,
    source:SourceProvider
    model:ModelInfo;
    json:GeminiRequest;
    retry?:PromiseRetries;
})=>{
    const {model,json,cred,source,retry} = param;
    return GeminiPostTool.postLaMRepeat({
        cred, source,
        postJson:json,
        modelData:model,
        retryOption: retry ?? source.retry,
    });
}) satisfies LaMPostRequestFunc<GeminiRequest,GeminiResponse>;

/**发送openai 样式的请求 */
export const postOpenAIRequest = (async (param:{
    cred:CredProvider,
    source:SourceProvider
    model:ModelInfo;
    json:AnyOpenAILikeRequest;
    retry?:PromiseRetries;
})=>{
    const {model,json,cred,source,retry} = param;
    return OpenAiPostTool.postLaMRepeat({
        cred, source,
        postJson:json,
        modelData:model,
        retryOption: retry ?? source.retry,
    });
}) satisfies LaMPostRequestFunc<AnyOpenAILikeRequest,AnyOpenAIResponse>;

/**剔除重试结果 */
export const reduceRepeatResult =  async <T>(t:MPromise<PromiseRetryResult<T>>) => (await t)?.completed;

/**计算价格 */
export const computeCost = (param:{
    price:ModelPrice,usage:ModelUsage
})=>{
    const {price,usage} = param;
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
export const computeGeminiUsage = ((resp:AnyGeminiResponse)=>{
    const {usageMetadata} = resp;
    if(usageMetadata==null){
        void SLogger.error(`computeGeminiUsage 错误 未找到 usageMetadata, resp:\n`,resp);
        return {} as ModelUsage;
    }

    return {
        completionTokens :(usageMetadata.candidatesTokenCount??0) + (usageMetadata.thoughtsTokenCount??0),
        promptTokens     :usageMetadata.promptTokenCount??0,
    } satisfies ModelUsage;
}) satisfies LaMComputeUsageFunc<AnyGeminiResponse>;;

/**计算openai使用量 */
export const computeOpenAIUsage = ((resp:AnyOpenAIResponse)=>{
    const {usage} = resp;
    if(usage==null){
        void SLogger.error(`computeOpenAIUsage 错误 未找到 usage, resp:\n`,resp);
        return {} as ModelUsage;
    }

    return {
        completionTokens      : usage.completion_tokens??0,
        promptTokens          : usage.prompt_tokens??0,
        promptCacheHitTokens  : 'prompt_cache_hit_tokens' in usage ? usage.prompt_cache_hit_tokens : undefined,
        promptCacheMissTokens  : 'prompt_cache_miss_tokens' in usage ? usage.prompt_cache_miss_tokens : undefined,
    } satisfies ModelUsage;
}) satisfies LaMComputeUsageFunc<AnyOpenAIResponse>;

/**计费 */
export const recordCost = async <T>(param:{
    cred:CredProvider;
    price?:ModelPrice;
    resp?:T;
    computeUsage:LaMComputeUsageFunc<T>;
    logUsage?:boolean;
})=>{
    const {cred,price,resp,computeUsage,logUsage} = param;
    if (resp == undefined || price == undefined || cred.recordCost == undefined)
        return;
    await cred.recordCost?.(computeCost({price,usage:computeUsage(resp)}));
    //打印理论的当前使用量
    if(logUsage) await cred.currUsage?.();
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

/**依照source将modid转为对应source的异构格式, 例硅基流动 */
export const specializeModelId = (param:{
    modelId:string;
    source:SourceProvider;
})=>{
    const {modelId,source} = param;
    return source.modelIdMap?.[modelId] ?? modelId;
};

/**token计算函数 */
export const computeTokenCount = memoize(async (param:{
    text:string,tokensizerType:TokensizerType
}):Promise<number>=>{
    const {text,tokensizerType} = param;
    const tokenizer = getTokensizer(tokensizerType);
    return (await tokenizer.encode(text)).length;
},60_000);

/**token化logit_bias 参数
 * @param rawLogitBias   - 未tokenize的原始 logit_bias 参数
 * @param tokensizerType - 令牌化器类型
 * @returns logit_bias 参数
 */
export const tokenifyLogitBias = memoize(async (param:{
    textLogitBias:Record<string,number>|Record<string,number>[]|null|undefined,
    tokensizerType:TokensizerType,
}):Promise<undefined|Record<string,number>>=>{
    const {tokensizerType} = param;
    let {textLogitBias} = param;

    if(textLogitBias==undefined) return undefined;
    if(!(textLogitBias instanceof Array))
        textLogitBias = [textLogitBias];

    const tokenizer = getTokensizer(tokensizerType);

    const out:Record<string,number> = {};
    const mergeObj = async (tokenStr:string,weight:number)=>{
        const tokenArr = await tokenizer.encode(tokenStr);
        let factor = 1;
        //写入权重
        for(const token of tokenArr){
            const strCode = String(token);
            if(out[strCode]==undefined || weight>out[strCode])
                out[strCode] = Number((weight*factor).toFixed(5));
            factor/=2;
        }
    };

    await Promise.all(textLogitBias
        .map(async biasMap=>
            await Promise.all(Object.entries(biasMap)
                .map(async ([k,v])=>
                    mergeObj(k,v)))));
    return out;
},60_000);
}


async ()=>{
    const v = UtilFP.flow(
        LaMChain.postGeminiRequest,
        async res => LaMChain.reduceRepeatResult(res),
    );
};