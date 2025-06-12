import { PromiseRetryResult } from "@zwa73/utils";
import { AnyOpenaiModel, AnyOpenaiOption } from "./OpenAI";
import { AnyDeepseekModel, AnyDeepseekOption } from "./Deepseek";
import { AnyOpenAIChatRespFormat, AnyOpenAITextRespFormat as AnyOpenAITextRespFormat } from "./OpenAI/Resp";
import { AnyDeepseekChatRespFormat } from "./Deepseek/Resp";
import { AnyGoogleModel, AnyGoogleOption } from "./Google/GoogleInterface";
import { AnyGoogleChatRespFormat } from "./Google";


/**文本完成模型通用配置 */
export type TextCompletionOptions=Partial<{
    /**最大token数 */
    max_tokens: number;
    /**temperature 采样温度 越大越容易选择低概率token */
    temperature: number;
    /**top_p 越低可选的token越少,优先淘汰掉最低概率的token */
    top_p: number;
    /**stop字符串数组 */
    stop: string[]|null;
    /**存在惩罚 只要token出现在提示中,出现概率就会受到惩罚 */
    presence_penalty: number;
    /**频率惩罚 token每出现一次,出现概率就会受到一次惩罚 */
    frequency_penalty: number;
    /**逻辑对数偏置 {"token":偏置值} 对特定token的出现率调整 */
    logit_bias: Record<string, number>|null;
    /**产生回复的数量 */
    n: number;
    /**思考token预算 模型将尽量保证思考链长度为此值 */
    think_budget: number|null;
}>;

/**文本完成通用回复 */
export type TextCompletionResp = {
    /**选项 */
    choices:{
        /**文本内容 */
        content:string;
    }[];
    /**是否有效 */
    vaild: boolean;
}

/**空结果 */
export const DefChatLaMResult:TextCompletionResult = {completed:undefined,pending:[]};

/**文本完成通用结果 */
export type TextCompletionResult = PromiseRetryResult<TextCompletionResp>;

/**任何文本完成模型 */
export type AnyTextCompletionModel   = AnyOpenaiModel|AnyDeepseekModel|AnyGoogleModel;
/**任何文本完成模型的配置 */
export type AnyTextCompletionOption = AnyDeepseekOption|AnyOpenaiOption|AnyGoogleOption;

/**任何 OpenAI Chat API 接口的回复格式 */
export type AnyOpenAIChatApiRespFormat  = AnyOpenAIChatRespFormat|AnyDeepseekChatRespFormat;
/**任何 OpenAI Text API 接口的回复格式 */
export type AnyOpenAITextApiRespFormat  = AnyOpenAITextRespFormat;
/**任何 OpenAI API 接口的回复格式 */
export type AnyOpenAIApiRespFormat = AnyOpenAIChatApiRespFormat|AnyOpenAITextApiRespFormat;
/**任何 Google Chat API 接口的回复格式 */
export type AnyGoogleChatApiRespFormat  = AnyGoogleChatRespFormat;
/**任何 Google API 接口的回复格式 */
export type AnyGoogleApiRespFormat = AnyGoogleChatApiRespFormat;
/**任何 文本完成 API 接口的回复格式 */
export type AnyTextCompletionRespFormat = AnyOpenAIChatApiRespFormat|AnyOpenAITextApiRespFormat|AnyGoogleChatApiRespFormat;


