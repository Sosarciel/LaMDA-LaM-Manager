import { MPromise, PromiseRetryResult } from "@zwa73/utils";
import { TextCompletionResult } from "TextCompletion";
import { TokensizerType } from "@/src/Tokensize";
import { DeepseekBetaChatTaskFormater, DeepseekChatTaskFormater } from "./Deepseek";
import { OpenAIChatChatFormater } from "./GPTChat";
import { OpenAITextChatFormater } from "./GPTText";
import { GeminiChatTaskFormater } from "./Gemini";
import { AnyTextCompletionRespFormat } from "RespFormat";
import { AnyTextCompletionOption } from "ModelConfig";
import { ChatTaskOption, LaMChatMessages } from "../ChatTaskInterface";
import { GeminiCompatChatTaskFormater } from "./GeminiCompat";

export type ChatTaskFormater<Opt extends AnyTextCompletionOption, Fmt extends AnyTextCompletionRespFormat> = {
    /**检查配置是否有效, 斌返回用于post的JObject */
    formatOption:(opt:ChatTaskOption,model:string)=>MPromise<undefined|Opt>;
    /**转换结果为通用Resp包装 */
    formatResult:(resp:PromiseRetryResult<Fmt | undefined> | undefined)=>MPromise<TextCompletionResult>;
    /**计算token */
    calcToken:(message:LaMChatMessages,tokensizerType:TokensizerType)=>MPromise<number>;
}

export const ChatTaskFormaterTable = {
    deepseek_chat:DeepseekChatTaskFormater,
    deepseek_chat_beta:DeepseekBetaChatTaskFormater,
    openai_chat:OpenAIChatChatFormater,
    openai_text:OpenAITextChatFormater,
    google_chat:GeminiChatTaskFormater,
    google_chat_compat:GeminiCompatChatTaskFormater,
};
export type ChatFormaterType = keyof typeof ChatTaskFormaterTable;

