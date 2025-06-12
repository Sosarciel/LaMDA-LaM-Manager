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

