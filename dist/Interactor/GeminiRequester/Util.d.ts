import type { PromiseStatus } from "@zwa73/utils";
import type { APIPrice, CredsData } from "../../CredService";
import type { AnyGeminiRespFormat } from "../../ResponseFormat";
/**记录用量
 * @param rawResp    - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 */
export declare const recordPrice: (respObj: AnyGeminiRespFormat | undefined, price: APIPrice, accountData: CredsData) => Promise<void>;
/**验证回复可用性并处理错误
 * @async
 * @param rawResp      - 未做处理的回复
 * @param apiKeyName - 本次回复的APIkey
 * @returns 可用性
 */
export declare const verifyResp: (respObj: AnyGeminiRespFormat | undefined, accountData: CredsData) => Promise<PromiseStatus>;
