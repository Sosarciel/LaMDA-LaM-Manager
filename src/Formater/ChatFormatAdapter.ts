import { MPromise, PromiseRetryResult } from "@zwa73/utils";
import { ChatTaskOption, LaMChatMessages, TextCompletionResult } from "TextCompletion";
import { TokensizerType } from "@/src/Tokensize";
import { DeepseekChatBetaChatTaskFormater, DeepseekChatChatTaskFormater } from "./DeepseekChat";
import { OpenAIChatFormater } from "./GPTChat";
import { OpenAITextFormater } from "./GPTText";
import { GoogleChatChatTaskFormater, GoogleChatCompatChatTaskFormater } from "./GoogleChat";
import { AnyTextCompletionRespFormat } from "RespFormat";
import { AnyTextCompletionOption } from "ModelConfig";

export type IChatFormater<Opt extends AnyTextCompletionOption, Fmt extends AnyTextCompletionRespFormat> = {
    /**检查配置是否有效, 斌返回用于post的JObject */
    formatOption:(opt:ChatTaskOption,model:string)=>MPromise<undefined|Opt>;
    /**转换结果为通用Resp包装 */
    formatResult:(resp:PromiseRetryResult<Fmt | undefined> | undefined)=>MPromise<TextCompletionResult>;
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

