
import type { TokensizerType } from "Tokensizer";
import { getTokensizer } from "Tokensizer";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import type { ChatTaskOption, LaMChatMessages } from "Task/Chat/Interface";




/**标准的 stringify 后计算tokens的高阶函数 */
export const stringifyCalcToken = (tool:ChatTaskFormatter<any,any,any>)=>async (message:LaMChatMessages,tokensizerType:TokensizerType):Promise<number>=>{
    const turboMessage = tool.buildMessage('unknow',message);
    const tokenizer = getTokensizer(tokensizerType);
    return (await tokenizer.encode(JSON.stringify(turboMessage))).length;
};

/**标准的计算tokens的高阶函数 */
export const commonCalcToken = (tool:ChatTaskFormatter<any,any,any>)=>async (message:LaMChatMessages,tokensizerType:TokensizerType):Promise<number>=>{
    const turboMessage = tool.buildMessage('unknow',message);
    const tokenizer = getTokensizer(tokensizerType);
    return (await tokenizer.encode(turboMessage)).length;
};

/**标准的请求文本转换工具 */
export const commonProcessMessage = <T>(tool:ChatTaskFormatter<T,any,any>,opt:ChatTaskOption)=>{
    const msg = tool.buildMessage(opt.target,opt.messages);
    return tool.formatMessage(opt.target,msg);
};


