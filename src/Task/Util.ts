import type { PromiseRetryResult } from "@zwa73/js-utils";

import type { AnyTextCompletionResponse } from "ResponseFormat";

import type { TextCompletionResult } from "Task/DataInterface";
import { DefChatLaMResult } from "Task/DataInterface";
import type { RespFormatter } from "Task/ToolInterface";





/**通用的Resp转换函数 */
export const commonFormatResp = <FMT extends AnyTextCompletionResponse>(
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