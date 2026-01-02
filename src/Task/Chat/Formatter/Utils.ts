
import type { TokensizerType } from "Tokensizer";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import type { ChatTaskOption, LaMChatMessages } from "Task/Chat/Interface";
import { commonCalcToken } from "Task/Util";




/**标准的 stringify 后计算tokens的高阶函数 */
export const stringifyCalcTokenFactory = (tool:ChatTaskFormatter<any,any,any>)=>
    async (message:LaMChatMessages,tokensizerType:TokensizerType):Promise<number>=>{
        const turboMessage = tool.buildMessage('unknow',message);
        return await commonCalcToken(JSON.stringify(turboMessage),tokensizerType);
    };

/**标准的计算tokens的高阶函数 */
export const commonCalcTokenFactory = (tool:ChatTaskFormatter<string,any,any>)=>
    async (message:LaMChatMessages,tokensizerType:TokensizerType):Promise<number>=>{
        const turboMessage = tool.buildMessage('unknow',message);
        return await commonCalcToken(turboMessage,tokensizerType);
    };

/**标准的请求文本转换工具 */
export const commonProcessMessage = <T>(tool:ChatTaskFormatter<T,any,any>,opt:ChatTaskOption)=>{
    const msg = tool.buildMessage(opt.target,opt.messages);
    return tool.formatMessage(opt.target,msg);
};


