import type { MPromise } from "@zwa73/utils";

import type { AnyTextCompletionRequest } from "RequestFormat";
import type { AnyTextCompletionResponse } from "ResponseFormat";
import type { TokensizerType } from "Tokensizer";

import type { RespFormatter, TextCompletionTaskFormatter } from "Task/ToolInterface";

import { DeepseekPrefixChatTaskFormatter, DeepseekChatTaskFormatter, GeminiCompatChatTaskFormatter, GLMChatTaskFormatter, OpenAIConversationChatTaskFormatter, OpenAITextChatTaskFormatter, GeminiChatTaskFormatter, DeepseekTextChatTaskFormatter, DeepseekRawChatTaskFormatter } from "./Formatter";
import type { ChatTaskOption, LaMChatMessages } from "./Interface";


/** 聊天任务格式化工具 */
export type ChatTaskFormatter<MSG,
REQ extends AnyTextCompletionRequest,
RES extends AnyTextCompletionResponse> =
TextCompletionTaskFormatter<ChatTaskOption,REQ,RES>&
RespFormatter<RES>&{
    /**计算token */
    computeTokenCount:(message:LaMChatMessages,tokensizerType:TokensizerType)=>MPromise<number>;
    /**转换一个模型所用的messageEntry
     * @param target      - 聊天目标名
     * @param messages    - 待转换的通用消息列表
     * @param hint        - 临时提示
     */
    buildMessage(param:{target:string,messages:LaMChatMessages,hint?:string}): MSG;
    /**给聊天信息加上询问格式, 让模型稳定输出
     * @param target    - 聊天目标
     * @param messages  - 待格式化的聊天信息
     * @returns 完成格式化 可以进行post的聊天信息
     */
    formatMessage(param:{target:string,messages:MSG}):MSG;
};

export const ChatTaskFormatterTable = {
    deepseek_chat            : DeepseekChatTaskFormatter,
    deepseek_chat_raw        : DeepseekRawChatTaskFormatter,
    deepseek_prefix          : DeepseekPrefixChatTaskFormatter,
    deepseek_text            : DeepseekTextChatTaskFormatter,
    openai_chat              : OpenAIConversationChatTaskFormatter,
    openai_text              : OpenAITextChatTaskFormatter,
    google_chat              : GeminiChatTaskFormatter,
    google_chat_compat       : GeminiCompatChatTaskFormatter,
    glm_chat                 : GLMChatTaskFormatter,
};
export type ChatFormatterType = keyof typeof ChatTaskFormatterTable;

