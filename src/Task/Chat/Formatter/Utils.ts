
import type { LaMPostRequestFunc, CredProvider, ModelInfo, SourceProvider, AnyTextCompletionRequest, TokensizerType } from "@sosraciel-lamda/lam-chain";
import { LaMChain } from "@sosraciel-lamda/lam-chain";
import { SLogger, UtilFunc } from "@zwa73/utils";

import type { ChatTaskFormatter } from "Task/Chat/Adapter";
import type { ChatTaskOption, LaMChatMessages } from "Task/Chat/Interface";




/**标准的 stringify 后计算tokens的高阶函数 */
export const stringifyComputeTokenCountFactory = (tool:ChatTaskFormatter<any,any,any>)=>
    async (messages:LaMChatMessages,tokensizerType:TokensizerType):Promise<number>=>{
        const turboMessage = tool.buildMessage({target:'unknow',messages});
        return await LaMChain.computeTokenCount({text:JSON.stringify(turboMessage),tokensizerType});
    };

/**标准的计算tokens的高阶函数 */
export const commonComputeTokenCountFactory = (tool:ChatTaskFormatter<string,any,any>)=>
    async (messages:LaMChatMessages,tokensizerType:TokensizerType):Promise<number>=>{
        const turboMessage = tool.buildMessage({target:'unknow',messages});
        return await LaMChain.computeTokenCount({text:turboMessage,tokensizerType});
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

/**通用的聊天任务执行器 由formatter自管流程
 * @param param1 - 工具与传输函数
 */
export const commonChatTask = <
REQ extends AnyTextCompletionRequest,
P extends LaMPostRequestFunc<REQ,any>,
>(param1:{
    tool:ChatTaskFormatter<any,REQ,any>;
    post:P;
})=>async (param2:{
    cred:CredProvider;
    source:SourceProvider;
    model:ModelInfo;
    option:ChatTaskOption;
    tokensizerType:TokensizerType;
})=>{
    const {tool} = param1;
    const {cred,source,model,option,tokensizerType} = param2;
    const json = await tool.formatOption({
        option,
        tokensizerType,
        modelId:model.id,
    });
    if(json===undefined) return undefined;

    if(option.log_level!='none')
        SLogger.log(option.log_level??'none',`参数: ${UtilFunc.stringifyJToken(json,{compress:true,space:2})}`);

    const resp = await param1.post({
        cred,source,model,json,
    });

    return tool.formatResult(resp);
};

/**OpenAI 样式的聊天任务执行器 */
export const commonOpenAIChatTask = (tool:ChatTaskFormatter<any,any,any>)=>
    commonChatTask({tool,post:LaMChain.postOpenAIRequest});

/**Gemini 样式的聊天任务执行器 */
export const commonGeminiChatTask = (tool:ChatTaskFormatter<any,any,any>)=>
    commonChatTask({tool,post:LaMChain.postGeminiRequest});


