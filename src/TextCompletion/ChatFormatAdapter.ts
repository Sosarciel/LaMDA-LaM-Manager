import { MPromise, PromiseRetryResult } from "@zwa73/utils";
import { ChatTaskOption, LaMChatMessages } from "./ChatTaskInterface";
import { AnyTextCompletionOption, AnyTextCompletionRespFormat, TextCompletionResult } from "./TextCompletionInterface";
import { TokensizerType } from "@/src/Tokensize";
import { DeepseekChatChatTaskFormater } from "./Deepseek";
import { OpenAIChatFormater, OpenAITextFormater } from "./OpenAI";
import { GoogleChatChatTaskFormater } from "./Google";

export type IChatFormater = {
    /**检查配置是否有效, 斌返回用于post的JObject */
    formatOption:(opt:ChatTaskOption,model:string)=>MPromise<undefined|AnyTextCompletionOption>;
    /**转换结果为通用Resp包装 */
    formatResp:(resp:PromiseRetryResult<AnyTextCompletionRespFormat | undefined> | undefined)=>MPromise<TextCompletionResult>;
    /**计算token */
    calcToken:(message:LaMChatMessages,tokensizerType:TokensizerType)=>MPromise<number>;
}

export const ChatFormaterTable = {
    deepseek_chat:DeepseekChatChatTaskFormater,
    openai_chat:OpenAIChatFormater,
    openai_text:OpenAITextFormater,
    google_chat:GoogleChatChatTaskFormater
};
export type ChatFormaterType = keyof typeof ChatFormaterTable;