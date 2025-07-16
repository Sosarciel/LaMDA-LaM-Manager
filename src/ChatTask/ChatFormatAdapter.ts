import { MPromise, PromiseRetryResult } from "@zwa73/utils";
import { TextCompletionResp, TextCompletionResult } from "TextCompletion";
import { TokensizerType } from "@/src/Tokensize";
import { AnyTextCompletionRespFormat } from "RespFormat";
import { AnyTextCompletionOption } from "ModelConfig";
import { ChatTaskOption, LaMChatMessages } from "./ChatTaskInterface";
import { DeepseekBetaChatTaskFormatter, DeepseekChatTaskFormatter, GeminiCompatChatTaskFormatter, OpenAIConversationChatFormatter, OpenAITextChatFormatter } from "./Formatter";
import { GeminiChatTaskFormatter } from "./Formatter/Gemini";

export type ChatTaskFormatter<Msg,Opt extends AnyTextCompletionOption, Fmt extends AnyTextCompletionRespFormat> = {
    /**检查配置是否有效, 斌返回用于post的JObject */
    formatOption:(opt:ChatTaskOption,model:string)=>MPromise<undefined|Opt>;
    /**转换结果为通用Resp包装 */
    formatResult:(resp:PromiseRetryResult<Fmt | undefined> | undefined)=>MPromise<TextCompletionResult>;
    /**计算token */
    calcToken:(message:LaMChatMessages,tokensizerType:TokensizerType)=>MPromise<number>;
    /**转换一个模型所用的messageEntry
     * @param chatTarget      - 聊天目标名
     * @param messageList     - 待转换的通用消息列表
     */
    transReq(chatTarget:string,messageList:LaMChatMessages): Msg;
    /**给聊天信息加上询问格式, 让模型稳定输出
     * @param chatTarget - 聊天目标
     * @param chatList   - 待格式化的聊天信息
     * @returns 完成格式化 可以进行post的聊天信息
     */
    formatReq(chatTarget:string,chatList:Msg):Msg;
    /**回复包装 */
    formatResp(resp:Fmt):TextCompletionResp;
}

export const ChatTaskFormaterTable = {
    deepseek_chat:DeepseekChatTaskFormatter,
    deepseek_chat_beta:DeepseekBetaChatTaskFormatter,
    openai_chat:OpenAIConversationChatFormatter,
    openai_text:OpenAITextChatFormatter,
    google_chat:GeminiChatTaskFormatter,
    google_chat_compat:GeminiCompatChatTaskFormatter,
};
export type ChatFormaterType = keyof typeof ChatTaskFormaterTable;

