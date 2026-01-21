import type { PromiseRetryResult } from "@zwa73/js-utils";
import { memoize } from "@zwa73/utils";

import type { AnyTextCompletionResponseFormat } from "ResponseFormat";
import type { TokensizerType } from "Tokensizer";
import { getTokensizer } from "Tokensizer";

import type { TextCompletionResult } from "Task/DataInterface";
import { DefChatLaMResult } from "Task/DataInterface";
import type { RespFormatter } from "Task/ToolInterface";





/**通用的Resp转换函数 */
export const commonFormatResp = <FMT extends AnyTextCompletionResponseFormat>(
    tool:RespFormatter<FMT>
)=>async (resp:PromiseRetryResult<FMT | undefined> | undefined):Promise<TextCompletionResult>=>{
    if(resp==null) return DefChatLaMResult;
    return {
        completed:resp.completed ? tool.formatResp(resp.completed) : undefined,
        pending:resp.pending.map(async p=>{
            const res = await p;
            if(res==null) return undefined;
            return tool.formatResp(res);
        })
    };
};

/**通用的token计算函数 */
export const commonComputeTokenCount = async (message:string,tokensizerType:TokensizerType):Promise<number>=>{
    const tokenizer = getTokensizer(tokensizerType);
    return (await tokenizer.encode(message)).length;
};

/**token化logit_bias 参数
 * @param rawLogitBias   - 未tokenize的原始 logit_bias 参数
 * @param tokensizerType - 令牌化器类型
 * @returns logit_bias 参数
 */
export const tokenifyLogitBias = memoize(async (
    rawLogitBias:Record<string,number>|Record<string,number>[]|null|undefined,
    tokensizerType:TokensizerType,
):Promise<null|Record<string,number>>=>{
    if(rawLogitBias==null) return null;
    if(!(rawLogitBias instanceof Array))
        rawLogitBias = [rawLogitBias];

    const tokenizer = getTokensizer(tokensizerType);

    const out:Record<string,number> = {};
    const mergeObj = async function(tokenStr:string,weight:number){
        const tokenArr = await tokenizer.encode(tokenStr);
        let factor = 1;
        //写入权重
        for(const token of tokenArr){
            const strCode = `${token}`;
            if(out[strCode]==null || weight>out[strCode])
                out[strCode] = Number((weight*factor).toFixed(5));
            factor/=2;
        }
    };

    await Promise.all(rawLogitBias
        .map(async biasMap=>
            await Promise.all(Object.entries(biasMap)
                .map(async ([k,v])=>
                    mergeObj(k,v)))));
    return out;
},6000);