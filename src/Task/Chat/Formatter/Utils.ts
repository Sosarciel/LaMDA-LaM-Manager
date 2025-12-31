import type { PromiseRetryResult } from "@zwa73/js-utils";

import type { AnyTextCompletionRespFormat } from "ResponseFormat";
import type { TokensizerType } from "Tokensizer";
import { getTokensizer } from "Tokensizer";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import type { ChatTaskOption, LaMChatMessages } from "Task/Chat/Interface";
import type { TextCompletionResult } from "Task/Interface";
import { DefChatLaMResult } from "Task/Interface";




/**标准的 stringify 后计算tokens的高阶函数 */
export const stringifyCalcToken = (tool:ChatTaskFormatter<any,any,any>)=>async (message:LaMChatMessages,tokensizerType:TokensizerType):Promise<number>=>{
    const turboMessage = tool.transReq('unknow',message);
    const tokenizer = getTokensizer(tokensizerType);
    return (await tokenizer.encode(JSON.stringify(turboMessage))).length;
};

/**标准的计算tokens的高阶函数 */
export const commonCalcToken = (tool:ChatTaskFormatter<any,any,any>)=>async (message:LaMChatMessages,tokensizerType:TokensizerType):Promise<number>=>{
    const turboMessage = tool.transReq('unknow',message);
    const tokenizer = getTokensizer(tokensizerType);
    return (await tokenizer.encode(turboMessage)).length;
};

/**通用的Resp转换函数 */
export const commonFormatResp = <FMT extends AnyTextCompletionRespFormat>(tool:ChatTaskFormatter<any,any,FMT>)=>async (resp:PromiseRetryResult<FMT | undefined> | undefined):Promise<TextCompletionResult>=>{
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

/**标准的请求文本转换工具 */
export const commonProcReq = <T>(tool:ChatTaskFormatter<T,any,any>,opt:ChatTaskOption)=>{
    const msg = tool.transReq(opt.target,opt.messages);
    return tool.formatReq(opt.target,msg);
};


