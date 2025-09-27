import { MPromise, PromiseRetryResult } from "@zwa73/utils";
import { TextCompletionResp, TextCompletionResult } from "../Interface";
import { TokensizerType } from "Tokensizer";
import { AnyTextCompletionRespFormat } from "ResponseFormat";
import { ChatTaskOption, LaMChatMessages } from "./Interface";
import { DeepseekBetaChatTaskFormatter, DeepseekChatTaskFormatter, GeminiGptgeCompatChatTaskFormatter, OpenAIConversationChatTaskFormatter, OpenAITextChatTaskFormatter,GeminiChatTaskFormatter } from "./Formatter";
import { AnyTextCompletionOption } from "RequestFormat";

/** 聊天任务格式化工具 */
export type ChatTaskFormatter<msG,OPT extends AnyTextCompletionOption, FMT extends AnyTextCompletionRespFormat> = {
    /**检查配置是否有效, 斌返回用于post的JObject */
    formatOption:(opt:ChatTaskOption,model:string)=>MPromise<undefined|OPT>;
    /**转换结果为通用Resp包装 */
    formatResult:(resp:PromiseRetryResult<FMT | undefined> | undefined)=>MPromise<TextCompletionResult>;
    /**计算token */
    calcToken:(message:LaMChatMessages,tokensizerType:TokensizerType)=>MPromise<number>;
    /**转换一个模型所用的messageEntry
     * @param chatTarget      - 聊天目标名
     * @param messageList     - 待转换的通用消息列表
     */
    transReq(chatTarget:string,messageList:LaMChatMessages): msG;
    /**给聊天信息加上询问格式, 让模型稳定输出
     * @param chatTarget - 聊天目标
     * @param chatList   - 待格式化的聊天信息
     * @returns 完成格式化 可以进行post的聊天信息
     */
    formatReq(chatTarget:string,chatList:msG):msG;
    /**回复包装 */
    formatResp(resp:FMT):TextCompletionResp;
}

export const ChatTaskFormaterTable = {
    deepseek_chat            : DeepseekChatTaskFormatter,
    deepseek_chat_beta       : DeepseekBetaChatTaskFormatter,
    openai_chat              : OpenAIConversationChatTaskFormatter,
    openai_text              : OpenAITextChatTaskFormatter,
    google_chat              : GeminiChatTaskFormatter,
    google_chat_gptge_compat : GeminiGptgeCompatChatTaskFormatter,
};
export type ChatFormaterType = keyof typeof ChatTaskFormaterTable;

