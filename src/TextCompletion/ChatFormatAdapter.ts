import { MPromise, PromiseRetryResult } from "@zwa73/utils";
import { ChatTaskOption, ChatTaskTool, LaMChatMessages } from "./ChatTaskInterface";
import { AnyTextCompletionOption, AnyTextCompletionRespFormat, DefChatLaMResult, TextCompletionResult } from "./TextCompletionInterface";
import { getTokensizer, TokensizerType } from "@/src/Tokensize";
import { DeepseekChatBetaChatTaskFormater, DeepseekChatChatTaskFormater } from "./Deepseek";
import { OpenAIChatFormater, OpenAITextFormater } from "./OpenAI";
import { GoogleChatChatTaskFormater, GoogleChatCompatChatTaskFormater } from "./Google";

export type IChatFormater<O extends AnyTextCompletionOption, F extends AnyTextCompletionRespFormat> = {
    /**检查配置是否有效, 斌返回用于post的JObject */
    formatOption:(opt:ChatTaskOption,model:string)=>MPromise<undefined|O>;
    /**转换结果为通用Resp包装 */
    formatResp:(resp:PromiseRetryResult<F | undefined> | undefined)=>MPromise<TextCompletionResult>;
    /**计算token */
    calcToken:(message:LaMChatMessages,tokensizerType:TokensizerType)=>MPromise<number>;
}

export const ChatFormaterTable = {
    deepseek_chat:DeepseekChatChatTaskFormater,
    deepseek_chat_beta:DeepseekChatBetaChatTaskFormater,
    openai_chat:OpenAIChatFormater,
    openai_text:OpenAITextFormater,
    google_chat:GoogleChatChatTaskFormater,
    google_chat_compat:GoogleChatCompatChatTaskFormater,
};
export type ChatFormaterType = keyof typeof ChatFormaterTable;



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