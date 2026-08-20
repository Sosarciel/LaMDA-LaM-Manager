import type { JToken, MPromise, PromiseRetries, PromiseRetryResult } from "@zwa73/js-utils";
import { lazyFunction, memoize, SLogger, UtilFP, UtilFunc } from "@zwa73/utils";

import type { Interactor } from "Interactor";
import { GeminiPostTool, OpenAiPostTool } from "Interactor";
import type { AnyOpenAIChatLikeRequest, AnyOpenAILikeRequest, AnyTextCompletionRequest, GeminiRequest, OpenAITextRequest, OpenAITool } from "RequestFormat";
import type { AnyGeminiResponse, AnyOpenAIChatLikeResponse, AnyOpenAIResponse, AnyTextCompletionResponse, GeminiResponse, OpenAITextResponse } from "ResponseFormat";
import type { TokensizerType } from "Tokensizer";
import { getTokensizer } from "Tokensizer";

import type { CredProvider, LaMComputeUsageFunc, LaMPostRequestFunc, ModelInfo, ModelPrice, ModelUsage, SourceProvider, ToolProvider } from "./Interface";


/**单次对象参数偏应用（Partial Application）
 * 固定部分对象属性，返回一个接收剩余属性并直接执行原函数的函数
 */
function partialize<T extends object, P extends Partial<T>, R>(
    fn: (params: T) => R,
    preset: P,
): (rest: Omit<T, keyof P>) => R {
    return (rest: Omit<T, keyof P>) => fn({ ...preset as Partial<T>, ...rest } as T);
}

export namespace LaMChain{

//#reginon 快捷包装
/**简易发送OpenAI Chat API 请求 */
export const simpleOpenAIChatRequest = lazyFunction(()=>UtilFP.flow(
    LaMChain.postOpenAIChatRequest,
    async res => LaMChain.reduceRepeatResult(res),
    LaMChain.extractOpenAIChatResponseSingle,
    v=>v ?? undefined,
));
/**简易发送OpenAI Chat API 请求, 带有工具*/
export const simpleOpenAIChatToolCallRequest = lazyFunction(()=>UtilFP.flow(
    (v: Omit<Parameters<typeof LaMChain.processOpenAIChatToolLoop>[0],'resp'>)=>
        ({ ...v,json:{...v.json,tools:v.json.tools ?? LaMChain.toOpenAITools(v.tool) } }),
    UtilFP.bind('firstResp',async v=>LaMChain.postOpenAIChatRequest(v)),
    UtilFP.bind('resp',async v=>LaMChain.reduceRepeatResult(v.firstResp)),
    LaMChain.processOpenAIChatToolLoop,
    LaMChain.extractOpenAIChatResponseSingle,
    v=>v ?? undefined,
));
//#endregion

//#region 发送请求
/**发送请求 */
export const postRequest = async <
T extends AnyTextCompletionRequest,
R extends AnyTextCompletionResponse,
>(param:{
    /**凭据提供者 */
    cred:CredProvider;
    /**来源提供者 */
    source:SourceProvider;
    /**模型信息 */
    model:ModelInfo;
    /**请求体 */
    json:T;
    /**重试参数 */
    retry?:PromiseRetries;
    /**交互器 */
    interactor:Interactor<R>;
})=>{
    const {model,json,cred,source,retry,interactor} = param;
    return interactor.postLaMRepeat({
        cred, source,
        postJson:json,
        modelData:model,
        retryOption: retry ?? source.retry,
    });
};
/**发送Gemini API 请求 */
export const postGeminiRequest = (partialize(postRequest<GeminiRequest,GeminiResponse>,{
    interactor:GeminiPostTool
})) satisfies LaMPostRequestFunc<GeminiRequest,GeminiResponse>;
/**发送OpenAI API 请求 */
export const postOpenAIRequest = (partialize(postRequest<AnyOpenAILikeRequest,AnyOpenAIResponse>,{
    interactor:OpenAiPostTool
})) satisfies LaMPostRequestFunc<AnyOpenAILikeRequest,AnyOpenAIResponse>;
/**发送OpenAI Chat API 请求 */
export const postOpenAIChatRequest = (partialize(postRequest<AnyOpenAIChatLikeRequest,AnyOpenAIChatLikeResponse>,{
    interactor:OpenAiPostTool as Interactor<AnyOpenAIChatLikeResponse>
})) satisfies LaMPostRequestFunc<AnyOpenAIChatLikeRequest,AnyOpenAIChatLikeResponse>;
/**发送OpenAI Text API 请求 */
export const postOpenAITextRequest = (partialize(postRequest<OpenAITextRequest,OpenAITextResponse>,{
    interactor:OpenAiPostTool as Interactor<OpenAITextResponse>
})) satisfies LaMPostRequestFunc<OpenAITextRequest,OpenAITextResponse>;
//#endregion

/**剔除重试结果 */
export const reduceRepeatResult = async <T>(t:MPromise<PromiseRetryResult<T>>) => (await t)?.completed;
/**提取OpenAI Chat API 返回值 */
export const extractOpenAIChatResponseSingle = async (t:MPromise<undefined | AnyOpenAIChatLikeResponse>) =>
    (await t)?.choices?.[0]?.message?.content;

/**计算价格 */
export const computeCost = (param:{
    /**模型价格 */
    price:ModelPrice;
    /**模型使用量 */
    usage:ModelUsage;
})=>{
    const {price,usage} = param;
    //如果没有miss则认为全是hit
    const missPromptCount = usage.promptCacheMissTokens ?? usage.promptTokens ?? 0;
    //如果没有miss则直接跳过hit统计
    const hitPromptCount = usage.promptCacheMissTokens == undefined
        ? 0 : usage.promptCacheHitTokens ?? 0;
    const completionCount = usage.completionTokens ?? 0;

    const {
        completionPrice = 0,
        promptPrice: missPromptPrice = 0,
    } = price;

    //如果没有设置cacheHitPromptPrice则使用promptPrice
    const hitPromptPrice = price.cacheHitPromptPrice ?? missPromptPrice;

    const totalPrice =
        (missPromptCount * missPromptPrice)+
        (hitPromptCount  * hitPromptPrice )+
        (completionCount * completionPrice);
    if(isNaN(totalPrice)){
        SLogger.error(`computeCost 错误 无法计算价格 usage:`,usage);
        return 0;
    }
    return totalPrice;
};

//#region 计算使用量
/**计算gemini使用量 */
export const computeGeminiUsage = ((resp:AnyGeminiResponse)=>{
    const {usageMetadata} = resp;
    if(usageMetadata==null){
        void SLogger.error(`computeGeminiUsage 错误 未找到 usageMetadata, resp:`,resp);
        return {} as ModelUsage;
    }

    return {
        completionTokens :(usageMetadata.candidatesTokenCount??0) + (usageMetadata.thoughtsTokenCount??0),
        promptTokens     :usageMetadata.promptTokenCount??0,
    } satisfies ModelUsage;
}) satisfies LaMComputeUsageFunc<AnyGeminiResponse>;
/**计算openai使用量 */
export const computeOpenAIUsage = ((resp:AnyOpenAIResponse)=>{
    const {usage} = resp;
    if(usage==null){
        void SLogger.error(`computeOpenAIUsage 错误 未找到 usage, resp:`,resp);
        return {} as ModelUsage;
    }

    return {
        completionTokens      : usage.completion_tokens??0,
        promptTokens          : usage.prompt_tokens??0,
        promptCacheHitTokens  : 'prompt_cache_hit_tokens' in usage ? usage.prompt_cache_hit_tokens : undefined,
        promptCacheMissTokens  : 'prompt_cache_miss_tokens' in usage ? usage.prompt_cache_miss_tokens : undefined,
    } satisfies ModelUsage;
}) satisfies LaMComputeUsageFunc<AnyOpenAIResponse>;
//#endregion

//#region 计费
/**计费 */
export const recordCost = async <T>(param:{
    /**凭据提供者 */
    cred:CredProvider;
    /**模型价格 */
    price?:ModelPrice;
    /**响应 */
    resp?:T;
    /**计算函数 */
    computeUsage:LaMComputeUsageFunc<T>;
    /**是否打印使用量 */
    logUsage?:boolean;
})=>{
    const {cred,price,resp,computeUsage,logUsage} = param;
    if (resp == undefined || price == undefined || cred.recordCost == undefined)
        return;
    await cred.recordCost?.(computeCost({price,usage:computeUsage(resp)}));
    //打印理论的当前使用量
    if(logUsage) await cred.currUsage?.();
};
/**计费Gemini API 返回值 */
export const recordGeminiCost = partialize(recordCost<AnyGeminiResponse>,{computeUsage:LaMChain.computeGeminiUsage});
/**计费OpenAI Chat API 返回值 */
export const recordOpenAICost = partialize(recordCost<AnyOpenAIResponse>,{computeUsage:LaMChain.computeOpenAIUsage});
//#endregion


//#region source标准化
/**依照source将option转为对应source的异构格式, 例硅基流动 */
export const specializeOpenAILikeRequest = <T extends AnyOpenAILikeRequest>(param:{
    /**请求体 */
    json:AnyOpenAILikeRequest;
    /**来源提供者 */
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
    /**模型id */
    modelId:string;
    /**来源提供者 */
    source:SourceProvider;
})=>{
    const {modelId,source} = param;
    return source.modelIdMap?.[modelId] ?? modelId;
};
//#endregion

//#region token计算
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
        .flatMap(async biasMap=>
            Object.entries(biasMap)
                .map(async ([k,v])=>mergeObj(k,v))));
    return out;
},60_000);
//#endregion

//#region 工具函数
/**递归剔除对象中所有值为 undefined 的属性
 * 用于清理 formatOption 等构建的请求对象, 避免携带无意义字段
 */
export const stripUndefined = <T extends JToken>(value: T): T => {
    if (Array.isArray(value))
        return value.map(stripUndefined) as T;
    if (value !== null && typeof value === "object")
        return Object.fromEntries(
            Object.entries(value as Record<string, JToken>)
                .filter(([, v]) => v !== undefined)
                .map(([k, v]) => [k, stripUndefined(v)])
        ) as T;
    return value;
};
//#endregion

//#region 工具调用
/** 从 Provider 提取 OpenAI tools 请求参数 */
export const toOpenAITools = (provider: ToolProvider) => {
    return provider.tools.map(t => ({
        type: "function" as const,
        function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
            strict: t.strict,
        },
    }) satisfies OpenAITool);
};
/** 尝试/处理 OpenAI Tool Call 循环 */
export const processOpenAIChatToolLoop = async <
REQ extends AnyOpenAIChatLikeRequest,
RES extends AnyOpenAIChatLikeResponse
>(param: {
    /** 原始响应 */
    resp: RES|undefined;
    /** 工具提供者 */
    tool: ToolProvider;
    /** 凭据提供者 */
    cred: CredProvider;
    /** 来源提供者 */
    source: SourceProvider;
    /** 模型信息 */
    model: ModelInfo;
    /** 原始请求 */
    json: REQ;
    /** 重试参数 */
    retry?: PromiseRetries;
    /** 请求修改器 */
    patch?: (param: { resp: RES; body: REQ }) => MPromise<REQ>;
    /** 最大循环次数 */
    maxLoops?: number;
}) => {
    if(param.resp==undefined) return undefined;
    const { tool, cred, source, model, retry, patch, maxLoops = 10 } = param;

    let currentResult = param.resp;
    let currentBody:REQ = {
        ...param.json,
        messages: [...(param.json.messages ?? [])],
        tools: param.json.tools ?? LaMChain.toOpenAITools(tool),
    };

    const toolMap = Object.fromEntries(tool.tools.map(t => [t.name, t]));

    for (let loop = 0; loop < maxLoops; loop++) {
        const completedResp = currentResult;
        const choice = completedResp?.choices?.[0];

        const msg = choice?.message ?? {};
        const toolCalls = ('tool_calls' in (msg))
            ? msg.tool_calls : undefined;

        // 尝试提取：如果没有 tool_calls 则直接原样返回最终结果
        if (!toolCalls || toolCalls.length === 0)
            return currentResult;

        // 1. 执行本地 tools
        const toolResponses = await Promise.all(
            toolCalls.map(async call => {
                const targetTool = toolMap[call.function.name];
                let content: string;
                if (targetTool) {
                    try {
                        const rawArgs = call.function.arguments;
                        // GLM 等厂商可能直接返回 object 参数, 此时跳过 JSON.parse
                        const parsedArgs = (typeof rawArgs === "object" && rawArgs !== null)
                            ? rawArgs
                            : rawArgs ? JSON.parse(rawArgs) : {};
                        const res = await targetTool.handler(parsedArgs);
                        content = typeof res === "string" ? res : JSON.stringify(res);
                    } catch (err: any) {
                        content = JSON.stringify({ error: err?.message ?? String(err) });
                    }
                } else content = JSON.stringify({ error: `Tool ${call.function.name} not found` });

                return {
                    role: "tool" as const,
                    tool_call_id: call.id,
                    content,
                };
            })
        );

        // 2. 组装 messages
        currentBody = {
            ...currentBody,
            messages: [
                ...currentBody.messages ?? [],
                choice.message,
                ...toolResponses,
            ],
        } satisfies REQ;

        // 3. 用户 patch 钩子（可在此捕获中间态、打日志或修改即将下发的 body）
        if (patch) currentBody = await patch({ resp: completedResp, body: currentBody });

        // 4. 发起下一轮请求
        const result = await LaMChain.reduceRepeatResult(LaMChain.postOpenAIRequest({
            cred, source, model, retry,
            json: currentBody,
        })) as RES;
        if(result==undefined) return undefined;
        currentResult = result;
    }

    return currentResult;
};
//#endregion
}