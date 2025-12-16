import type { PromiseStatus } from "@zwa73/utils";
import type { APIPrice, CredsData } from "../../CredService";
import type { AnyOpenAIRespFormat, OpenAIErrorFormat } from "../../ResponseFormat";
/**记录用量
 * @param rawResp    - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 */
export declare const recordPrice: (respObj: AnyOpenAIRespFormat | undefined, price: APIPrice, accountData: CredsData) => Promise<undefined>;
/**验证回复可用性并处理错误
 * @async
 * @param rawResp    - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 * @returns 可用性
 */
export declare const verifyResp: (rawResp: AnyOpenAIRespFormat | OpenAIErrorFormat | undefined, accountData: CredsData) => Promise<PromiseStatus>;
/**验证回复可用性并处理错误
 * @async
 * @param rawResp      - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 * @returns 可用性
 */
export declare const checkError: (error: OpenAIErrorFormat["error"], accountData: CredsData) => Promise<PromiseStatus>;
