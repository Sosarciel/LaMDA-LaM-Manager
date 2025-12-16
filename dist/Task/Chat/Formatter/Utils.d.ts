import type { PromiseRetryResult } from "@zwa73/js-utils";
import type { AnyTextCompletionRespFormat } from "../../../ResponseFormat";
import type { TokensizerType } from "../../../Tokensizer";
import type { ChatTaskFormatter } from "../../Chat/Adapter";
import type { LaMChatMessages } from "../../Chat/Interface";
import type { TextCompletionResult } from "../../Interface";
/**标准的 stringify 后计算tokens的高阶函数 */
export declare const stringifyCalcToken: (tool: ChatTaskFormatter<any, any, any>) => (message: LaMChatMessages, tokensizerType: TokensizerType) => Promise<number>;
/**标准的计算tokens的高阶函数 */
export declare const commonCalcToken: (tool: ChatTaskFormatter<any, any, any>) => (message: LaMChatMessages, tokensizerType: TokensizerType) => Promise<number>;
/**通用的Resp转换函数 */
export declare const commonFormatResp: <FMT extends AnyTextCompletionRespFormat>(tool: ChatTaskFormatter<any, any, FMT>) => (resp: PromiseRetryResult<FMT | undefined> | undefined) => Promise<TextCompletionResult>;
