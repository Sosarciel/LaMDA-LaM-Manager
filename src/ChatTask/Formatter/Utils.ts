import type { PromiseRetryResult } from "@zwa73/js-utils";
import { getTokensizer, TokensizerType } from "@/src/Tokensize";
import type { ChatTaskTool, LaMChatMessages } from "../ChatTaskInterface";
import { DefChatLaMResult, TextCompletionResult } from "TextCompletion";
import { AnyTextCompletionRespFormat } from "RespFormat";


/**标准的 stringify 后计算tokens的高阶函数 */
export const stringifyCalcToken = (tool:ChatTaskTool<any,any>)=>async (message:LaMChatMessages,tokensizerType:TokensizerType):Promise<number>=>{
    const turboMessage = tool.transReq('unknow',message);
    const tokenizer = getTokensizer(tokensizerType);
    return (await tokenizer.encode(JSON.stringify(turboMessage))).length;
};

/**标准的计算tokens的高阶函数 */
export const commonCalcToken = (tool:ChatTaskTool<any,any>)=>async (message:LaMChatMessages,tokensizerType:TokensizerType):Promise<number>=>{
    const turboMessage = tool.transReq('unknow',message);
    const tokenizer = getTokensizer(tokensizerType);
    return (await tokenizer.encode(turboMessage)).length;
};

/**通用的Resp转换函数 */
export const commonFormatResp = <Fmt extends AnyTextCompletionRespFormat>(tool:ChatTaskTool<any,Fmt>)=>async (resp:PromiseRetryResult<Fmt | undefined> | undefined):Promise<TextCompletionResult>=>{
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


