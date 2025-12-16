import type { MPromise } from "@zwa73/utils";
import type { AnyTextCompletionOption } from "../../RequestFormat";
import type { AnyTextCompletionRespFormat } from "../../ResponseFormat";
import type { TokensizerType } from "../../Tokensizer";
import type { TextCompletionResp, TextCompletionTaskFormatter } from "../Interface";
import type { ChatTaskOption, LaMChatMessages } from "./Interface";
/** 聊天任务格式化工具 */
export type ChatTaskFormatter<MSG, OPT extends AnyTextCompletionOption, FMT extends AnyTextCompletionRespFormat> = TextCompletionTaskFormatter<ChatTaskOption, OPT, FMT> & {
    /**计算token */
    calcToken: (message: LaMChatMessages, tokensizerType: TokensizerType) => MPromise<number>;
    /**转换一个模型所用的messageEntry
     * @param chatTarget      - 聊天目标名
     * @param messageList     - 待转换的通用消息列表
     */
    transReq(chatTarget: string, messageList: LaMChatMessages): MSG;
    /**给聊天信息加上询问格式, 让模型稳定输出
     * @param chatTarget - 聊天目标
     * @param chatList   - 待格式化的聊天信息
     * @returns 完成格式化 可以进行post的聊天信息
     */
    formatReq(chatTarget: string, chatList: MSG): MSG;
    /**回复包装 */
    formatResp(resp: FMT): TextCompletionResp;
};
export declare const ChatTaskFormaterTable: {
    deepseek_chat: ChatTaskFormatter<import("../../RequestFormat").DeepseekAPIEntry[], Partial<{
        model: string;
        messages: import("../../RequestFormat").DeepseekAPIEntry[];
        max_tokens: number;
        temperature: number;
        top_p: number;
        stop: string[] | null;
        presence_penalty: number;
        frequency_penalty: number;
    }>, import("../../ResponseFormat").DeepseekRespFormat>;
    deepseek_chat_beta: ChatTaskFormatter<import("../../RequestFormat").DeepseekAPIEntry[], Partial<{
        model: string;
        messages: import("../../RequestFormat").DeepseekAPIEntry[];
        max_tokens: number;
        temperature: number;
        top_p: number;
        stop: string[] | null;
        presence_penalty: number;
        frequency_penalty: number;
    }>, import("../../ResponseFormat").DeepseekRespFormat>;
    openai_chat: ChatTaskFormatter<import("../../RequestFormat").OpenAIConversationAPIEntry[], Partial<{
        model: string;
        messages: import("../../RequestFormat").OpenAIConversationAPIEntry[];
        max_tokens: number;
        temperature: number;
        top_p: number;
        stop: string[] | null;
        presence_penalty: number;
        frequency_penalty: number;
        logit_bias: Record<string, number> | null;
        n: number;
    }>, import("../../ResponseFormat").AnyOpenAIConversationLikeRespFormat>;
    openai_text: ChatTaskFormatter<string, Partial<{
        model: string;
        prompt: string;
        max_tokens: number;
        temperature: number;
        top_p: number;
        stop: string[] | null;
        presence_penalty: number;
        frequency_penalty: number;
        logit_bias: Record<string, number> | null;
        n: number;
    }>, import("../../ResponseFormat").OpenAITextRespFormat>;
    google_chat: ChatTaskFormatter<import("../../RequestFormat").GeminiApiData, import("../../RequestFormat").GeminiOption, import("../../ResponseFormat").GeminiRespFormat>;
    google_chat_compat: ChatTaskFormatter<import("../../RequestFormat").GeminiCompatAPIEntry[], Partial<{
        model: string;
        messages: import("../../RequestFormat").GeminiCompatAPIEntry[];
        max_tokens: number;
        temperature: number;
        top_p: number;
        stop: string[] | null;
        presence_penalty: number;
        frequency_penalty: number;
        extra_body: {
            google?: {
                thinking_config?: {
                    include_thoughts?: boolean;
                    thinking_budget?: number;
                };
            };
        };
        reasoning_effort: "low" | "medium" | "high";
    }>, import("../../ResponseFormat").OpenAIConversationRespFormat>;
};
export type ChatFormaterType = keyof typeof ChatTaskFormaterTable;
