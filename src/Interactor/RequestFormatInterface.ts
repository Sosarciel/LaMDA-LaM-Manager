import { AnyLaMOption } from "LaMService";
import { assertType, PartialOption,PromiseRetries,PromiseRetryResult, SLogger } from "@zwa73/utils";
import { TextCompleteionModelConfig } from "LaMService";
import { CredsData } from "@sosraciel-lamda/creds-manager";
import { AnyTextCompletionRespFormat } from "ResponseFormat";



/**请求格式化工具 */
export type IRequestFormater = {
    /**向 openai模型 发送一个POST请求并接受数据
     * @async
     * @param partialOpt - 可选的参数
     * @returns 结果 undefined 为未能成功接收
     */
    postLaM(partialOpt:PartialPostLaMOption):Promise<AnyTextCompletionRespFormat|undefined>
    /**向 openai模型 重复请求发送POST请求并接受数据
     * @async
     * @param partialOpt - 可选的参数
     * @returns 结果 undefined 为未能成功接收
     */
    postLaMRepeat(partialOpt:PartialPostLaMOption): Promise<PromiseRetryResult<AnyTextCompletionRespFormat|undefined>>
}





//#region 缺省option参数
/**PostLaM参数 */
export type PostLaMOption={
    /**传入的参数对象 */
    postJson:AnyLaMOption;
    /**账户数据 */
    accountData:CredsData;
    /**api价格 */
    modelData:TextCompleteionModelConfig;
    /**单个超时时间/毫秒 最小为10000毫秒 -1为不存在 */
    timeLimit:number;
    /**重试选项 */
    retryOption:PromiseRetries;
}
//超时限制 ms 至少为 10000
//30000
const POST_TIME_LIMIT = 3_600_000;
const REPEAT_TIME_LIMIT = 300_000;
const REPEAT_COUNT = 3;
SLogger.info(`OpenAILaMClient postAsync 超时:${POST_TIME_LIMIT} ms`);
SLogger.info(`OpenAILaMClient postAsyncRepeat 超时:${REPEAT_TIME_LIMIT} ms`);
SLogger.info(`OpenAILaMClient postAsyncRepeat 重试:${REPEAT_COUNT} 次`);
/**默认的聊天设置 */
export const DEF_POST_LAM_OPT = {
    timeLimit:POST_TIME_LIMIT,
    retryOption:{
        count:REPEAT_COUNT,
        tryInterval: REPEAT_TIME_LIMIT,
        tryDelay: 3,
    }
} as const;
assertType<Partial<PostLaMOption>>(DEF_POST_LAM_OPT);
/**默认设置为可选项的聊天设置 */
export type PartialPostLaMOption = PartialOption<PostLaMOption,typeof DEF_POST_LAM_OPT>;
//#endregion