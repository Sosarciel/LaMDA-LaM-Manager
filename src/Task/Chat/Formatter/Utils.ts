
import type { TokensizerType } from "Tokensizer";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import type { ChatTaskOption, LaMChatMessages } from "Task/Chat/Interface";
import { commonComputeTokenCount } from "Task/Util";




/**标准的 stringify 后计算tokens的高阶函数 */
export const stringifyComputeTokenCountFactory = (tool:ChatTaskFormatter<any,any,any>)=>
    async (messages:LaMChatMessages,tokensizerType:TokensizerType):Promise<number>=>{
        const turboMessage = tool.buildMessage({target:'unknow',messages});
        return await commonComputeTokenCount(JSON.stringify(turboMessage),tokensizerType);
    };

/**标准的计算tokens的高阶函数 */
export const commonComputeTokenCountFactory = (tool:ChatTaskFormatter<string,any,any>)=>
    async (messages:LaMChatMessages,tokensizerType:TokensizerType):Promise<number>=>{
        const turboMessage = tool.buildMessage({target:'unknow',messages});
        return await commonComputeTokenCount(turboMessage,tokensizerType);
    };

/**标准的请求文本转换工具 使用配置 */
export const commonProcessMessageWithOpt = <T>(param:{tool:ChatTaskFormatter<T,any,any>,option:ChatTaskOption})=>{
    const {option,tool} = param;
    const {messages,target,hint} = option;
    return commonProcessMessage({ tool,target,messages,hint });
};

/**标准的请求文本转换工具 */
export const commonProcessMessage = <T>(param:{
    tool:ChatTaskFormatter<T,any,any>;
    target:string;
    hint?:string;
    messages:LaMChatMessages;
})=>{
    const {tool,target} = param;
    const buildMsg = tool.buildMessage(param);
    return tool.formatMessage({target,messages:buildMsg});
};


