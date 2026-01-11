import type { MPromise } from "@zwa73/utils";

import type { AnyTextCompletionRequestFormat } from "RequestFormat";
import type { AnyTextCompletionResponseFormat } from "ResponseFormat";
import type { TokensizerType } from "Tokensizer";

import type { RespFormatter, TextCompletionTaskFormatter } from "Task/ToolInterface";

import { DeepseekBetaChatTaskFormatter, DeepseekChatTaskFormatter, GeminiCompatChatTaskFormatter, OpenAIConversationChatTaskFormatter, OpenAITextChatTaskFormatter, GeminiChatTaskFormatter, DeepseekTextChatTaskFormatter } from "./Formatter";
import type { ChatTaskOption, LaMChatMessages } from "./Interface";


/** 聊天任务格式化工具 */
export type ChatTaskFormatter<MSG,
REQ extends AnyTextCompletionRequestFormat,
RES extends AnyTextCompletionResponseFormat> =
TextCompletionTaskFormatter<ChatTaskOption,REQ,RES>&
RespFormatter<RES>&{
    /**计算token */
    calcToken:(message:LaMChatMessages,tokensizerType:TokensizerType)=>MPromise<number>;
    /**转换一个模型所用的messageEntry
     * @param chatTarget      - 聊天目标名
     * @param messageList     - 待转换的通用消息列表
     */
    buildMessage(chatTarget:string,messageList:LaMChatMessages): MSG;
    /**给聊天信息加上询问格式, 让模型稳定输出
     * @param chatTarget - 聊天目标
     * @param chatList   - 待格式化的聊天信息
     * @returns 完成格式化 可以进行post的聊天信息
     */
    formatMessage(chatTarget:string,chatList:MSG):MSG;
};

export const ChatTaskFormaterTable = {
    deepseek_chat            : DeepseekChatTaskFormatter,
    deepseek_chat_beta       : DeepseekBetaChatTaskFormatter,
    deepseek_text            : DeepseekTextChatTaskFormatter,
    openai_chat              : OpenAIConversationChatTaskFormatter,
    openai_text              : OpenAITextChatTaskFormatter,
    google_chat              : GeminiChatTaskFormatter,
    google_chat_compat       : GeminiCompatChatTaskFormatter,
};
export type ChatFormaterType = keyof typeof ChatTaskFormaterTable;

