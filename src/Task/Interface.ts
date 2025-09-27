import { JToken, LogLevel, MPromise, PromiseRetryResult } from "@zwa73/utils";
import { CredCategoryID } from "CredService";
import { ChatTaskOption } from "./Chat";


/**文本完成模型通用配置 */
export type TextCompletionOption=Partial<{
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
    /**首选账户 需要填入 CredCategoryJsonTable 定义的 CredCategory */
    preferred_account:CredCategoryID[];
    /**log等级 */
    log_level:LogLevel|'none';
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

/**nlp任务类型 */
export type TaskType = "Chat"|"Translate";

/**nlp任务格式化工具 */
export type TaskFormatter = {
    /**检查配置是否有效, 斌返回用于post的JObject */
    formatOption:(opt:any,model:string)=>MPromise<undefined|JToken>;
    /**转换结果为通用Resp包装 */
    formatResult:(resp:PromiseRetryResult<any | undefined> | undefined)=>MPromise<TextCompletionResult>;
}

