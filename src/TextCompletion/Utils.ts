import type { PromiseRetryResult } from "@zwa73/js-utils";
import { getTokensizer, TokensizerType } from "../Tokensize";
import type { ChatTaskTool, LaMChatMessages } from "./ChatTaskInterface";
import { AnyTextCompletionRespFormat, DefChatLaMResult, TextCompletionResult } from "./TextCompletionInterface";


/**标准的 stringify 后计算tokens的高阶函数 */
export const stringifyCalcToken = (tool:ChatTaskTool<any,any>)=>async (message:LaMChatMessages,tokensizerType:TokensizerType):Promise<number>=>{
    const turboMessage = tool.transReq('unknow',message);
    const tokenizer = getTokensizer(tokensizerType);
    return (await tokenizer.encode(turboMessage)).length;
};

/**通用的Resp转换函数 */
export const commonFormatResp = (tool:ChatTaskTool<any,any>)=>async (resp:PromiseRetryResult<AnyTextCompletionRespFormat | undefined> | undefined):Promise<TextCompletionResult>=>{
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