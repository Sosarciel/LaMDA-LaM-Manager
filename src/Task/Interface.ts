import { assertType, LogLevel, MPromise, PromiseRetryResult } from "@zwa73/utils";
import { CredCategoryID } from "CredService";
import { ChatTaskInterface } from "./Chat";
import { AnyTextCompletionOption } from "RequestFormat";
import { AnyTextCompletionRespFormat } from "ResponseFormat";


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

/**文本完成通用接口 */
export type TextCompletionInterface = {
    /**token编码
     * @async
     * @param str - 待编码的字符串
     * @returns Token数组
     */
    encodeToken(str:string):Promise<number[]>
    /**token解码
      * @param arr = Token数组
      * @returns 消息字符串
      */
    decodeToken(arr:number[]):Promise<string>
    /**获取默认选项 */
    getDefaultOption():TextCompletionOption;
}

/**文本完成任务通用格式化工具 */
export type TextCompletionTaskFormatter<IOPT,
OOPT extends AnyTextCompletionOption,
FMT extends AnyTextCompletionRespFormat> = {
     /**检查配置是否有效, 斌返回用于post的JObject */
    formatOption:(opt:IOPT,model:string)=>MPromise<undefined|OOPT>;
    /**转换结果为通用Resp包装 */
    formatResult:(resp:PromiseRetryResult<FMT | undefined> | undefined)=>MPromise<TextCompletionResult>;
}


/**task接口 */
export type TaskInterface = {
    /**chat任务, 与实体渐进式聊天 */
    chat:ChatTaskInterface;
}
/**task类型 */
export type TaskType =  keyof TaskInterface;
/**task类型 列表 */
export const TaskTypeList = ['chat'] as const;
assertType<ReadonlyArray<TaskType>>(TaskTypeList);