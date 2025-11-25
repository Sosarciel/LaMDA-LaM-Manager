
import { RequestResult,JToken } from "@zwa73/utils";



/**检查响应码是否合规
 * @param respData - 响应数据
 */
export const checkRespCode = (respData?:RequestResult<JToken>)=>{
    const respcode = respData?.statusCode ?? 0;
    return respcode>=200 && respcode<300;
};