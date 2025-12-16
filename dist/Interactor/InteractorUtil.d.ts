import type { RequestResult, JToken } from "@zwa73/utils";
/**检查响应码是否合规
 * @param respData - 响应数据
 */
export declare const checkRespCode: (respData?: RequestResult<JToken>) => boolean;
