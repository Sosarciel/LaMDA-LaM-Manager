import { PromiseRetryResult } from "@zwa73/utils";
import { AnyOpenaiModel, AnyOpenaiOption } from "./OpenAI";
import { AnyDeepseekModel, AnyDeepseekOption } from "./Deepseek";
import { AnyOpenAIChatRespFormat, AnyOpenAITextRespFormat as AnyOpenAITextRespFormat } from "./OpenAI/Resp";
import { AnyDeepseekChatRespFormat } from "./Deepseek/Resp";
import { AnyGoogleModel, AnyGoogleOption } from "./Google/GoogleInterface";
import { AnyGoogleChatRespFormat } from "./Google";


/**文本完成模型通用配置 */
export type TextCompletionOptions={
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
}

/**文本完成通用回复 */
export interface ITextCompletionResp{
    /**获得选项列表
     * @returns 选项列表
     */
    getChoiceList():string[];
    /**获得目标选项
     * @param index - 目标下标
     * @returns 目标选项
     */
    getChoice(index:number):string|null;
    /**设置目标选项
     * @param index     - 目标下标
     * @param content   - 目标内容
     */
    setChoice(index:number,content:string):void;
    /**是否有效
     * @returns 是否有效
     */
    isVaild():boolean;
}

/**空结果 */
export const DefChatLaMResult:TextCompletionResult = {completed:undefined,pending:[]};

/**文本完成通用结果 */
export type TextCompletionResult = PromiseRetryResult<ITextCompletionResp>;


export type AnyTextCompletionModel   = AnyOpenaiModel|AnyDeepseekModel|AnyGoogleModel;
export type AnyTextCompletionOption = AnyDeepseekOption|AnyOpenaiOption|AnyGoogleOption;

export type AnyOpenAIChatApiRespFormat  = AnyOpenAIChatRespFormat|AnyDeepseekChatRespFormat;
export type AnyOpenAITextApiRespFormat  = AnyOpenAITextRespFormat;

export type AnyOpenAIApiRespFormat = AnyOpenAIChatApiRespFormat|AnyOpenAITextApiRespFormat;

export type AnyGoogleChatApiRespFormat  = AnyGoogleChatRespFormat;
export type AnyGoogleApiRespFormat = AnyGoogleChatApiRespFormat;

export type AnyTextCompletionRespFormat = AnyOpenAIChatApiRespFormat|AnyOpenAITextApiRespFormat|AnyGoogleChatApiRespFormat;


