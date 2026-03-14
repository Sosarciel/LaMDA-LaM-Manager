import type { MPromise, PromiseRetryResult } from "@zwa73/js-utils";

import type { AnyTextCompletionRequest } from "RequestFormat";
import type { AnyTextCompletionResponse } from "ResponseFormat";
import type { TokensizerType } from "Tokensizer";

import type { TextCompletionOption, TextCompletionResp, TextCompletionResult } from "./DataInterface";

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
export type TextCompletionTaskFormatter<IN,
OUT extends AnyTextCompletionRequest,
FMT extends AnyTextCompletionResponse> = {
     /**检查配置是否有效, 并返回用于请求的JObject */
    formatOption:(arg:{
        option        :IN;
        modelId       :string;
        tokensizerType:TokensizerType;
    })=>MPromise<undefined|OUT>;
    /**转换结果为通用响应包装 */
    formatResult:(resp:PromiseRetryResult<FMT | undefined> | undefined)=>MPromise<TextCompletionResult>;
}

/**响应包装器 */
export type RespFormatter<FMT extends AnyTextCompletionResponse> = {
    /**将响应包装为通用文本完成回复 */
    formatResp(resp:FMT):TextCompletionResp;
}
