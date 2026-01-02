import type { PromiseRetryResult } from "@zwa73/js-utils";

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
export const commonCalcToken = async (message:string,tokensizerType:TokensizerType):Promise<number>=>{
    const tokenizer = getTokensizer(tokensizerType);
    return (await tokenizer.encode(message)).length;
};