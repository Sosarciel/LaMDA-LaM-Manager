
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

/**标准的请求文本转换工具 使用配置 */
export const commonProcessMessageWithOpt = <T>(tool:ChatTaskFormatter<T,any,any>,opt:ChatTaskOption)=>{
    return commonProcessMessage(tool,opt.target,opt.messages);
};

/**标准的请求文本转换工具 */
export const commonProcessMessage = <T>(
    tool:ChatTaskFormatter<T,any,any>,target:string,message:LaMChatMessages
)=>{
    const buildMsg = tool.buildMessage(target,message);
    return tool.formatMessage(target,buildMsg);
};


